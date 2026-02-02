import React, { useState, useEffect } from 'react';
import { GameState, GamePhase } from '../types';
import { Avatar } from '../components/Avatar';
import { Clock, Users, CheckCircle, Lock, Play, Minus, Plus, RotateCcw, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sfx } from '../services/audioService';

interface PlayerViewProps {
  state: GameState;
  actions: any;
  playerId: string;
}

export const PlayerView: React.FC<PlayerViewProps> = ({ state, actions, playerId }) => {
  // Game Interactions State
  const [lieText, setLieText] = useState('');
  const [showTruthWarning, setShowTruthWarning] = useState(false);
  const [myEmoteExpression, setMyEmoteExpression] = useState<'NEUTRAL'|'HAPPY'|'SHOCKED'|'ANGRY' | null>(null);
  const [selectedRounds, setSelectedRounds] = useState(3);
  
  // Entry Flow State
  const [joinStep, setJoinStep] = useState<'CODE' | 'NAME'>('CODE');
  const [inputCode, setInputCode] = useState('');
  const [joinName, setJoinName] = useState('');
  const [codeError, setCodeError] = useState('');

  const me = state.players[playerId];
  const amAudience = state.audience[playerId];
  const isJoined = !!me || !!amAudience;

  // Reset lie text between rounds
  useEffect(() => {
      setLieText('');
      setShowTruthWarning(false);
  }, [state.currentRound, state.phase]);

  // Sync selected rounds if changed remotely
  useEffect(() => {
      if (state.totalRounds) {
          setSelectedRounds(state.totalRounds);
      }
  }, [state.totalRounds]);

  // Handle self-emote display
  const handleEmote = (type: 'LAUGH'|'SHOCK'|'LOVE'|'TOMATO') => {
      const name = me ? me.name : (amAudience ? amAudience.name : 'Unknown');
      const seed = me ? me.avatarSeed : (amAudience ? amAudience.avatarSeed : 'unknown');
      actions.sendEmote(type, name, seed);
      sfx.play('CLICK');
      
      // Local feedback
      if (type === 'SHOCK') setMyEmoteExpression('SHOCKED');
      else if (type === 'TOMATO') setMyEmoteExpression('ANGRY');
      else setMyEmoteExpression('HAPPY');
      
      setTimeout(() => setMyEmoteExpression(null), 2000);
  };

  const submitLie = () => {
      if (!state.currentQuestion) return;
      const cleanLie = lieText.trim().toLowerCase();
      const cleanAnswer = state.currentQuestion.answer.toLowerCase();

      // Simple fuzzy check
      if (cleanLie === cleanAnswer || cleanAnswer.includes(cleanLie) && cleanLie.length > 3) {
          setShowTruthWarning(true);
          sfx.play('FAILURE');
          setTimeout(() => setShowTruthWarning(false), 3000);
          return;
      }
      
      actions.sendLie(lieText);
  };

  const updateRounds = (val: number) => {
      setSelectedRounds(val);
      actions.sendUpdateRounds(val);
      sfx.play('CLICK');
  };

  const handleAvatarClick = () => {
      if (actions.requestSync) {
          actions.requestSync((success: boolean) => {
              if (success) {
                  sfx.play('JOIN'); 
              } else {
                  sfx.play('FAILURE'); // Cooldown
              }
          });
      }
  };

  // Determine avatar expression (local override vs server state)
  const currentExpression = myEmoteExpression || (me ? me.expression : 'NEUTRAL');

  const EmoteGrid = () => (
      <div className="grid grid-cols-4 gap-2 w-full mt-4">
          <button onClick={() => handleEmote('LAUGH')} className="bg-gray-800 p-3 rounded-xl hover:bg-gray-700 text-2xl active:scale-95 transition">😂</button>
          <button onClick={() => handleEmote('SHOCK')} className="bg-gray-800 p-3 rounded-xl hover:bg-gray-700 text-2xl active:scale-95 transition">😮</button>
          <button onClick={() => handleEmote('LOVE')} className="bg-gray-800 p-3 rounded-xl hover:bg-gray-700 text-2xl active:scale-95 transition">❤️</button>
          <button onClick={() => handleEmote('TOMATO')} className="bg-gray-800 p-3 rounded-xl hover:bg-gray-700 text-2xl active:scale-95 transition">🍅</button>
      </div>
  );

  // --- UNIFIED JOIN FLOW ---
  if (!isJoined) {
      return (
          <div className="h-full bg-purple-900 p-6 flex flex-col items-center justify-center">
              <div className="w-full max-w-md space-y-6">
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
                               {state.phase !== GamePhase.LOBBY && (
                                   <div className="mt-2 text-yellow-400 font-bold uppercase text-sm animate-pulse">
                                       GAME IN PROGRESS
                                   </div>
                               )}
                          </div>

                          <input 
                                type="text"
                                placeholder="ENTER YOUR NAME"
                                className="w-full p-4 text-center text-xl font-bold rounded-xl bg-white text-black placeholder-gray-500 uppercase"
                                value={joinName}
                                onChange={e => setJoinName(e.target.value.toUpperCase())}
                                maxLength={12}
                            />
                            
                          {state.phase === GamePhase.LOBBY ? (
                              <div className="space-y-4">
                                  {/* Join as Player if Lobby */}
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
                          ) : (
                              <div className="space-y-4">
                                  {/* Only Join Audience if In Progress */}
                                  <button 
                                      disabled={!joinName}
                                      onClick={() => { sfx.play('CLICK'); actions.sendJoinAudience(joinName, joinName); }}
                                      className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black text-xl shadow-lg flex items-center justify-center gap-2 transform transition active:scale-95 disabled:opacity-50 uppercase"
                                  >
                                      <Users size={24} /> JOIN AUDIENCE
                                  </button>
                                  <p className="text-center text-white/50 text-xs uppercase">
                                      Late players must join audience
                                  </p>
                              </div>
                          )}

                          <button onClick={() => setJoinStep('CODE')} className="w-full text-center text-white/40 text-sm hover:text-white uppercase mt-4">
                              Back to Code
                          </button>
                      </motion.div>
                  )}
              </div>
          </div>
      );
  }

  // --- LOBBY WAIT (READY/START) ---
  if (state.phase === GamePhase.LOBBY && me) {
      const allPlayers = Object.values(state.players);
      const allReady = allPlayers.length > 0 && allPlayers.every(p => p.isReady);
      const amIHost = state.vipId === playerId; 

      return (
          <div className="h-full bg-indigo-900 text-white flex flex-col items-center p-8">
               <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
                   
                   {/* Clean Avatar Display (No Square Box) */}
                   <div className="relative mb-6 cursor-pointer" onClick={handleAvatarClick} title="Tap to Sync">
                        {amIHost && (
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-400 drop-shadow-lg flex flex-col items-center animate-bounce-subtle">
                                <Crown size={32} fill="currentColor" />
                                <span className="text-xs font-black uppercase mt-1 bg-black/50 px-2 rounded">VIP</span>
                            </div>
                        )}
                        <Avatar seed={me.avatarSeed} size={140} expression={currentExpression} className="filter drop-shadow-2xl" />
                   </div>

                   <h2 className="text-3xl font-bold mb-8 uppercase">{me.name}</h2>
                   
                   <button 
                       onClick={actions.sendToggleReady}
                       className={`w-full py-6 rounded-2xl font-black text-2xl shadow-lg mb-4 transition-all transform active:scale-95 uppercase ${
                           me.isReady 
                           ? 'bg-gray-800 text-gray-400 border-4 border-gray-700' 
                           : 'bg-green-500 hover:bg-green-400 text-white border-b-8 border-green-700 active:border-b-0 active:translate-y-2'
                       }`}
                   >
                       {me.isReady ? 'READY!' : 'TAP WHEN READY'}
                   </button>

                   <div className="text-center text-sm opacity-60 font-mono mb-8 uppercase">
                       WAITING FOR PLAYERS...
                   </div>

                   {amIHost && (
                       <div className="w-full space-y-4">
                           <div className="bg-black/20 p-4 rounded-xl flex items-center justify-between">
                                <span className="font-bold uppercase text-sm opacity-75">Game Length</span>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => updateRounds(Math.max(1, selectedRounds - 1))} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><Minus size={16} /></button>
                                    <span className="font-black text-xl w-4 text-center">{selectedRounds}</span>
                                    <button onClick={() => updateRounds(Math.min(10, selectedRounds + 1))} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><Plus size={16} /></button>
                                </div>
                           </div>
                           <div className="text-center text-xs opacity-50 mb-2 font-mono">
                               EST. TIME: {Math.ceil(selectedRounds * 2.5)} MINS
                           </div>

                           <button
                               disabled={!allReady} 
                               onClick={() => { sfx.play('CLICK'); actions.sendStartGame(selectedRounds); }}
                               className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:opacity-30 disabled:cursor-not-allowed text-black py-4 rounded-xl font-black text-xl shadow-xl flex items-center justify-center gap-2 uppercase"
                           >
                               <Play size={24} /> EVERYONE'S IN
                           </button>
                       </div>
                   )}
                   {amIHost && !allReady && <p className="text-xs mt-2 text-center opacity-50 uppercase">Wait for everyone to ready up to start.</p>}
                   {!amIHost && <p className="text-xs mt-2 text-center opacity-50 uppercase">Waiting for VIP to start game.</p>}
               </div>
          </div>
      );
  }

  // --- AUDIENCE VIEW ---
  if (amAudience) {
      return (
          <div className="h-full bg-gray-900 text-white flex flex-col relative overflow-hidden">
              {/* Header */}
              <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700 z-10">
                  <div className="flex items-center gap-2">
                      <div className="bg-blue-600 text-xs font-bold px-2 py-1 rounded">AUDIENCE</div>
                      <h2 className="font-bold leading-none uppercase">{amAudience.name}</h2>
                  </div>
                  <div className="bg-black/30 px-3 py-1 rounded-full text-sm font-mono text-gray-400">
                      {state.phase}
                  </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col items-center justify-start pb-8 overflow-y-auto w-full relative px-4 pt-6">
                  
                  {/* Big Avatar for Audience */}
                  <div className="mb-6 relative cursor-pointer" onClick={handleAvatarClick} title="Tap to Sync">
                      <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse" />
                      <Avatar seed={amAudience.avatarSeed} size={140} className="relative z-10 drop-shadow-2xl" expression={currentExpression || 'NEUTRAL'} />
                  </div>

                  {state.phase === GamePhase.VOTING && (
                      <div className="w-full max-w-lg space-y-4">
                          <div className="text-center mb-4">
                              <h3 className="text-2xl font-black text-yellow-400 mb-1 uppercase">CAST YOUR VOTE</h3>
                              <p className="text-gray-400 text-sm uppercase">Trick the players by boosting a lie!</p>
                          </div>
                          {state.roundAnswers.map(ans => {
                              // Check if I voted for this
                              const iVoted = ans.audienceVotes.includes(playerId);
                              return (
                                  <button
                                    key={ans.id}
                                    onClick={() => { sfx.play('CLICK'); actions.sendAudienceVote(ans.id); }}
                                    className={`w-full p-4 border-2 rounded-xl font-bold text-lg transition-all text-left flex justify-between items-center group active:scale-95 uppercase
                                        ${iVoted ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-700 hover:border-blue-500 text-gray-200'}
                                    `}
                                  >
                                      <span className="truncate mr-2">{ans.text}</span>
                                      {iVoted && <CheckCircle size={20} />}
                                  </button>
                              );
                          })}
                      </div>
                  )}

                  {(state.phase === GamePhase.WRITING || state.phase === GamePhase.CATEGORY_SELECT || state.phase === GamePhase.LOBBY) && (
                      <div className="text-center opacity-80 mt-4">
                          <h3 className="text-xl font-bold text-blue-200 mb-2 uppercase">Enjoy the show!</h3>
                          <p className="text-gray-400 uppercase">React below to let them know how you feel.</p>
                      </div>
                  )}

                  {state.phase === GamePhase.REVEAL && (
                       <div className="text-center mt-4 w-full">
                           <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">The Truth Is Revealed</h3>
                           <div className="bg-green-900/50 border border-green-500 p-6 rounded-2xl animate-pulse">
                               <p className="text-xl text-green-400 font-black uppercase">Look at the big screen!</p>
                           </div>
                       </div>
                  )}

                  <div className="mt-auto w-full pb-4">
                      <p className="text-center text-xs uppercase tracking-widest opacity-50 mb-2">Reactions</p>
                      <EmoteGrid />
                  </div>
              </div>
          </div>
      );
  }

  // --- PLAYER: CATEGORY SELECTION ---
  if (state.phase === GamePhase.CATEGORY_SELECT) {
      const isSelector = state.categorySelection?.selectorId === playerId;
      const options = state.categorySelection?.options || [];
      const hasSelected = !!state.categorySelection?.selected;

      if (isSelector) {
          if (hasSelected) {
               return (
                   <div className="h-full bg-indigo-900 text-white flex flex-col items-center justify-center p-8 text-center">
                       <h2 className="text-3xl font-bold mb-4 uppercase">Good Choice!</h2>
                       <p className="text-xl opacity-75 uppercase">Prepare yourself...</p>
                       <EmoteGrid />
                   </div>
               );
          }

          return (
             <div className="h-full bg-indigo-900 text-white flex flex-col p-4">
                 <div className="text-center mb-6 mt-4">
                     <h2 className="text-3xl font-black text-yellow-400 uppercase">IT'S YOUR TURN!</h2>
                     <p className="text-lg opacity-80 uppercase">Pick a category for everyone.</p>
                     <div className="mt-2 text-sm font-mono flex items-center justify-center gap-2">
                        <Clock size={16} /> {state.timeLeft}s
                     </div>
                 </div>
                 
                 <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto pb-4">
                     {options.map(opt => (
                         <button
                           key={opt}
                           onClick={() => { sfx.play('CLICK'); actions.sendCategorySelection(opt); }}
                           className="bg-white text-indigo-900 p-4 rounded-xl font-black text-lg shadow-lg active:scale-95 transition-transform uppercase"
                         >
                             {opt}
                         </button>
                     ))}
                 </div>
                 <EmoteGrid />
             </div>
          );
      } else {
          const selectorName = state.categorySelection?.selectorId ? state.players[state.categorySelection.selectorId]?.name : 'Someone';
          
          return (
              <div className="h-full bg-indigo-900 text-white flex flex-col items-center justify-center p-8 text-center space-y-6">
                   <div className="animate-pulse">
                       <Avatar seed={state.players[state.categorySelection?.selectorId || '']?.avatarSeed || 'unknown'} size={100} expression={currentExpression} />
                   </div>
                   <div>
                       <h2 className="text-2xl font-bold mb-2 uppercase">{selectorName} is choosing...</h2>
                       <p className="opacity-70 uppercase">Judge their decision silently.</p>
                   </div>
                   <EmoteGrid />
              </div>
          );
      }
  }

  // --- PLAYER: WAITING SCREENS ---
  if ((state.phase === GamePhase.WRITING && state.submittedLies[playerId]) ||
     (state.phase === GamePhase.VOTING && me.currentVote) ||
     state.phase === GamePhase.INTRO || 
     state.phase === GamePhase.REVEAL || 
     state.phase === GamePhase.LEADERBOARD ||
     state.phase === GamePhase.GAME_OVER) {
      
      let message = "Waiting for Host...";
      if (state.phase === GamePhase.WRITING) message = "Lie submitted! Good luck.";
      if (state.phase === GamePhase.VOTING) message = "Vote locked in!";
      if (state.phase === GamePhase.INTRO) message = "Look at the screen!";
      if (state.phase === GamePhase.REVEAL) message = "Did you fool them?";
      if (state.phase === GamePhase.GAME_OVER) message = "Game Over!";

      const isVip = state.vipId === playerId;

      return (
          <div className="h-full bg-indigo-900 text-white flex flex-col items-center p-8">
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  
                  {/* Clean Avatar Display */}
                  <div className="relative cursor-pointer" onClick={handleAvatarClick} title="Tap to Sync">
                      <Avatar seed={me.avatarSeed} size={140} expression={currentExpression} className="filter drop-shadow-2xl" />
                  </div>
                  
                  <h2 className="text-3xl font-bold uppercase">{me.name}</h2>
                  <div className="bg-white/10 p-6 rounded-xl text-center backdrop-blur-sm border border-white/20">
                      <p className="text-xl font-bold animate-pulse uppercase">{message}</p>
                  </div>

                  {state.phase === GamePhase.GAME_OVER && isVip && (
                       <div className="space-y-4 w-full mt-4">
                           <button onClick={() => { sfx.play('CLICK'); actions.sendRestart(); }} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-black text-xl shadow-lg flex items-center justify-center gap-2 uppercase">
                               <RotateCcw size={24} /> PLAY AGAIN
                           </button>
                           <button onClick={() => window.location.reload()} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-4 rounded-xl font-black text-xl shadow-lg flex items-center justify-center gap-2 uppercase">
                               EXIT ROOM
                           </button>
                       </div>
                  )}
                  {state.phase === GamePhase.GAME_OVER && !isVip && (
                      <p className="text-sm opacity-50 uppercase text-center mt-4">Waiting for VIP to restart...</p>
                  )}

              </div>
              <div className="w-full text-center opacity-50 font-mono text-sm mb-4 uppercase">
                  {(state.phase === GamePhase.LEADERBOARD || state.phase === GamePhase.GAME_OVER) && (
                     <span>SCORE: {me.score}</span>
                  )}
              </div>
              <EmoteGrid />
          </div>
      );
  }

  // --- PLAYER: WRITING PHASE ---
  if (state.phase === GamePhase.WRITING) {
      return (
          <div className="h-full bg-purple-800 text-white p-6 flex flex-col relative overflow-hidden">
              <AnimatePresence>
                  {showTruthWarning && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-red-900/90 z-50 flex flex-col items-center justify-center text-center p-8 backdrop-blur-sm"
                      >
                          <Lock size={64} className="mb-4 text-red-200" />
                          <h2 className="text-4xl font-black text-white mb-2 uppercase">SHHHHH!</h2>
                          <p className="text-xl text-red-100 uppercase">That's the actual truth! You found it, but don't tell anyone. Write a lie instead!</p>
                      </motion.div>
                  )}
              </AnimatePresence>

              <div className="flex justify-between items-center mb-6">
                 <span className="font-bold text-purple-200">ROUND {state.currentRound}</span>
                 <div className="flex items-center text-yellow-400 font-bold gap-2">
                     <Clock size={20} /> {state.timeLeft}
                 </div>
              </div>
              
              <div className="bg-white text-purple-900 p-6 rounded-xl mb-8 shadow-lg">
                  <p className="text-lg font-bold leading-relaxed uppercase">
                      {state.currentQuestion?.fact.replace('<BLANK>', '________')}
                  </p>
              </div>

              <div className="flex-1">
                  <label className="block text-sm font-bold uppercase tracking-wider mb-2 text-purple-200">Enter your Lie</label>
                  <textarea 
                    className="w-full p-4 rounded-xl text-xl font-bold h-32 resize-none focus:ring-4 focus:ring-yellow-400 outline-none bg-white text-black placeholder-gray-500 uppercase"
                    placeholder="Make it believable..."
                    value={lieText}
                    onChange={e => setLieText(e.target.value.toUpperCase())}
                  />
              </div>

              <button 
                onClick={submitLie}
                disabled={!lieText.trim()}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-purple-900 py-6 rounded-xl font-black text-2xl shadow-lg mt-4 disabled:opacity-50 uppercase"
              >
                  SUBMIT LIE
              </button>
          </div>
      );
  }

  // --- PLAYER: VOTING PHASE ---
  if (state.phase === GamePhase.VOTING) {
      const choices = state.roundAnswers.filter(a => !a.authorIds.includes(playerId));

      return (
          <div className="h-full bg-blue-900 text-white p-4 flex flex-col">
               <div className="bg-blue-800 p-4 rounded-xl mb-4 border border-blue-700 shadow-sm">
                   <p className="text-sm font-bold opacity-80 mb-1 uppercase">THE FACT:</p>
                   <p className="font-bold text-lg leading-snug uppercase">
                       {state.currentQuestion?.fact.replace('<BLANK>', '________')}
                   </p>
               </div>

               <div className="text-center mb-4">
                   <h2 className="text-xl font-black uppercase text-yellow-400">Find the Truth</h2>
                   <p className="text-xs opacity-75 uppercase">Tap the answer you think is real.</p>
               </div>

               <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                   {choices.map(ans => (
                       <button
                         key={ans.id}
                         onClick={() => { sfx.play('CLICK'); actions.sendVote(ans.id); }}
                         className="w-full p-6 bg-white text-blue-900 rounded-xl font-bold text-lg shadow-md hover:bg-blue-50 hover:scale-[1.02] transition-transform active:scale-95 text-left relative overflow-hidden uppercase"
                       >
                           <span className="relative z-10">{ans.text}</span>
                           {/* Show Audience indicators to confuse them */}
                           {ans.audienceVotes.length > 0 && (
                               <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-70">
                                   <Users size={16} className="text-indigo-500" />
                                   <span className="text-sm font-bold text-indigo-500">{ans.audienceVotes.length}</span>
                               </div>
                           )}
                       </button>
                   ))}
               </div>
               <EmoteGrid />
          </div>
      );
  }

  return <div>Loading...</div>;
};