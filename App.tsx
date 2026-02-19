import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { useGameService } from './services/gameService';
import { HostView } from './views/HostView';
import { PlayerView } from './views/PlayerView';
import { Monitor, Smartphone, Users, SplitSquareHorizontal, Globe, Settings as SettingsIcon } from 'lucide-react';
import { OnlinePlayerView } from './views/OnlinePlayerView';
import { SettingsView } from './views/SettingsView';
import { AdminView } from './views/AdminView';
import { getText } from './i18n';
import { Avatar } from './components/Avatar'; // Import Avatar
import { NARRATOR_SEED } from './constants'; // Import Seed
import { Expression } from './types'; // Import Expression Type
import { GameBackground } from './views/GameSharedComponents'; // Import GameBackground
import { GameButton } from './components/ui/GameButton';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/settings" element={<SettingsView />} />
        {import.meta.env.DEV && <Route path="/admin" element={<AdminView />} />}
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
      {view === 'HOST' && <div className="h-full w-full"><GameHostWrapper onHome={() => setView('HOME')} debugMode={false} language={language} setLanguage={handleSetLanguage} /></div>}
      {view === 'PLAYER' && <div className="h-full w-full"><GamePlayerWrapper onHome={() => setView('HOME')} language={language} setLanguage={handleSetLanguage} /></div>}
      {view === 'TEST' && <TestModeView language={language} setLanguage={handleSetLanguage} />}
    </div>
  );
};

const HomeSelector = ({ onSelect, isMobile, language, setLanguage }: { onSelect: (v: 'HOST' | 'PLAYER' | 'TEST') => void, isMobile: boolean, language: 'en' | 'el', setLanguage: (l: 'en' | 'el') => void }) => {
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'el' : 'en');
  };
  const navigate = useNavigate();

  // Lively Narrator Logic
  const [narratorExpression, setNarratorExpression] = useState<Expression>('HAPPY');
  useEffect(() => {
    const timer = setInterval(() => {
      const exprs: Expression[] = ['HAPPY', 'SMUG', 'THINKING', 'HAPPY', 'HAPPY']; // Mostly happy/confident
      setNarratorExpression(exprs[Math.floor(Math.random() * exprs.length)]);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <GameBackground className="flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="relative z-10 w-full max-w-6xl flex flex-col items-center py-8">

        {/* Narrator Avatar */}
        <div className="relative mb-6 transform hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => setNarratorExpression('SHOCKED')}>
          <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
          <div className="filter drop-shadow-2xl animate-float">
            <Avatar
              seed={NARRATOR_SEED}
              size={isMobile ? 120 : 160}
              expression={narratorExpression}
            />
          </div>
        </div>

        <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-8 md:mb-12 drop-shadow-2xl tracking-tighter uppercase transform -rotate-2 text-center">
          Bamboozle
        </h1>

        <div className="w-full max-w-sm md:max-w-2xl space-y-3 md:space-y-0 relative z-20">
          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
            <GameButton
              variant="purple"
              size="xl"
              onClick={() => onSelect('HOST')}
              className="w-full h-full"
            >
              <div className="bg-white/20 p-3 md:p-4 rounded-full mb-1 group-hover:scale-110 transition-transform">
                <Monitor className="text-white w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h2 className="text-xl md:text-3xl font-black mb-1 uppercase tracking-wide">{getText(language, 'HOME_HOST_GAME')}</h2>
              <p className="text-[10px] md:text-xs font-bold opacity-80 uppercase tracking-widest">{isMobile ? getText(language, 'HOME_HOST_DESC_MOBILE') : getText(language, 'HOME_HOST_DESC_DESKTOP')}</p>
            </GameButton>

            <GameButton
              variant="blue"
              size="xl"
              onClick={() => onSelect('PLAYER')}
              className="w-full h-full"
            >
              <div className="bg-white/20 p-3 md:p-4 rounded-full mb-1 group-hover:scale-110 transition-transform">
                <Smartphone className="text-white w-6 h-6 md:w-8 md:h-8" />
              </div>
              <h2 className="text-xl md:text-3xl font-black mb-1 uppercase tracking-wide">{getText(language, 'HOME_JOIN_GAME')}</h2>
              <p className="text-[10px] md:text-xs font-bold opacity-80 uppercase tracking-widest">{getText(language, 'HOME_JOIN_DESC')}</p>
            </GameButton>
          </div>

          {/* Utility Buttons */}
          <div className="grid grid-cols-2 gap-3 py-6 md:gap-6">
            <GameButton
              variant="pink"
              size="lg"
              onClick={toggleLanguage}
              className="w-full"
            >
              <Globe className="text-pink-200 group-hover:text-white w-6 h-6 md:w-8 md:h-8 mb-2" />
              <h2 className="text-sm md:text-xl font-black uppercase tracking-wide">{language === 'en' ? 'ENGLISH' : 'ΕΛΛΗΝΙΚΑ'}</h2>
            </GameButton>

            <GameButton
              variant="gray"
              size="lg"
              onClick={() => navigate('/settings')}
              className="w-full"
            >
              <SettingsIcon className="text-gray-300 group-hover:text-white w-6 h-6 md:w-8 md:h-8 mb-2" />
              <h2 className="text-sm md:text-xl font-black uppercase tracking-wide">Settings</h2>
            </GameButton>
          </div>

          {/* Test Mode Button */}
          {!isMobile && import.meta.env.DEV && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 md:mt-6">
              <GameButton
                variant="orange"
                size="lg"
                onClick={() => onSelect('TEST')}
                className="md:col-span-2"
              >
                <div className="flex items-center gap-3">
                  <SplitSquareHorizontal className="text-orange-200 group-hover:text-white w-6 h-6" />
                  <h2 className="text-lg md:text-2xl font-black uppercase tracking-wide">{getText(language, 'HOME_TEST_MODE')}</h2>
                </div>
              </GameButton>
            </div>
          )}
        </div>

        <p className="mt-8 md:mt-12 text-white/40 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-center">
          {getText(language, 'HOME_TAGLINE')}
        </p>
      </div>
    </GameBackground>
  );
};

const TestModeView = ({ language, setLanguage }: { language: 'en' | 'el', setLanguage: (l: 'en' | 'el') => void }) => {
  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-black">
      {/* Host Side */}
      <div className="flex-1 md:h-full border-b md:border-b-0 md:border-r border-gray-700 relative flex flex-col min-h-0">
        <div className="absolute top-2 left-2 z-50 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none shadow-lg">HOST VIEW</div>
        <GameHostWrapper onHome={() => window.location.reload()} debugMode={true} language={language} setLanguage={setLanguage} />
      </div>

      {/* Player Side */}
      <div className="flex-1 md:h-full md:max-w-sm border-l border-gray-700 relative bg-gray-900 flex flex-col min-h-0">
        <div className="absolute top-2 left-2 z-50 bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none shadow-lg">PLAYER VIEW</div>
        <GamePlayerWrapper onHome={() => window.location.reload()} language={language} setLanguage={setLanguage} />
      </div>
    </div>
  )
}

