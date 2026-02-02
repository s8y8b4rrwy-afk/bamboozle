

export type PlayerRole = 'HOST' | 'PLAYER' | 'AUDIENCE';

export enum GamePhase {
  LOBBY = 'LOBBY',
  CATEGORY_SELECT = 'CATEGORY_SELECT',
  INTRO = 'INTRO',
  WRITING = 'WRITING',
  VOTING = 'VOTING',
  REVEAL = 'REVEAL',
  LEADERBOARD = 'LEADERBOARD',
  GAME_OVER = 'GAME_OVER'
}

export type Expression = 'NEUTRAL' | 'HAPPY' | 'SAD' | 'SHOCKED' | 'SMUG' | 'THINKING' | 'ANGRY';

export interface Player {
  id: string;
  name: string;
  avatarSeed: string;
  score: number;
  isConnected: boolean;
  isReady: boolean; // New: Track ready state
  isBot?: boolean;
  currentLie?: string;
  currentVote?: string; // ID of the answer they voted for
  lastRoundScore: number;
  expression: Expression;
  previousRank?: number;
}

export interface AudienceMember {
  id: string;
  name: string;
  avatarSeed: string;
  isBot?: boolean;
}

export interface Emote {
  id: string;
  type: 'LAUGH' | 'SHOCK' | 'LOVE' | 'TOMATO';
  senderName: string; // For display
  senderSeed: string; // For avatar display
  x: number; // Random start position %
  createdAt: number; // For cleanup
}

export interface Question {
  id: string;
  fact: string;
  answer: string;
  category: string;
  lies: string[];
}

export interface Answer {
  id: string;
  text: string;
  authorIds: string[];
  votes: string[];
  audienceVotes: string[]; // Track audience consensus
}

export interface CategorySelectionState {
  selectorId: string;
  options: string[];
  selected: string | null;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  players: Record<string, Player>;
  audience: Record<string, AudienceMember>; // New Audience Roster
  currentRound: number;
  totalRounds: number;
  currentQuestion: Question | null;
  submittedLies: Record<string, string>;
  roundAnswers: Answer[];
  timeLeft: number;
  hostId: string;
  vipId: string; // New: Track the 'VIP' player who can restart game
  usedQuestionIds: string[];
  playersWhoPicked: string[];
  categorySelection: CategorySelectionState | null;
  isNarrating: boolean;
  emotes: Emote[]; // Queue of emotes to render
  isOnlineMode: boolean; // New: Track online friend mode
}

export type GameEvent =
  | { type: 'SYNC_STATE'; payload: GameState }
  | { type: 'REQUEST_STATE'; payload: null }
  | { type: 'JOIN_ROOM'; payload: { id: string; name: string; avatarSeed: string; isBot?: boolean } }
  | { type: 'JOIN_AUDIENCE'; payload: { id: string; name: string; avatarSeed: string; isBot?: boolean } }
  | { type: 'TOGGLE_READY'; payload: { playerId: string } }
  | { type: 'UPDATE_ROUNDS'; payload: { rounds: number } }
  | { type: 'SUBMIT_LIE'; payload: { playerId: string; text: string } }
  | { type: 'SUBMIT_VOTE'; payload: { playerId: string; answerId: string } }
  | { type: 'SUBMIT_AUDIENCE_VOTE'; payload: { playerId: string; answerId: string } }
  | { type: 'SEND_EMOTE'; payload: { type: 'LAUGH' | 'SHOCK' | 'LOVE' | 'TOMATO'; senderName: string; senderSeed: string } }
  | { type: 'START_GAME'; payload: { rounds: number } }
  | { type: 'SELECT_CATEGORY'; payload: { category: string } }
  | { type: 'TOGGLE_ONLINE_MODE'; payload: null }
  | { type: 'RESTART_GAME'; payload: null };