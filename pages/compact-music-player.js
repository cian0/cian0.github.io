import React from 'react';
import Head from 'next/head';

const CompactMusicPlayerPage = () => {
  return (
    <div className="retro-container">
      <Head>
        <title>Compact Music Player</title>
        <script src="https://unpkg.com/tone"></script>
        <script src="https://cdn.tailwindcss.com"></script>
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
          <iframe
            src="/minified_player.html"
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default CompactMusicPlayerPage;