const GameHostWrapper = ({ onHome, debugMode, language, setLanguage }: { onHome: () => void, debugMode: boolean, language?: 'en' | 'el', setLanguage: (l: 'en' | 'el') => void }) => {
  const { state, actions, playerId, isSpeaking, hostDisconnected, roomClosed } = useGameService('HOST', undefined, language);

  // Sync language with Host State
  useEffect(() => {
    if (state.language && state.language !== language) {
      setLanguage(state.language as 'en' | 'el');
    }
  }, [state.language, language, setLanguage]);

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

  // Automatically switch to online mode if on mobile
  useEffect(() => {
    if (isMobile && !state.isOnlineMode && state.roomCode) {
      actions.sendToggleOnlineMode();
    }
  }, [state.isOnlineMode, state.roomCode, actions, isMobile]);

  // Loading Screen Logic: Narrator Face Cycling
  const [loadingExpression, setLoadingExpression] = useState<Expression>('HAPPY');

  useEffect(() => {
    if (!state.roomCode || (isMobile && !state.isOnlineMode)) {
      const timer = setInterval(() => {
        const exprs: Expression[] = ['HAPPY', 'SHOCKED', 'THINKING', 'SMUG', 'ANGRY', 'SAD'];
        setLoadingExpression(exprs[Math.floor(Math.random() * exprs.length)]);
      }, 700);
      return () => clearInterval(timer);
    }
  }, [state.roomCode, isMobile, state.isOnlineMode]);

  // Loading Screen if not connected yet or switch pending on mobile
  if (!state.roomCode || (isMobile && !state.isOnlineMode)) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center relative overflow-hidden font-display text-white selection:bg-pink-500">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex flex-col items-center translate-y-[-10%]">
          <div className="relative mb-8 transform scale-125 md:scale-150 transition-transform duration-500">
            <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 animate-pulse"></div>
            <div className="filter drop-shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
              <Avatar
                seed={NARRATOR_SEED}
                size={180}
                expression={loadingExpression}
              />
            </div>
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 drop-shadow-lg tracking-widest uppercase mb-6 text-center animate-pulse">
            {getText(language || 'en', 'GAME_LOADING')}
          </h2>

          <div className="flex gap-3">
            <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-400 rounded-full animate-bounce shadow-lg shadow-yellow-400/50" style={{ animationDelay: '0s', animationDuration: '1s' }} />
            <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-400 rounded-full animate-bounce shadow-lg shadow-yellow-400/50" style={{ animationDelay: '0.15s', animationDuration: '1s' }} />
            <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-400 rounded-full animate-bounce shadow-lg shadow-yellow-400/50" style={{ animationDelay: '0.3s', animationDuration: '1s' }} />
          </div>

          <p className="mt-6 text-white/40 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-center">
            {state.roomCode ? 'Setting up...' : 'Connecting...'}
          </p>
        </div>
      </div>
    );
  }

  if (state.isOnlineMode) {
    return <OnlinePlayerView state={state} actions={actions} playerId={playerId} isSpeaking={isSpeaking} onHome={onHome} hostDisconnected={hostDisconnected} roomClosed={roomClosed} />;
  }

  return <HostView state={state} actions={actions} onHome={onHome} debugMode={debugMode} isSpeaking={isSpeaking} />;
};

const GamePlayerWrapper = ({ onHome, language, setLanguage }: { onHome: () => void, language?: 'en' | 'el', setLanguage: (l: 'en' | 'el') => void }) => {
  const { state, actions, playerId, isSpeaking, hostDisconnected, roomClosed } = useGameService('PLAYER', undefined, language);

  // Sync language with Host State
  useEffect(() => {
    if (state.language && state.language !== language) {
      setLanguage(state.language as 'en' | 'el');
    }
  }, [state.language, language, setLanguage]);

  // New: Switch to Online Player View if mode is enabled
  if (state.isOnlineMode) {
    return <OnlinePlayerView state={state} actions={actions} playerId={playerId} isSpeaking={isSpeaking} onHome={onHome} hostDisconnected={hostDisconnected} roomClosed={roomClosed} />;
  }

  // Regular Player View doesn't need isSpeaking yet (it's mobile only, no narrator usually)
  // But if we want to add it later we can.
  return <PlayerView state={state} actions={actions} playerId={playerId} />;
};

export default App;