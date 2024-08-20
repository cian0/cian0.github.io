import React from 'react';
import dynamic from 'next/dynamic';

const DynamicEmojiPlatformerGame = dynamic(
  () => import('../components/EmojiPlatformerGame').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <p className="retro-text">Loading platformer game...</p>
  }
);

const EmojiPlatformerPage = () => {
  return (
    <div className="retro-container">
      <div className="retro-post">
        <h1 className="retro-header">Emoji Platformer Game</h1>
        <DynamicEmojiPlatformerGame />
      </div>
    </div>
  );
};

export default EmojiPlatformerPage;import React from 'react';
import dynamic from 'next/dynamic';

const DynamicEmojiPlatformerGame = dynamic(() => import('../components/EmojiPlatformerGame'), {
  ssr: false,
});

const EmojiPlatformerPage = () => {
  return (
    <div className="container">
      <h1 className="nes-text is-primary">Emoji Platformer</h1>
      <DynamicEmojiPlatformerGame />
    </div>
  );
};

export default EmojiPlatformerPage;
