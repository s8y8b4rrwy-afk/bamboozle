import React, { useEffect, useState, useMemo, useRef } from 'react';
import { GameState, GamePhase, Player, Answer, Expression, Emote } from '../types';
import { Avatar } from '../components/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { sfx } from '../services/audioService';
import { NARRATOR_SEED } from '../constants';

// Helper: Join names with "and"
export const joinNames = (names: string[]) => {
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return names.join(' and ');
    return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
};

export const getPointsConfig = (currentRound: number, totalRounds: number) => {
    let multiplier = 1;
    if (currentRound === totalRounds) multiplier = 3;
    else if (currentRound === totalRounds - 1) multiplier = 2;

    return {
        truth: 1000 * multiplier,
        lie: 500 * multiplier
    };
};

export const CountUp = ({ value, from }: { value: number; from: number }) => {
    const [displayValue, setDisplayValue] = useState(isNaN(from) ? 0 : from);

    useEffect(() => {
        let start = from;
        const end = value;
        if (start === end) return;
        const duration = 1500;
        const startTime = performance.now();
        let lastSoundTime = 0;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * ease);
            setDisplayValue(current);

            // Play ticking sound while counting
            if (currentTime - lastSoundTime > 100) {
                sfx.play('TICK');
                lastSoundTime = currentTime;
            }

            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value, from]);

    return <span>{displayValue}</span>;
};

// --- POINTS POPUP ANIMATION ---
export const PointsPopup = ({ amount, label = 'PTS' }: { amount: number, label?: string }) => {
    useEffect(() => {
        sfx.play('SUCCESS');
    }, []);

    return (
        <motion.div
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 0.9, y: -80, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="absolute z-[100] flex flex-col items-center pointer-events-none w-full"
        >
            <div className="text-3xl md:text-6xl font-black text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] stroke-black" style={{ WebkitTextStroke: '1px black' }}>
                +{amount}
            </div>
            <div className="text-sm md:text-xl font-bold text-white bg-black/80 px-3 py-1 rounded-full uppercase border-2 border-yellow-400 transform -rotate-3">{label}</div>
        </motion.div>
    );
};

