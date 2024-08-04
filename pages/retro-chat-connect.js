import React from 'react';
import Link from 'next/link';
import RetroChat from '../components/RetroChat';

const RetroChatConnectPage = () => {
  return (
    <div className="retro-container">
      <div className="retro-post">
        <div className="retro-header">
          💬 Retro Chat Connect 📡
        </div>
        
        <div className="retro-section">
          <p className="retro-text">Welcome to Retro Chat Connect!</p>
          <p className="retro-text">Share your unique room ID with a friend to start chatting.</p>
        </div>
        
        <RetroChat />
        
      </div>
    </div>
  );
};

export default RetroChatConnectPage;