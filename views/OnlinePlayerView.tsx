import React, { useState, useEffect, useRef } from 'react';
import { GameState, GamePhase, Player, Answer, Expression } from '../types';
import { Avatar } from '../components/Avatar';
import { Narrator } from '../components/Narrator';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, CheckCircle, Lock, Play, Crown, ArrowUp, Star, Menu, X } from 'lucide-react';
import { sfx } from '../services/audioService';
import { RevealSequence, LeaderboardSequence, CategoryRoulette, PointsPopup, EmotePopupLayer, CountUp } from './GameSharedComponents';

interface OnlinePlayerViewProps {
    state: GameState;
    actions: any;
    playerId: string;
    isSpeaking: boolean;
}

const MOBILE_SCALE = 0.66; // <--- CHANGE THIS to scale mobile view (0.5 = 50% size, 1.0 = Normal)

export const OnlinePlayerView: React.FC<OnlinePlayerViewProps> = ({ state, actions, playerId, isSpeaking }) => {
    const me = state.players[playerId];
    const amAudience = state.audience[playerId];
    const isVip = state.vipId === playerId;

    // Derived State
    const isJoined = !!me || !!amAudience;
    const audienceCount = Object.keys(state.audience).length;
    const showTimer = (state.phase === GamePhase.WRITING || state.phase === GamePhase.VOTING || state.phase === GamePhase.CATEGORY_SELECT) && state.timeLeft > 0;
    const isFinalRound = state.currentRound === state.totalRounds;

    // Mobile Scale Logic
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mobileStyle = isMobile ? {
        transform: `scale(${MOBILE_SCALE})`,
        width: `${100 / MOBILE_SCALE}%`,
        height: `${100 / MOBILE_SCALE}%`,
        transformOrigin: 'top left'
    } : {};

    // Local interaction state
    const [lieText, setLieText] = useState('');
    const [showTruthWarning, setShowTruthWarning] = useState(false);
    const [myEmoteExpression, setMyEmoteExpression] = useState<Expression | null>(null);

    // Entry Flow State
    const [joinStep, setJoinStep] = useState<'CODE' | 'NAME'>('CODE');
    const [inputCode, setInputCode] = useState(state.roomCode || '');
    const [joinName, setJoinName] = useState('');
    const [codeError, setCodeError] = useState('');

    // Reset interactions on phase change
    useEffect(() => {
        setLieText('');
        setShowTruthWarning(false);
    }, [state.currentRound, state.phase]);

    // Auto-Join if room code exists
    useEffect(() => {
        if (state.roomCode && joinStep === 'CODE') {
            setInputCode(state.roomCode);
            setJoinStep('NAME');
        }
    }, [state.roomCode, joinStep]);

    const handleEmote = (type: 'LAUGH' | 'SHOCK' | 'LOVE' | 'TOMATO') => {
        const name = me ? me.name : (amAudience ? amAudience.name : 'Unknown');
        const seed = me ? me.avatarSeed : (amAudience ? amAudience.avatarSeed : 'unknown');
        actions.sendEmote(type, name, seed);
        sfx.play('CLICK');

        if (type === 'SHOCK') setMyEmoteExpression('SHOCKED');
        else if (type === 'TOMATO') setMyEmoteExpression('ANGRY');
        else setMyEmoteExpression('HAPPY');
        setTimeout(() => setMyEmoteExpression(null), 2000);
    };

    const submitLie = () => {
        if (!state.currentQuestion) return;
        const cleanLie = lieText.trim().toLowerCase();
        const cleanAnswer = state.currentQuestion.answer.toLowerCase();

        if (cleanLie === cleanAnswer || (cleanAnswer.includes(cleanLie) && cleanLie.length > 3)) {
            setShowTruthWarning(true);
            sfx.play('FAILURE');
            setTimeout(() => setShowTruthWarning(false), 3000);
            return;
        }
        actions.sendLie(lieText);
    };

    // --- SUB-COMPONENTS ---

    const TopBar = () => (
        <div className="flex items-center justify-start w-full px-4 py-2 bg-transparent z-50 shrink-0 absolute top-0 left-0 right-0">
            <span className="text-yellow-400 font-black uppercase text-lg drop-shadow-md tracking-wider">ROOM: {state.roomCode}</span>
        </div>
    );

    const AvatarStrip = () => {
        const players = Object.values(state.players);
        // During lobby we show full grid, so skip strip
        if (state.phase === GamePhase.LOBBY) return null;

        return (
            <div className="w-full p-2 overflow-x-auto flex items-center justify-center gap-2 z-40 shrink-0 no-scrollbar relative min-h-[60px]">
                {/* Clean background as requested */}

                {players.map(p => {
                    const isDone = (state.phase === GamePhase.WRITING && !!state.submittedLies[p.id]) ||
                        (state.phase === GamePhase.VOTING && !!p.currentVote);
                    return (
                        <div key={p.id} className="relative flex-shrink-0 flex flex-col items-center min-w-[50px] z-10">
                            {isDone && <div className="absolute top-0 right-0 bg-green-500 w-3 h-3 rounded-full border border-white z-10" />}
                            <Avatar seed={p.avatarSeed} size={40} expression={p.expression} className="filter drop-shadow-lg" />
                            <span className="text-[10px] text-white/90 truncate max-w-[50px] uppercase font-bold mt-1 shadow-black/50 drop-shadow-md">{p.name}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    // --- JOIN FLOW ---
    if (!isJoined) {
        return (
            <div className="h-full bg-purple-900 flex flex-col overflow-y-auto">
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                    <EmotePopupLayer emotes={state.emotes} />
                    <div className="w-full max-w-sm space-y-6 relative z-10">
                        <h1 className="text-5xl font-display text-center text-yellow-400 mb-8 drop-shadow-lg">Bamboozle</h1>

                        {joinStep === 'CODE' && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <p className="text-center text-white/70 mb-2 uppercase font-bold tracking-widest text-sm">Room Code</p>
                                <input
                                    type="text"
                                    placeholder="ABCD"
                                    className="w-full p-6 text-center text-5xl font-black rounded-2xl uppercase tracking-[0.5em] bg-white text-black placeholder-gray-300 border-4 border-transparent focus:border-yellow-400 outline-none shadow-xl"
                                    maxLength={4}
                                    value={inputCode}
                                    onChange={(e) => {
                                        setInputCode(e.target.value.toUpperCase());
                                        setCodeError('');
                                    }}
                                />
                                {codeError && (
                                    <div className="text-red-300 text-center font-bold animate-pulse uppercase text-sm bg-red-900/50 p-2 rounded">
                                        {codeError}
                                    </div>
                                )}
                                <button
                                    onClick={() => {
                                        actions.joinRoom(inputCode, (success: boolean, error?: string) => {
                                            if (success) {
                                                sfx.play('CLICK');
                                                setJoinStep('NAME');
                                            } else {
                                                sfx.play('FAILURE');
                                                setCodeError(error || 'Room not found');
                                            }
                                        });
                                    }}
                                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-black text-2xl shadow-lg uppercase"
                                >
                                    ENTER
                                </button>
                            </motion.div>
                        )}

                        {joinStep === 'NAME' && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="text-center mb-6">
                                    <span className="bg-black/20 text-white/60 text-xs font-bold px-3 py-1 rounded-full uppercase">Joining Room {state.roomCode}</span>
                                </div>

                                <input
                                    type="text"
                                    placeholder="YOUR NAME"
                                    className="w-full p-4 text-center text-2xl font-black rounded-xl bg-white text-black placeholder-gray-400 uppercase shadow-lg"
                                    value={joinName}
                                    onChange={e => setJoinName(e.target.value.toUpperCase())}
                                    maxLength={12}
                                />

                                <div className="space-y-3 pt-4">
                                    <button
                                        disabled={!joinName || Object.keys(state.players).length >= 6}
                                        onClick={() => { sfx.play('CLICK'); actions.sendJoin(joinName, joinName); }}
                                        className="w-full bg-green-500 hover:bg-green-400 text-white py-4 rounded-xl font-black text-2xl shadow-lg transform transition active:scale-95 disabled:opacity-50 uppercase flex items-center justify-center gap-2"
                                    >
                                        PLAY
                                    </button>

                                    <div className="text-center text-white/20 font-bold uppercase text-xs my-2">- OR -</div>

                                    <button
                                        disabled={!joinName}
                                        onClick={() => { sfx.play('CLICK'); actions.sendJoinAudience(joinName, joinName); }}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transform transition active:scale-95 disabled:opacity-50 uppercase"
                                    >
                                        <Users size={20} /> WATCH
                                    </button>
                                </div>

                                <button onClick={() => setJoinStep('CODE')} className="w-full text-center text-white/40 text-xs hover:text-white uppercase mt-6 font-bold">
                                    Cancel
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- MAIN GAME RENDER ---

    return (
        <div
            className="bg-gradient-to-b from-indigo-900 to-purple-900 flex flex-col overflow-hidden relative"
            style={mobileStyle}
        >
            <EmotePopupLayer emotes={state.emotes} />
            <TopBar />

            {/* GLOBAL NARRATOR - Better positioning & Larger Size */}
            <div className={`absolute top-12 left-0 right-0 flex justify-center z-10 pointer-events-none transform transition-all duration-500
                ${state.phase === GamePhase.WRITING ? 'scale-100 translate-y-2' : 'scale-110 translate-y-0'}
            `}>
                <Narrator isSpeaking={isSpeaking} />
            </div>

            {/* MAIN CONTENT */}
            <div className={`
                flex-1 relative flex flex-col pt-16
                ${(state.phase === GamePhase.LOBBY || state.phase === GamePhase.REVEAL || state.phase === GamePhase.VOTING) ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'}
            `}>

                {/* 1. LOBBY */}
                {/* 1. LOBBY */}
                {state.phase === GamePhase.LOBBY && (
                    <div className="flex-1 p-4 flex flex-col items-center mt-32 md:mt-40">
                        <h2 className="text-white text-center font-bold uppercase tracking-widest text-sm mb-4 opacity-70">Waiting for players...</h2>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-md pb-64">
                            {Object.values(state.players).map((p) => (
                                <div key={p.id} className={`flex flex-col items-center bg-black/20 p-3 rounded-2xl border-2 ${p.isReady ? 'border-green-400 bg-green-900/20' : 'border-white/10'}`}>
                                    {p.id === state.vipId && <Crown size={16} className="text-yellow-400 mb-1" fill="currentColor" />}
                                    <Avatar seed={p.avatarSeed} size={60} expression={p.expression} />
                                    <div className="font-bold text-white uppercase mt-2 text-sm">{p.name}</div>
                                    <div className="text-[10px] font-bold uppercase text-white/50">{p.isReady ? 'READY' : '...'}</div>
                                </div>
                            ))}
                            {Array.from({ length: Math.max(0, 6 - Object.values(state.players).length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl min-h-[120px]">
                                    <span className="text-white/10 font-bold uppercase text-sm">Empty</span>
                                </div>
                            ))}
                        </div>

                        {/* Lobby Controls Fixed Bottom - Moved up for URL Bar */}
                        {me && (
                            <div className="fixed bottom-12 left-0 right-0 p-4 z-50 flex flex-col gap-3">
                                <button
                                    onClick={actions.sendToggleReady}
                                    className={`w-full py-4 rounded-xl font-black text-xl shadow-lg uppercase transition-all transform active:scale-95 ${me?.isReady ? 'bg-gray-700 text-gray-400' : 'bg-green-500 text-white'}`}
                                >
                                    {me?.isReady ? 'Ready!' : 'READY UP'}
                                </button>
                                {isVip && (
                                    <button
                                        disabled={!Object.values(state.players).every(p => p.isReady) || Object.values(state.players).length === 0}
                                        onClick={() => actions.sendStartGame(state.totalRounds)}
                                        className="w-full bg-yellow-400 text-black py-3 rounded-xl font-black text-lg shadow-xl uppercase disabled:opacity-50 disabled:grayscale"
                                    >
                                        START GAME
                                    </button>
                                )}
                            </div>
                        )}
                        {amAudience && <div className="fixed bottom-0 w-full p-4 text-center text-white/50 font-bold uppercase">Audience Mode</div>}
                    </div>
                )}

                {/* 2. CATEGORY SELECT */}
                {state.phase === GamePhase.CATEGORY_SELECT && (
                    <div className="flex-1 flex flex-col items-center justify-center transform scale-90 origin-center relative">
                        {/* Timer moved to corner to avoid Presenter */}
                        <div className="absolute top-4 right-4 bg-black/50 px-4 py-2 rounded-full border border-white/20 backdrop-blur-md z-50">
                            <div className="flex items-center gap-2">
                                <Clock size={20} className="text-yellow-400 animate-pulse" />
                                <span className="font-mono font-bold text-2xl text-white">{state.timeLeft}</span>
                            </div>
                        </div>
                        <CategoryRoulette
                            state={state}
                            onSelect={state.categorySelection?.selectorId === playerId ? (cat) => actions.sendCategorySelection(cat) : undefined}
                        />
                    </div>
                )}

                {/* 3. WRITING (And INTRO) */}
                {(state.phase === GamePhase.WRITING || state.phase === GamePhase.INTRO) && (
                    <div className="flex-1 flex flex-col items-center p-4">
                        <div className="w-full max-w-sm flex flex-col items-center gap-4 mt-20">


                            {/* Stats Header (Round, Audience, Multiplier) - GAME STYLE BADGES */}
                            <div className="w-full flex items-center justify-between px-2 pb-2 relative z-20">
                                <div className="flex items-center gap-2">
                                    <div className="bg-purple-600/90 text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg border-2 border-purple-400 shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                                        {isFinalRound ? 'FINAL ROUND' : `ROUND ${state.currentRound}/${state.totalRounds}`}
                                    </div>
                                    {(state.currentRound === state.totalRounds) && (
                                        <div className="bg-yellow-400 text-black text-[10px] font-black uppercase px-3 py-1 rounded-lg border-2 border-white shadow-[0_2px_0_rgba(0,0,0,0.5)] animate-pulse">
                                            TRIPLE POINTS
                                        </div>
                                    )}
                                    {(state.currentRound === state.totalRounds - 1) && (
                                        <div className="bg-blue-400 text-black text-[10px] font-black uppercase px-3 py-1 rounded-lg border-2 border-white shadow-[0_2px_0_rgba(0,0,0,0.5)] animate-pulse">
                                            DOUBLE POINTS
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                                    <Users size={12} className="text-white" />
                                    <span className="text-xs font-black text-white">{audienceCount}</span>
                                </div>
                            </div>

                            {/* Fact Card */}
                            <div className="w-full bg-white text-purple-900 p-6 rounded-3xl shadow-xl border-b-8 border-purple-300 relative z-10">
                                <p className="text-2xl md:text-3xl font-black leading-tight uppercase text-center break-words">
                                    {state.currentQuestion?.fact.replace('<BLANK>', '________')}
                                </p>
                            </div>

                            <AnimatePresence>
                                {showTruthWarning && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-red-500 text-white px-4 py-2 rounded-full font-bold uppercase text-xs shadow-lg animate-bounce">
                                        Cannot write the truth!
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Input Area (Only in WRITING phase) */}
                            {state.phase === GamePhase.WRITING && (
                                <>
                                    {me && !state.submittedLies[playerId] ? (
                                        <div className="w-full space-y-3 mt-2">
                                            <input
                                                type="text"
                                                className="w-full bg-black/20 text-white p-4 rounded-xl text-lg font-bold uppercase outline-none focus:ring-2 focus:ring-yellow-400 placeholder-white/30 text-center"
                                                placeholder="LIE HERE..."
                                                value={lieText}
                                                onChange={e => setLieText(e.target.value.toUpperCase())}
                                                maxLength={50}
                                            />

                                            {/* Timer between Input and Button */}
                                            <div className="w-full flex justify-center py-2">
                                                <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/10">
                                                    <Clock size={20} className="text-yellow-400 animate-pulse" />
                                                    <span className="font-mono font-bold text-2xl text-white">{state.timeLeft}s</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={submitLie}
                                                disabled={!lieText.trim()}
                                                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-black text-xl uppercase shadow-lg active:scale-95 disabled:opacity-50"
                                            >
                                                SUBMIT
                                            </button>
                                        </div>
                                    ) : me && (
                                        <div className="mt-8 bg-green-500/20 text-green-400 px-6 py-3 rounded-xl font-black uppercase flex items-center gap-2 border border-green-500/50">
                                            <CheckCircle /> LIE SENT
                                        </div>
                                    )}
                                    {amAudience && <div className="mt-8 text-white/50 font-bold uppercase">Waiting for players...</div>}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {state.phase === GamePhase.VOTING && (
                    <div className="flex-1 flex flex-col items-center p-4">
                        {/* Mini Fact Header */}
                        <div className="w-full max-w-md mb-2 text-center mt-20">
                            {/* Timer in Voting Phase - Contextual */}
                            <div className="flex justify-center mb-4 relative z-30">
                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-1 rounded-full border border-white/20 shadow-lg">
                                    <Clock size={16} className="text-yellow-400 animate-pulse" />
                                    <span className="font-mono font-bold text-xl text-white">{state.timeLeft}s</span>
                                </div>
                            </div>

                            <p className="text-white/70 text-sm font-bold uppercase mb-1">Find the Truth</p>
                            <div className="bg-purple-800/50 p-3 rounded-xl border border-white/10 backdrop-blur-sm">
                                <p className="text-lg font-bold text-white leading-tight uppercase">
                                    {state.currentQuestion?.fact.replace('<BLANK>', '________')}
                                </p>
                            </div>
                        </div>

                        {/* Answers Grid */}
                        <div className="grid grid-cols-1 gap-3 w-full max-w-md pb-24">
                            {state.roundAnswers.filter(a => !a.authorIds.includes(playerId)).map((ans, idx) => {
                                const iVoted = amAudience ? ans.audienceVotes.includes(playerId) : me?.currentVote === ans.id;
                                return (
                                    <motion.button
                                        key={ans.id}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => {
                                            if (!iVoted) {
                                                sfx.play('CLICK');
                                                if (amAudience) actions.sendAudienceVote(ans.id);
                                                else actions.sendVote(ans.id);
                                            }
                                        }}
                                        disabled={iVoted && !amAudience}
                                        className={`
                                              w-full p-4 rounded-xl border-l-8 text-left font-bold text-lg shadow-md transition-all active:scale-95 uppercase relative overflow-hidden
                                              ${iVoted
                                                ? 'bg-indigo-600 border-indigo-400 text-white'
                                                : 'bg-white border-transparent text-indigo-900'
                                            }
                                              ${(me?.currentVote && !iVoted) ? 'opacity-50 grayscale' : ''}
                                          `}
                                    >
                                        <span className="relative z-10 flex flex-col">
                                            <span>{ans.text}</span>
                                            {/* Audience Indicator */}
                                            {ans.audienceVotes.length > 0 && (
                                                <div className="flex items-center gap-1 mt-1 opacity-70 scale-90 origin-left">
                                                    <Users size={14} className={iVoted ? 'text-black' : 'text-purple-500'} />
                                                    <span className={`text-xs font-black ${iVoted ? 'text-black' : 'text-purple-500'}`}>
                                                        {ans.audienceVotes.length} AUDIENCE
                                                    </span>
                                                </div>
                                            )}
                                        </span>
                                        {iVoted && <motion.div layoutId="voted-check" className="absolute right-4 top-1/2 -translate-y-1/2"><CheckCircle size={24} /></motion.div>}
                                    </motion.button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* 5. REVEAL & LEADERBOARD (Shared) */}
                {state.phase === GamePhase.REVEAL && (
                    <div className="mt-20 transform scale-90 origin-top">
                        <RevealSequence state={state} actions={actions} setGalleryOverrides={() => { }} isHost={isVip} />
                    </div>
                )}

                {state.phase === GamePhase.LEADERBOARD && (
                    <div className="mt-20 transform scale-90 origin-top">
                        <LeaderboardSequence state={state} actions={actions} onHome={() => { }} isHost={isVip} />
                    </div>
                )}

                {state.phase === GamePhase.GAME_OVER && (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 mt-20 transform scale-90 origin-top">
                        <LeaderboardSequence state={state} actions={actions} onHome={() => { }} isHost={isVip} />
                        {isVip && (
                            <div className="flex flex-col gap-4 mt-8 w-full max-w-sm">
                                <button onClick={() => actions.sendRestart()} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-black text-xl shadow-lg uppercase w-full">
                                    PLAY AGAIN
                                </button>
                                <button onClick={() => window.location.reload()} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-black text-xl shadow-lg uppercase w-full">
                                    END GAME
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* PERSISTENT BOTTOM BAR (Avatar Strip + Emotes) - Transparent */}
            {state.phase !== GamePhase.LOBBY && state.phase !== GamePhase.LEADERBOARD && state.phase !== GamePhase.GAME_OVER && (
                <div className={`border-t border-white/5 relative ${isMobile ? 'pb-10' : ''}`}>
                    <AvatarStrip />
                    <div className="grid grid-cols-4 gap-2 px-4 pb-4 pt-2 w-full max-w-sm mx-auto z-20 relative">
                        <button onClick={() => handleEmote('LAUGH')} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 text-2xl active:scale-95 transition border border-white/5">😂</button>
                        <button onClick={() => handleEmote('SHOCK')} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 text-2xl active:scale-95 transition border border-white/5">😮</button>
                        <button onClick={() => handleEmote('LOVE')} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 text-2xl active:scale-95 transition border border-white/5">❤️</button>
                        <button onClick={() => handleEmote('TOMATO')} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 text-2xl active:scale-95 transition border border-white/5">🍅</button>
                    </div>
                </div>
            )}
        </div>
    );
};
