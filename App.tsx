import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useGameService } from './services/gameService';
import { HostView } from './views/HostView';
import { PlayerView } from './views/PlayerView';
import { Monitor, Smartphone, Users, SplitSquareHorizontal, Globe, Settings as SettingsIcon } from 'lucide-react';
import { OnlinePlayerView } from './views/OnlinePlayerView';
import { SettingsView } from './views/SettingsView';
import { getText } from './i18n';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/settings" element={<SettingsView />} />
      </Routes>
    </BrowserRouter>
  );
};

const AppContent: React.FC = () => {
  const [view, setView] = useState<'HOME' | 'HOST' | 'PLAYER' | 'TEST'>('HOME');
  const [language, setLanguage] = useState<'en' | 'el'>(() => {
    const stored = localStorage.getItem('bamboozle_language');
    return (stored === 'en' || stored === 'el') ? stored : 'en';
  });

  const handleSetLanguage = (lang: 'en' | 'el') => {
    setLanguage(lang);
    localStorage.setItem('bamboozle_language', lang);
  };

  // Update document language for CSS matching - moved to Root so it persists
  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'el') {
      document.body.classList.add('lang-el');
    } else {
      document.body.classList.remove('lang-el');
    }
  }, [language]);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth <= 768);

  return (
    <div className="h-screen w-full overflow-hidden">
      {view === 'HOME' && <HomeSelector onSelect={setView} isMobile={isMobile} language={language} setLanguage={handleSetLanguage} />}
      {view === 'HOST' && <div className="h-full w-full"><GameHostWrapper onHome={() => setView('HOME')} debugMode={false} language={language} /></div>}
      {view === 'PLAYER' && <div className="h-full w-full"><GamePlayerWrapper onHome={() => setView('HOME')} language={language} /></div>}
      {view === 'TEST' && <TestModeView language={language} />}
    </div>
  );
};

