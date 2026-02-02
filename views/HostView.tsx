import React, { useEffect, useState, useMemo, useRef } from 'react';
import { GameState, GamePhase, Player, Answer, Expression, Emote } from '../types';
import { Avatar } from '../components/Avatar';
import { Narrator } from '../components/Narrator';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, User, Play, Clock, Trophy, Bot, ArrowUp, CheckCircle, RotateCcw, Home, Disc, Users, Crown } from 'lucide-react';
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
        <div className="flex flex-col items-center justify-center h-full space-y-8 z-20 relative">
            <div className="text-center w-full px-4">
                <h2 className="text-xl md:text-4xl text-purple-300 font-bold mb-2 uppercase tracking-widest">Join Game at</h2>
                <h1 className="text-5xl md:text-8xl text-yellow-400 font-display tracking-tighter shadow-glow break-all">bamboozle.party</h1>
                <p className="text-lg md:text-2xl mt-4 opacity-75 uppercase">Room Code:</p>
                <div className="text-6xl md:text-9xl font-black bg-white text-black px-4 md:px-8 py-2 md:py-4 rounded-xl mt-2 inline-block transform -rotate-2 border-4 md:border-8 border-purple-500 uppercase">
                    {state.roomCode}
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <div className="bg-black/30 px-6 py-2 rounded-full flex items-center gap-3">
                    <User size={24} />
                    <span className="font-bold text-lg md:text-xl uppercase">{Object.keys(state.players).length} / 6 PLAYERS</span>
                </div>
                <div className="bg-black/30 px-6 py-2 rounded-full flex items-center gap-3 border border-white/10">
                    <span className="font-bold text-lg md:text-xl uppercase text-yellow-400">{state.totalRounds} ROUNDS</span>
                </div>
            </div>

            {debugMode && (
                <div className="flex gap-4 mt-8">
                    <button onClick={() => { sfx.play('CLICK'); actions.addBot(); }} className="px-6 py-3 bg-blue-600/50 hover:bg-blue-600 text-white text-xl font-bold rounded-2xl flex items-center gap-2">
                        <Bot size={24} /> ADD BOT
                    </button>
                    <button onClick={() => { sfx.play('CLICK'); actions.addAudienceBot(); }} className="px-6 py-3 bg-indigo-600/50 hover:bg-indigo-600 text-white text-xl font-bold rounded-2xl flex items-center gap-2">
                        <Users size={24} /> ADD AUDIENCE BOT
                    </button>
                </div>
            )}
            {!debugMode && (
                <div className="flex flex-col items-center gap-4 mt-8">
                    <div className="text-xl text-yellow-400 font-bold animate-pulse uppercase">
                        Waiting for players to ready up...
                    </div>

                    <button
                        onClick={() => { sfx.play('CLICK'); actions.sendToggleOnlineMode(); }}
                        className={`flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all ${state.isOnlineMode ? 'bg-green-600 border-green-400' : 'bg-transparent border-gray-500 hover:border-white'}`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 ${state.isOnlineMode ? 'bg-white border-white' : 'border-gray-500'}`} />
                        <div className="flex flex-col items-start">
                            <span className="font-bold text-white uppercase tracking-wider">Online Friends Mode</span>
                            <span className="text-xs text-gray-300 uppercase">Single Device View (No TV needed)</span>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );


    const renderQuestion = () => (
        <div className="flex flex-col items-center h-full pt-12 relative z-20">
            <div className="mt-12 max-w-4xl text-center">
                <h3 className="text-3xl text-purple-300 font-bold mb-4 uppercase tracking-widest">
                    {state.currentQuestion?.category}
                    {(state.currentRound === state.totalRounds) && <span className="text-yellow-400 ml-4 animate-pulse">TRIPLE POINTS</span>}
                    {(state.currentRound === state.totalRounds - 1) && <span className="text-yellow-400 ml-4 animate-pulse">DOUBLE POINTS</span>}
                </h3>
                <div className="bg-white text-purple-900 p-12 rounded-3xl shadow-2xl transform rotate-1 border-b-8 border-purple-300">
                    <p className="text-5xl font-bold leading-tight uppercase">
                        {state.currentQuestion?.fact.split('<BLANK>').map((part, i, arr) => (
                            <span key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                    <span className="inline-block border-b-4 border-dashed border-purple-900 w-48 mx-2 text-purple-400">
                                        {state.phase === GamePhase.WRITING ? "???" : "BLANK"}
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
        <div className="flex flex-col items-center h-full pt-8 relative z-20">
            <div className="text-center mb-12 max-w-4xl z-30 relative">
                <div className="bg-purple-900/90 backdrop-blur-md p-6 rounded-3xl border-2 border-purple-400/50 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <p className="text-2xl font-bold text-purple-100 leading-snug uppercase">
                        {state.currentQuestion?.fact.replace('<BLANK>', '________')}
                    </p>
                    <div className="absolute -top-6 -left-6 bg-yellow-400 text-purple-900 font-black px-4 py-2 rounded-lg transform -rotate-12 shadow-lg">
                        FACT
                    </div>
                </div>
                <h2 className="text-6xl font-black text-white mt-8 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tight uppercase">
                    PICK THE TRUTH
                </h2>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-7xl px-8 z-30 relative">
                {state.roundAnswers.map((ans, idx) => (
                    <motion.div
                        key={ans.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, type: 'spring' }}
                        className="group relative"
                    >
                        <div className="absolute inset-0 bg-blue-500 rounded-2xl transform translate-y-2 group-hover:translate-y-3 transition-transform" />
                        <div className="relative bg-white text-indigo-900 p-8 rounded-2xl shadow-xl border-4 border-blue-200 flex items-center justify-center min-h-[120px] transform group-hover:-translate-y-1 transition-transform cursor-pointer">
                            <span className="text-4xl font-black text-center leading-none uppercase">{ans.text}</span>

                            {/* Real-time Audience Indicator */}
                            {ans.audienceVotes.length > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-4 -right-4 bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold border-4 border-white shadow-lg z-10"
                                >
                                    {ans.audienceVotes.length}
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