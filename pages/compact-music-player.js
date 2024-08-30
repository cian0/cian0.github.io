import React from 'react';
import Head from 'next/head';
import CompactMusicPlayer from '../components/CompactMusicPlayer';

const CompactMusicPlayerPage = () => {
  return (
    <div className="retro-container">
      <Head>
        <title>Compact Music Player</title>
      </Head>
      <div className="retro-post">
        <div className="retro-header">
          🎵 Compact Music Player 🎶
        </div>
        
        <div className="retro-section">
          <p className="retro-text">Welcome to the Compact Music Player!</p>
          <p className="retro-text">Use this player to visualize and play your music scores.</p>
        </div>
        
        <div className="retro-section">
          <CompactMusicPlayer />
        </div>
      </div>
    </div>
  );
};

export default CompactMusicPlayerPage;
