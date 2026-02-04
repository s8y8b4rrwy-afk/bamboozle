import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsView: React.FC = () => {
    const navigate = useNavigate();
    const [useLocalServer, setUseLocalServer] = useState(false);
    const [usePremiumVoices, setUsePremiumVoices] = useState(true);
    const [customServerUrl, setCustomServerUrl] = useState('http://localhost:3001');

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('bamboozle_settings');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.useLocalServer !== undefined) setUseLocalServer(!!parsed.useLocalServer);
                if (parsed.usePremiumVoices !== undefined) setUsePremiumVoices(!!parsed.usePremiumVoices);
                if (parsed.customServerUrl) setCustomServerUrl(parsed.customServerUrl);
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Auto-save whenever settings change, but only after initial load
    useEffect(() => {
        if (!isLoaded) return;

        const settings = {
            useLocalServer,
            usePremiumVoices,
            customServerUrl
        };
        localStorage.setItem('bamboozle_settings', JSON.stringify(settings));
    }, [useLocalServer, usePremiumVoices, customServerUrl, isLoaded]);

    const saveAndExit = () => {
        // Force reload if server config changed, otherwise just navigate
        // Actually, let's just navigate to home. App.tsx or gameService relies on localStorage read on mount/event.
        // Ideally we might want to reload if server URL changed to reconnect socket? 
        // For now, let's navigate. The gameService reads mostly on mount/connect.
        // If we want to strictly apply network changes, a window.location.reload() or navigate + reload is decent.
        // The user asked to remove "Save & Reload" button, but "Save and Exit" should probably still be robust.
        // Let's just navigate home. If the user wants to apply server changes, they might need to refresh if the socket doesn't reconnect efficiently.
        // Actually, the previous logic had a window.location.reload(). 
        // Let's keep it simple: Navigate Home. The socket logic in gameService reads localStorage on mount/reconnect?
        // gameService reads localStorage in `getServerUrl` which is called at top level of hook. 
        // So a full page reload or ensuring the hook re-runs is needed for Server URL change to take effect immediately.
        // BUT, since we are moving back to Home, the component might not unmount if using React Router fully.
        // To be safe for "switching servers", a hard reload is safer.

        window.location.href = "/";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white flex flex-col items-center p-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">

                <div className="flex items-center justify-between mb-8">
                    <button onClick={saveAndExit} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
                        <SettingsIcon className="w-8 h-8 text-yellow-400" />
                        Settings
                    </h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>

                <div className="space-y-8">
                    {/* Developer Settings */}
                    <section className="bg-black/20 rounded-2xl p-4">
                        <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Developer Mode</h2>

                        <div className="flex items-center justify-between mb-4">
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">Use Local Server</span>
                                <span className="text-xs text-white/60">Override production URL</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={useLocalServer}
                                    onChange={(e) => setUseLocalServer(e.target.checked)}
                                />
                                <div className="w-14 h-7 bg-black/40 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                            </label>
                        </div>

                        {useLocalServer && (
                            <div className="mt-4 animate-fadeIn">
                                <label className="block text-xs font-bold text-white/70 mb-2 uppercase">Local Server URL</label>
                                <input
                                    type="text"
                                    value={customServerUrl}
                                    onChange={(e) => setCustomServerUrl(e.target.value)}
                                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                                    placeholder="http://localhost:3001"
                                />
                            </div>
                        )}
                    </section>

                    {/* Game Settings */}
                    <section className="bg-black/20 rounded-2xl p-4">
                        <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">Game Preferences</h2>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-bold text-lg">Premium Voices</span>
                                <span className="text-xs text-white/60">Use High-Quality Cloud TTS (Requires Internet)</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={usePremiumVoices}
                                    onChange={(e) => setUsePremiumVoices(e.target.checked)}
                                />
                                <div className="w-14 h-7 bg-black/40 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500"></div>
                            </label>
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
};
