import React from 'react';
import SEO from '../components/SEO';
import AudioEditor from '../components/AudioEditor';

const AudioEditorPage = () => {
  return (
    <>
      <SEO 
        title="Audio Editor - Cut, Split & Export Audio Files | Browser-Based Tool"
        description="Free online audio editor for cutting, splitting, and exporting audio files. Edit WAV files directly in your browser with touch-optimized controls. No upload required - process audio locally."
        url="https://cian0.github.io/audio-editor"
        keywords="audio editor, split audio, cut audio, export audio, WAV editor, browser audio tool, online audio editor, audio splitter, audio cutter, web audio editor"
      />
      <div className="retro-container">
        <div className="retro-post">
          <div className="retro-header">
            🎵 Audio Editor 🎧
          </div>
          
          <div className="retro-section">
            <h1 style={{ fontSize: '1.5rem', margin: '0 0 1rem 0' }}>Free Online Audio Editor</h1>
            <p className="retro-text">
              Professional audio editing tool that runs entirely in your browser. Edit your audio files with ease - 
              no installation required, no uploads needed. All processing happens locally on your device.
            </p>
            <p className="retro-text">
              <strong>Features:</strong> Cut unwanted sections, split audio into multiple segments, 
              export edited files as WAV format. Optimized for both desktop and mobile devices with 
              touch-friendly controls.
            </p>
          </div>
          
          <div className="retro-section">
            <AudioEditor />
          </div>
        </div>
      </div>
    </>
  );
};

export default AudioEditorPage;
