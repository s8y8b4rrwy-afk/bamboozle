import React, { useState, useEffect } from 'react';
import { useGameService } from './services/gameService';
import { HostView } from './views/HostView';
import { PlayerView } from './views/PlayerView';
import { Monitor, Smartphone, Users, SplitSquareHorizontal } from 'lucide-react';
import { OnlinePlayerView } from './views/OnlinePlayerView';

const App: React.FC = () => {
  const [view, setView] = useState<'HOME' | 'HOST' | 'PLAYER' | 'TEST'>('HOME');

  // Game service is initialized only when we pick a role to avoid conflicting channel listeners in same component
  // But hooks must be top level. We can use a wrapper component.

  return (
    <div className="h-screen w-full overflow-hidden">
      {view === 'HOME' && <HomeSelector onSelect={setView} />}
      {view === 'HOST' && <div className="h-full w-full"><GameHostWrapper onHome={() => setView('HOME')} debugMode={false} /></div>}
      {view === 'PLAYER' && <div className="h-full w-full"><GamePlayerWrapper /></div>}
      {view === 'TEST' && <TestModeView />}
    </div>
  );
};

const HomeSelector = ({ onSelect }: { onSelect: (v: 'HOST' | 'PLAYER' | 'TEST') => void }) => (
  <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 overflow-y-auto">
    <h1 className="text-4xl md:text-6xl font-display text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8 md:mb-12 animate-bounce text-center">
      Bamboozle
    </h1>

    <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-8 w-full max-w-sm md:max-w-6xl">
      <button
        onClick={() => onSelect('HOST')}
        className="group relative bg-purple-800 p-6 md:p-8 rounded-3xl border-4 border-purple-600 hover:border-yellow-400 transition-all transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center"
      >
        <Monitor size={48} className="mb-4 text-purple-300 group-hover:text-yellow-400 md:w-16 md:h-16" />
        <h2 className="text-2xl md:text-3xl font-bold mb-1">HOST GAME</h2>
        <p className="text-sm md:text-base opacity-70">Big Screen</p>
      </button>

      <button
        onClick={() => onSelect('PLAYER')}
        className="group relative bg-blue-800 p-6 md:p-8 rounded-3xl border-4 border-blue-600 hover:border-green-400 transition-all transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center"
      >
        <Smartphone size={48} className="mb-4 text-blue-300 group-hover:text-green-400 md:w-16 md:h-16" />
        <h2 className="text-2xl md:text-3xl font-bold mb-1">JOIN GAME</h2>
        <p className="text-sm md:text-base opacity-70">Your Phone</p>
      </button>

      <button
        onClick={() => onSelect('TEST')}
        className="group relative bg-gray-800 p-6 md:p-8 rounded-3xl border-4 border-gray-600 hover:border-orange-400 transition-all transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center"
      >
        <SplitSquareHorizontal size={48} className="mb-4 text-gray-300 group-hover:text-orange-400 md:w-16 md:h-16" />
        <h2 className="text-2xl md:text-3xl font-bold mb-1">TEST MODE</h2>
        <p className="text-sm md:text-base opacity-70">Debug Split</p>
      </button>
    </div>

    <p className="mt-8 text-gray-500 text-xs md:text-base max-w-xs md:max-w-lg text-center">
      Multiplayer Party Game. Open on multiple devices to play!
    </p>
  </div>
);

const TestModeView = () => {
  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-black">
      {/* Host Side */}
      <div className="flex-1 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-gray-700 relative">
        <div className="absolute top-2 left-2 z-50 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none shadow-lg">HOST VIEW</div>
        <GameHostWrapper onHome={() => window.location.reload()} debugMode={true} />
      </div>

      {/* Player Side */}
      <div className="flex-1 h-1/2 md:h-full md:max-w-sm border-l border-gray-700 relative bg-gray-900">
        <div className="absolute top-2 left-2 z-50 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none shadow-lg">PLAYER VIEW</div>
        <GamePlayerWrapper />
      </div>
    </div>
  )
}

const GameHostWrapper = ({ onHome, debugMode }: { onHome: () => void, debugMode: boolean }) => {
  const { state, actions, playerId } = useGameService('HOST');

  if (state.isOnlineMode) {
    return <OnlinePlayerView state={state} actions={actions} playerId={playerId} />;
  }

  return <HostView state={state} actions={actions} onHome={onHome} debugMode={debugMode} />;
};

const GamePlayerWrapper = () => {
  const { state, actions, playerId } = useGameService('PLAYER');

  // New: Switch to Online Player View if mode is enabled
  if (state.isOnlineMode) {
    return <OnlinePlayerView state={state} actions={actions} playerId={playerId} />;
  }

  return <PlayerView state={state} actions={actions} playerId={playerId} />;
};

export default App;