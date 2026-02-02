import React, { useEffect, useState, useMemo, useRef } from 'react';
import { GameState, GamePhase, Player, Answer, Expression, Emote } from '../types';
import { Avatar } from '../components/Avatar';
import { Narrator } from '../components/Narrator';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, User, Play, Clock, Trophy, Bot, ArrowUp, CheckCircle, RotateCcw, Home, Disc, Users, Crown, Quote } from 'lucide-react';
import { sfx } from '../services/audioService';

interface HostViewProps {
    state: GameState;
    actions: any;
    onHome: () => void;
    debugMode: boolean;
    isSpeaking: boolean;
}

// Helpers and shared components are now imported from GameSharedComponents.tsx
import {
    CountUp,
    PointsPopup,
    EmotePopupLayer,
    CategoryRoulette,
    RevealSequence,
    LeaderboardSequence
} from './GameSharedComponents';

export const HostView: React.FC<HostViewProps> = ({ state, actions, onHome, debugMode, isSpeaking }) => {
    const [galleryOverrides, setGalleryOverrides] = useState<Record<string, Expression>>({});
    const audienceCount = Object.keys(state.audience).length;

    useEffect(() => {
        if (state.phase !== GamePhase.REVEAL) setGalleryOverrides({});
    }, [state.phase]);

    const renderLobby = () => (
        <div className="flex flex-col items-center justify-center h-full space-y-4 md:space-y-10 z-20 relative px-4 md:px-6 w-full">
            <div className="text-center w-full px-4 transform transition-all hover:scale-105 duration-500 cursor-default">
                <h2 className="text-lg md:text-3xl text-purple-200 font-bold mb-2 md:mb-3 uppercase tracking-[0.2em] drop-shadow-md">Join now at</h2>
                <h1 className="text-4xl md:text-9xl text-yellow-400 font-display tracking-tighter shadow-glow break-all leading-none mb-6">bamboozlegame.netlify.app</h1>
                <div className="relative inline-block mt-4 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                    <div className="relative text-5xl md:text-9xl font-black bg-white text-black px-6 md:px-10 py-4 md:py-6 rounded-2xl transform -rotate-2 border-4 md:border-8 border-transparent uppercase tracking-widest shadow-2xl">
                        {state.roomCode}
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12 mt-4 md:mt-8 w-full justify-center">
                <div className="bg-black/40 backdrop-blur-md px-4 md:px-8 py-3 md:py-4 rounded-full flex items-center gap-3 md:gap-4 border border-white/10 shadow-lg w-full md:w-auto justify-center">
                    <User className="text-blue-400 w-5 h-5 md:w-8 md:h-8" />
                    <span className="font-bold text-lg md:text-2xl uppercase tracking-wider">{Object.keys(state.players).length} / 6 PLAYERS</span>
                </div>
                <div className="bg-black/40 backdrop-blur-md px-4 md:px-8 py-3 md:py-4 rounded-full flex items-center gap-3 md:gap-4 border border-white/10 shadow-lg w-full md:w-auto justify-center">
                    <Trophy className="text-yellow-400 w-5 h-5 md:w-8 md:h-8" />
                    <span className="font-bold text-lg md:text-2xl uppercase tracking-wider text-yellow-400">{state.totalRounds} ROUNDS</span>
                </div>
            </div>

            <div className="flex gap-4 mt-8 flex-wrap justify-center">
                <button onClick={() => { sfx.play('CLICK'); actions.addBot(); }} className="px-6 py-3 bg-blue-600/50 hover:bg-blue-600 text-white text-base md:text-xl font-bold rounded-2xl flex items-center gap-2">
                    <Bot size={24} /> ADD BOT
                </button>
                <button onClick={() => { sfx.play('CLICK'); actions.addAudienceBot(); }} className="px-6 py-3 bg-indigo-600/50 hover:bg-indigo-600 text-white text-base md:text-xl font-bold rounded-2xl flex items-center gap-2">
                    <Users size={24} /> ADD AUDIENCE BOT
                </button>
            </div>
            {!debugMode && (
                <div className="flex flex-col items-center gap-6 mt-4 md:mt-12 w-full max-w-md">
                    <div className="text-lg md:text-2xl text-yellow-400 font-bold animate-pulse uppercase tracking-widest flex items-center gap-3 text-center">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping flex-shrink-0" />
                        Waiting for players...
                    </div>

                    <button
                        onClick={() => { sfx.play('CLICK'); actions.sendToggleOnlineMode(); }}
                        className={`flex items-center gap-4 px-6 md:px-8 py-3 md:py-4 rounded-full border-2 transition-all shadow-xl hover:scale-105 active:scale-95 w-full md:w-auto justify-center ${state.isOnlineMode ? 'bg-green-600 border-green-400' : 'bg-black/40 border-gray-500 hover:border-white hover:bg-black/60'}`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${state.isOnlineMode ? 'bg-white border-white' : 'border-gray-500'}`}>
                            {state.isOnlineMode && <CheckCircle size={16} className="text-green-600" strokeWidth={4} />}
                        </div>
                        <div className="flex flex-col items-start text-left">
                            <span className="font-black text-white uppercase tracking-wider text-sm md:text-lg">Online Friends Mode</span>
                            <span className="text-[10px] md:text-xs text-gray-300 uppercase font-bold tracking-wide opacity-80">Single Device View (No TV needed)</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );


    const renderQuestion = () => (
        <div className="flex flex-col items-center h-full pt-8 md:pt-24 relative z-20 px-4 md:px-8 overflow-y-auto">
            <div className="mt-4 md:mt-16 max-w-5xl text-center w-full">
                <h3 className="text-lg md:text-4xl text-purple-200 font-bold mb-4 md:mb-8 uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-4 drop-shadow-md">
                    {state.currentQuestion?.category}
                    {(state.currentRound === state.totalRounds) && <span className="text-yellow-400 bg-yellow-900/50 px-2 md:px-3 py-1 rounded text-xs md:text-lg animate-pulse border border-yellow-400/50">3X POINTS</span>}
                    {(state.currentRound === state.totalRounds - 1) && <span className="text-yellow-400 bg-yellow-900/50 px-2 md:px-3 py-1 rounded text-xs md:text-lg animate-pulse border border-yellow-400/50">2X POINTS</span>}
                </h3>
                <div className="bg-white text-purple-900 p-6 md:p-12 rounded-[2rem] shadow-2xl transform rotate-1 border-b-[8px] border-r-[8px] border-purple-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Quote className="w-10 h-10 md:w-20 md:h-20" />
                    </div>
                    <p className="text-xl md:text-5xl font-black leading-tight uppercase relative z-10">
                        {state.currentQuestion?.fact.split('<BLANK>').map((part, i, arr) => (
                            <span key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                    <span className="inline-flex items-center justify-center border-b-4 border-dashed border-purple-300 min-w-[40px] md:min-w-[80px] mx-1 md:mx-2 text-purple-400 px-1 md:px-2 animate-pulse">
                                        {state.phase === GamePhase.WRITING ? "?" : "BLANK"}
                                    </span>
                                )}
                            </span>
                        ))}
                    </p>
                </div>
            </div>
        </div>
    );

    const renderVoting = () => (
        <div className="flex flex-col items-center h-full pt-8 md:pt-16 relative z-20 px-4 md:px-6 overflow-y-auto w-full">
            <div className="text-center mb-6 md:mb-10 max-w-4xl z-30 relative w-full">
                <div className="bg-purple-900/80 backdrop-blur-xl p-4 md:p-8 rounded-3xl border border-purple-400/30 shadow-2xl skew-x-1 hover:skew-x-0 transition-transform duration-500 mb-4 md:mb-8 inline-block relative max-w-full">
                    <p className="text-sm md:text-3xl font-bold text-purple-100 leading-snug uppercase tracking-wide">
                        {state.currentQuestion?.fact.replace('<BLANK>', '________')}
                    </p>
                    <div className="absolute -top-3 -left-3 md:-top-5 md:-left-5 bg-yellow-400 text-purple-900 font-black px-3 py-1 md:px-6 md:py-2 rounded-xl transform -rotate-6 shadow-xl text-xs md:text-lg border-2 border-white">
                        THE FACT
                    </div>
                </div>
                <h2 className="text-3xl md:text-7xl font-black text-white mt-2 md:mt-4 drop-shadow-xl tracking-tighter uppercase">
                    SPOT THE <span className="text-green-400">TRUTH</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8 w-full max-w-6xl px-2 md:px-8 z-30 relative pb-safe-bottom">
                {state.roundAnswers.map((ans, idx) => (
                    <motion.div
                        key={ans.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, type: 'spring' }}
                        className="group relative"
                    >
                        <div className="absolute inset-0 bg-blue-600 rounded-[2rem] transform translate-y-2 translate-x-1 group-hover:translate-y-4 group-hover:translate-x-2 transition-transform duration-300" />
                        <div className="relative bg-white text-indigo-950 p-4 md:p-8 rounded-[2rem] shadow-xl border-4 border-blue-200 flex items-center justify-center min-h-[80px] md:min-h-[140px] transform group-hover:-translate-y-1 group-hover:-translate-x-1 transition-transform cursor-default overflow-hidden">
                            <span className="text-xl md:text-4xl font-black text-center leading-none uppercase z-10 break-words w-full">{ans.text}</span>

                            {/* Decorative Pattern */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 to-transparent" style={{ backgroundSize: '20px 20px' }}></div>

                            {/* Real-time Audience Indicator */}
                            {ans.audienceVotes.length > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 md:-top-3 md:-right-3 bg-indigo-600 text-white rounded-full w-10 h-10 md:w-14 md:h-14 flex flex-col items-center justify-center font-bold border-4 border-white shadow-lg z-20"
                                >
                                    <span className="text-[10px] md:text-xs uppercase font-black -mb-1 opacity-70">AUD</span>
                                    <span className="text-sm md:text-xl leading-none">{ans.audienceVotes.length}</span>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const showGallery = state.phase === GamePhase.LOBBY || state.phase === GamePhase.WRITING || state.phase === GamePhase.VOTING || state.phase === GamePhase.CATEGORY_SELECT;
    const isFinalRound = state.currentRound === state.totalRounds;
    const showTimer = (state.phase === GamePhase.WRITING || state.phase === GamePhase.VOTING || state.phase === GamePhase.CATEGORY_SELECT) && state.timeLeft > 0;

    return (
        <div className="relative w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden text-white selection:bg-pink-500 font-display flex flex-col">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            {/* Emotes Overlay */}
            <EmotePopupLayer emotes={state.emotes} />

            <div className="absolute top-6 left-8 z-50 pointer-events-none">
                <Narrator isSpeaking={isSpeaking} />
            </div>

            <main className="flex-1 w-full p-8 z-20 relative flex flex-col">
                {state.phase === GamePhase.LOBBY && renderLobby()}
                {state.phase === GamePhase.CATEGORY_SELECT && <CategoryRoulette state={state} />}
                {(state.phase === GamePhase.INTRO || state.phase === GamePhase.WRITING) && renderQuestion()}
                {state.phase === GamePhase.VOTING && renderVoting()}
                {state.phase === GamePhase.REVEAL && <RevealSequence state={state} actions={actions} setGalleryOverrides={setGalleryOverrides} isHost={true} />}
                {(state.phase === GamePhase.LEADERBOARD || state.phase === GamePhase.GAME_OVER) && <LeaderboardSequence state={state} actions={actions} onHome={onHome} isHost={true} />}
            </main>

            {/* Persistent Room Code & Audience Count - CLEANED UP LAYOUT */}
            <div className="absolute top-6 right-8 z-[50] flex flex-col items-end gap-3 pointer-events-none">
                {state.phase !== GamePhase.LOBBY && (
                    <div className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black text-2xl shadow-xl border-4 border-white/20 uppercase transform rotate-2">
                        CODE: {state.roomCode}
                    </div>
                )}
                <div className="bg-black/60 px-4 py-2 rounded-full flex items-center gap-2 text-white/90 backdrop-blur-sm border border-white/10">
                    <Users size={20} />
                    <span className="font-bold uppercase">{audienceCount} AUDIENCE</span>
                </div>

                {/* Timer - MOVED TO TOP RIGHT */}
                <AnimatePresence>
                    {showTimer && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="mt-4"
                        >
                            <div className="bg-black/50 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-3 border border-white/20 shadow-2xl">
                                <Clock size={24} className="text-yellow-400 animate-pulse" />
                                <span className="text-2xl font-mono text-white tracking-widest">{state.timeLeft}s</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Round Counter - TOP CENTER */}
            {state.phase !== GamePhase.LOBBY && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[50] pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 shadow-lg">
                        <span className="font-bold text-white/90 tracking-widest uppercase text-lg">
                            {isFinalRound ? "FINAL ROUND" : `ROUND ${state.currentRound} / ${state.totalRounds}`}
                        </span>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {showGallery && (
                    <motion.div
                        initial={{ y: 200, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 200, opacity: 0 }}
                        className="w-full z-40 flex flex-wrap items-end justify-center gap-4 p-4 pb-12 relative min-h-[200px] h-auto max-h-[60vh] overflow-y-auto"
                    >
                        {Object.values(state.players).map((p: Player) => {
                            const isDone = (state.phase === GamePhase.WRITING && !!state.submittedLies[p.id]) ||
                                (state.phase === GamePhase.VOTING && !!p.currentVote) ||
                                (state.phase === GamePhase.CATEGORY_SELECT && state.categorySelection?.selectorId === p.id && !!state.categorySelection.selected) ||
                                (state.phase === GamePhase.LOBBY && p.isReady);

                            const effectiveExpression = galleryOverrides[p.id] || p.expression;

                            return (
                                <motion.div
                                    key={p.id}
                                    layout
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="flex flex-col items-center relative group p-2 mx-2"
                                >
                                    {/* VIP CROWN */}
                                    {state.vipId === p.id && (state.phase === GamePhase.LOBBY) && (
                                        <motion.div
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className="absolute -top-12 z-50 text-yellow-400 drop-shadow-md"
                                        >
                                            <Crown size={40} fill="currentColor" />
                                        </motion.div>
                                    )}

                                    <AnimatePresence>
                                        {isDone && (
                                            <motion.div initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }} className="absolute -top-6 bg-green-500 text-white rounded-full p-2 shadow-lg z-50 border-2 border-white">
                                                <CheckCircle size={24} strokeWidth={3} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {state.phase === GamePhase.CATEGORY_SELECT && state.categorySelection?.selectorId === p.id && !isDone && (
                                        <motion.div initial={{ y: -10 }} animate={{ y: 0 }} transition={{ repeat: Infinity, repeatType: 'reverse' }} className="absolute -top-10 text-yellow-400 font-bold text-sm bg-black px-2 py-1 rounded uppercase">
                                            PICKING!
                                        </motion.div>
                                    )}

                                    <div className="relative hover:scale-110 transition-transform duration-200">
                                        <Avatar seed={p.avatarSeed} size={100} expression={effectiveExpression} className="filter drop-shadow-xl" />
                                    </div>
                                    <div className="mt-1 bg-black/50 px-2 py-0.5 rounded text-center min-w-[80px]">
                                        <div className="font-bold text-white text-sm truncate max-w-[100px] uppercase">{p.name}</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};