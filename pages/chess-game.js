import React from 'react';
import SEO from '../components/SEO';
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
    <>
      <SEO 
        title="Emoji Chess Game"
        description="Play chess with emojis! A fun retro-themed chess game built with React and Next.js."
        url="https://cian0.github.io/chess-game"
        keywords="chess game, emoji chess, react chess, web games, interactive chess"
      />
      <div className="retro-container">
      <div className="retro-post">
        <h1 className="retro-header">Emoji Chess Game</h1>
        <DynamicEmojiChessGame />
      </div>
      </div>
    </>
  );
};

export default EmojiChessGamePage;
