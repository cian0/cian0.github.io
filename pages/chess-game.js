import React from 'react';
import dynamic from 'next/dynamic';

const DynamicEmojiChessGame = dynamic(
  () => import('../components/ChessGame').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <p className="retro-text">Loading chess game...</p>
  }
);

const EmojiChessGamePage = () => {
  return (
    <div className="retro-container">
      <div className="retro-post">
        <h1 className="retro-header">Emoji Chess Game</h1>
        <DynamicEmojiChessGame />
      </div>
    </div>
  );
};

export default EmojiChessGamePage;