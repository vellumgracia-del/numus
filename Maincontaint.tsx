import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Icons } from './Icons';
import { ViewState, ChatMessage, Playlist, Song } from '../types';
import { MOCK_PLAYLISTS, RECENTLY_PLAYED, YOUR_MIXES } from '../utils/musicData';
import { generateMusicAdvice } from '../services/geminiService';

interface MainContentProps {
  view: ViewState;
  onPlaySong: (song: Song) => void;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const MainContent: React.FC<MainContentProps> = ({ view, onPlaySong }) => {
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: "Hello! I'm your Numus AI DJ. I can help you explore the world of Suno.ai generated music. What vibe are you looking for today?" }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, view]);

  const handleAiSend = async () => {
    if (!aiInput.trim() || aiLoading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: aiInput };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
        const response = await generateMusicAdvice(userMsg.text);
        setAiMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: response }]);
    } catch (e) {
        setAiMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'model', text: "Sorry, I lost the connection to the audio server." }]);
    } finally {
        setAiLoading(false);
    }
  };

  const handlePlayPlaylist = (e: React.MouseEvent, playlist: Playlist) => {
    e.stopPropagation();
    if (playlist.songs.length > 0) {
        onPlaySong(playlist.songs[0]);
    }
  };

  const renderPlaylistCard = (playlist: Playlist) => (
    <div key={playlist.id} className="bg-numus-card hover:bg-numus-cardHover p-4 rounded-md transition-all duration-300 group cursor-pointer">
        <div className="relative mb-4 shadow-lg">
            <img src={playlist.coverUrl} alt={playlist.name} className="w-full aspect-square object-cover rounded-md" />
            <div 
                onClick={(e) => handlePlayPlaylist(e, playlist)}
                className="absolute bottom-2 right-2 bg-numus-green rounded-full p-3 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center hover:scale-105"
            >
                <Icons.Play fill="black" className="text-black ml-0.5" size={20} />
            </div>
        </div>
        <h3 className="text-white font-bold mb-1 truncate">{playlist.name}</h3>
        <p className="text-numus-gray text-xs font-medium mb-1 flex items-center gap-1">
             <Icons.Sparkles size={10} /> {playlist.owner}
        </p>
        <p className="text-numus-gray text-xs line-clamp-2 opacity-70">{playlist.description}</p>
    </div>
  );

  return (
    <div className="flex-1 bg-numus-dark rounded-lg overflow-y-auto relative custom-scrollbar bg-gradient-to-b from-[#202020] to-[#121212]">
      {/* Top Bar */}
      <div className="sticky top-0 h-16 bg-numus-dark/80 backdrop-blur-md z-20 px-6 flex items-center justify-between">
        <div className="flex gap-4">
            <button className="bg-black/50 rounded-full p-1.5 text-numus-gray hover:text-white cursor-not-allowed"><Icons.SkipBack size={20} /></button>
            <button className="bg-black/50 rounded-full p-1.5 text-numus-gray hover:text-white cursor-not-allowed"><Icons.SkipForward size={20} /></button>
        </div>
        <div className="flex gap-4 items-center">
             <div className="hidden md:flex items-center gap-2 text-xs font-bold tracking-wider text-numus-green bg-numus-green/10 px-3 py-1 rounded-full uppercase">
                <Icons.Sparkles size={12} />
                Powered by Suno.ai
             </div>
            <button className="text-sm font-bold text-numus-gray hover:text-white hover:scale-105 transition-all">Sign up</button>
            <button className="bg-white text-black text-sm font-bold px-6 py-2.5 rounded-full hover:scale-105 transition-all">Log in</button>
        </div>
      </div>

      <div className="px-6 pb-8 pt-2">
        {view === 'home' && (
            <div className="space-y-8">
                <section>
                    <h2 className="text-3xl font-bold text-white mb-6">{getGreeting()}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {RECENTLY_PLAYED.map(pl => (
                            <div key={pl.id} className="flex items-center bg-white/10 hover:bg-white/20 rounded-md overflow-hidden transition-colors group cursor-pointer">
                                <img src={pl.coverUrl} alt={pl.name} className="h-20 w-20 object-cover shadow-lg" />
                                <div className="px-4 font-bold text-white flex-1 flex justify-between items-center min-w-0">
                                    <div className="overflow-hidden">
                                        <span className="block truncate">{pl.name}</span>
                                        <span className="text-xs text-numus-gray font-normal truncate">Suno Mix</span>
                                    </div>
                                    <div 
                                        onClick={(e) => handlePlayPlaylist(e, pl)}
                                        className="bg-numus-green rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 shadow-black/40 transition-all hover:scale-105 shrink-0 ml-2"
                                    >
                                        <Icons.Play fill="black" className="text-black ml-0.5" size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4 hover:underline cursor-pointer">Generated For You</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {YOUR_MIXES.map(renderPlaylistCard)}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4 hover:underline cursor-pointer">Latest from Suno.ai</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                         {MOCK_PLAYLISTS.slice(0,5).reverse().map(renderPlaylistCard)}
                    </div>
                </section>
            </div>
        )}

        {view === 'search' && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Browse Styles</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {['Suno Top 50', 'New Gens', 'Trending', 'Synthwave', 'Cinematic', 'Lofi', 'Metal', 'Experimental', 'Ambient', 'Vocal Tracks'].map((cat, i) => (
                        <div key={i} className={`aspect-square rounded-lg p-4 relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform bg-gradient-to-br ${
                            i % 4 === 0 ? 'from-purple-600 to-blue-600' :
                            i % 4 === 1 ? 'from-red-500 to-orange-500' :
                            i % 4 === 2 ? 'from-green-500 to-emerald-700' :
                            'from-pink-500 to-rose-600'
                        }`}>
                            <h3 className="text-2xl font-bold text-white break-words max-w-[80%]">{cat}</h3>
                            <div className="absolute -bottom-4 -right-4 rotate-[25deg] shadow-lg">
                                <img src={MOCK_PLAYLISTS[i % MOCK_PLAYLISTS.length].coverUrl} className="w-24 h-24 rounded-md" alt="" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {view === 'library' && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Your Generations</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {MOCK_PLAYLISTS.map(renderPlaylistCard)}
                </div>
            </div>
        )}

        {view === 'ai-dj' && (
            <div className="max-w-3xl mx-auto h-[70vh] flex flex-col">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <Icons.Sparkles size={32} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-white">Numus AI</h2>
                        <p className="text-numus-gray">Explore music generated by Suno.ai</p>
                    </div>
                </div>

                <div className="flex-1 bg-numus-card/50 rounded-xl p-4 overflow-y-auto space-y-4 mb-4 border border-white/5 custom-scrollbar">
                    {aiMessages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-numus-green text-black font-medium rounded-br-sm' : 'bg-numus-card text-white rounded-bl-sm shadow-md'}`}>
                                {msg.role === 'model' ? <div className="prose prose-invert prose-sm"><ReactMarkdown>{msg.text}</ReactMarkdown></div> : msg.text}
                            </div>
                        </div>
                    ))}
                    {aiLoading && (
                         <div className="flex justify-start">
                            <div className="bg-numus-card p-4 rounded-2xl rounded-bl-sm flex gap-2 items-center">
                                <span className="w-2 h-2 bg-numus-green rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-numus-green rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-numus-green rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="flex gap-3">
                    <input 
                        type="text" 
                        value={aiInput}
                        onChange={e => setAiInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAiSend()}
                        placeholder="Ask for a style like '80s Japanese City Pop'..."
                        className="flex-1 bg-numus-card border border-white/10 rounded-full px-6 py-3 text-white focus:outline-none focus:border-numus-green transition-colors placeholder-numus-gray shadow-inner"
                    />
                    <button 
                        onClick={handleAiSend}
                        disabled={!aiInput.trim() || aiLoading}
                        className="bg-numus-green text-black p-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-numus-green/20"
                    >
                        <Icons.Play size={24} fill="black" className="ml-1" />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
