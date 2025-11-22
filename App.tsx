import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import MainContent from './components/MainContent';
import { ViewState, Song } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden font-sans selection:bg-numus-green selection:text-black">
      <div className="flex-1 flex overflow-hidden gap-2 p-2 pb-0">
        <Sidebar currentView={view} setView={setView} />
        <MainContent view={view} onPlaySong={handlePlaySong} />
      </div>
      <Player 
        currentSong={currentSong} 
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying} 
      />
    </div>
  );
};

export default App;
