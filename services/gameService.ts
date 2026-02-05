import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, GameEvent, Player, GamePhase, Answer, Question, Expression, AudienceMember, Emote } from '../types';
import { ROUND_TIMER_SECONDS } from '../constants';
import { getQuestions, Language } from '../i18n/questions';
import { getNarratorPhrase, getBotNames } from '../i18n/narrator';
import { sfx } from './audioService';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Fisher-Yates Shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const generateQuestionId = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `q-${Math.abs(hash).toString(36)}`;
};

// Initial Question Load (Default English)
const loadQuestions = (lang: Language) => {
  return getQuestions(lang).map((q) => ({
    ...q,
    id: generateQuestionId(q.fact)
  }));
};

const getUniqueBotName = (usedNames: string[], language: Language): string => {
  const allBots = getBotNames(language);
  const available = allBots.filter(name => !usedNames.includes(name));
  const baseNames = available.length > 0 ? available : allBots;

  let candidate = '';
  let attempts = 0;
  do {
    const base = baseNames[Math.floor(Math.random() * baseNames.length)];
    // Add a random number 10-99 for bot flair
    candidate = `${base} ${Math.floor(Math.random() * 90) + 10}`;
    attempts++;
  } while (usedNames.includes(candidate) && attempts < 100);

  return candidate;
};

const joinNames = (names: string[], language: Language): string => {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  const andWord = getNarratorPhrase(language, 'AND_CONNECTIVE', {}) || ' and ';
  const last = names[names.length - 1];
  const others = names.slice(0, -1).join(', ');
  return `${others}${andWord}${last}`;
};


const STORAGE_KEY = 'bamboozle_used_questions';
const MAX_PLAYERS = 6;
// SOCKET_URL moved inside hook to be dynamic

// Bot Data
// BOT_NAMES removed - using localized getBotNames()
// Fallback lies just in case
const FALLBACK_BOT_LIES = [
  "A bag of hammers", "Radioactive cheese", "The 1989 Denver Broncos",
  "Three raccoons in a trenchcoat", "Just soup", "A sad clown"
];

// Initial Empty State
const INITIAL_STATE: GameState = {
  roomCode: '',
  phase: GamePhase.LOBBY,
  players: {},
  audience: {},
  currentRound: 0,
  totalRounds: 3,
  currentQuestion: null,
  submittedLies: {},
  roundAnswers: [],
  timeLeft: 0,
  hostId: '',
  vipId: '', // Initial VIP is empty
  usedQuestionIds: [],
  playersWhoPicked: [],
  categorySelection: null,
  isNarrating: false,
  emotes: [],
  isOnlineMode: false,
  recentCategories: [],
  revealOrder: [],
  revealStep: 0,
  revealSubPhase: 'CARD',
  leaderboardPhase: 'INTRO',
  language: 'en',
  usePremiumVoices: false, // Default to Premium Voices OFF
  isPaused: false
};

