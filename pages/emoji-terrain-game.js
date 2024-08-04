import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const DynamicEmojiTerrainGame = dynamic(
  () => import('../components/EmojiTerrainGame'),
  { 
    ssr: false,
    loading: () => <p className="nes-text is-primary">Loading game...</p>
  }
);

const EmojiTerrainGamePage = () => {
  return (
    <div className="retro-container">
      <div className="retro-post">
        <div className="retro-header">
          🌳 Emoji Terrain Adventure 🤠
        </div>
        
        <div className="retro-section">
          <p>Welcome to the pixelated world of Emoji Terrain!</p>
          <p>Navigate through trees and grass in this retro-styled adventure.</p>
        </div>

        <DynamicEmojiTerrainGame />

        <div className="retro-section">
          <p>🎮 Game Instructions:</p>
          <ul className="nes-list is-disc">
            <li>Use arrow keys to move your cowboy emoji</li>
            <li>Avoid trees and explore the terrain</li>
            <li>Have fun in this retro emoji world!</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default EmojiTerrainGamePage;