// --- EMOTE AVATAR POPUP ---
export const EmotePopupLayer = ({ emotes }: { emotes: Emote[] }) => {
    return (
        <div className="absolute inset-0 z-[60] pointer-events-none overflow-hidden">
            <AnimatePresence>
                {emotes.map((e) => {
                    // Determine expression based on emote type
                    let expression: Expression = 'HAPPY';
                    if (e.type === 'SHOCK') expression = 'SHOCKED';
                    if (e.type === 'TOMATO') expression = 'ANGRY';
                    if (e.type === 'LOVE') expression = 'HAPPY';

                    return (
                        <motion.div
                            key={e.id}
                            initial={{ y: '100%', x: `${e.x}%`, scale: 0.3, opacity: 0 }}
                            animate={{ y: '-50vh', scale: 0.5, opacity: 1 }}
                            exit={{ y: '-80vh', opacity: 0, scale: 0.4 }}
                            transition={{ duration: 2.5, ease: "easeOut" }}
                            className="absolute bottom-0 flex flex-col items-center justify-center"
                        >
                            <div className="relative">
                                <Avatar seed={e.senderSeed || 'guest'} size={120} expression={expression} className="filter drop-shadow-2xl" />
                                <div className="absolute -top-4 -right-4 text-4xl bg-white rounded-full p-1 shadow-md">
                                    {e.type === 'LAUGH' && '😂'}
                                    {e.type === 'SHOCK' && '😮'}
                                    {e.type === 'LOVE' && '❤️'}
                                    {e.type === 'TOMATO' && '🍅'}
                                </div>
                            </div>
                            <div className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-bold mt-2 backdrop-blur-sm uppercase">
                                {e.senderName}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

// --- CATEGORY ROULETTE ---
export const CategoryRoulette = ({ state, onSelect }: { state: GameState, onSelect?: (category: string) => void }) => {
    const selectorId = state.categorySelection?.selectorId;
    const selectorName = selectorId ? state.players[selectorId]?.name : 'Someone';
    const options = state.categorySelection?.options || [];
    const selected = state.categorySelection?.selected;

    return (
        <div className="flex flex-col items-center justify-center h-full w-full z-30 relative px-4 md:px-12 py-safe overflow-y-auto">
            <div className="mb-4 md:mb-12 text-center max-w-2xl mx-auto flex-shrink-0 pt-4 md:pt-0">
                <h2 className="text-sm md:text-3xl text-purple-200 uppercase tracking-widest font-black drop-shadow-sm mb-2 md:mb-4">Category Selection</h2>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 md:px-8 md:py-4 rounded-3xl inline-flex flex-col items-center shadow-2xl">
                    <span className="text-yellow-400 font-black text-xl md:text-4xl uppercase mb-0.5 md:mb-1">{selectorName}</span>
                    <span className="text-white/80 text-xs md:text-lg font-bold uppercase tracking-wider">{onSelect ? 'PICK A CATEGORY' : 'IS CHOOSING...'}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 w-full max-w-5xl px-1 md:px-2 pb-24 md:pb-0">
                {options.map((opt, idx) => {
                    const isSelected = selected === opt;
                    const isDimmed = selected && !isSelected;
                    const isHighlight = !selected && (Math.floor(Date.now() / 300) % options.length === idx);

                    return (
                        <motion.button
                            key={opt}
                            layout
                            onClick={() => onSelect && onSelect(opt)}
                            disabled={!onSelect || !!selected}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{
                                scale: isSelected ? 1.05 : 1,
                                opacity: isDimmed ? 0.3 : 1,
                                backgroundColor: isSelected ? '#FBBF24' : (isHighlight ? '#7C3AED' : 'rgba(30, 41, 59, 0.6)'),
                                color: isSelected ? '#000' : '#FFF',
                                borderColor: isSelected ? '#FFF' : 'rgba(255,255,255,0.1)'
                            }}
                            className={`
                                p-3 md:p-6 rounded-2xl md:rounded-[2rem] border-2 backdrop-blur-md text-center font-black text-sm md:text-2xl shadow-lg flex items-center justify-center w-full aspect-[2/1] md:aspect-auto md:min-h-[10rem] relative overflow-hidden uppercase transition-all
                                ${isSelected ? 'z-50 ring-4 ring-yellow-400/50 shadow-2xl' : ''}
                                ${onSelect && !selected ? 'hover:scale-[1.02] active:scale-95 cursor-pointer hover:bg-purple-800/80 hover:border-purple-400' : ''}
                            `}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            <span className="relative z-10 leading-tight drop-shadow-md text-xs md:text-2xl line-clamp-2">{opt}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export const RevealSequence = ({ state, actions, setGalleryOverrides, isHost }: { state: GameState, actions: any, setGalleryOverrides: (o: Record<string, Expression>) => void, isHost: boolean }) => {
    // --- REFACTORED TO BE PURELY STATE DRIVEN ---
    // The Host now drives the sequence via GameState updates (revealStep, revealSubPhase)

    // Safety check - if data is missing or out of sync
    if (!state.revealOrder || state.revealOrder.length === 0) {
        return <div className="flex h-full items-center justify-center text-4xl font-black text-white/20 uppercase">Waiting for Host...</div>;
    }

    const currentAnswerId = state.revealOrder[state.revealStep];
    // If step is out of bounds, we might be at end or transitioning
    if (!currentAnswerId) return null;

    const currentAnswer = state.roundAnswers.find(a => a.id === currentAnswerId);

    // Should verify phase consistency
    const phase = state.revealSubPhase || 'CARD';

    useEffect(() => {
        if (!currentAnswer) {
            setGalleryOverrides({});
            return;
        }

        const overrides: Record<string, Expression> = {};
        const isTruth = currentAnswer.authorIds.includes('SYSTEM');

        // Apply overrides based on current sub-phase from state
        currentAnswer.votes.forEach(vid => {
            if (phase === 'VOTERS') {
                overrides[vid] = isTruth ? 'HAPPY' : 'SHOCKED';
            } else if (phase === 'AUTHOR') {
                overrides[vid] = isTruth ? 'HAPPY' : 'SAD';
            } else {
                overrides[vid] = 'THINKING';
            }
        });

        if (!isTruth) {
            currentAnswer.authorIds.forEach(aid => {
                if (phase === 'AUTHOR') {
                    overrides[aid] = 'SMUG';
                } else if (phase === 'VOTERS' && currentAnswer.votes.length > 0) {
                    overrides[aid] = 'HAPPY';
                }
            });
        }

        setGalleryOverrides(overrides);
    }, [currentAnswer, phase, setGalleryOverrides]);

    if (!currentAnswer) return <div className="flex h-full items-center justify-center text-4xl font-black text-white/50">Loading...</div>;



    const isTruth = currentAnswer.authorIds.includes('SYSTEM');
    const authors = currentAnswer.authorIds.map(id => state.players[id]).filter(Boolean);
    const factParts = state.currentQuestion?.fact.split('<BLANK>') || ['', ''];
    const showFilledFact = isTruth && phase === 'AUTHOR';

    // Points logic
    const pointsConfig = getPointsConfig(state.currentRound, state.totalRounds);
    const audienceVoters = currentAnswer.audienceVotes.map(id => state.audience[id]).filter(Boolean);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-6xl mx-auto relative z-20 px-4 md:px-6 py-safe">
            <div className="mb-2 md:mb-10 text-center bg-black/40 px-4 md:px-10 py-2 md:py-6 rounded-3xl backdrop-blur-xl border border-white/10 w-full shadow-2xl skew-y-1 flex-shrink-0">
                <p className="text-sm md:text-3xl font-bold text-gray-100 leading-relaxed uppercase tracking-wide">
                    {factParts[0]}
                    <AnimatePresence mode="wait">
                        {showFilledFact ? (
                            <motion.span
                                key="filled"
                                initial={{ opacity: 0, y: 10, scale: 1.5, color: '#FBBF24' }}
                                animate={{ opacity: 1, y: 0, scale: 1, color: '#FBBF24' }}
                                className="inline-block px-3 font-black underline decoration-4 decoration-yellow-400 underline-offset-4"
                            >
                                {currentAnswer.text}
                            </motion.span>
                        ) : (
                            <motion.span
                                key="blank"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="inline-block px-2 text-white/30 tracking-widest"
                            >
                                ________
                            </motion.span>
                        )}
                    </AnimatePresence>
                    {factParts[1]}
                </p>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentAnswer.id}
                    initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.4 }}
                    className={`relative w-full p-2 md:p-14 rounded-[2rem] md:rounded-[2.5rem] border-4 md:border-[6px] shadow-xl md:shadow-2xl flex flex-col items-center text-center transition-colors duration-500 uppercase flex-1 min-h-0 justify-center
                      ${isTruth && phase === 'AUTHOR'
                            ? 'bg-green-600 border-green-300 text-white shadow-[0_20px_60px_-15px_rgba(22,163,74,0.6)]'
                            : 'bg-white border-gray-200 text-black shadow-[0_20px_60px_-15px_rgba(255,255,255,0.4)]'}
                  `}
                >
                    <h2 className="text-lg md:text-7xl font-black mb-2 md:mb-12 leading-none drop-shadow-sm line-clamp-3 md:line-clamp-none overflow-hidden">{currentAnswer.text}</h2>

                    {/* Voters Container */}
                    <div className="w-full flex flex-wrap items-center justify-center gap-2 md:gap-6 mb-2 md:mb-8 min-h-[4rem] relative flex-shrink-0">
                        {phase !== 'CARD' && (
                            <>
                                {/* Player Voters */}
                                {currentAnswer.votes.map((vid, idx) => {
                                    const voter = state.players[vid];
                                    let voterExpression: Expression = 'NEUTRAL';
                                    if (phase === 'VOTERS') voterExpression = isTruth ? 'HAPPY' : 'SHOCKED';
                                    else if (phase === 'AUTHOR') voterExpression = isTruth ? 'HAPPY' : 'SAD';

                                    return (
                                        <motion.div
                                            key={vid}
                                            initial={{ y: -40, opacity: 0, scale: 0.5 }}
                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.15, type: 'spring' }}
                                            className="flex flex-col items-center relative group"
                                        >
                                            {/* Points Animation for Voters */}
                                            <AnimatePresence>
                                                {phase === 'VOTERS' && isTruth && (
                                                    <PointsPopup amount={pointsConfig.truth} />
                                                )}
                                            </AnimatePresence>

                                            <div className="relative transform hover:scale-110 transition-transform duration-200 flex flex-col items-center">
                                                <Avatar seed={voter.avatarSeed} size={90} expression={voterExpression} className="filter drop-shadow-lg mb-2 !w-12 !h-12 md:!w-[90px] md:!h-[90px]" />
                                                <motion.div
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                    className={`${isTruth ? 'bg-green-600' : 'bg-red-600'} text-white font-black px-3 py-0.5 rounded-full text-xs uppercase shadow-md border-2 border-white whitespace-nowrap z-10`}
                                                >
                                                    {isTruth ? 'SMART' : 'FOOLED'}
                                                </motion.div>
                                            </div>
                                            <div className="font-bold mt-2 text-[10px] md:text-base opacity-90">{voter.name}</div>
                                        </motion.div>
                                    )
                                })}

                                {/* Audience Ghost Voters */}
                                {audienceVoters.map((av, idx) => (
                                    <motion.div
                                        key={av.id}
                                        initial={{ y: -40, opacity: 0 }}
                                        animate={{ y: 0, opacity: 0.6 }}
                                        transition={{ delay: (currentAnswer.votes.length * 0.15) + (idx * 0.1), type: 'spring' }}
                                        className="flex flex-col items-center grayscale mix-blend-multiply"
                                    >
                                        <Avatar seed={av.avatarSeed} size={70} expression={isTruth ? 'HAPPY' : 'SHOCKED'} className="filter drop-shadow-sm !w-8 !h-8 md:!w-[70px] md:!h-[70px]" />
                                        <div className="bg-blue-500 text-white font-black px-2 py-0.5 rounded-full mt-1 text-[10px] uppercase mb-1">
                                            Audience
                                        </div>
                                        <div className="text-gray-500 font-bold text-xs">{av.name}</div>
                                    </motion.div>
                                ))}
                            </>
                        )}

                        {phase !== 'CARD' && currentAnswer.votes.length === 0 && audienceVoters.length === 0 && (
                            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-gray-400 font-black italic text-3xl md:text-4xl uppercase tracking-tighter opacity-30 select-none">
                                (No Takers)
                            </motion.div>
                        )}
                    </div>

                    <div className="flex-none min-h-[5rem] w-full flex items-center justify-center gap-4 md:gap-6 relative mt-2 md:mt-4">
                        {phase === 'AUTHOR' && !isTruth && authors.length > 0 && authors.map((author, idx) => (
                            <motion.div
                                key={author.id}
                                initial={{ scale: 0, rotate: 10 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: idx * 0.1, type: "spring" }}
                                className="flex items-center gap-2 md:gap-4 bg-purple-900 text-white pl-2 pr-4 md:pl-4 md:pr-8 py-2 md:py-3 rounded-full border-2 md:border-4 border-purple-400 uppercase relative shadow-2xl"
                            >
                                {/* Points Animation for Author */}
                                <AnimatePresence>
                                    {currentAnswer.votes.length > 0 && (
                                        <PointsPopup amount={pointsConfig.lie * currentAnswer.votes.length} label="LIE BONUS" />
                                    )}
                                </AnimatePresence>

                                <div className="border-2 md:border-4 border-white rounded-full overflow-hidden shadow-lg">
                                    <Avatar seed={author.avatarSeed} size={70} expression={'SMUG'} className="!w-10 !h-10 md:!w-[70px] md:!h-[70px]" />
                                </div>
                                <div className="text-left flex flex-col justify-center">
                                    <span className="text-[6px] md:text-[10px] font-black tracking-widest text-purple-200 mb-0.5 block">WRITTEN BY</span>
                                    <span className="text-sm md:text-2xl font-black leading-none block">{author.name}</span>
                                </div>
                            </motion.div>
                        ))}
                        {phase === 'AUTHOR' && !isTruth && currentAnswer.authorIds.includes('HOST_BOT') && (
                            <motion.div
                                key="HOST_BOT"
                                initial={{ scale: 0, rotate: -5 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.1, type: "spring" }}
                                className="flex items-center gap-2 md:gap-4 bg-gray-900 text-white pl-2 pr-4 md:pl-4 md:pr-8 py-2 md:py-3 rounded-full border-2 md:border-4 border-gray-400 uppercase relative shadow-2xl"
                            >
                                <div className="border-2 md:border-4 border-white rounded-full overflow-hidden shadow-lg">
                                    <Avatar seed={NARRATOR_SEED} size={70} expression={'SMUG'} className="!w-10 !h-10 md:!w-[70px] md:!h-[70px]" />
                                </div>
                                <div className="text-left flex flex-col justify-center">
                                    <span className="text-[6px] md:text-[10px] font-black tracking-widest text-gray-400 mb-0.5 block">WRITTEN BY</span>
                                    <span className="text-sm md:text-2xl font-black leading-none block text-gray-200">The Narrator</span>
                                </div>
                            </motion.div>
                        )}
                        {phase === 'AUTHOR' && isTruth && (
                            <motion.div
                                initial={{ scale: 3, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-3xl md:text-6xl font-black text-white drop-shadow-xl tracking-widest border-8 border-white px-10 py-4 bg-green-500 rounded-3xl transform -rotate-3 uppercase shadow-2xl"
                            >
                                THE TRUTH
                            </motion.div>
                        )}
                    </div>

                </motion.div >
            </AnimatePresence >
        </div >
    );
};

export const LeaderboardSequence = ({ state, actions, onHome, isHost }: { state: GameState, actions: any, onHome: () => void, isHost: boolean }) => {
    const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);
    const [showNewScores, setShowNewScores] = useState(false);

    useEffect(() => {
        // Create a defensive copy before sorting to avoid mutating state/props
        // Filter out any undefined/null players just in case
        const players = Object.values(state.players || {}).filter(Boolean);

        // Helper for sorting
        const getOldScore = (p: Player) => (p.score || 0) - (p.lastRoundScore || 0);

        // Calculate initial sort (by old score)
        const initialSort = [...players].sort((a, b) => getOldScore(b) - getOldScore(a));

        // Calculate final sort (by current score)
        const finalSort = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));

        if (state.phase === GamePhase.GAME_OVER) {
            setShowNewScores(true);
            setSortedPlayers(finalSort);
        } else if (state.leaderboardPhase === 'REVEAL' || state.leaderboardPhase === 'LEADER') {
            setShowNewScores(true);
            setSortedPlayers(finalSort);
        } else {
            // Intro phase or default
            setShowNewScores(false);
            setSortedPlayers(initialSort);
        }
    }, [state.phase, state.leaderboardPhase, state.players]); // Correct dependency array

    // Cleanup: Removed the duplicate useEffects that were causing conflicts


    const getRankEmotion = (p: Player, currentIdx: number): Expression => {
        if (!showNewScores) return 'NEUTRAL';
        if (p.previousRank === undefined) return 'HAPPY';
        if (currentIdx < p.previousRank) return 'HAPPY';
        if (currentIdx > p.previousRank) return 'ANGRY';
        return 'NEUTRAL';
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto z-20 relative">
            <h2 className="text-3xl md:text-6xl font-black text-yellow-400 mb-8 drop-shadow-lg tracking-wider uppercase">
                {state.phase === GamePhase.GAME_OVER ? "FINAL SCORES" : "STANDINGS"}
            </h2>
            <div className="w-full space-y-4">
                <ul className="w-full space-y-4">
                    <AnimatePresence>
                        {sortedPlayers.map((p, idx) => {
                            const oldScore = p.score - p.lastRoundScore;
                            const targetScore = showNewScores ? p.score : oldScore;

                            return (
                                <motion.li
                                    key={p.id}
                                    layout
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: 'spring', stiffness: 45, damping: 12 }}
                                    className="bg-white text-black p-4 rounded-2xl flex items-center shadow-2xl relative overflow-hidden border-b-8 border-gray-200"
                                >
                                    <div className="w-8 md:w-16 text-2xl md:text-4xl font-black text-gray-300 italic">
                                        #{idx + 1}
                                    </div>
                                    <Avatar seed={p.avatarSeed} size={72} expression={getRankEmotion(p, idx)} className="mr-2 md:mr-6 filter drop-shadow scale-75 md:scale-100" />
                                    <div className="flex-1 uppercase">
                                        <h3 className="text-lg md:text-3xl font-bold">{p.name}</h3>
                                        {showNewScores && p.lastRoundScore > 0 && (
                                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-green-600 font-bold flex items-center gap-1 text-sm md:text-base">
                                                <ArrowUp size={20} strokeWidth={4} />
                                                {p.lastRoundScore} PTS
                                            </motion.div>
                                        )}
                                    </div>
                                    <div className="text-2xl md:text-5xl font-black text-purple-700 w-20 md:w-32 text-right">
                                        <CountUp value={targetScore} from={oldScore} />
                                    </div>
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </ul>
            </div>

            {/* HOST VIEW NO LONGER SHOWS CONTROLS IN GAME OVER - THEY ARE ON VIP PHONE */}
            {state.phase === GamePhase.GAME_OVER && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 3 }} className="mt-8 flex gap-4 uppercase">
                    <div className="text-2xl text-yellow-400 font-bold animate-pulse">
                        WAITING FOR VIP TO RESTART...
                    </div>
                </motion.div>
            )}
        </div>
    );
};
