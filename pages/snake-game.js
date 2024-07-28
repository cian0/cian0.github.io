import React from 'react';
import dynamic from 'next/dynamic';

const DynamicEmojiSnakeGame = dynamic(
  () => import('../components/EmojiSnakeGame'),
  { ssr: false }
);

const SnakeGamePage = () => {
  return (
    <div className="nes-container with-title is-centered" style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <p className="title">Emoji Snake Game</p>
      <DynamicEmojiSnakeGame />
    </div>
  );
};

export default SnakeGamePage;