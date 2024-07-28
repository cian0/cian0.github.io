import React from 'react';
import dynamic from 'next/dynamic';

const DynamicEmojiChessGame = dynamic(
  () => import('../components/ChessGame').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <p>Loading chess game...</p>
  }
);

const EmojiChessGamePage = () => {
  return (
    <div className="nes-container with-title is-centered" style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <p className="title">Emoji Chess Game</p>
      <DynamicEmojiChessGame />
    </div>
  );
};

export default EmojiChessGamePage;