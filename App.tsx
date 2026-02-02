import React, { useState, useEffect } from 'react';
import { useGameService } from './services/gameService';
import { HostView } from './views/HostView';
import { PlayerView } from './views/PlayerView';
import { Monitor, Smartphone, Users, SplitSquareHorizontal } from 'lucide-react';
import { OnlinePlayerView } from './views/OnlinePlayerView';

const App: React.FC = () => {
  const [view, setView] = useState<'HOME' | 'HOST' | 'PLAYER' | 'TEST'>('HOME');

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth <= 768);

  return (
    <div className="h-screen w-full overflow-hidden">
      {view === 'HOME' && <HomeSelector onSelect={setView} isMobile={isMobile} />}
      {view === 'HOST' && <div className="h-full w-full"><GameHostWrapper onHome={() => setView('HOME')} debugMode={false} /></div>}
      {view === 'PLAYER' && <div className="h-full w-full"><GamePlayerWrapper onHome={() => setView('HOME')} /></div>}
      {view === 'TEST' && <TestModeView />}
    </div>
  );
};

const HomeSelector = ({ onSelect, isMobile }: { onSelect: (v: 'HOST' | 'PLAYER' | 'TEST') => void, isMobile: boolean }) => (
  <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex flex-col items-center justify-center p-4 relative overflow-y-auto">
    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

    <div className="relative z-10 w-full max-w-6xl flex flex-col items-center py-8">
      <h1 className="text-4xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-8 md:mb-12 drop-shadow-2xl tracking-tighter uppercase transform -rotate-2 text-center">
        Bamboozle
      </h1>

      <div className={`grid grid-cols-1 ${isMobile ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-3 md:gap-6 w-full max-w-sm md:max-w-none justify-center`}>
        <button
          onClick={() => onSelect('HOST')}
          className="group relative bg-white/10 backdrop-blur-md p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/20 hover:bg-purple-600/40 hover:border-purple-400 transition-all duration-300 flex flex-col items-center shadow-xl hover:shadow-purple-500/30 hover:-translate-y-2 active:scale-95"
        >
          <div className="bg-purple-500/20 p-4 md:p-6 rounded-full mb-3 md:mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors">
            <Monitor className="text-purple-300 group-hover:text-white w-6 h-6 md:w-10 md:h-10" />
          </div>
          <h2 className="text-xl md:text-3xl font-black mb-1 md:mb-2 uppercase tracking-wide">Host Game</h2>
          <p className="text-xs md:text-sm font-bold opacity-60 uppercase tracking-widest">{isMobile ? 'Play with friends' : 'Big Screen / TV'}</p>
        </button>

        <button
          onClick={() => onSelect('PLAYER')}
          className="group relative bg-white/10 backdrop-blur-md p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/20 hover:bg-blue-600/40 hover:border-blue-400 transition-all duration-300 flex flex-col items-center shadow-xl hover:shadow-blue-500/30 hover:-translate-y-2 active:scale-95"
        >
          <div className="bg-blue-500/20 p-4 md:p-6 rounded-full mb-3 md:mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Smartphone className="text-blue-300 group-hover:text-white w-6 h-6 md:w-10 md:h-10" />
          </div>
          <h2 className="text-xl md:text-3xl font-black mb-1 md:mb-2 uppercase tracking-wide">Join Game</h2>
          <p className="text-xs md:text-sm font-bold opacity-60 uppercase tracking-widest">Your Phone</p>
        </button>

        {!isMobile && (
          <button
            onClick={() => onSelect('TEST')}
            className="group relative bg-white/10 backdrop-blur-md p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/20 hover:bg-orange-600/40 hover:border-orange-400 transition-all duration-300 flex flex-col items-center shadow-xl hover:shadow-orange-500/30 hover:-translate-y-2 active:scale-95"
          >
            <div className="bg-orange-500/20 p-4 md:p-6 rounded-full mb-3 md:mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <SplitSquareHorizontal className="text-orange-300 group-hover:text-white w-6 h-6 md:w-10 md:h-10" />
            </div>
            <h2 className="text-xl md:text-3xl font-black mb-1 md:mb-2 uppercase tracking-wide">Test Mode</h2>
            <p className="text-xs md:text-sm font-bold opacity-60 uppercase tracking-widest">Debug Split</p>
          </button>
        )}
      </div>

      <p className="mt-8 md:mt-12 text-white/40 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-center">
        Multiplayer Party Game
      </p>
    </div>
  </div>
);

const TestModeView = () => {
  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-black">
      {/* Host Side */}
      <div className="flex-1 md:h-full border-b md:border-b-0 md:border-r border-gray-700 relative flex flex-col min-h-0">
        <div className="absolute top-2 left-2 z-50 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none shadow-lg">HOST VIEW</div>
        <GameHostWrapper onHome={() => window.location.reload()} debugMode={true} />
      </div>

      {/* Player Side */}
      <div className="flex-1 md:h-full md:max-w-sm border-l border-gray-700 relative bg-gray-900 flex flex-col min-h-0">
        <div className="absolute top-2 left-2 z-50 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none shadow-lg">PLAYER VIEW</div>
        <GamePlayerWrapper onHome={() => window.location.reload()} />
      </div>
    </div>
  )
}

const GameHostWrapper = ({ onHome, debugMode }: { onHome: () => void, debugMode: boolean }) => {
  const { state, actions, playerId, isSpeaking } = useGameService('HOST');

  // Automatically switch to online mode if on mobile
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile && !state.isOnlineMode && state.roomCode) {
      actions.sendToggleOnlineMode();
    }
  }, [state.isOnlineMode, state.roomCode, actions]);

  if (state.isOnlineMode) {
    return <OnlinePlayerView state={state} actions={actions} playerId={playerId} isSpeaking={isSpeaking} onHome={onHome} />;
  }

  return <HostView state={state} actions={actions} onHome={onHome} debugMode={debugMode} isSpeaking={isSpeaking} />;
};

const GamePlayerWrapper = ({ onHome }: { onHome: () => void }) => {
  const { state, actions, playerId, isSpeaking } = useGameService('PLAYER');

  // New: Switch to Online Player View if mode is enabled
  if (state.isOnlineMode) {
    return <OnlinePlayerView state={state} actions={actions} playerId={playerId} isSpeaking={isSpeaking} onHome={onHome} />;
  }

  // Regular Player View doesn't need isSpeaking yet (it's mobile only, no narrator usually)
  // But if we want to add it later we can.
  return <PlayerView state={state} actions={actions} playerId={playerId} />;
};

export default App;