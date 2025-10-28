import React from 'react';
import Head from 'next/head';
import AudioEditor from '../components/AudioEditor';

const AudioEditorPage = () => {
  return (
    <div className="retro-container">
      <Head>
        <title>Audio Editor - Cut, Split & Edit Audio</title>
        <meta name="description" content="Mobile-first audio editor for cutting, splitting, and editing audio files directly in your browser" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <div className="retro-post">
        <div className="retro-header">
          🎵 Audio Editor 🎧
        </div>
        
        <div className="retro-section">
          <p className="retro-text">Edit your audio files with ease!</p>
          <p className="retro-text">Cut unwanted parts, split audio into segments, and export your edits.</p>
        </div>
        
        <div className="retro-section">
          <AudioEditor />
        </div>
      </div>
    </div>
  );
};

export default AudioEditorPage;
