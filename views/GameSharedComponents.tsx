import React, { useEffect, useState, useMemo, useRef } from 'react';
import { GameState, GamePhase, Player, Answer, Expression, Emote } from '../types';
import { Avatar } from '../components/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { sfx } from '../services/audioService';

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
    const [displayValue, setDisplayValue] = useState(from);

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
            <div className="text-4xl md:text-6xl font-black text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] stroke-black" style={{ WebkitTextStroke: '1px black' }}>
                +{amount}
            </div>
            <div className="text-lg md:text-xl font-bold text-white bg-black/80 px-3 py-1 rounded-full uppercase border-2 border-yellow-400 transform -rotate-3">{label}</div>
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
        <div className="flex flex-col items-center justify-center h-full w-full z-30 relative px-4 md:px-12">
            <div className="mb-4 md:mb-12 text-center">
                <h2 className="text-2xl md:text-4xl text-purple-200 uppercase tracking-widest font-black drop-shadow-md">Category Selection</h2>
                <p className="text-lg md:text-2xl text-white mt-2 font-bold bg-black/30 px-6 py-2 rounded-full inline-block border border-white/10 uppercase">
                    <span className="text-yellow-400">{selectorName}</span> {onSelect ? 'pick one!' : 'is choosing...'}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 w-full max-w-6xl">
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
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                                scale: isSelected ? 1.15 : 1,
                                opacity: isDimmed ? 0.2 : 1,
                                backgroundColor: isSelected ? '#FBBF24' : (isHighlight ? '#6D28D9' : '#1F2937'),
                                color: isSelected ? '#000' : '#FFF',
                                borderColor: isSelected ? '#FFF' : 'rgba(255,255,255,0.1)'
                            }}
                            className={`
                                p-4 md:p-8 rounded-3xl border-4 text-center font-black text-xl md:text-3xl shadow-2xl flex items-center justify-center h-24 md:h-40 relative overflow-hidden uppercase
                                ${isSelected ? 'z-50 ring-8 ring-yellow-400/50' : ''}
                                ${onSelect && !selected ? 'hover:scale-105 active:scale-95 cursor-pointer hover:bg-purple-800' : ''}
                            `}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                            <span className="relative z-10">{opt}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export const RevealSequence = ({ state, actions, setGalleryOverrides, isHost }: { state: GameState, actions: any, setGalleryOverrides: (o: Record<string, Expression>) => void, isHost: boolean }) => {
    const [step, setStep] = useState(0);
    const [phase, setPhase] = useState<'CARD' | 'VOTERS' | 'AUTHOR'>('CARD');
    const [sequence, setSequence] = useState<Answer[]>([]);

    useEffect(() => {
        const truth = state.roundAnswers.find(a => a.authorIds.includes('SYSTEM'));
        const relevantAnswers = state.roundAnswers.filter(a =>
            a.authorIds.includes('SYSTEM') || a.votes.length > 0
        );

        const lies = relevantAnswers.filter(a => !a.authorIds.includes('SYSTEM'));
        const shuffledLies = lies.sort(() => Math.random() - 0.5);

        setSequence([...shuffledLies, truth!].filter(Boolean));
    }, [state.roundAnswers]);

    const currentAnswer = sequence[step];
    const mounted = useRef(true);

    useEffect(() => {
        if (!currentAnswer) {
            setGalleryOverrides({});
            return;
        }

        const overrides: Record<string, Expression> = {};
        const isTruth = currentAnswer.authorIds.includes('SYSTEM');

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

    const speakAndWait = async (text: string, delayAfter: number = 0, key?: string) => {
        actions.speak(text, false, key);
        const duration = Math.max(1500, text.split(' ').length * 350 + 800);
        await new Promise(resolve => setTimeout(resolve, duration + delayAfter));
    };

    useEffect(() => {
        mounted.current = true;
        if (!currentAnswer) return;

        const runSequence = async () => {
            const isTruth = currentAnswer.authorIds.includes('SYSTEM');
            const voters = currentAnswer.votes.map(vid => state.players[vid]).filter(Boolean);
            const voterNames = joinNames(voters.map(v => v.name));
            const authors = currentAnswer.authorIds.map(id => state.players[id]).filter(Boolean);

            if (!mounted.current) return;
            setPhase('CARD');
            sfx.play('POP');
            await speakAndWait(actions.getRandomPhrase('REVEAL_CARD_INTRO', { text: currentAnswer.text }), 500, `REVEAL_CARD_${currentAnswer.id}`);

            if (!mounted.current) return;
            setPhase('VOTERS');

            if (voters.length > 0 && currentAnswer.audienceVotes.length > 2 && !isTruth) {
                sfx.play('FAILURE');
                await speakAndWait(actions.getRandomPhrase('PLAYER_FOOLED_BY_AUDIENCE', { names: voterNames }), 1000, `FOOLED_AUD_${currentAnswer.id}`);
            } else if (voters.length > 0) {
                if (isTruth) {
                    sfx.play('SUCCESS');
                    await speakAndWait(actions.getRandomPhrase('REVEAL_CORRECT_GROUP', { names: voterNames }), 1000, `CORRECT_${currentAnswer.id}`);
                }
                else {
                    sfx.play('FAILURE');
                    await speakAndWait(actions.getRandomPhrase('REVEAL_FOOLED_GROUP', { names: voterNames }), 1000, `FOOLED_${currentAnswer.id}`);
                }
            } else {
                if (isTruth) await speakAndWait(actions.getRandomPhrase('REVEAL_NOBODY'), 1000, `NOBODY_${currentAnswer.id}`);
                else await new Promise(r => setTimeout(r, 1500));
            }

            if (!mounted.current) return;
            setPhase('AUTHOR');
            if (isTruth) {
                const intro = actions.getRandomPhrase('REVEAL_TRUTH_INTRO');
                const fullFact = state.currentQuestion?.fact.replace('<BLANK>', currentAnswer.text) || currentAnswer.text;
                sfx.play('REVEAL');
                await speakAndWait(`${intro} ${fullFact}`, 2000, `TRUTH_${currentAnswer.id}`);
            } else {
                if (authors.length > 0) {
                    if (authors.length === 1) await speakAndWait(actions.getRandomPhrase('REVEAL_LIAR', { name: authors[0].name }), 1000, `LIAR_${currentAnswer.id}`);
                    else {
                        const authorNames = joinNames(authors.map(a => a.name));
                        await speakAndWait(actions.getRandomPhrase('REVEAL_LIAR_JINX', { names: authorNames }), 1500, `LIAR_JINX_${currentAnswer.id}`);
                    }
                }
            }

            if (!mounted.current) return;
            if (step < sequence.length - 1) {
                setStep(s => s + 1);
            } else {
                if (isHost) actions.triggerNextPhase();
            }
        };

        runSequence();
        return () => { mounted.current = false; };
    }, [step, currentAnswer]);

    if (!currentAnswer) return <div className="flex h-full items-center justify-center text-4xl">Calculating lies...</div>;

    const isTruth = currentAnswer.authorIds.includes('SYSTEM');
    const authors = currentAnswer.authorIds.map(id => state.players[id]).filter(Boolean);
    const factParts = state.currentQuestion?.fact.split('<BLANK>') || ['', ''];
    const showFilledFact = isTruth && phase === 'AUTHOR';

    // Points logic
    const pointsConfig = getPointsConfig(state.currentRound, state.totalRounds);
    const audienceVoters = currentAnswer.audienceVotes.map(id => state.audience[id]).filter(Boolean);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-5xl mx-auto relative z-20">
            <div className="mb-4 md:mb-8 text-center bg-black/40 px-4 md:px-8 py-2 md:py-4 rounded-xl backdrop-blur-md border border-white/10 w-full uppercase">
                <p className="text-sm md:text-xl font-bold text-gray-200 leading-relaxed">
                    {factParts[0]}
                    <AnimatePresence mode="wait">
                        {showFilledFact ? (
                            <motion.span
                                key="filled"
                                initial={{ opacity: 0, y: 10, scale: 1.5, color: '#FBBF24' }}
                                animate={{ opacity: 1, y: 0, scale: 1, color: '#FBBF24' }}
                                className="inline-block px-2 font-black"
                            >
                                {currentAnswer.text}
                            </motion.span>
                        ) : (
                            <motion.span
                                key="blank"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="inline-block px-1"
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
                    initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ type: 'spring', bounce: 0.5 }}
                    className={`relative w-full p-4 md:p-12 rounded-3xl border-4 md:border-8 shadow-2xl flex flex-col items-center text-center transition-colors duration-500 uppercase
                      ${isTruth && phase === 'AUTHOR' ? 'bg-green-600 border-green-300 text-white' : 'bg-white border-gray-300 text-black'}
                  `}
                >
                    <h2 className="text-2xl md:text-6xl font-black mb-4 md:mb-8 leading-tight">{currentAnswer.text}</h2>

                    {/* Voters Container */}
                    <div className="h-40 w-full flex flex-wrap items-center justify-center gap-4 mb-4 relative">
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
                                            initial={{ y: -50, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.2, type: 'spring' }}
                                            className="flex flex-col items-center relative"
                                        >
                                            {/* Points Animation for Voters */}
                                            <AnimatePresence>
                                                {phase === 'VOTERS' && isTruth && (
                                                    <PointsPopup amount={pointsConfig.truth} />
                                                )}
                                            </AnimatePresence>

                                            <Avatar seed={voter.avatarSeed} size={80} expression={voterExpression} className="filter drop-shadow-md" />
                                            <div className={`${isTruth ? 'bg-green-600' : 'bg-red-600'} text-white font-bold px-2 rounded mt-1 text-sm uppercase`}>
                                                {isTruth ? 'SMART' : 'VICTIM'}
                                            </div>
                                            <div className="font-bold">{voter.name}</div>
                                        </motion.div>
                                    )
                                })}

                                {/* Audience Ghost Voters */}
                                {audienceVoters.map((av, idx) => (
                                    <motion.div
                                        key={av.id}
                                        initial={{ y: -50, opacity: 0 }}
                                        animate={{ y: 0, opacity: 0.5 }}
                                        transition={{ delay: (currentAnswer.votes.length * 0.2) + (idx * 0.1), type: 'spring' }}
                                        className="flex flex-col items-center grayscale"
                                    >
                                        <Avatar seed={av.avatarSeed} size={60} expression={isTruth ? 'HAPPY' : 'SHOCKED'} className="filter drop-shadow-sm" />
                                        <div className="bg-blue-500/50 text-white font-bold px-2 rounded mt-1 text-xs uppercase mb-1">
                                            Audience
                                        </div>
                                        <div className="text-gray-500 font-bold text-xs">{av.name}</div>
                                    </motion.div>
                                ))}
                            </>
                        )}

                        {phase !== 'CARD' && currentAnswer.votes.length === 0 && audienceVoters.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400 font-bold italic text-2xl uppercase">
                                (No one picked this)
                            </motion.div>
                        )}
                    </div>

                    <div className="h-32 w-full flex items-center justify-center gap-4 relative">
                        {phase === 'AUTHOR' && !isTruth && authors.length > 0 && authors.map((author, idx) => (
                            <motion.div
                                key={author.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center gap-4 bg-purple-900 text-white p-4 rounded-full pr-8 border-4 border-purple-400 uppercase relative"
                            >
                                {/* Points Animation for Author */}
                                <AnimatePresence>
                                    {currentAnswer.votes.length > 0 && (
                                        <PointsPopup amount={pointsConfig.lie * currentAnswer.votes.length} label="LIE BONUS" />
                                    )}
                                </AnimatePresence>

                                <Avatar seed={author.avatarSeed} size={64} expression={'SMUG'} />
                                <div className="text-left">
                                    <div className="text-sm font-bold opacity-75">WRITTEN BY</div>
                                    <div className="text-2xl font-black">{author.name}</div>
                                </div>
                            </motion.div>
                        ))}
                        {phase === 'AUTHOR' && isTruth && (
                            <motion.div
                                initial={{ scale: 5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-6xl font-black text-white drop-shadow-lg tracking-widest border-4 border-white px-8 py-2 bg-green-500 rounded-xl transform -rotate-2 uppercase"
                            >
                                THE TRUTH
                            </motion.div>
                        )}
                    </div>

                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export const LeaderboardSequence = ({ state, actions, onHome, isHost }: { state: GameState, actions: any, onHome: () => void, isHost: boolean }) => {
    const [sortedPlayers, setSortedPlayers] = useState<Player[]>([]);
    const [showNewScores, setShowNewScores] = useState(false);

    useEffect(() => {
        const initial = Object.values(state.players).sort((a, b) => {
            const prevA = a.score - a.lastRoundScore;
            const prevB = b.score - b.lastRoundScore;
            return prevB - prevA;
        });
        setSortedPlayers(initial);

        if (state.phase === GamePhase.GAME_OVER) {
            setShowNewScores(true);
            setSortedPlayers(Object.values(state.players).sort((a, b) => b.score - a.score));
        }
    }, []);

    useEffect(() => {
        if (state.phase === GamePhase.GAME_OVER) return;
        let mounted = true;
        const runSequence = async () => {
            const intro = actions.getRandomPhrase('LEADERBOARD_INTRO');
            actions.speak(intro, false, `LEADERBOARD_INTRO_${state.currentRound}`);
            await new Promise(r => setTimeout(r, 2500));
            if (!mounted) return;

            setShowNewScores(true);
            const newOrder = Object.values(state.players).sort((a, b) => b.score - a.score);
            setSortedPlayers(newOrder);

            if (newOrder.length > 0) {
                const leader = newOrder[0];
                const text = actions.getRandomPhrase('LEADERBOARD_LEADER', { name: leader.name });
                actions.speak(text, false, `LEADERBOARD_LEADER_${state.currentRound}`);
                const duration = Math.max(1500, text.split(' ').length * 350 + 800);
                await new Promise(r => setTimeout(r, duration + 2000));
            } else {
                await new Promise(r => setTimeout(r, 3000));
            }

            if (!mounted) return;
            if (isHost) actions.triggerNextPhase();
        };
        runSequence();
        return () => { mounted = false; };
    }, [state.phase]);

    const getRankEmotion = (p: Player, currentIdx: number): Expression => {
        if (!showNewScores) return 'NEUTRAL';
        if (p.previousRank === undefined) return 'HAPPY';
        if (currentIdx < p.previousRank) return 'HAPPY';
        if (currentIdx > p.previousRank) return 'ANGRY';
        return 'NEUTRAL';
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto z-20 relative">
            <h2 className="text-6xl font-black text-yellow-400 mb-8 drop-shadow-lg tracking-wider uppercase">
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
                                    <div className="w-16 text-4xl font-black text-gray-300 italic">
                                        #{idx + 1}
                                    </div>
                                    <Avatar seed={p.avatarSeed} size={72} expression={getRankEmotion(p, idx)} className="mr-6 filter drop-shadow" />
                                    <div className="flex-1 uppercase">
                                        <h3 className="text-3xl font-bold">{p.name}</h3>
                                        {showNewScores && p.lastRoundScore > 0 && (
                                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-green-600 font-bold flex items-center gap-1">
                                                <ArrowUp size={20} strokeWidth={4} />
                                                {p.lastRoundScore} PTS
                                            </motion.div>
                                        )}
                                    </div>
                                    <div className="text-5xl font-black text-purple-700 w-32 text-right">
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