export const useGameService = (role: 'HOST' | 'PLAYER' | 'AUDIENCE', playerName?: string, initialLanguage?: 'en' | 'el') => {
  // Determine Server URL from Settings or Env
  const getServerUrl = () => {
    const settings = localStorage.getItem('bamboozle_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      if (parsed.useLocalServer) {
        // Use custom URL if provided, otherwise default to localhost:3001
        return parsed.customServerUrl || 'http://localhost:3001';
      }
    }
    return import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
  };

  const SOCKET_URL = getServerUrl();
  const [playerId] = useState(() => {
    // Persist Player ID to allow reconnection on refresh
    const stored = localStorage.getItem('bamboozle_player_id');
    if (stored) return stored;
    const newId = generateId();
    localStorage.setItem('bamboozle_player_id', newId);
    return newId;
  });

  // Store questions in a Ref to avoid global state issues
  const questionsRef = useRef(loadQuestions(initialLanguage || 'en'));

  // Initialize state with persistence check for HOST
  const [state, setState] = useState<GameState>(() => {
    const baseState = { ...INITIAL_STATE };

    // Load Settings
    try {
      const settings = localStorage.getItem('bamboozle_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.usePremiumVoices !== undefined) {
          baseState.usePremiumVoices = !!parsed.usePremiumVoices;
        }
      }
    } catch (e) {
      console.warn("Failed to load settings", e);
    }

    if (initialLanguage) {
      baseState.language = initialLanguage;
    }
    if (role === 'HOST') {
      // Reload global questions if language is set
      if (initialLanguage) {
        questionsRef.current = loadQuestions(initialLanguage);
      }
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const usedIds = JSON.parse(stored);
          if (Array.isArray(usedIds)) {
            // Validate IDs exist in current version
            const validIds = usedIds.filter((uid: string) => questionsRef.current.some(q => q.id === uid));
            baseState.usedQuestionIds = validIds;
          }
        }
      } catch (e) {
        console.warn("Failed to load used questions", e);
      }
      // Initialize Host properties immediately
      baseState.hostId = playerId;
    }
    return baseState;
  });

  const stateRef = useRef<GameState>(state);
  const [socket, setSocket] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<number | null>(null);
  const speechDedupRef = useRef<Record<string, number>>({});
  const lastSyncRef = useRef<number>(0);
  const isHostRef = useRef<boolean>(role === 'HOST'); // Track if we're acting as host (can change via reclaim)
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    setLocalIsNarrating(false);
  };

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Persist used questions when they change (HOST only)
  useEffect(() => {
    if (role === 'HOST') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.usedQuestionIds));
    }
  }, [state.usedQuestionIds, role]);

  // Sync questions ref if language changes (for Host)
  useEffect(() => {
    if (role === 'HOST' && state.language) {
      questionsRef.current = loadQuestions(state.language);
    }
  }, [state.language, role]);

  // Emote Cleanup Loop (Host Only)
  useEffect(() => {
    if (role !== 'HOST') return;
    const interval = setInterval(() => {
      const prev = stateRef.current;
      const now = Date.now();
      // Remove emotes older than 2.5 seconds (faster cleanup)
      const validEmotes = prev.emotes.filter(e => now - e.createdAt < 2500);

      if (validEmotes.length !== prev.emotes.length) {
        const next = { ...prev, emotes: validEmotes };
        stateRef.current = next;
        setState(next);
        broadcastState(next);
      }
    }, 500); // Check more frequently
    return () => clearInterval(interval);
  }, [role]);

  const [localIsNarrating, setLocalIsNarrating] = useState(false);
  const [hostDisconnected, setHostDisconnected] = useState(false);
  const [roomClosed, setRoomClosed] = useState(false);

  // --- AUDIO / TTS ENGINE ---
  // --- AUDIO / TTS ENGINE ---
  const internalSpeak = (text: string, force: boolean = false, dedupKey?: string) => {
    // Valid text check
    if (!text) return;

    if ('speechSynthesis' in window) {
      const now = Date.now();
      const key = dedupKey || text;

      // Debounce: If same key/text spoken within 1 second, skip
      if (!force && speechDedupRef.current[key] && now - speechDedupRef.current[key] < 1000) {
        return;
      }
      speechDedupRef.current[key] = now;

      // OPTIMISTIC START: Ensure visuals trigger even if audio is blocked/fails
      setLocalIsNarrating(true);

      // Cancel previous speech if forced? (Optional, but good for interruptions)
      if (force && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      // Fallback Timer: Calculate estimated duration in case onend never fires (blocked audio)
      // approx 400ms per word + buffer
      const wordCount = text.split(' ').length;
      const estimatedDuration = Math.max(2000, wordCount * 500);

      // Clear previous fallback if it exists (using a ref for this would be best, but we'll rely on the dedicated timer below not conflicting too much)
      // Ideally we'd store `narratorTimeoutRef` but for now we'll set a new one. 
      // A safety timeout to ensure we don't get stuck talking forever.
      const safetyTimeout = setTimeout(() => {
        setLocalIsNarrating(false);
      }, estimatedDuration + 1000);

      const utterance = new SpeechSynthesisUtterance(text);

      // Voice Selection with Retry Logic
      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Try to wait for voices? Or just proceed with default
        // Chrome loads voices async. We might be using default.
      }

      const preferred = voices.find(v => v.name.includes('Google US English')) ||
        voices.find(v => v.lang.includes('en-US')) ||
        voices[0];

      // Greek Voice Support
      if (stateRef.current.language === 'el') {
        const greekVoice = voices.find(v => v.lang.includes('el') || v.name.includes('Greek'));
        if (greekVoice) utterance.voice = greekVoice;
      } else {
        if (preferred) utterance.voice = preferred;
      }

      utterance.pitch = 0.9 + Math.random() * 0.2;
      utterance.rate = 0.9 + Math.random() * 0.2;

      // Event Handlers
      utterance.onstart = () => {
        setLocalIsNarrating(true);
      };

      utterance.onend = () => {
        setLocalIsNarrating(false);
        clearTimeout(safetyTimeout);
      };

      utterance.onerror = (e) => {
        console.warn('Speech Error:', e);
        // If not allowed, we KEEP isNarrating true (via optimistic) until safety timeout clears it
        // so the user still sees the "talking" even if they don't hear it.
        // Unless it was canceled.
        if (e.error === 'canceled') {
          setLocalIsNarrating(false);
          clearTimeout(safetyTimeout);
        }
      };

      console.log('[TTS] Speaking:', text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const checkRoomExists = (roomCode: string, callback: (exists: boolean) => void) => {
    console.log('[GameService] Checking if room exists:', roomCode);
    socketRef.current?.emit('checkRoom', { roomCode }, (response: { exists: boolean }) => {
      console.log('[GameService] Room exists check for', roomCode, 'result:', response.exists);
      callback(response.exists);
    });
  };

  const speak = (text: string, force: boolean = false, dedupKey?: string) => {
    // HOST LOGIC:
    // Check if Premium Voices are Enabled
    if (stateRef.current.usePremiumVoices) {
      if (isHostRef.current) {
        // Use dedup to prevent spamming server
        const now = Date.now();
        const key = dedupKey || text;
        if (!force && speechDedupRef.current[key] && now - speechDedupRef.current[key] < 1000) {
          return;
        }
        speechDedupRef.current[key] = now;

        console.log('[TTS] Requesting premium voice from server...');

        // Start a fallback timer. If server doesn't respond in 4s, use local TTS.
        const fallbackTimer = setTimeout(() => {
          console.warn('[TTS] Server took too long to respond. Falling back to local voice.');
          internalSpeak(text, force, dedupKey);
        }, 4000);

        socketRef.current?.emit('requestNarrator', {
          roomCode: stateRef.current.roomCode,
          text,
          language: stateRef.current.language
        });

        // Store the timer so we can cancel it if 'playAudio' arrives for this text
        // (Simplified: just global ref for now is fine since narration is sequential)
        (window as any)._lastTTSFallback = fallbackTimer;
      }
      // Players do nothing; they wait for 'playAudio' event
    } else {
      // Fallback or Premium Disabled: Use Local Web Speech API
      if (isHostRef.current) {
        processHostEvent({ type: 'PLAY_NARRATION', payload: { text, key: dedupKey } });
      } else {
        // Players: only speak if in online mode
        if (stateRef.current.isOnlineMode) {
          internalSpeak(text, force, dedupKey);
        }
      }
    }
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    setSocket(socket);

    if (role === 'HOST') {
      const setupHostListeners = () => {
        socket.on('playerEvent', (event: GameEvent) => {
          processHostEvent(event);
        });
      };

      // Always create a new room when hosting
      socket.emit('createRoom', { hostId: playerId }, (roomCode: string) => {
        console.log('[GameService] Room created:', roomCode, '. Saving to localStorage.');
        localStorage.setItem('bamboozle_room_code', roomCode); // Save for rejoin
        setState(prev => {
          const next = { ...prev, roomCode };
          socket.emit('gameStateUpdate', { roomCode, gameState: next });
          return next;
        });
      });
      setupHostListeners();
    }

    // Listen for game state updates
    socket.on('gameStateUpdate', (gameState: GameState) => {
      // Only non-hosts should accept state updates from server
      if (!isHostRef.current) {
        setState(gameState);
      }
    });

    // Listen for Host Events (Narration)
    socket.on('hostEvent', (event: GameEvent) => {
      if (event.type === 'PLAY_NARRATION') {
        internalSpeak(event.payload.text, false, event.payload.key);
      }
    });

    // Room is closing (host didn't reconnect in time)
    socket.on('roomClosed', () => {
      localStorage.removeItem('bamboozle_room_code'); // Clear session
      setHostDisconnected(false);
      setRoomClosed(true);
    });

    // Host disconnected - show overlay while waiting for reconnection
    socket.on('hostDisconnected', () => {
      console.log('Host disconnected. Waiting for reconnection...');
      if (!isHostRef.current) {
        setHostDisconnected(true);
      }
    });

    // Host reconnected - hide overlay
    socket.on('hostReconnected', () => {
      console.log('Host reconnected!');
      setHostDisconnected(false);
    });

    // Player was kicked after 60s disconnect timeout
    socket.on('playerKicked', ({ playerId }: { playerId: string }) => {
      console.log(`Player ${playerId} was kicked due to disconnect timeout`);
      // If we're the host, remove the player from state
      if (isHostRef.current) {
        processHostEvent({ type: 'REMOVE_PLAYER', payload: { playerId } });
      }
    });

    // LISTEN FOR SERVER AUDIO BROADCASTS
    socket.on('playAudio', ({ audioUrl, text }: { audioUrl: string, text: string }) => {
      console.log('[Audio] Received broadcast:', text, audioUrl);

      // Cancel the Host's fallback timer if audio arrived
      if ((window as any)._lastTTSFallback) {
        clearTimeout((window as any)._lastTTSFallback);
        (window as any)._lastTTSFallback = null;
      }

      // Use the current socket URL base if audioUrl is relative
      const fullUrl = audioUrl.startsWith('http') ? audioUrl : `${SOCKET_URL}${audioUrl}`;

      const audio = new Audio(fullUrl);
      activeAudioRef.current = audio;

      // Better Lip-Sync: Only start narrating when audio actually begins
      audio.onplay = () => {
        setLocalIsNarrating(true);
      };

      audio.play().catch(e => {
        console.warn('[Audio] Failed to play remote audio:', e, 'URL:', fullUrl);
        // We don't automatically fallback here to avoid double-speaking 
        // if the fallback timer already fired.
      });

      audio.onended = () => {
        setLocalIsNarrating(false);
        if (activeAudioRef.current === audio) activeAudioRef.current = null;
      };

      // Failsafe
      setTimeout(() => {
        if (activeAudioRef.current === audio) {
          setLocalIsNarrating(false);
          activeAudioRef.current = null;
        }
      }, 10000);
    });

    return () => {
      socket.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, playerId]);

  // --- BOT BRAIN (Players & Audience) ---
  useEffect(() => {
    if (role !== 'HOST') return;
    if (state.hostId !== playerId) return;

    // 1. Player Bots
    const bots = (Object.values(state.players) as Player[]).filter(p => p.isBot);
    // 2. Audience Bots
    const audienceBots = (Object.values(state.audience) as AudienceMember[]).filter(a => a.isBot);

    if (bots.length === 0 && audienceBots.length === 0) return;

    // -- Bot Category Selection --
    if (state.phase === GamePhase.CATEGORY_SELECT && state.categorySelection && !state.categorySelection.selected) {
      const selectorId = state.categorySelection.selectorId;
      const bot = bots.find(b => b.id === selectorId);
      if (bot) {
        if (Math.random() < 0.05 || state.timeLeft < 5) {
          const options = state.categorySelection.options;
          const randomCat = options[Math.floor(Math.random() * options.length)];
          processHostEvent({ type: 'SELECT_CATEGORY', payload: { category: randomCat } });
        }
      }
    }

    // -- Bot Writing --
    if (state.phase === GamePhase.WRITING) {
      bots.forEach(bot => {
        if (!state.submittedLies[bot.id]) {
          if (Math.random() < 0.2 || state.timeLeft <= 3) {
            // Pick from current question lies if available, else fallback
            const availableLies = state.currentQuestion?.lies && state.currentQuestion.lies.length > 0
              ? state.currentQuestion.lies
              : FALLBACK_BOT_LIES;

            // Ensure unique lies if possible (simple check)
            const usedLies = Object.values(state.submittedLies);
            let randomLie = availableLies[Math.floor(Math.random() * availableLies.length)];

            // Try one more time if taken
            if (usedLies.includes(randomLie)) {
              randomLie = availableLies[Math.floor(Math.random() * availableLies.length)];
            }

            processHostEvent({ type: 'SUBMIT_LIE', payload: { playerId: bot.id, text: randomLie } });
          }
        }
      });
    }

    // -- Bot Voting (Player & Audience) --
    if (state.phase === GamePhase.VOTING) {
      // Player Bots
      bots.forEach(bot => {
        if (!bot.currentVote) {
          if (Math.random() < 0.2 || state.timeLeft <= 3) {
            const validOptions = state.roundAnswers.filter(a => !a.authorIds.includes(bot.id));
            if (validOptions.length > 0) {
              const randomChoice = validOptions[Math.floor(Math.random() * validOptions.length)];
              processHostEvent({ type: 'SUBMIT_VOTE', payload: { playerId: bot.id, answerId: randomChoice.id } });
            }
          }
        }
      });

      // Audience Bots
      audienceBots.forEach(bot => {
        if (Math.random() < 0.05) {
          const options = state.roundAnswers;
          if (options.length > 0) {
            const randomChoice = options[Math.floor(Math.random() * options.length)];
            processHostEvent({ type: 'SUBMIT_AUDIENCE_VOTE', payload: { playerId: bot.id, answerId: randomChoice.id } });
          }
        }
      });
    }

    // -- Random Emotes (Audience Bots) --
    if (audienceBots.length > 0) {
      if (Math.random() < 0.05) { // 5% chance per tick
        const bot = audienceBots[Math.floor(Math.random() * audienceBots.length)];
        const types: ('LAUGH' | 'SHOCK' | 'LOVE' | 'TOMATO')[] = ['LAUGH', 'SHOCK', 'LOVE', 'TOMATO'];
        const type = types[Math.floor(Math.random() * types.length)];
        processHostEvent({ type: 'SEND_EMOTE', payload: { type, senderName: bot.name, senderSeed: bot.avatarSeed } });
      }
    }

  }, [state.timeLeft, state.phase, state.hostId, playerId, state.categorySelection]);

  // --- HOST LOGIC ---
  const processHostEvent = (event: GameEvent) => {
    const prev = stateRef.current;
    const next = { ...prev };
    next.usedQuestionIds = [...prev.usedQuestionIds];

    let changed = false;

    switch (event.type) {
      case 'JOIN_ROOM':
        // 1. RECONNECT: If ID exists in players, they are re-joining.
        // We ensure they are NOT in audience and just sync them.
        if (next.players[event.payload.id]) {
          next.players[event.payload.id].isConnected = true;
          // Clean up audience if they somehow got there
          if (next.audience[event.payload.id]) {
            const { [event.payload.id]: _, ...rest } = next.audience;
            next.audience = rest;
          }
          changed = true;
          break;
        }

        // 2. LATE JOIN: If game not in LOBBY, divert *new* IDs to Audience
        if (next.phase !== GamePhase.LOBBY) {
          if (!next.audience[event.payload.id]) {
            next.audience = {
              ...next.audience,
              [event.payload.id]: {
                id: event.payload.id,
                name: event.payload.name + " (Late)",
                avatarSeed: event.payload.avatarSeed,
                isBot: event.payload.isBot
              }
            };
            sfx.play('JOIN'); // SFX
            changed = true;
          }
          break;
        }

        if (next.phase === GamePhase.LOBBY) {
          // 1. Check Capacity
          if (Object.keys(next.players).length >= MAX_PLAYERS) {
            break;
          }

          if (!next.players[event.payload.id]) {
            const newPlayer: Player = {
              id: event.payload.id,
              name: event.payload.name,
              avatarSeed: event.payload.avatarSeed,
              score: 0,
              lastRoundScore: 0,
              isConnected: true,
              isReady: !!event.payload.isBot,
              isBot: event.payload.isBot,
              expression: 'HAPPY',
              previousRank: Object.keys(next.players).length
            };

            next.players = {
              ...next.players,
              [event.payload.id]: newPlayer
            };

            // VIP LOGIC:
            // 1. If no VIP, new player is VIP.
            // 2. If current VIP is a BOT and new player is HUMAN, new player becomes VIP.
            const currentVip = next.players[next.vipId];
            if (!next.vipId || (currentVip && currentVip.isBot && !newPlayer.isBot)) {
              next.vipId = newPlayer.id;
            }

            sfx.play('JOIN'); // SFX
            speak(getNarratorPhrase(next.language, 'JOIN', { name: event.payload.name }), false, `JOIN_${event.payload.id}`);

            // Revert to Neutral after 3 seconds
            const pid = event.payload.id;
            setTimeout(() => {
              const current = stateRef.current;
              if (current.players[pid]) {
                const updated = { ...current };
                updated.players = { ...current.players, [pid]: { ...current.players[pid], expression: 'NEUTRAL' } };
                stateRef.current = updated;
                setState(updated);
                broadcastState(updated);
              }
            }, 3000);

            changed = true;
          }
        }
        break;

      case 'JOIN_AUDIENCE':
        // Can join audience at any time
        if (!next.audience[event.payload.id]) {
          next.audience = {
            ...next.audience,
            [event.payload.id]: {
              id: event.payload.id,
              name: event.payload.name,
              avatarSeed: event.payload.avatarSeed,
              isBot: event.payload.isBot
            }
          };
          sfx.play('JOIN');
          if (Math.random() < 0.3) {
            speak(getNarratorPhrase(next.language, 'AUDIENCE_JOIN', {}), false, `JOIN_AUDIENCE_${event.payload.id}`);
          }

          changed = true;
        }
        break;

      case 'TOGGLE_READY':
        if (next.phase === GamePhase.LOBBY && next.players[event.payload.playerId]) {
          const isNowReady = !next.players[event.payload.playerId].isReady;

          next.players = {
            ...next.players,
            [event.payload.playerId]: {
              ...next.players[event.payload.playerId],
              isReady: isNowReady,
              expression: isNowReady ? 'SMUG' : 'NEUTRAL'
            }
          };

          sfx.play('CLICK');
          if (isNowReady) next.players[event.payload.playerId].expression = 'SMUG';
          else next.players[event.payload.playerId].expression = 'NEUTRAL';
          changed = true;
        }
        break;

      case 'UPDATE_ROUNDS':
        if (next.phase === GamePhase.LOBBY) {
          next.totalRounds = event.payload.rounds;
          sfx.play('CLICK');
          changed = true;
        }
        break;

      case 'START_GAME':
        stopSpeech();
        if (next.phase === GamePhase.LOBBY) {
          // Check player count
          const currentPlayers = Object.values(next.players);
          if (currentPlayers.length < 2) {
            // Add Bots needed
            const needed = 2 - currentPlayers.length;
            for (let i = 0; i < needed; i++) {
              const botId = generateId();
              const usedNames = Object.values(next.players).map(p => p.name);
              const botName = getUniqueBotName(usedNames, next.language);
              next.players[botId] = {
                id: botId,
                name: botName,
                avatarSeed: botName,
                score: 0,
                lastRoundScore: 0,
                isConnected: true,
                isReady: true,
                isBot: true,
                expression: 'NEUTRAL',
                previousRank: Object.keys(next.players).length
              };
            };
          }
        }

        next.totalRounds = event.payload.rounds;
        next.currentRound = 1;
        next.playersWhoPicked = [];
        sfx.play('START');

        startCategorySelectionPhase(next);

        changed = true;
        break;

      case 'SELECT_CATEGORY':
        if (next.phase === GamePhase.CATEGORY_SELECT && next.categorySelection && !next.categorySelection.selected) {
          next.categorySelection = { ...next.categorySelection, selected: event.payload.category };
          next.playersWhoPicked = [...next.playersWhoPicked, next.categorySelection.selectorId];

          sfx.play('SUCCESS');
          speak(getNarratorPhrase(next.language, 'CATEGORY_CHOSEN', { category: event.payload.category }), false, `CAT_CHOSEN_${event.payload.category}`);

          // Reset expressions
          if (next.players[next.categorySelection.selectorId]) {
            next.players[next.categorySelection.selectorId].expression = 'HAPPY';
          }

          if (timerRef.current) clearInterval(timerRef.current);
          startTimer(4, () => {
            const s = stateRef.current;
            const n = { ...s };
            n.usedQuestionIds = [...s.usedQuestionIds];
            startActualRound(n, event.payload.category);
            stateRef.current = n;
            setState(n);
            broadcastState(n);
          });
          changed = true;
        }
        break;

      case 'SUBMIT_LIE':
        if (next.phase === GamePhase.WRITING) {
          if (!next.submittedLies[event.payload.playerId]) {
            // Ensure text isn't empty (double check)
            if (!event.payload.text || event.payload.text.trim() === '') break;

            next.submittedLies = { ...next.submittedLies, [event.payload.playerId]: event.payload.text };
            sfx.play('POP');
            if (next.players[event.payload.playerId]) {
              next.players[event.payload.playerId].expression = 'SMUG';
            }

            const activePlayers = Object.values(next.players).filter((p: Player) => p.isConnected);
            if (Object.keys(next.submittedLies).length >= activePlayers.length) {
              startVotingPhase(next);
            }
            changed = true;
          }
        }
        break;

      case 'SUBMIT_VOTE':
        if (next.phase === GamePhase.VOTING) {
          const player = next.players[event.payload.playerId];
          if (player && !player.currentVote) {
            player.currentVote = event.payload.answerId;
            player.expression = 'THINKING';
            sfx.play('CLICK');
            next.players[event.payload.playerId] = { ...player };

            const activePlayers = Object.values(next.players).filter((p: Player) => p.isConnected);
            const votes = Object.values(next.players).filter((p: Player) => p.currentVote).length;

            if (votes >= activePlayers.length) {
              startRevealPhase(next);
            }
            changed = true;
          }
        }
        break;

      case 'SUBMIT_AUDIENCE_VOTE':
        if (next.phase === GamePhase.VOTING) {
          const ans = next.roundAnswers.find(a => a.id === event.payload.answerId);
          if (ans) {
            // Check if audience member already voted for ANY answer in this round
            let alreadyVotedAnswer: Answer | undefined;
            next.roundAnswers.forEach(a => {
              if (a.audienceVotes.includes(event.payload.playerId)) {
                alreadyVotedAnswer = a;
              }
            });

            // Remove vote from previous answer if exists
            if (alreadyVotedAnswer) {
              alreadyVotedAnswer.audienceVotes = alreadyVotedAnswer.audienceVotes.filter(id => id !== event.payload.playerId);
            }

            // Add vote to new answer
            ans.audienceVotes.push(event.payload.playerId);
            sfx.play('POP');
            changed = true;
          }
        }
        break;

      case 'SEND_EMOTE':
        // Logic to send emote
        const newEmote: Emote = {
          id: generateId(),
          type: event.payload.type,
          senderName: event.payload.senderName,
          senderSeed: event.payload.senderSeed,
          x: Math.random() * 80 + 10,
          createdAt: Date.now()
        };
        if (event.payload.type === 'LAUGH') sfx.play('POP');
        if (event.payload.type === 'SHOCK') sfx.play('FAILURE');
        next.emotes = [...next.emotes, newEmote];
        changed = true;
        break;

      case 'RESTART_GAME':
        next.phase = GamePhase.LOBBY;
        next.currentRound = 0;
        next.playersWhoPicked = [];
        next.categorySelection = null;
        sfx.play('SWOOSH');
        Object.keys(next.players).forEach(pid => {
          const p = next.players[pid];
          p.score = 0;
          p.lastRoundScore = 0;
          p.currentLie = undefined;
          p.currentVote = undefined;
          p.expression = 'NEUTRAL';
          // Auto-ready bots, unready humans
          p.isReady = !!p.isBot;
        });
        speak(getNarratorPhrase(next.language, 'RESTART', {}), false, 'RESTART');
        changed = true;
        break;

      case 'TOGGLE_ONLINE_MODE':
        if (role === 'HOST') {
          // Handled by dispatch but if we need local state change?
          // Actually TOGGLE_ONLINE_MODE logic was:
          // next.isOnlineMode = !next.isOnlineMode
          // But simpler here:
          next.isOnlineMode = !next.isOnlineMode;
          sfx.play('CLICK');
          changed = true;
        }
        break;

      case 'TOGGLE_PREMIUM_VOICES':
        if (role === 'HOST') {
          next.usePremiumVoices = !next.usePremiumVoices;
          sfx.play('CLICK');
          changed = true;
        }
        break;


      case 'TOGGLE_LANGUAGE':
        if (next.phase === GamePhase.LOBBY) {
          next.language = next.language === 'en' ? 'el' : 'en';
          // Reload questions
          questionsRef.current = loadQuestions(next.language);
          // Reset used questions
          next.usedQuestionIds = [];

          sfx.play('CLICK');
          changed = true;
        }
        break;

      case 'REMOVE_PLAYER':
        if (next.phase === GamePhase.LOBBY) {
          const targetId = event.payload.playerId;
          const targetPlayer = next.players[targetId];

          if (targetPlayer) {
            // Get the name before removal for narrator
            const playerName = targetPlayer.name;

            // Remove the player
            const { [targetId]: removed, ...remainingPlayers } = next.players;
            next.players = remainingPlayers;

            // If removed player was VIP, reassign VIP
            if (next.vipId === targetId) {
              const remainingPlayerList = Object.values(remainingPlayers);
              // Prefer human players for VIP
              const humanPlayer = remainingPlayerList.find(p => !p.isBot);
              const newVip = humanPlayer || remainingPlayerList[0];
              next.vipId = newVip?.id || '';
            }

            sfx.play('CLICK');
            speak(getNarratorPhrase(next.language, 'PLAYER_REMOVED', { name: playerName }), false, `REMOVED_${targetId}`);
            changed = true;
          }
        }
        break;

      case 'TOGGLE_PAUSE':
        // DEV ONLY: Pause/Unpause
        if (role === 'HOST') {
          const isPausing = !next.isPaused;
          next.isPaused = isPausing;

          if (isPausing) {
            console.log('[GameService] PAUSING GAME');
            // Clear all timers
            if (timerRef.current) {
              clearInterval(timerRef.current);
              clearTimeout(timerRef.current); // Just in case it was a timeout
              timerRef.current = null;
            }
            // Stop any revealing loops
            // We rely on the state freeze, but if a timeout is pending for next step, we clear it.
            // (Shared timerRef handles this)
          } else {
            console.log('[GameService] UNPAUSING GAME');
            // Resume logic
            // We need to trigger resume AFTER state update, but processHostEvent is synchronous state calculation.
            // We can use a side effect or just trust that resumeGameProgression will be called?
            // Actually, processHostEvent updates stateRef.current. 
            // We can't easily call "resumeGameProgression" from inside the reducer-like switch without being careful.
            // However, resumeGameProgression uses stateRef.current.
            // Let's set a flag or just handle it.
            // Better approach: We need to effectuate the resume. 
            // Since we are inside processHostEvent, we are about to broadcast.
            // We can attach a specialized "resume" trigger outside? 
            // Or better, just handle it in the event dispatch/processing wrapper if possible?
            // But processHostEvent is internal.

            // Simple hack: We can't call complex side-effects (like starting new intervals) easily inside here if they depend on the *new* state being fully propagated/rendered if using refs carefully.
            // BUT, resumeGameProgression takes 'state' as arg.
            // We can call it, but we need to ensure we don't double-set state if resumeGameProgression calls setState.
            // resumeGameProgression DOES call setState/broadcast.
            // So calling it here would be recursive/problematic if we are already in the "update state" flow.

            // CHANGE OF PLAN: logic for RESUME needs to happen *after* the state update is committed/broadcast.
            // But we need to do it. 
            // We'll set a flag in the 'changed' block? No.

            // Workaround: We'll defer the resume call using setTimeout(..., 0)
            setTimeout(() => {
              resumeGameProgression(next);
            }, 50);
          }
          changed = true;
        }
        break;
    }

    if (changed) {
      stateRef.current = next;
      setState(next);
      broadcastState(next);
    }

    // Special Handling for Narrator Event (State Independent Broadcast)
    if (event.type === 'PLAY_NARRATION') {
      // Broadcast via hostEvent channel ONLY if in Online Mode
      if (next.isOnlineMode) {
        socketRef.current?.emit('hostEvent', { roomCode: next.roomCode, event });
      }
      // Play locally for Host
      internalSpeak(event.payload.text, false, event.payload.key);
    }
  };

  // --- BOT/AUDIENCE AUTO-START WATCHER ---
  useEffect(() => {
    if (role !== 'HOST' || state.phase !== GamePhase.LOBBY) return;

    const players = Object.values(state.players);
    const audience = Object.values(state.audience);
    const hasBots = players.length > 0 && players.every(p => p.isBot);
    const hasAudience = audience.length > 0;

    // If we have only bots, and an audience member joins, start automatically
    if (hasBots && hasAudience) {
      const t = setTimeout(() => {
        processHostEvent({ type: 'START_GAME', payload: { rounds: 3 } });
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [state.players, state.audience, state.phase]);

  const startCategorySelectionPhase = (state: GameState) => {
    state.phase = GamePhase.CATEGORY_SELECT;
    sfx.play('SWOOSH');

    let availableQuestions = questionsRef.current.filter(q => !state.usedQuestionIds.includes(q.id));
    if (availableQuestions.length < 5) {
      state.usedQuestionIds = [];
      availableQuestions = questionsRef.current;
    }

    // --- SMART CATEGORY SELECTION ---
    // 1. Get all technically available categories from unused questions
    const validCategories = Array.from(new Set(availableQuestions.map(q => q.category)));

    // 2. Split into Fresh (not seen recently) and Stale (seen recently)
    const recent = state.recentCategories || [];
    const freshCategories = validCategories.filter(c => !recent.includes(c));
    const staleCategories = validCategories.filter(c => recent.includes(c));

    // 3. Shuffle both lists
    const shuffledFresh = shuffle(freshCategories);
    const shuffledStale = shuffle(staleCategories);

    // 4. Fill slots: Prioritize Fresh
    const options: string[] = [];

    // Take as many fresh as possible up to 6
    options.push(...shuffledFresh.slice(0, 6));

    // If we still need more, take from Stale
    if (options.length < 6) {
      const needed = 6 - options.length;
      options.push(...shuffledStale.slice(0, needed));
    }

    // 5. Update recent categories for next time
    state.recentCategories = options;

    let candidateIds = Object.keys(state.players).filter(pid => !state.playersWhoPicked.includes(pid));
    if (candidateIds.length === 0) {
      state.playersWhoPicked = [];
      candidateIds = Object.keys(state.players);
    }

    const selectorId = candidateIds[Math.floor(Math.random() * candidateIds.length)];
    const selectorName = state.players[selectorId].name;

    state.categorySelection = {
      selectorId,
      options,
      selected: null
    };

    // Reset Expressions
    Object.values(state.players).forEach(p => {
      if (p.id === selectorId) p.expression = 'THINKING';
      else p.expression = 'NEUTRAL';
    });

    speak(getNarratorPhrase(state.language, 'CATEGORY_INIT', { name: selectorName }), false, `CAT_INIT_${selectorName}_${state.currentRound}`);

    state.timeLeft = 20;
    startTimer(20, () => {
      const s = stateRef.current;
      if (s.phase === GamePhase.CATEGORY_SELECT && s.categorySelection && !s.categorySelection.selected) {
        const randomCat = s.categorySelection.options[Math.floor(Math.random() * s.categorySelection.options.length)];
        processHostEvent({ type: 'SELECT_CATEGORY', payload: { category: randomCat } });
      }
    });
  };

  const startActualRound = (state: GameState, category: string) => {
    state.phase = GamePhase.INTRO;
    sfx.play('SWOOSH');

    let availableQuestions = questionsRef.current.filter(q => !state.usedQuestionIds.includes(q.id) && q.category === category);
    if (availableQuestions.length === 0) availableQuestions = questionsRef.current.filter(q => !state.usedQuestionIds.includes(q.id));
    if (availableQuestions.length === 0) { availableQuestions = questionsRef.current; state.usedQuestionIds = []; }

    const selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    state.currentQuestion = selectedQuestion;

    state.usedQuestionIds = [...state.usedQuestionIds];
    if (!state.usedQuestionIds.includes(selectedQuestion.id)) {
      state.usedQuestionIds.push(selectedQuestion.id);
    }

    state.submittedLies = {};
    state.roundAnswers = [];

    const sortedByScore = Object.values(state.players).sort((a, b) => b.score - a.score);
    Object.values(state.players).forEach((p: Player) => {
      p.currentLie = undefined;
      p.currentVote = undefined;
      p.lastRoundScore = 0;
      p.expression = 'NEUTRAL';
      p.previousRank = sortedByScore.findIndex(pl => pl.id === p.id);
    });

    let multiplierText = "";
    let roundPhrase = getNarratorPhrase(state.language, 'ROUND_INTRO', { round: state.currentRound });

    if (state.currentRound === state.totalRounds) {
      multiplierText = getNarratorPhrase(state.language, 'MULTIPLIER_3', {});
      roundPhrase = getNarratorPhrase(state.language, 'FINAL_ROUND', {});
    } else if (state.currentRound === state.totalRounds - 1) {
      multiplierText = getNarratorPhrase(state.language, 'MULTIPLIER_2', {});
      roundPhrase += multiplierText;
    }

    speak(roundPhrase, true, `ROUND_INTRO_${state.currentRound}`);

    const introDuration = Math.max(3000, roundPhrase.split(' ').length * 400 + 1000);

    setTimeout(() => {
      const blankWord = getNarratorPhrase(state.language, 'BLANK_WORD', {}) || 'blank';
      const questionText = state.currentQuestion!.fact.replace('<BLANK>', blankWord);
      speak(questionText, false, `QUESTION_${state.currentQuestion!.id}`);
      const readingDuration = Math.max(3000, questionText.split(' ').length * 350 + 2000);

      state.timeLeft = 0;
      startTimer(readingDuration / 1000, () => {
        const s = stateRef.current;
        const next = { ...s };
        startWritingPhase(next);
        stateRef.current = next;
        setState(next);
        broadcastState(next);
      });

    }, introDuration);
  };

  const startWritingPhase = (state: GameState) => {
    state.phase = GamePhase.WRITING;
    sfx.play('SWOOSH');
    state.timeLeft = ROUND_TIMER_SECONDS.WRITING;
    Object.values(state.players).forEach(p => p.expression = 'THINKING');

    const players = Object.values(state.players);
    const randomP = players.length > 0 ? players[Math.floor(Math.random() * players.length)].name : 'someone';
    speak(getNarratorPhrase(state.language, 'WRITING', { randomPlayer: randomP, seconds: ROUND_TIMER_SECONDS.WRITING }), false, `WRITING_${state.currentRound}`);

    startTimer(ROUND_TIMER_SECONDS.WRITING, () => {
      const s = stateRef.current;
      const n2 = { ...s };
      startVotingPhase(n2);
      stateRef.current = n2;
      setState(n2);
      broadcastState(n2);
    });
  };

  const startVotingPhase = (state: GameState) => {
    state.phase = GamePhase.VOTING;
    sfx.play('SWOOSH');
    state.timeLeft = ROUND_TIMER_SECONDS.VOTING;

    const answers: Answer[] = [];
    answers.push({ id: 'TRUTH', text: state.currentQuestion!.answer, authorIds: ['SYSTEM'], votes: [], audienceVotes: [] });

    const groupedLies: Record<string, string[]> = {};
    Object.entries(state.submittedLies).forEach(([pid, text]) => {
      // Basic normalization for grouping same lies
      if (text.toLowerCase() === state.currentQuestion!.answer.toLowerCase()) return;
      const normalizedText = text.trim();
      const existingKey = Object.keys(groupedLies).find(k => k.toLowerCase() === normalizedText.toLowerCase());
      if (existingKey) groupedLies[existingKey].push(pid);
      else groupedLies[normalizedText] = [pid];
    });

    // --- HOST BOT LIES (If < 6 players) ---
    const activePlayersCount = Object.keys(state.players).length;
    if (activePlayersCount < 6 && state.currentQuestion?.lies) {
      const numToadd = Math.random() < 0.5 ? 1 : 2;
      const potentialLies = state.currentQuestion.lies.filter(l =>
        l.toLowerCase() !== state.currentQuestion!.answer.toLowerCase() &&
        !Object.values(state.submittedLies).some(sl => sl.toLowerCase() === l.toLowerCase())
      );

      const shuffled = shuffle(potentialLies);
      const selected = shuffled.slice(0, numToadd);

      selected.forEach(lie => {
        const normalized = lie.trim();
        if (groupedLies[normalized]) {
          groupedLies[normalized].push('HOST_BOT');
        } else {
          groupedLies[normalized] = ['HOST_BOT'];
        }
      });
    }

    Object.entries(groupedLies).forEach(([text, pids], idx) => {
      answers.push({
        id: `LIE_${idx}`,
        text: text,
        authorIds: pids,
        votes: [],
        audienceVotes: []
      });
    });

    state.roundAnswers = shuffle(answers);

    const players = Object.values(state.players);
    const randomP = players.length > 0 ? players[Math.floor(Math.random() * players.length)].name : 'someone';
    speak(getNarratorPhrase(state.language, 'VOTING', { randomPlayer: randomP }), false, `VOTING_${state.currentRound}`);

    startTimer(ROUND_TIMER_SECONDS.VOTING, () => {
      const s = stateRef.current;
      const n = { ...s };
      startRevealPhase(n);
      stateRef.current = n;
      setState(n);
      broadcastState(n);
    });
  };

  const handlePostLeaderboard = () => {
    const s = stateRef.current;
    const n = { ...s };
    if (n.currentRound < n.totalRounds) {
      n.currentRound += 1;
      startCategorySelectionPhase(n);
    } else {
      n.phase = GamePhase.GAME_OVER;
      sfx.play('SUCCESS');
      const allPlayers = Object.values(n.players);
      const winner = allPlayers.length > 0 ? allPlayers.sort((a: any, b: any) => b.score - a.score)[0] : null;
      if (winner) {
        speak(getNarratorPhrase(n.language, 'GAME_OVER', { winner: winner.name }), false, 'GAME_OVER');
        if (n.players[winner.id]) {
          n.players[winner.id].expression = 'HAPPY';
        }
      } else {
        speak("Game over!", false, 'GAME_OVER_DEFAULT');
      }
    }
    stateRef.current = n;
    setState(n);
    broadcastState(n);
  };

  const startLeaderboardPhase = () => {
    const s = stateRef.current;

    // Don't restart if already there (unless forcing)
    // if (s.phase === GamePhase.LEADERBOARD) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const n = { ...s };
    n.phase = GamePhase.LEADERBOARD;
    n.leaderboardPhase = 'INTRO';
    sfx.play('SWOOSH');

    // Broadcast initial state (INTRO)
    stateRef.current = n;
    setState(n);
    broadcastState(n);

    // Timeline:
    // 0s: INTRO (Old Scores) -> Speak Intro
    const intro = getNarratorPhrase(n.language, 'LEADERBOARD_INTRO', {});
    speak(intro, false, `LEADERBOARD_INTRO_${n.currentRound}`);

    // 2.5s: REVEAL (New Scores animate)
    timerRef.current = window.setTimeout(() => {
      const s2 = { ...stateRef.current, leaderboardPhase: 'REVEAL' as const };
      stateRef.current = s2;
      setState(s2);
      broadcastState(s2);

      // 4.5s: LEADER (Highlight Leader)
      const diff = 4000; // Time for count up animation
      timerRef.current = window.setTimeout(() => {
        const s3 = { ...stateRef.current, leaderboardPhase: 'LEADER' as const };
        // Sort to find leader
        const leader = Object.values(s3.players).sort((a, b) => b.score - a.score)[0];

        if (leader) {
          const text = getNarratorPhrase(n.language, 'LEADERBOARD_LEADER', { name: leader.name });
          speak(text, false, `LEADERBOARD_LEADER_${n.currentRound}`);
        }

        stateRef.current = s3;
        setState(s3);
        broadcastState(s3);

        // 8s: NEXT PHASE (Category or Game Over)
        timerRef.current = window.setTimeout(() => {
          handlePostLeaderboard();
        }, 5000);

      }, diff);

    }, 2500);

  };

  const startRevealPhase = (state: GameState) => {
    state.phase = GamePhase.REVEAL;
    if (timerRef.current) clearInterval(timerRef.current);

    // Points Logic (Existing)
    const multiplier = state.currentRound >= state.totalRounds ? 3 : (state.currentRound === state.totalRounds - 1 ? 2 : 1);
    const TRUTH_POINTS = 1000 * multiplier;
    const BASE_LIE_POINTS = TRUTH_POINTS / 2;

    Object.values(state.players).forEach((p: Player) => {
      if (!p.currentVote) return;
      const votedAnswer = state.roundAnswers.find(a => a.id === p.currentVote);
      if (votedAnswer) {
        votedAnswer.votes.push(p.id);
        if (votedAnswer.authorIds.includes('SYSTEM')) {
          p.lastRoundScore += TRUTH_POINTS;
          p.score += TRUTH_POINTS;
        } else {
          votedAnswer.authorIds.forEach(authorId => {
            const liar = state.players[authorId];
            if (liar && p.id !== liar.id) {
              liar.lastRoundScore += BASE_LIE_POINTS;
              liar.score += BASE_LIE_POINTS;
            }
          });
        }
      }
    });

    // --- NEW REVEAL LOGIC ---
    // 1. Generate Order
    const truth = state.roundAnswers.find(a => a.authorIds.includes('SYSTEM'));
    const relevantAnswers = state.roundAnswers.filter(a =>
      a.authorIds.includes('SYSTEM') || a.votes.length > 0
    );
    const lies = relevantAnswers.filter(a => !a.authorIds.includes('SYSTEM'));
    // Shuffle lies deterministically or randomly (randomly is fine as it's done once by host)
    const shuffledLies = shuffle(lies);
    const sequence = [...shuffledLies, truth!].filter(Boolean);

    state.revealOrder = sequence.map(a => a.id);
    state.revealStep = 0;
    state.revealSubPhase = 'CARD';

    // Broadcast Initial State
    broadcastState(state);

    // 2. Start Recursive Step Loop
    runRevealStep(state);
  };

  const runRevealStep = (state: GameState) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Check if we are done
    if (state.revealStep >= state.revealOrder.length) {
      startLeaderboardPhase();
      return;
    }

    const currentAnswerId = state.revealOrder[state.revealStep];
    const currentAnswer = state.roundAnswers.find(a => a.id === currentAnswerId);

    if (!currentAnswer) {
      // Should not happen, but skip if bad data
      state.revealStep++;
      runRevealStep(state);
      return;
    }

    const isTruth = currentAnswer.authorIds.includes('SYSTEM');
    const voters = currentAnswer.votes.map(vid => state.players[vid]).filter(Boolean);
    const voterNames = joinNames(voters.map(v => v.name), state.language);
    // const authors = currentAnswer.authorIds.map(id => state.players[id]).filter(Boolean);

    // Helper to advance after delay
    const advance = (delay: number, nextFn: () => void) => {
      timerRef.current = window.setTimeout(nextFn, delay);
    };

    const updateAndBroadcast = (s: GameState) => {
      stateRef.current = s;
      setState(s);
      broadcastState(s);
    };

    // SEQUENCE FLOW:
    // 1. CARD Display (Already set before calling this or at end of previous)
    // - Speak Lie/Truth Text
    sfx.play('POP');
    speak(getNarratorPhrase(state.language, 'REVEAL_CARD_INTRO', { text: currentAnswer.text }), false, `REVEAL_CARD_${currentAnswerId}`);

    // Wait for text read (approx 2s) + delay -> Go to VOTERS
    advance(2500, () => {
      state.revealSubPhase = 'VOTERS';
      updateAndBroadcast(state);

      // VOTERS Logic
      // Check triggers for SFX/Speech
      if (voters.length > 0) {
        if (isTruth) {
          sfx.play('SUCCESS');
          speak(getNarratorPhrase(state.language, 'REVEAL_CORRECT_GROUP', { names: voterNames }), false, `CORRECT_${currentAnswerId}`);
        } else {
          sfx.play('FAILURE');
          if (currentAnswer.audienceVotes.length > 2) {
            speak(getNarratorPhrase(state.language, 'PLAYER_FOOLED_BY_AUDIENCE', { names: voterNames }), false, `FOOLED_AUD_${currentAnswerId}`);
          } else {
            speak(getNarratorPhrase(state.language, 'REVEAL_FOOLED_GROUP', { names: voterNames }), false, `FOOLED_${currentAnswerId}`);
          }
        }
      } else {
        if (isTruth) speak(getNarratorPhrase(state.language, 'REVEAL_NOBODY', {}), false, `NOBODY_${currentAnswerId}`);
      }

      // Wait -> Go to AUTHOR
      // Wait -> Go to AUTHOR
      advance(3000, () => { // Give time for voter reaction speech
        state.revealSubPhase = 'AUTHOR';
        updateAndBroadcast(state);

        // AUTHOR Logic
        let speechText = '';

        if (isTruth) {
          sfx.play('REVEAL');
          const intro = getNarratorPhrase(state.language, 'REVEAL_TRUTH_INTRO', {});
          const fullFact = state.currentQuestion?.fact.replace('<BLANK>', currentAnswer.text) || currentAnswer.text;
          speechText = `${intro} ${fullFact}`;
          speak(speechText, false, `TRUTH_${currentAnswerId}`);
        } else {
          const authors = currentAnswer.authorIds.map(id => state.players[id]).filter(Boolean);
          if (authors.length > 0) {
            if (authors.length === 1) {
              speechText = getNarratorPhrase(state.language, 'REVEAL_LIAR', { name: authors[0].name });
              speak(speechText, false, `LIAR_${currentAnswerId}`);
            } else {
              const names = joinNames(authors.map(a => a.name), state.language);
              speechText = getNarratorPhrase(state.language, 'REVEAL_LIAR_JINX', { names: names });
              speak(speechText, false, `LIAR_JINX_${currentAnswerId}`);
            }
          } else if (currentAnswer.authorIds.includes('HOST_BOT')) {
            // HOST LIE REVEAL
            sfx.play('FAILURE');
            speechText = getNarratorPhrase(state.language, 'REVEAL_HOST_LIE', { names: voterNames });
            speak(speechText, false, `HOST_LIE_${currentAnswerId}`);
          }
        }

        // Calculate duration based on text length
        // Approx 450ms per word (slower reading) + 3s buffer to let it sink in
        const wordCount = speechText.split(' ').length;
        const duration = Math.max(4000, wordCount * 450 + 1000);

        // Wait -> Next Step
        advance(duration, () => {
          state.revealStep++;
          state.revealSubPhase = 'CARD'; // Reset for next
          updateAndBroadcast(state);
          runRevealStep(state);
        });
      });
    });
  };

  const startTimer = (seconds: number, onComplete: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current);
    let t = seconds;
    timerRef.current = window.setInterval(() => {
      t--;
      const prev = stateRef.current;
      const next = { ...prev, timeLeft: t };

      // --- REACTIVE EXPRESSIONS ---
      if (t < 10 && t > 0) {
        let changed = false;
        // Play ticking sound on host only logic
        sfx.play('TICK');

        if (next.phase === GamePhase.WRITING) {
          Object.values(next.players).forEach(p => {
            if (!next.submittedLies[p.id] && p.expression !== 'SHOCKED') {
              p.expression = 'SHOCKED';
              changed = true;
            }
          });
        } else if (next.phase === GamePhase.VOTING) {
          Object.values(next.players).forEach(p => {
            if (!p.currentVote && p.expression !== 'SHOCKED') {
              p.expression = 'SHOCKED';
              changed = true;
            }
          });
        }
        if (changed) broadcastState(next);
      }

      if (t % 1 === 0) broadcastState(next);

      stateRef.current = next;
      setState(next);

      if (t <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        onComplete();
      }
    }, 1000);
  };

  const broadcastState = (newState: GameState) => {
    socketRef.current?.emit('gameStateUpdate', { roomCode: newState.roomCode, gameState: newState });
  };

  const resumeGameProgression = (state: GameState) => {
    if (!isHostRef.current) return;

    console.log('[Host Reclaim] Resuming game progression for phase:', state.phase, 'Time left:', state.timeLeft);

    // If it's a phase with a countdown, restart the timer
    if (state.phase === GamePhase.WRITING) {
      startTimer(state.timeLeft > 0 ? state.timeLeft : 60, () => {
        const s = { ...stateRef.current };
        startVotingPhase(s);
        stateRef.current = s;
        setState(s);
        broadcastState(s);
      });
    } else if (state.phase === GamePhase.VOTING) {
      startTimer(state.timeLeft > 0 ? state.timeLeft : 60, () => {
        const s = { ...stateRef.current };
        startRevealPhase(s);
        stateRef.current = s;
        setState(s);
        broadcastState(s);
      });
    } else if (state.phase === GamePhase.CATEGORY_SELECT) {
      if (state.categorySelection?.selected) {
        // Category already selected, start the short delay to Actual Round
        startTimer(4, () => {
          const s = { ...stateRef.current };
          startActualRound(s, s.categorySelection!.selected!);
          stateRef.current = s;
          setState(s);
          broadcastState(s);
        });
      } else {
        startTimer(state.timeLeft > 0 ? state.timeLeft : 20, () => {
          const s = stateRef.current;
          if (s.phase === GamePhase.CATEGORY_SELECT && s.categorySelection && !s.categorySelection.selected) {
            const randomCat = s.categorySelection.options[Math.floor(Math.random() * s.categorySelection.options.length)];
            processHostEvent({ type: 'SELECT_CATEGORY', payload: { category: randomCat } });
          }
        });
      }
    } else if (state.phase === GamePhase.REVEAL) {
      // For reveal, we can safely just run the current step again
      runRevealStep(state);
    } else if (state.phase === GamePhase.INTRO) {
      // If we were reading the question intro, jump to writing to avoid freeze
      startWritingPhase(state);
      stateRef.current = state;
      setState(state);
      broadcastState(state);
    } else if (state.phase === GamePhase.LEADERBOARD) {
      // For leaderboard, if it was mid-animation it might freeze. 
      // Safest to just jump to STANDINGS or restart it. Restarting is safer.
      startLeaderboardPhase();
    }
  };

  const dispatch = (event: GameEvent) => {
    // Debug log
    console.log('[Dispatch]', isHostRef.current ? 'HOST' : role, event.type, stateRef.current.roomCode);

    if (isHostRef.current) {
      processHostEvent(event);
    } else {
      socketRef.current?.emit('playerEvent', { roomCode: stateRef.current.roomCode, event });
    }
  };

  // Exposed Actions
  const joinRoom = (roomCode: string, callback?: (success: boolean, error?: string, becameHost?: boolean) => void) => {
    socketRef.current?.emit('joinRoom', { roomCode, id: playerId }, (response: any) => {
      if (response.success) {
        // Update both stateRef and setState to ensure everything is in sync
        stateRef.current = response.state;
        setState(response.state);

        // If we reclaimed host status, set up host listeners and broadcast function
        if (response.becameHost) {
          console.log('Reclaimed host status! Setting up host listeners.');

          // Mark this client as now being the host
          isHostRef.current = true;

          // Set up playerEvent listener for incoming player actions
          socketRef.current?.on('playerEvent', (event: GameEvent) => {
            processHostEvent(event);
          });

          // Ensure host is VIP if they're a player
          const updatedState = { ...response.state };
          if (updatedState.players[playerId]) {
            updatedState.vipId = playerId;
            stateRef.current = updatedState;
            setState(updatedState);
          }

          // Broadcast the current state to sync all players
          socketRef.current?.emit('gameStateUpdate', { roomCode, gameState: stateRef.current });

          // Resume game logic if mid-game
          resumeGameProgression(stateRef.current);
        }

        if (callback) callback(true, undefined, response.becameHost);
        // Save code on successful join
        console.log('[GameService] Joined room:', roomCode, '. Saving to localStorage.');
        localStorage.setItem('bamboozle_room_code', roomCode);
      } else {
        if (callback) callback(false, response.error);
      }
    });
  };

  const sendJoin = (name: string, avatarSeed: string) => {
    dispatch({ type: 'JOIN_ROOM', payload: { id: playerId, name, avatarSeed } });
  };

  const sendJoinAudience = (name: string, avatarSeed: string) => {
    dispatch({ type: 'JOIN_AUDIENCE', payload: { id: playerId, name, avatarSeed } });
  };
  const sendToggleReady = () => dispatch({ type: 'TOGGLE_READY', payload: { playerId } });

  const addBot = () => {
    const botId = generateId();
    const usedNames = Object.values(state.players).map(p => p.name);
    const botName = getUniqueBotName(usedNames, state.language);
    dispatch({ type: 'JOIN_ROOM', payload: { id: botId, name: botName, avatarSeed: botName, isBot: true } });
  };

  const addAudienceBot = () => {
    const botId = generateId();
    const botName = (getNarratorPhrase(state.language, 'AUDIENCE_BOT_NAME', {}) || "Audience Bot") + " " + (Math.floor(Math.random() * 90) + 10);
    dispatch({ type: 'JOIN_AUDIENCE', payload: { id: botId, name: botName, avatarSeed: botName, isBot: true } });
  };

  const sendStartGame = (rounds: number) => dispatch({ type: 'START_GAME', payload: { rounds } });
  const sendUpdateRounds = (rounds: number) => dispatch({ type: 'UPDATE_ROUNDS', payload: { rounds } });
  const sendLie = (text: string) => dispatch({ type: 'SUBMIT_LIE', payload: { playerId, text } });
  const sendVote = (answerId: string) => dispatch({ type: 'SUBMIT_VOTE', payload: { playerId, answerId } });
  const sendAudienceVote = (answerId: string) => dispatch({ type: 'SUBMIT_AUDIENCE_VOTE', payload: { playerId, answerId } });
  const sendEmote = (type: 'LAUGH' | 'SHOCK' | 'LOVE' | 'TOMATO', senderName: string, senderSeed: string) => dispatch({ type: 'SEND_EMOTE', payload: { type, senderName, senderSeed } });

  const removePlayer = (targetPlayerId: string) => dispatch({ type: 'REMOVE_PLAYER', payload: { playerId: targetPlayerId } });

  const sendRestart = () => dispatch({ type: 'RESTART_GAME', payload: null });
  const sendCategorySelection = (category: string) => dispatch({ type: 'SELECT_CATEGORY', payload: { category } });

  const requestSync = (callback?: (success: boolean) => void) => {
    const now = Date.now();
    if (now - lastSyncRef.current < 30000) {
      console.log('Sync cooldown active');
      if (callback) callback(false);
      return;
    }

    if (!state.roomCode) return;

    lastSyncRef.current = now;
    socketRef.current?.emit('requestState', { roomCode: state.roomCode }, (remoteState: GameState | null) => {
      if (remoteState) {
        setState(remoteState);
        if (callback) callback(true);
      } else {
        if (callback) callback(false);
      }
    });
  };

  const triggerNextPhase = () => {
    if (role === 'HOST') {
      if (stateRef.current.phase === GamePhase.REVEAL) {
        if (timerRef.current) clearInterval(timerRef.current);
        startLeaderboardPhase();
      } else if (stateRef.current.phase === GamePhase.LEADERBOARD) {
        if (timerRef.current) clearInterval(timerRef.current);
        handlePostLeaderboard();
      }
    }
  };

  return {
    state, playerId, actions: {
      joinRoom,
      requestSync, // Added requestSync
      sendJoin,
      sendJoinAudience,
      sendToggleReady,
      addBot,
      addAudienceBot,
      sendStartGame,
      sendUpdateRounds,
      sendLie,
      sendVote,
      sendAudienceVote,
      sendEmote,
      removePlayer,
      sendRestart,
      sendCategorySelection,
      checkRoomExists,
      speak,
      triggerNextPhase,
      sendToggleOnlineMode: () => {
        if (role === 'HOST') {
          processHostEvent({ type: 'TOGGLE_ONLINE_MODE', payload: null });
        }
      },
      sendTogglePause: () => {
        dispatch({ type: 'TOGGLE_PAUSE', payload: null });
      }
    },
    isSpeaking: localIsNarrating, // Use local state primarily for lip sync as it reflects actual audio
    hostDisconnected,
    roomClosed
  };
};