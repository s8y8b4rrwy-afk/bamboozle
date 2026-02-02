import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, GameEvent, Player, GamePhase, Answer, Question, Expression, AudienceMember, Emote } from '../types';
import { ROUND_TIMER_SECONDS } from '../constants';
import { QUESTIONS as RAW_QUESTIONS } from '../data/questions';
import { PHRASES, getRandomPhrase } from '../data/narratorLines';
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

// Hydrate questions with runtime IDs
const GAME_QUESTIONS: Question[] = RAW_QUESTIONS.map((q) => ({
    ...q,
    id: generateQuestionId(q.fact)
}));

const STORAGE_KEY = 'bamboozle_used_questions';
const MAX_PLAYERS = 6;
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

// Bot Data
const BOT_NAMES = ['Hal 9000', 'GLaDOS', 'Wall-E', 'R2-D2', 'Data', 'Bender', 'Marvin', 'Cortana', 'Maria', 'Optimus', 'Megatron', 'T-800'];
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
  emotes: []
};

export const useGameService = (role: 'HOST' | 'PLAYER' | 'AUDIENCE', playerName?: string) => {
  const [playerId] = useState(() => {
    // Persist Player ID to allow reconnection on refresh
    const stored = localStorage.getItem('bamboozle_player_id');
    if (stored) return stored;
    const newId = generateId();
    localStorage.setItem('bamboozle_player_id', newId);
    return newId;
  });

  // Initialize state with persistence check for HOST
  const [state, setState] = useState<GameState>(() => {
      const baseState = { ...INITIAL_STATE };
      if (role === 'HOST') {
          try {
              const stored = localStorage.getItem(STORAGE_KEY);
              if (stored) {
                  const usedIds = JSON.parse(stored);
                  if (Array.isArray(usedIds)) {
                      // Validate IDs exist in current version
                      const validIds = usedIds.filter((uid: string) => GAME_QUESTIONS.some(q => q.id === uid));
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
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<number | null>(null);
  const speechDedupRef = useRef<Record<string, number>>({});
  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Persist used questions when they change (HOST only)
  useEffect(() => {
      if (role === 'HOST') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.usedQuestionIds));
      }
  }, [state.usedQuestionIds, role]);

  // Emote Cleanup Loop (Host Only)
  useEffect(() => {
    if (role !== 'HOST') return;
    const interval = setInterval(() => {
        setState(prev => {
            const now = Date.now();
            // Remove emotes older than 2.5 seconds (faster cleanup)
            const validEmotes = prev.emotes.filter(e => now - e.createdAt < 2500);
            
            if (validEmotes.length !== prev.emotes.length) {
                const next = { ...prev, emotes: validEmotes };
                broadcastState(next);
                return next;
            }
            return prev;
        });
    }, 500); // Check more frequently
    return () => clearInterval(interval);
  }, [role]);

  // --- AUDIO / TTS ENGINE ---
  const speak = (text: string, force: boolean = false, dedupKey?: string) => {
    if ('speechSynthesis' in window) {
      const now = Date.now();
      const key = dedupKey || text;
      
      // Debounce: If same key/text spoken within 1 second, skip
      if (!force && speechDedupRef.current[key] && now - speechDedupRef.current[key] < 1000) {
          return;
      }
      speechDedupRef.current[key] = now;

      const randomRate = 0.9 + Math.random() * 0.2; 
      const randomPitch = 0.9 + Math.random() * 0.2;

      // Ensure we don't cut off previous speech abruptly unless forced
      if (force) window.speechSynthesis.cancel(); 
      
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.name.includes('Google US English')) || 
                        voices.find(v => v.lang.includes('en-US')) || 
                        voices[0];
      
      if (preferred) utterance.voice = preferred;
      utterance.pitch = randomPitch;
      utterance.rate = randomRate;
      
      // Update Narrating State
      utterance.onstart = () => {
          setState(prev => ({ ...prev, isNarrating: true }));
      };
      utterance.onend = () => {
          setState(prev => ({ ...prev, isNarrating: false }));
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    if (role === 'HOST') {
      socket.emit('createRoom', (roomCode: string) => {
        setState(prev => {
          const next = { ...prev, roomCode };
          socket.emit('gameStateUpdate', { roomCode, gameState: next });
          return next;
        });
      });

      socket.on('playerEvent', (event: GameEvent) => {
        processHostEvent(event);
      });
    } else {
        // Auto-reconnect logic for players/audience
        const storedRoom = localStorage.getItem('bamboozle_room_code');
        if (storedRoom) {
            socket.emit('joinRoom', { roomCode: storedRoom, id: playerId }, (response: any) => {
                if (response.success) {
                    setState(response.state);
                    console.log('Auto-reconnected to room:', storedRoom);
                } else {
                    // If room invalid, clear storage
                    localStorage.removeItem('bamboozle_room_code');
                }
            });
        }
    }

    // Listen for game state updates
    socket.on('gameStateUpdate', (gameState: GameState) => {
      if (role !== 'HOST') {
        setState(gameState);
      }
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
            const types: ('LAUGH'|'SHOCK'|'LOVE'|'TOMATO')[] = ['LAUGH', 'SHOCK', 'LOVE', 'TOMATO'];
            const type = types[Math.floor(Math.random() * types.length)];
            processHostEvent({ type: 'SEND_EMOTE', payload: { type, senderName: bot.name, senderSeed: bot.avatarSeed } });
        }
    }

  }, [state.timeLeft, state.phase, state.hostId, playerId, state.categorySelection]); 

  // --- HOST LOGIC ---
  const processHostEvent = (event: GameEvent) => {
    setState(prev => {
      const next = { ...prev };
      next.usedQuestionIds = [...prev.usedQuestionIds];
      
      let changed = false;

      switch (event.type) {
        case 'JOIN_ROOM':
          // LATE JOIN LOGIC: If game not in LOBBY, divert to Audience
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
                speak(getRandomPhrase('JOIN', { name: event.payload.name }), false, `JOIN_${event.payload.id}`);
                
                // Revert to Neutral after 3 seconds
                const pid = event.payload.id;
                setTimeout(() => {
                    setState(s => {
                        const n = { ...s };
                        if (n.players[pid]) n.players[pid].expression = 'NEUTRAL';
                        broadcastState(n);
                        return n;
                    });
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
                     speak(getRandomPhrase('AUDIENCE_JOIN'), false, `JOIN_AUDIENCE_${event.payload.id}`);
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
          if (next.phase === GamePhase.LOBBY) {
            // Check player count
            const currentPlayers = Object.values(next.players);
            if (currentPlayers.length < 2) {
                // Add Bots needed
                const needed = 2 - currentPlayers.length;
                for (let i = 0; i < needed; i++) {
                    const botId = generateId();
                    const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] + ` ${Math.floor(Math.random() * 100)}`;
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
                }
                speak("Adding some bots so you don't play alone.", false, 'ADD_BOTS');
            }

            next.totalRounds = event.payload.rounds;
            next.currentRound = 1;
            next.playersWhoPicked = [];
            sfx.play('START');
            startCategorySelectionPhase(next);
            changed = true;
          }
          break;

        case 'SELECT_CATEGORY':
            if (next.phase === GamePhase.CATEGORY_SELECT && next.categorySelection && !next.categorySelection.selected) {
                 next.categorySelection = { ...next.categorySelection, selected: event.payload.category };
                 next.playersWhoPicked = [...next.playersWhoPicked, next.categorySelection.selectorId];
                 
                 sfx.play('SUCCESS');
                 speak(getRandomPhrase('CATEGORY_CHOSEN', { category: event.payload.category }), false, `CAT_CHOSEN_${event.payload.category}`);
                 
                 // Reset expressions
                 if (next.players[next.categorySelection.selectorId]) {
                     next.players[next.categorySelection.selectorId].expression = 'HAPPY';
                 }

                 if (timerRef.current) clearInterval(timerRef.current);
                 startTimer(4, () => {
                     setState(s => {
                         const n = { ...s };
                         n.usedQuestionIds = [...s.usedQuestionIds];
                         startActualRound(n, event.payload.category);
                         broadcastState(n);
                         return n;
                     });
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
                if(next.players[event.payload.playerId]) {
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
          speak(getRandomPhrase('RESTART'), false, 'RESTART');
          changed = true;
          break;
      }

      if (changed) {
        broadcastState(next);
        return next;
      }
      return prev;
    });
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
      
      let availableQuestions = GAME_QUESTIONS.filter(q => !state.usedQuestionIds.includes(q.id));
      if (availableQuestions.length < 5) {
          state.usedQuestionIds = [];
          availableQuestions = GAME_QUESTIONS;
      }

      const availableCategories = Array.from(new Set(availableQuestions.map(q => q.category)));
      const shuffledCategories = shuffle(availableCategories);
      const options = shuffledCategories.slice(0, 6);
      
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

      speak(getRandomPhrase('CATEGORY_INIT', { name: selectorName }), false, `CAT_INIT_${selectorName}_${state.currentRound}`);
      
      state.timeLeft = 20;
      startTimer(20, () => {
          setState(s => {
              const n = { ...s };
              if (n.phase === GamePhase.CATEGORY_SELECT && n.categorySelection && !n.categorySelection.selected) {
                  const randomCat = n.categorySelection.options[Math.floor(Math.random() * n.categorySelection.options.length)];
                  processHostEvent({ type: 'SELECT_CATEGORY', payload: { category: randomCat } });
              }
              return n;
          });
      });
  };

  const startActualRound = (state: GameState, category: string) => {
    state.phase = GamePhase.INTRO;
    sfx.play('SWOOSH');
    
    let availableQuestions = GAME_QUESTIONS.filter(q => !state.usedQuestionIds.includes(q.id) && q.category === category);
    if (availableQuestions.length === 0) availableQuestions = GAME_QUESTIONS.filter(q => !state.usedQuestionIds.includes(q.id));
    if (availableQuestions.length === 0) { availableQuestions = GAME_QUESTIONS; state.usedQuestionIds = []; }

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
    let roundPhrase = getRandomPhrase('ROUND_INTRO', { round: state.currentRound });
    
    if (state.currentRound === state.totalRounds) {
        multiplierText = getRandomPhrase('MULTIPLIER_3');
        roundPhrase = getRandomPhrase('FINAL_ROUND');
    } else if (state.currentRound === state.totalRounds - 1) {
        multiplierText = getRandomPhrase('MULTIPLIER_2');
        roundPhrase += multiplierText;
    }

    speak(roundPhrase, true, `ROUND_INTRO_${state.currentRound}`);

    const introDuration = Math.max(3000, roundPhrase.split(' ').length * 400 + 1000);

    setTimeout(() => {
        const questionText = state.currentQuestion!.fact.replace('<BLANK>', 'blank');
        speak(questionText, false, `QUESTION_${state.currentQuestion!.id}`);
        const readingDuration = Math.max(3000, questionText.split(' ').length * 350 + 2000);

        state.timeLeft = 0; 
        startTimer(readingDuration / 1000, () => {
             setState(s => {
                const next = { ...s };
                startWritingPhase(next);
                broadcastState(next);
                return next;
             });
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
    speak(getRandomPhrase('WRITING', { randomPlayer: randomP, seconds: ROUND_TIMER_SECONDS.WRITING }), false, `WRITING_${state.currentRound}`);
    
    startTimer(ROUND_TIMER_SECONDS.WRITING, () => {
       setState(s2 => {
         const n2 = { ...s2 };
         startVotingPhase(n2);
         broadcastState(n2);
         return n2;
       });
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
    speak(getRandomPhrase('VOTING', { randomPlayer: randomP }), false, `VOTING_${state.currentRound}`);
    
    startTimer(ROUND_TIMER_SECONDS.VOTING, () => {
        setState(s => {
             const n = { ...s };
             startRevealPhase(n);
             broadcastState(n);
             return n;
           });
    });
  };

  const handlePostLeaderboard = () => {
    setState(s => {
        const n = { ...s };
        if (n.currentRound < n.totalRounds) {
            n.currentRound += 1;
            startCategorySelectionPhase(n);
        } else {
            n.phase = GamePhase.GAME_OVER;
            sfx.play('SUCCESS');
            const winner = Object.values(n.players).sort((a: any, b: any) => b.score - a.score)[0];
            speak(getRandomPhrase('GAME_OVER', { winner: winner?.name }), false, 'GAME_OVER');
            if (winner) n.players[winner.id].expression = 'HAPPY';
        }
        broadcastState(n);
        return n;
    });
  };

  const startLeaderboardPhase = () => {
      setState(s => {
        const n = { ...s };
        if (n.phase === GamePhase.LEADERBOARD) return n;
        n.phase = GamePhase.LEADERBOARD;
        sfx.play('SWOOSH');
        startTimer(60, () => { handlePostLeaderboard(); });
        broadcastState(n);
        return n;
      });
  };

  const startRevealPhase = (state: GameState) => {
    state.phase = GamePhase.REVEAL;
    sfx.play('DRUMROLL');
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Points Logic:
    // 1. Truth Base = 1000 * Multiplier
    // 2. Lie Base = Half of Truth Base (500 * Multiplier)
    const multiplier = state.currentRound >= state.totalRounds ? 3 : (state.currentRound === state.totalRounds - 1 ? 2 : 1);
    const TRUTH_POINTS = 1000 * multiplier;
    const BASE_LIE_POINTS = TRUTH_POINTS / 2; // Always half of truth points

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

    startTimer(ROUND_TIMER_SECONDS.REVEAL, () => { startLeaderboardPhase(); }); 
    broadcastState(state);
  };

  const startTimer = (seconds: number, onComplete: () => void) => {
    if (timerRef.current) clearInterval(timerRef.current);
    let t = seconds;
    timerRef.current = window.setInterval(() => {
      t--;
      setState(prev => {
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
        return next;
      });

      if (t <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        onComplete();
      }
    }, 1000);
  };

  const broadcastState = (newState: GameState) => {
    socketRef.current?.emit('gameStateUpdate', { roomCode: newState.roomCode, gameState: newState });
  };

  const dispatch = (event: GameEvent) => {
    // Debug log
    console.log('[Dispatch]', role, event.type, state.roomCode);

    if (role === 'HOST') {
      processHostEvent(event);
    } else {
      socketRef.current?.emit('playerEvent', { roomCode: state.roomCode, event });
    }
  };

  // Exposed Actions
  const joinRoom = (roomCode: string, callback?: (success: boolean, error?: string) => void) => {
    socketRef.current?.emit('joinRoom', { roomCode, id: playerId }, (response: any) => {
      if (response.success) {
        setState(response.state);
        localStorage.setItem('bamboozle_room_code', roomCode); // Persist room code
        if (callback) callback(true);
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
    const botName = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)] + ` ${Math.floor(Math.random() * 100)}`;
    dispatch({ type: 'JOIN_ROOM', payload: { id: botId, name: botName, avatarSeed: botName, isBot: true } });
  };

  const addAudienceBot = () => {
    const botId = generateId();
    const botName = "Audience Bot " + Math.floor(Math.random() * 100);
    dispatch({ type: 'JOIN_AUDIENCE', payload: { id: botId, name: botName, avatarSeed: botName, isBot: true } });
  };

  const sendStartGame = (rounds: number) => dispatch({ type: 'START_GAME', payload: { rounds } });
  const sendUpdateRounds = (rounds: number) => dispatch({ type: 'UPDATE_ROUNDS', payload: { rounds } });
  const sendLie = (text: string) => dispatch({ type: 'SUBMIT_LIE', payload: { playerId, text } });
  const sendVote = (answerId: string) => dispatch({ type: 'SUBMIT_VOTE', payload: { playerId, answerId } });
  const sendAudienceVote = (answerId: string) => dispatch({ type: 'SUBMIT_AUDIENCE_VOTE', payload: { playerId, answerId } });
  const sendEmote = (type: 'LAUGH' | 'SHOCK' | 'LOVE' | 'TOMATO', senderName: string, senderSeed: string) => dispatch({ type: 'SEND_EMOTE', payload: { type, senderName, senderSeed } });
  
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

  return { state, playerId, actions: { 
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
      sendRestart, 
      sendCategorySelection, 
      speak, 
      triggerNextPhase,
      getRandomPhrase 
    } 
  };
};