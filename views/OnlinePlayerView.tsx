import React, { useState, useEffect } from 'react';
import { GameState, GamePhase, Player, Answer, Expression } from '../types';
import { Avatar } from '../components/Avatar';
import { Narrator } from '../components/Narrator';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, CheckCircle, Lock, Play, Minus, Plus, RotateCcw, Crown, ArrowUp, Star } from 'lucide-react';
import { sfx } from '../services/audioService';
import { RevealSequence, LeaderboardSequence, CategoryRoulette, PointsPopup, EmotePopupLayer, CountUp } from './GameSharedComponents';

interface OnlinePlayerViewProps {
    state: GameState;
    actions: any;
    playerId: string;
}

export const OnlinePlayerView: React.FC<OnlinePlayerViewProps> = ({ state, actions, playerId }) => {
    const me = state.players[playerId];
    const amAudience = state.audience[playerId];
    const isVip = state.vipId === playerId;

    // Local interaction state
    const [lieText, setLieText] = useState('');
    const [showTruthWarning, setShowTruthWarning] = useState(false);
    const [myEmoteExpression, setMyEmoteExpression] = useState<Expression | null>(null);

    // Entry Flow State
    const [joinStep, setJoinStep] = useState<'CODE' | 'NAME'>('CODE');
    const [inputCode, setInputCode] = useState(state.roomCode || '');
    const [joinName, setJoinName] = useState('');
    const [codeError, setCodeError] = useState('');

    const isJoined = !!me || !!amAudience;

    // Reset interactions on phase change
    useEffect(() => {
        setLieText('');
        setShowTruthWarning(false);
    }, [state.currentRound, state.phase]);

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

    // Reused Emote Grid
    const EmoteGrid = () => (
        <div className="absolute bottom-4 right-4 flex gap-2 z-50">
            <button onClick={() => handleEmote('LAUGH')} className="bg-black/50 p-3 rounded-full hover:bg-black/70 text-2xl backdrop-blur-sm">😂</button>
            <button onClick={() => handleEmote('SHOCK')} className="bg-black/50 p-3 rounded-full hover:bg-black/70 text-2xl backdrop-blur-sm">😮</button>
            <button onClick={() => handleEmote('LOVE')} className="bg-black/50 p-3 rounded-full hover:bg-black/70 text-2xl backdrop-blur-sm">❤️</button>
            <button onClick={() => handleEmote('TOMATO')} className="bg-black/50 p-3 rounded-full hover:bg-black/70 text-2xl backdrop-blur-sm">🍅</button>
        </div>
    );

    // --- UNIFIED JOIN FLOW ---
    if (!isJoined) {
        return (
            <div className="h-full bg-purple-900 p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <EmotePopupLayer emotes={state.emotes} />
                <div className="w-full max-w-md space-y-6 relative z-10">
                    <h1 className="text-4xl font-display text-center text-yellow-400 mb-2">Bamboozle</h1>

                    {joinStep === 'CODE' && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <p className="text-center text-white/70 mb-6 uppercase">Enter Room Code to Play</p>

                            <input
                                type="text"
                                placeholder="ABCD"
                                className="w-full p-4 text-center text-3xl font-black rounded-xl uppercase tracking-widest bg-white text-black placeholder-gray-500 border-4 border-transparent focus:border-yellow-400 outline-none"
                                maxLength={4}
                                value={inputCode}
                                onChange={(e) => {
                                    setInputCode(e.target.value.toUpperCase());
                                    setCodeError('');
                                }}
                            />

                            {codeError && (
                                <div className="text-red-300 text-center font-bold animate-pulse uppercase">
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
                            <div className="bg-black/20 p-4 rounded-xl text-center">
                                <p className="text-sm font-bold text-white/60 mb-1 uppercase">ROOM FOUND</p>
                                <p className="text-4xl font-black text-white tracking-widest">{state.roomCode}</p>
                            </div>

                            <input
                                type="text"
                                placeholder="ENTER YOUR NAME"
                                className="w-full p-4 text-center text-xl font-bold rounded-xl bg-white text-black placeholder-gray-500 uppercase"
                                value={joinName}
                                onChange={e => setJoinName(e.target.value.toUpperCase())}
                                maxLength={12}
                            />

                            <div className="space-y-4">
                                <button
                                    disabled={!joinName || Object.keys(state.players).length >= 6}
                                    onClick={() => { sfx.play('CLICK'); actions.sendJoin(joinName, joinName); }}
                                    className="w-full bg-green-500 hover:bg-green-400 text-white py-4 rounded-xl font-black text-2xl shadow-lg transform transition active:scale-95 disabled:opacity-50 uppercase"
                                >
                                    {Object.keys(state.players).length >= 6 ? 'GAME FULL' : 'JOIN GAME'}
                                </button>

                                <button
                                    disabled={!joinName}
                                    onClick={() => { sfx.play('CLICK'); actions.sendJoinAudience(joinName, joinName); }}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold text-xl shadow-lg flex items-center justify-center gap-2 transform transition active:scale-95 disabled:opacity-50 uppercase"
                                >
                                    <Users size={24} /> JOIN AUDIENCE
                                </button>
                            </div>

                            <button onClick={() => setJoinStep('CODE')} className="w-full text-center text-white/40 text-sm hover:text-white uppercase mt-4">
                                Back to Code
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    // --- RENDER PHASES ---

    // 1. LOBBY (Hybrid)
    if (state.phase === GamePhase.LOBBY) {
        const allPlayers = Object.values(state.players);
        const allReady = allPlayers.length > 0 && allPlayers.every(p => p.isReady);

        return (
            <div className="h-full w-full bg-indigo-900 overflow-hidden relative flex flex-col items-center justify-center p-4">
                <EmotePopupLayer emotes={state.emotes} />

                <div className="absolute top-4 left-4 z-10 text-left">
                    <div className="text-yellow-400 font-bold text-xl uppercase tracking-widest">Room Code</div>
                    <div className="text-5xl font-black text-white">{state.roomCode}</div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full z-10 mt-16">
                    {allPlayers.map((p) => (
                        <motion.div
                            key={p.id}
                            layout
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`relative flex flex-col items-center bg-black/20 p-4 rounded-3xl border-4 ${p.isReady ? 'border-green-400 bg-green-900/20' : 'border-white/10'}`}
                        >
                            {p.id === state.vipId && <Crown size={24} className="absolute top-2 right-2 text-yellow-400" fill="currentColor" />}
                            <Avatar seed={p.avatarSeed} size={80} expression={p.expression} />
                            <div className="font-bold text-white uppercase mt-2 text-lg">{p.name}</div>
                            <div className="text-xs font-bold uppercase text-white/50">{p.isReady ? 'READY' : 'WAITING'}</div>
                        </motion.div>
                    ))}
                    {Array.from({ length: Math.max(0, 6 - allPlayers.length) }).map((_, i) => (
                        <div key={`empty-${i}`} className="flex items-center justify-center border-4 border-dashed border-white/10 rounded-3xl min-h-[160px]">
                            <span className="text-white/20 font-bold uppercase">Open Slot</span>
                        </div>
                    ))}
                </div>

                {/* Player Controls */}
                {me && (
                    <div className="mt-8 z-20 w-full max-w-md space-y-4">
                        <button
                            onClick={actions.sendToggleReady}
                            className={`w-full py-4 rounded-xl font-black text-xl shadow-lg uppercase transition-all transform active:scale-95 ${me?.isReady
                                ? 'bg-gray-700 text-gray-400'
                                : 'bg-green-500 hover:bg-green-400 text-white'
                                }`}
                        >
                            {me?.isReady ? 'Waiting for others...' : 'I AM READY!'}
                        </button>

                        {isVip && (
                            <button
                                disabled={!allReady}
                                onClick={() => actions.sendStartGame(state.totalRounds)}
                                className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed text-black py-4 rounded-xl font-black text-xl shadow-xl flex items-center justify-center gap-2 uppercase"
                            >
                                <Play size={24} /> START GAME
                            </button>
                        )}
                    </div>
                )}
                {amAudience && (
                    <div className="mt-8 z-20 bg-black/40 px-6 py-3 rounded-full text-white font-bold uppercase backdrop-blur-md border border-white/10 animate-pulse">
                        You are in the Audience
                    </div>
                )}
            </div>
        );
    }

    // 2. CATEGORY SELECT
    if (state.phase === GamePhase.CATEGORY_SELECT) {
        const isSelector = state.categorySelection?.selectorId === playerId;

        return (
            <div className="h-full w-full bg-indigo-900 relative overflow-hidden flex flex-col">
                <EmotePopupLayer emotes={state.emotes} />
                <div className="flex-1 relative z-10">
                    <CategoryRoulette state={state} />
                </div>

                {/* Overlay Controls for Selector */}
                {isSelector && !state.categorySelection?.selected && (
                    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8">
                        <h2 className="text-4xl font-black text-yellow-400 mb-8 uppercase drop-shadow-lg">It's Your Turn!</h2>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
                            {state.categorySelection?.options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => { sfx.play('CLICK'); actions.sendCategorySelection(opt); }}
                                    className="bg-white hover:bg-gray-100 text-indigo-900 p-6 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-transform uppercase"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <EmoteGrid />
            </div>
        );
    }

    // 3. WRITING PHASE
    if (state.phase === GamePhase.WRITING) {
        const hasSubmitted = !!state.submittedLies[playerId];

        return (
            <div className="h-full w-full bg-purple-900 relative flex flex-col p-6 overflow-hidden">
                <Narrator text={state.currentQuestion?.fact || ''} isSpeaking={true} />
                <EmotePopupLayer emotes={state.emotes} />

                <AnimatePresence>
                    {showTruthWarning && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-red-900/90 z-[60] flex flex-col items-center justify-center text-center p-8 backdrop-blur-sm"
                        >
                            <Lock size={64} className="mb-4 text-red-200" />
                            <h2 className="text-4xl font-black text-white mb-2 uppercase">Whoops!</h2>
                            <p className="text-xl text-red-100 uppercase">You accidentally wrote the truth! Try to write a lie instead.</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* TV Style Question Display */}
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                    <div className="w-full max-w-4xl text-center space-y-8">
                        <div className="bg-purple-800/50 p-8 rounded-3xl border-4 border-purple-400/30 backdrop-blur-md shadow-2xl">
                            <h3 className="text-3xl font-bold text-purple-200 mb-4 uppercase tracking-widest">
                                {state.currentQuestion?.category}
                            </h3>
                            <p className="text-3xl md:text-5xl font-black text-white leading-tight uppercase drop-shadow-md">
                                {state.currentQuestion?.fact.replace('<BLANK>', '________')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Player Input Overlay */}
                {me && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="w-full max-w-2xl mx-auto bg-white p-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20"
                    >
                        {!hasSubmitted ? (
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    className="flex-1 bg-gray-100 p-4 rounded-xl text-xl font-bold text-black uppercase outline-none focus:ring-4 focus:ring-yellow-400"
                                    placeholder="WRITE YOUR LIE HERE..."
                                    value={lieText}
                                    onChange={e => setLieText(e.target.value.toUpperCase())}
                                    maxLength={50}
                                />
                                <button
                                    onClick={submitLie}
                                    disabled={!lieText.trim()}
                                    className="bg-yellow-400 hover:bg-yellow-300 text-black px-8 rounded-xl font-black text-xl uppercase shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    SEND
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <h3 className="text-2xl font-black text-green-600 uppercase flex items-center justify-center gap-2">
                                    <CheckCircle size={32} /> LIE SUBMITTED
                                </h3>
                                <p className="text-gray-500 uppercase font-bold text-sm mt-1">Wait for others...</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {amAudience && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/60 px-6 py-3 rounded-full text-white font-bold uppercase backdrop-blur-md border border-white/10 z-20">
                        Watch & React!
                    </div>
                )}

                <div className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-black/40 px-4 py-2 rounded-full border border-white/10">
                    <Clock size={20} className="text-yellow-400" />
                    <span className="font-mono font-bold text-xl text-white">{state.timeLeft}</span>
                </div>
                <EmoteGrid />
            </div>
        );
    }

    // 4. VOTING PHASE
    if (state.phase === GamePhase.VOTING) {
        const choices = state.roundAnswers.filter(a => !a.authorIds.includes(playerId));
        const hasVoted = !!me?.currentVote;

        return (
            <div className="h-full w-full bg-blue-900 relative flex flex-col p-6 overflow-hidden">
                <Narrator text="Pick the truth!" isSpeaking={true} />
                <EmotePopupLayer emotes={state.emotes} />

                <div className="text-center mb-8 relative z-10">
                    <h2 className="text-4xl font-black text-white uppercase drop-shadow-md mb-2">Find the Truth</h2>
                    <p className="text-xl text-blue-200 uppercase font-bold">{state.currentQuestion?.fact.replace('<BLANK>', '________')}</p>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto w-full relative z-20 overflow-y-auto pb-20">
                    {choices.map((ans, idx) => {
                        const iVoted = amAudience ? ans.audienceVotes.includes(playerId) : me?.currentVote === ans.id;

                        return (
                            <motion.button
                                key={ans.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => {
                                    if (!iVoted) {
                                        sfx.play('CLICK');
                                        if (amAudience) actions.sendAudienceVote(ans.id);
                                        else actions.sendVote(ans.id);
                                    }
                                }}
                                disabled={iVoted && !amAudience} // Audience can technically switch vote? Logic in PlayerView allowed it implicitly? No, PlayerView sends vote. Server handles it.
                                className={`
                                   p-6 rounded-2xl border-4 text-center font-black text-2xl shadow-xl transition-all transform active:scale-95 uppercase relative overflow-hidden group
                                   ${iVoted
                                        ? 'bg-yellow-400 border-white text-black scale-105 z-30'
                                        : (me?.currentVote || (amAudience && ans.audienceVotes.includes(playerId))) // If I voted (logic handled above by iVoted)
                                            ? 'bg-blue-800 border-blue-700 text-blue-400 opacity-50'
                                            : 'bg-white border-blue-300 text-blue-900 hover:bg-blue-50 hover:scale-105'
                                    }
                               `}
                            >
                                {/* Selection Ring */}
                                {iVoted && (
                                    <motion.div layoutId="vote-ring" className="absolute inset-0 border-8 border-white/50 rounded-xl" />
                                )}

                                <span className="relative z-10">{ans.text}</span>
                            </motion.button>
                        );
                    })}
                </div>

                {hasVoted && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur text-white px-8 py-4 rounded-full font-bold uppercase z-30"
                    >
                        Vote Locked! Wait for reveal...
                    </motion.div>
                )}
                <EmoteGrid />
            </div>
        );
    }

    // 5. REVEAL & LEADERBOARD (Direct reuse of Host Views)
    if (state.phase === GamePhase.REVEAL) {
        return (
            <div className="h-full w-full bg-gray-900 relative overflow-hidden">
                <EmotePopupLayer emotes={state.emotes} />
                <RevealSequence state={state} actions={actions} setGalleryOverrides={() => { }} isHost={state.hostId === playerId} />
                <EmoteGrid />
            </div>
        );
    }

    if (state.phase === GamePhase.LEADERBOARD || state.phase === GamePhase.GAME_OVER) {
        return (
            <div className="h-full w-full bg-gray-900 relative overflow-hidden flex flex-col">
                <EmotePopupLayer emotes={state.emotes} />
                <div className="flex-1 relative z-10 mt-8">
                    <LeaderboardSequence state={state} actions={actions} onHome={() => { }} isHost={state.hostId === playerId} />
                </div>
                {isVip && state.phase === GamePhase.GAME_OVER && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex gap-4">
                        <button onClick={() => actions.sendRestart()} className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-black text-xl shadow-lg uppercase">
                            PLAY AGAIN
                        </button>
                    </div>
                )}
                <EmoteGrid />
            </div>
        );
    }

    // Fallback for INTRO or other states
    return (
        <div className="h-full w-full bg-indigo-900 flex items-center justify-center">
            <h1 className="text-4xl font-black text-white animate-pulse uppercase">
                {state.phase}...
            </h1>
        </div>
    );
};
