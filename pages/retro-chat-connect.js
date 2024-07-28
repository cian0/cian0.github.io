import React from 'react';
import RetroChat from '../components/RetroChat';

const RetroChatConnectPage = () => {
  return (
    <div className="nes-container is-dark with-title" style={{ maxWidth: '900px', margin: '2rem auto' }}>
      <p className="title">Retro Chat Connect</p>
      <div className="nes-container is-rounded">
        <p className="nes-text is-primary">Welcome to Retro Chat Connect!</p>
        <p>Share your unique room ID with a friend to start chatting.</p>
      </div>
      <RetroChat />
    </div>
  );
};

export default RetroChatConnectPage;