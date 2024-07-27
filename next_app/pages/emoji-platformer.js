import React from 'react';
import dynamic from 'next/dynamic';

const DynamicEmojiPlatformerGame = dynamic(
  () => import('../components/EmojiPlatformerGame'),
  { 
    ssr: false,
    loading: () => <p>Loading game...</p>
  }
);

const EmojiPlatformerPage = () => {
  return (
    <div className="nes-container with-title is-centered" style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <p className="title">Emoji Platformer</p>
      <DynamicEmojiPlatformerGame />
    </div>
  );
};

export default EmojiPlatformerPage;