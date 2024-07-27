import React from 'react';
import dynamic from 'next/dynamic';

const DynamicEmojiTerrainGame = dynamic(
  () => import('../components/EmojiTerrainGame').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <p>Loading game...</p>
  }
);

const EmojiTerrainGamePage = () => {
  return (
    <div className="nes-container with-title is-centered" style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <p className="title">Emoji Terrain Game</p>
      <DynamicEmojiTerrainGame />
    </div>
  );
};

export default EmojiTerrainGamePage;