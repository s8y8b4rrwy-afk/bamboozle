import React, { useState, useEffect, useRef } from 'react';
import { GameState, GamePhase, Player, Answer, Expression } from '../types';
import { Avatar } from '../components/Avatar';
import { Narrator } from '../components/Narrator';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, CheckCircle, Lock, Play, Crown, ArrowUp, Star, Menu, X, ChevronDown } from 'lucide-react';
import { sfx } from '../services/audioService';
import { RevealSequence, LeaderboardSequence, CategoryRoulette, PointsPopup, EmotePopupLayer, CountUp } from './GameSharedComponents';

interface OnlinePlayerViewProps {
    state: GameState;
    actions: any;
    playerId: string;
    isSpeaking: boolean;
    onHome: () => void;
}

export const OnlinePlayerView: React.FC<OnlinePlayerViewProps> = ({ state, actions, playerId, isSpeaking, onHome }) => {
    const me = state.players[playerId];
    const amAudience = state.audience[playerId];
    const isVip = state.vipId === playerId;

    // Derived State
    const isJoined = !!me || !!amAudience;
    const audienceCount = Object.keys(state.audience).length;
    const showTimer = (state.phase === GamePhase.WRITING || state.phase === GamePhase.VOTING || state.phase === GamePhase.CATEGORY_SELECT) && state.timeLeft > 0;
    const isFinalRound = state.currentRound === state.totalRounds;

    // Local interaction state
    const [lieText, setLieText] = useState('');
    const [showTruthWarning, setShowTruthWarning] = useState(false);
    const [myEmoteExpression, setMyEmoteExpression] = useState<Expression | null>(null);

    // Scroll state for Voting
    const answersRef = useRef<HTMLDivElement>(null);
    const [canScrollDown, setCanScrollDown] = useState(false);

    useEffect(() => {
        const checkScroll = () => {
            if (answersRef.current) {
                const { scrollHeight, clientHeight, scrollTop } = answersRef.current;
                const remaining = scrollHeight - clientHeight - scrollTop;
                setCanScrollDown(remaining > 10);
            }
        };

        const el = answersRef.current;
        if (el) {
            checkScroll();
            el.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }

        return () => {
            if (el) {
                el.removeEventListener('scroll', checkScroll);
            }
            window.removeEventListener('resize', checkScroll);
        };
    }, [state.roundAnswers, state.phase]);

    // Entry Flow State
    const [joinStep, setJoinStep] = useState<'CODE' | 'NAME'>('CODE');
    const [inputCode, setInputCode] = useState(state.roomCode || '');
    const [joinName, setJoinName] = useState('');
    const [codeError, setCodeError] = useState('');

    // Mobile Reaction Bar State - Only affects "Mobile" (<768px)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showReactions, setShowReactions] = useState(false);
    const reactionTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const resetReactionTimer = () => {
        if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
        reactionTimerRef.current = setTimeout(() => {
            setShowReactions(false);
        }, 10000);
    };

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

        if (isMobile) resetReactionTimer();
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
        <div className="flex items-center justify-between w-full px-6 pt-safe-top pb-2 z-50 shrink-0">
            <span className="text-white/30 font-bold text-[10px] uppercase tracking-widest">Bamboozle</span>
            <span className="text-white/30 font-bold uppercase text-sm tracking-wider">ROOM: {state.roomCode}</span>
        </div>
    );

    const AvatarStrip = () => {
        const players = Object.values(state.players);
        // During lobby we show full grid, so skip strip
        if (state.phase === GamePhase.LOBBY) return null;

        return (
            <div
                onClick={() => {
                    if (isMobile) {
                        if (showReactions) {
                            setShowReactions(false);
                            if (reactionTimerRef.current) clearTimeout(reactionTimerRef.current);
                        } else {
                            setShowReactions(true);
                            resetReactionTimer();
                        }
                    }
                }}
                className="w-full py-3 px-2 overflow-x-auto flex items-center justify-center gap-3 z-40 shrink-0 no-scrollbar relative min-h-[4.5rem]"
            >
                {players.map(p => {
                    const isDone = (state.phase === GamePhase.WRITING && !!state.submittedLies[p.id]) ||
                        (state.phase === GamePhase.VOTING && !!p.currentVote);
                    return (
                        <div key={p.id} className="relative flex-shrink-0 flex flex-col items-center min-w-[50px] z-10">
                            {isDone && <div className="absolute top-0 right-0 bg-green-500 w-3 h-3 rounded-full border border-white z-10" />}
                            <Avatar seed={p.avatarSeed} size={40} expression={p.expression} className="filter drop-shadow-lg" />
                            <span className="text-[10px] text-white/90 truncate max-w-[60px] uppercase font-bold mt-1 shadow-black/50 drop-shadow-md">{p.name}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    // --- JOIN FLOW ---
    if (!isJoined) {
        return (
            <div className="h-full bg-purple-900 flex flex-col overflow-y-auto pb-safe-bottom">
                <TopBar />
                <div className="flex-1 flex flex-col items-center justify-center p-6 relative min-h-[60vh]">
                    <EmotePopupLayer emotes={state.emotes} />
                    <div className="w-full max-w-sm space-y-6 relative z-10">
                        <h1 className="text-3xl md:text-5xl font-display text-center text-yellow-400 mb-8 drop-shadow-lg">Bamboozle</h1>

                        {joinStep === 'CODE' && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <p className="text-center text-white/70 mb-2 uppercase font-bold tracking-widest text-sm">Room Code</p>
                                <input
                                    type="text"
                                    placeholder="ABCD"
                                    className="w-full p-6 text-center text-4xl md:text-5xl font-black rounded-2xl uppercase tracking-[0.2em] bg-white text-black placeholder-gray-300 border-4 border-transparent focus:border-yellow-400 outline-none shadow-xl"
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
                                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-black text-2xl shadow-lg uppercase active:scale-95 transition-transform"
                                >
                                    ENTER
                                </button>
                                <button onClick={() => { sfx.play('CLICK'); onHome(); }} className="w-full text-center text-white/40 text-xs hover:text-white uppercase mt-6 font-bold py-4">
                                    Cancel
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
                                    {state.phase === GamePhase.LOBBY ? (
                                        <>
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
                                        </>
                                    ) : (
                                        <button
                                            disabled={!joinName}
                                            onClick={() => {
                                                // Game in progress -> sendJoin will divert to Audience automatically
                                                sfx.play('CLICK');
                                                actions.sendJoin(joinName, joinName);
                                            }}
                                            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-xl shadow-lg transform transition active:scale-95 disabled:opacity-50 uppercase flex items-center justify-center gap-2"
                                        >
                                            <Users size={24} /> WATCH (GAME STARTED)
                                        </button>
                                    )}
                                </div>

                                <button onClick={() => { sfx.play('CLICK'); onHome(); }} className="w-full text-center text-white/40 text-xs hover:text-white uppercase mt-6 font-bold py-4">
                                    Cancel
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div >
        );
    }

    // --- MAIN GAME RENDER ---

    return (
        <div className="bg-gradient-to-b from-indigo-900 to-purple-900 flex flex-col h-full w-full overflow-hidden relative">
            <EmotePopupLayer emotes={state.emotes} />
            <TopBar />

            {/* GLOBAL NARRATOR - Static Flow */}
            <div
                className={`w-full flex justify-center mt-2 z-10 shrink-0 transform transition-all duration-500 relative
                    ${state.phase === GamePhase.WRITING ? 'scale-90' : 'scale-100'}
                    ${state.phase === GamePhase.LOBBY ? 'hidden' : 'flex'}
                `}
            >
                <Narrator isSpeaking={isSpeaking} />
            </div>

            {/* MAIN CONTENT AREA - FlexGrow to fill space */}
            <div className={`
                flex-1 relative flex flex-col w-full max-w-4xl mx-auto
                ${(state.phase === GamePhase.REVEAL || state.phase === GamePhase.VOTING) ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'}
            `}>

                {/* 1. LOBBY */}
                {state.phase === GamePhase.LOBBY && (
                    <div className="flex-1 flex flex-col w-full max-w-md mx-auto p-4 relative min-h-full">
                        {/* A. DASHBOARD (Fixed Top) */}
                        <div className="shrink-0 animate-fade-in-up pb-4 pt-2">
                            <div className="w-full flex flex-row items-center gap-2">
                                <Narrator isSpeaking={isSpeaking} size={70} className="shrink-0" />
                                <div className="flex-1 bg-indigo-950 border-4 border-yellow-400 shadow-[4px_4px_0px_0px_#FACC15] rounded-xl p-3 flex flex-row items-center justify-between relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
                                    <div className="z-10 flex flex-col items-start leading-none">
                                        <span className="text-yellow-400/80 font-black uppercase tracking-widest text-[8px]">Room Code</span>
                                        <span className="text-3xl md:text-4xl font-black text-white tracking-[0.1em] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] font-mono">
                                            {state.roomCode}
                                        </span>
                                    </div>
                                    <div className="z-10 flex flex-col gap-1 items-end">
                                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                                            <span className="text-white font-bold text-[8px] uppercase">Rounds</span>
                                            <span className="text-yellow-400 font-mono font-black text-xs">{state.totalRounds}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded border border-white/10">
                                            <Users size={10} className="text-blue-400" />
                                            <span className="text-white font-mono font-black text-[10px]">{audienceCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* B. CENTERED PLAYER GRID */}
                        <div className="flex-1 flex flex-col items-center justify-center p-2">
                            <div className="grid grid-cols-3 gap-y-12 gap-x-2 w-full">
                                {Object.values(state.players).map((p) => (
                                    <div key={p.id} className="flex flex-col items-center relative">
                                        {p.id === state.vipId && (
                                            <div className="absolute -top-5 z-10">
                                                <Crown size={16} className="text-yellow-400 filter drop-shadow-md" fill="currentColor" />
                                            </div>
                                        )}
                                        <div className="relative">
                                            <Avatar seed={p.avatarSeed} size={80} expression={p.expression} className={`filter drop-shadow-xl transition-all ${p.isReady ? 'opacity-100 scale-110' : 'opacity-80'}`} />
                                        </div>
                                        <div className="font-black text-white uppercase mt-4 text-[11px] tracking-wider truncate max-w-full text-center drop-shadow-md">{p.name}</div>
                                        <div className={`text-[9px] font-black uppercase mt-1 tracking-widest ${p.isReady ? 'text-green-400' : 'text-white/30'}`}>
                                            {p.isReady ? 'READY' : 'WAITING'}
                                        </div>
                                    </div>
                                ))}
                                {Array.from({ length: Math.max(0, 6 - Object.values(state.players).length) }).map((_, i) => (
                                    <div key={`empty-${i}`} className="flex flex-col items-center opacity-20">
                                        <div className="w-[80px] h-[80px] rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
                                            <Users size={24} className="text-white/20" />
                                        </div>
                                        <div className="mt-4 w-16 h-2 bg-white/10 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* C. BOTTOM SPACER (Clearing the Absolute Controls) */}
                        <div className={`${isVip ? 'h-[320px]' : 'h-[240px]'} shrink-0`} />

                        {/* Lobby Controls Fixed Bottom (Absolute) */}
                        {me && (
                            <div className={`absolute ${isVip ? 'bottom-4' : 'bottom-20'} left-4 right-4 z-50 flex flex-col gap-3 pb-safe-bottom`}>
                                <button
                                    onClick={actions.sendToggleReady}
                                    className={`w-full py-4 rounded-xl font-black text-xl shadow-lg uppercase transition-all transform active:scale-95 ${me?.isReady ? 'bg-gray-700 text-gray-400' : 'bg-green-500 text-white'}`}
                                >
                                    {me?.isReady ? 'Ready!' : 'READY UP'}
                                </button>
                                {isVip && (
                                    <div className="flex flex-col gap-4 w-full">
                                        <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/10">
                                            <span className="font-bold text-white uppercase text-sm">Rounds</span>
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => actions.sendUpdateRounds(Math.max(1, state.totalRounds - 1))}
                                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="text-xl font-black text-yellow-400 w-4 text-center">{state.totalRounds}</span>
                                                <button
                                                    onClick={() => actions.sendUpdateRounds(Math.min(10, state.totalRounds + 1))}
                                                    className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={actions.addBot}
                                                className="bg-blue-600/50 hover:bg-blue-600 py-3 rounded-xl text-xs font-bold uppercase"
                                                disabled={Object.keys(state.players).length >= 6}
                                            >
                                                + Bot
                                            </button>
                                            <button
                                                onClick={actions.addAudienceBot}
                                                className="bg-indigo-600/50 hover:bg-indigo-600 py-3 rounded-xl text-xs font-bold uppercase"
                                            >
                                                + Audience
                                            </button>
                                        </div>

                                        <button
                                            disabled={!Object.values(state.players).every(p => p.isReady) || Object.values(state.players).length === 0}
                                            onClick={() => actions.sendStartGame(state.totalRounds)}
                                            className="w-full bg-yellow-400 text-black py-3 rounded-xl font-black text-lg shadow-xl uppercase disabled:opacity-50 disabled:grayscale"
                                        >
                                            START GAME
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                        {amAudience && <div className="absolute bottom-4 w-full text-center text-white/50 font-bold uppercase pb-safe-bottom">Audience Mode</div>}
                    </div>
                )}

                {/* 2. CATEGORY SELECT */}
                {state.phase === GamePhase.CATEGORY_SELECT && (
                    <div className="flex-1 flex flex-col items-center justify-center relative p-4">
                        {/* Timer moved safely away from content */}
                        <div className="absolute top-2 right-2 bg-black/50 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md z-50">
                            <div className="flex items-center gap-2">
                                <Clock size={16} className="text-yellow-400 animate-pulse" />
                                <span className="font-mono font-bold text-lg text-white">{state.timeLeft}</span>
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
                    <div className="flex-1 flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-md flex flex-col items-center gap-4">

                            {/* Stats Header */}
                            <div className="w-full flex items-center justify-between px-1 pb-1 relative z-20">
                                <div className="flex items-center gap-2">
                                    <div className="bg-purple-600/90 text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg border-2 border-purple-400 shadow-sm">
                                        {isFinalRound ? 'FINAL ROUND' : `ROUND ${state.currentRound}/${state.totalRounds}`}
                                    </div>
                                    {(state.currentRound === state.totalRounds) && (
                                        <div className="bg-yellow-400 text-black text-[10px] font-black uppercase px-2 py-1 rounded-lg border-2 border-white shadow-sm animate-pulse">
                                            TRIPLE PTS
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
                                    <Users size={12} className="text-white" />
                                    <span className="text-[10px] md:text-xs font-black text-white">{audienceCount}</span>
                                </div>
                            </div>

                            {/* Fact Card */}
                            <div className="w-full bg-white text-purple-900 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-xl border-b-4 md:border-b-8 border-purple-300 relative z-10 min-h-[15vh] flex items-center justify-center">
                                <p className="text-base md:text-2xl font-black leading-tight uppercase text-center break-words">
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

                            {/* Input Area */}
                            {state.phase === GamePhase.WRITING && (
                                <div className="w-full mt-2 flex flex-col gap-3">
                                    {me && !state.submittedLies[playerId] ? (
                                        <>
                                            <input
                                                type="text"
                                                className="w-full bg-black/20 text-white p-4 rounded-xl text-base md:text-lg font-bold uppercase outline-none focus:ring-2 focus:ring-yellow-400 placeholder-white/30 text-center shadow-inner"
                                                placeholder="LIE HERE..."
                                                value={lieText}
                                                onChange={e => setLieText(e.target.value.toUpperCase())}
                                                maxLength={50}
                                            />

                                            <div className="flex justify-center py-2">
                                                <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full border border-white/10">
                                                    <Clock size={16} className="text-yellow-400 animate-pulse" />
                                                    <span className="font-mono font-bold text-xl text-white">{state.timeLeft}s</span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={submitLie}
                                                disabled={!lieText.trim()}
                                                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-black text-xl uppercase shadow-lg active:scale-95 disabled:opacity-50 transition-transform"
                                            >
                                                SUBMIT
                                            </button>
                                        </>
                                    ) : me && (
                                        <div className="mt-4 bg-green-500/20 text-green-400 px-6 py-8 rounded-xl font-black uppercase flex flex-col items-center gap-2 border border-green-500/50">
                                            <CheckCircle size={40} />
                                            LIE SENT
                                        </div>
                                    )}
                                    {amAudience && <div className="mt-8 text-white/50 font-bold uppercase text-center">Waiting for players...</div>}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 4. VOTING */}
                {state.phase === GamePhase.VOTING && (
                    <div className="flex-1 flex flex-col items-center w-full h-full overflow-hidden relative">
                        {/* Fixed Header */}
                        <div className="shrink-0 w-full max-w-md p-4 pb-2 flex flex-col items-center z-10">
                            {/* Timer */}
                            <div className="flex justify-center mb-4 relative z-30">
                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-1 rounded-full border border-white/20 shadow-lg">
                                    <Clock size={16} className="text-yellow-400 animate-pulse" />
                                    <span className="font-mono font-bold text-xl text-white">{state.timeLeft}s</span>
                                </div>
                            </div>

                            <div className="w-full bg-purple-800/50 p-4 rounded-xl border border-white/10 backdrop-blur-sm shadow-md text-center">
                                <p className="text-lg font-bold text-white leading-tight uppercase">
                                    {state.currentQuestion?.fact.replace('<BLANK>', '________')}
                                </p>
                            </div>
                        </div>

                        {/* Answers Grid - Scrollable */}
                        <div
                            ref={answersRef}
                            className="flex-1 w-full overflow-y-auto px-4 pb-4 no-scrollbar flex justify-center"
                        >
                            <div className="grid grid-cols-1 gap-3 w-full max-w-md pb-8">
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
                                                  w-full p-3 md:p-4 rounded-xl border-l-4 md:border-l-8 text-left font-bold text-base md:text-lg shadow-md transition-all active:scale-95 uppercase relative overflow-hidden min-h-[2.5rem] flex items-center
                                                  ${iVoted
                                                    ? 'bg-indigo-600 border-indigo-400 text-white'
                                                    : 'bg-white border-transparent text-indigo-900'
                                                }
                                                  ${(me?.currentVote && !iVoted) ? 'opacity-50 grayscale' : ''}
                                              `}
                                        >
                                            <div className="relative z-10 flex flex-col w-full min-h-[3rem] justify-center">
                                                <span className="leading-tight text-sm md:text-base">{ans.text}</span>
                                                {/* Audience Indicator */}
                                                {ans.audienceVotes.length > 0 && (
                                                    <div className="flex items-center gap-1 mt-1 opacity-70">
                                                        <Users size={12} className={iVoted ? 'text-black' : 'text-purple-500'} />
                                                        <span className={`text-[10px] font-black ${iVoted ? 'text-black' : 'text-purple-500'}`}>
                                                            {ans.audienceVotes.length}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {iVoted && <motion.div layoutId="voted-check" className="absolute right-4"><CheckCircle size={24} /></motion.div>}
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Scroll Indicator */}
                        <AnimatePresence>
                            {canScrollDown && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-20"
                                >
                                    <div className="bg-black/80 backdrop-blur-md text-white/90 pl-4 pr-3 py-2 rounded-full text-xs font-bold uppercase flex items-center gap-2 border border-white/20 shadow-xl animate-bounce">
                                        Scroll for more <ChevronDown size={14} className="animate-pulse" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* 5. REVEAL & LEADERBOARD (Shared) */}
                {state.phase === GamePhase.REVEAL && (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <RevealSequence state={state} actions={actions} setGalleryOverrides={() => { }} isHost={isVip} />
                    </div>
                )}

                {state.phase === GamePhase.LEADERBOARD && (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <LeaderboardSequence state={state} actions={actions} onHome={() => { }} isHost={isVip} />
                    </div>
                )}

                {state.phase === GamePhase.GAME_OVER && (
                    <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
                        <LeaderboardSequence state={state} actions={actions} onHome={() => { }} isHost={isVip} />
                        {isVip && (
                            <div className="flex flex-col gap-4 mt-8 w-full max-w-sm pb-12">
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

            {/* PERSISTENT BOTTOM BAR (Avatar Strip + Emotes) - With Safe Area support */}
            {
                state.phase !== GamePhase.LOBBY && state.phase !== GamePhase.LEADERBOARD && state.phase !== GamePhase.GAME_OVER && (
                    <div className="pb-safe-bottom z-50 transition-all duration-300">
                        <AvatarStrip />
                        <AnimatePresence>
                            {(!isMobile || showReactions) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="grid grid-cols-4 gap-2 px-4 pb-2 w-full max-w-sm mx-auto z-20 relative overflow-hidden"
                                >
                                    <button onClick={() => handleEmote('LAUGH')} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 text-2xl active:scale-95 transition border border-white/5 aspect-square flex items-center justify-center">😂</button>
                                    <button onClick={() => handleEmote('SHOCK')} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 text-2xl active:scale-95 transition border border-white/5 aspect-square flex items-center justify-center">😮</button>
                                    <button onClick={() => handleEmote('LOVE')} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 text-2xl active:scale-95 transition border border-white/5 aspect-square flex items-center justify-center">❤️</button>
                                    <button onClick={() => handleEmote('TOMATO')} className="bg-white/10 p-3 rounded-xl hover:bg-white/20 text-2xl active:scale-95 transition border border-white/5 aspect-square flex items-center justify-center">🍅</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )
            }
        </div >
    );
};