const HomeSelector = ({ onSelect, isMobile, language, setLanguage }: { onSelect: (v: 'HOST' | 'PLAYER' | 'TEST') => void, isMobile: boolean, language: 'en' | 'el', setLanguage: (l: 'en' | 'el') => void }) => {
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'el' : 'en');
  };
  const navigate = useNavigate();

  return (
    <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black text-white flex flex-col items-center justify-center p-4 relative overflow-y-auto">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center py-8">
        {/* Settings Button (Top Left) */}
        {!import.meta.env.PROD && (
          <button
            onClick={() => navigate('/settings')}
            className="absolute top-0 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            title="Settings"
          >
            <SettingsIcon className="w-6 h-6 text-white/70" />
          </button>
        )}

        <h1 className="text-4xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-8 md:mb-12 drop-shadow-2xl tracking-tighter uppercase transform -rotate-2 text-center">
          Bamboozle
        </h1>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 w-full max-w-sm md:max-w-4xl justify-center`}>
          <button
            onClick={() => onSelect('HOST')}
            className="group relative bg-white/10 backdrop-blur-md p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/20 hover:bg-purple-600/40 hover:border-purple-400 transition-all duration-300 flex flex-col items-center shadow-xl hover:shadow-purple-500/30 hover:-translate-y-2 active:scale-95"
          >
            <div className="bg-purple-500/20 p-4 md:p-6 rounded-full mb-3 md:mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Monitor className="text-purple-300 group-hover:text-white w-6 h-6 md:w-10 md:h-10" />
            </div>
            <h2 className="text-xl md:text-3xl font-black mb-1 md:mb-2 uppercase tracking-wide">{getText(language, 'HOME_HOST_GAME')}</h2>
            <p className="text-xs md:text-sm font-bold opacity-60 uppercase tracking-widest">{isMobile ? getText(language, 'HOME_HOST_DESC_MOBILE') : getText(language, 'HOME_HOST_DESC_DESKTOP')}</p>
          </button>

          <button
            onClick={() => onSelect('PLAYER')}
            className="group relative bg-white/10 backdrop-blur-md p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/20 hover:bg-blue-600/40 hover:border-blue-400 transition-all duration-300 flex flex-col items-center shadow-xl hover:shadow-blue-500/30 hover:-translate-y-2 active:scale-95"
          >
            <div className="bg-blue-500/20 p-4 md:p-6 rounded-full mb-3 md:mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Smartphone className="text-blue-300 group-hover:text-white w-6 h-6 md:w-10 md:h-10" />
            </div>
            <h2 className="text-xl md:text-3xl font-black mb-1 md:mb-2 uppercase tracking-wide">{getText(language, 'HOME_JOIN_GAME')}</h2>
            <p className="text-xs md:text-sm font-bold opacity-60 uppercase tracking-widest">{getText(language, 'HOME_JOIN_DESC')}</p>
          </button>

          {/* Language Toggle Button - Big */}
          <button
            onClick={toggleLanguage}
            className="group relative bg-white/10 backdrop-blur-md p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/20 hover:bg-pink-600/40 hover:border-pink-400 transition-all duration-300 flex flex-col items-center shadow-xl hover:shadow-pink-500/30 hover:-translate-y-2 active:scale-95"
          >
            <div className="bg-pink-500/20 p-4 md:p-6 rounded-full mb-3 md:mb-6 group-hover:bg-pink-500 group-hover:text-white transition-colors">
              <Globe className="text-pink-300 group-hover:text-white w-6 h-6 md:w-10 md:h-10" />
            </div>
            <h2 className="text-xl md:text-3xl font-black mb-1 md:mb-2 uppercase tracking-wide">{language === 'en' ? 'ENGLISH' : 'ΕΛΛΗΝΙΚΑ'}</h2>
            <p className="text-xs md:text-sm font-bold opacity-60 uppercase tracking-widest">{language === 'en' ? 'CHANGE LANGUAGE' : 'ΑΛΛΑΓΗ ΓΛΩΣΣΑΣ'}</p>
          </button>

          {!isMobile && (
            <button
              onClick={() => onSelect('TEST')}
              className="group relative bg-white/10 backdrop-blur-md p-4 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-white/20 hover:bg-orange-600/40 hover:border-orange-400 transition-all duration-300 flex flex-col items-center shadow-xl hover:shadow-orange-500/30 hover:-translate-y-2 active:scale-95"
            >
              <div className="bg-orange-500/20 p-4 md:p-6 rounded-full mb-3 md:mb-6 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                <SplitSquareHorizontal className="text-orange-300 group-hover:text-white w-6 h-6 md:w-10 md:h-10" />
              </div>
              <h2 className="text-xl md:text-3xl font-black mb-1 md:mb-2 uppercase tracking-wide">{getText(language, 'HOME_TEST_MODE')}</h2>
              <p className="text-xs md:text-sm font-bold opacity-60 uppercase tracking-widest">{getText(language, 'HOME_TEST_DESC')}</p>
            </button>
          )}
        </div>

        <p className="mt-8 md:mt-12 text-white/40 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-center">
          {getText(language, 'HOME_TAGLINE')}
        </p>
      </div>
    </div>
  );
};

const TestModeView = ({ language }: { language: 'en' | 'el' }) => {
  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-black">
      {/* Host Side */}
      <div className="flex-1 md:h-full border-b md:border-b-0 md:border-r border-gray-700 relative flex flex-col min-h-0">
        <div className="absolute top-2 left-2 z-50 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none shadow-lg">HOST VIEW</div>
        <GameHostWrapper onHome={() => window.location.reload()} debugMode={true} language={language} />
      </div>

      {/* Player Side */}
      <div className="flex-1 md:h-full md:max-w-sm border-l border-gray-700 relative bg-gray-900 flex flex-col min-h-0">
        <div className="absolute top-2 left-2 z-50 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none shadow-lg">PLAYER VIEW</div>
        <GamePlayerWrapper onHome={() => window.location.reload()} language={language} />
      </div>
    </div>
  )
}

const GameHostWrapper = ({ onHome, debugMode, language }: { onHome: () => void, debugMode: boolean, language?: 'en' | 'el' }) => {
  const { state, actions, playerId, isSpeaking, hostDisconnected, roomClosed } = useGameService('HOST', undefined, language);

  // Automatically switch to online mode if on mobile
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    if (isMobile && !state.isOnlineMode && state.roomCode) {
      actions.sendToggleOnlineMode();
    }
  }, [state.isOnlineMode, state.roomCode, actions]);

  if (state.isOnlineMode) {
    return <OnlinePlayerView state={state} actions={actions} playerId={playerId} isSpeaking={isSpeaking} onHome={onHome} hostDisconnected={hostDisconnected} roomClosed={roomClosed} />;
  }

  return <HostView state={state} actions={actions} onHome={onHome} debugMode={debugMode} isSpeaking={isSpeaking} />;
};

const GamePlayerWrapper = ({ onHome, language }: { onHome: () => void, language?: 'en' | 'el' }) => {
  const { state, actions, playerId, isSpeaking, hostDisconnected, roomClosed } = useGameService('PLAYER', undefined, language);

  // New: Switch to Online Player View if mode is enabled
  if (state.isOnlineMode) {
    return <OnlinePlayerView state={state} actions={actions} playerId={playerId} isSpeaking={isSpeaking} onHome={onHome} hostDisconnected={hostDisconnected} roomClosed={roomClosed} />;
  }

  // Regular Player View doesn't need isSpeaking yet (it's mobile only, no narrator usually)
  // But if we want to add it later we can.
  return <PlayerView state={state} actions={actions} playerId={playerId} />;
};

export default App;