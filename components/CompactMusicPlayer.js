import React, { useEffect, useRef } from 'react';
import { Tone } from 'tone';
import styles from '../styles/CompactMusicPlayer.module.css';

const CompactMusicPlayer = () => {
  const scoreInputRef = useRef(null);
  const parseBtnRef = useRef(null);
  const playBtnRef = useRef(null);
  const stopBtnRef = useRef(null);
  const rewindBtnRef = useRef(null);
  const loopBtnRef = useRef(null);
  const visualizerRef = useRef(null);
  const staticVisualizerRef = useRef(null);
  const debugRef = useRef(null);

  let score;
  let tracks;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/tone';
    document.head.appendChild(script);

    script.onload = () => {
      initializePlayer();
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const log = (message) => {
    console.log(message);
    if (debugRef.current) {
      debugRef.current.innerHTML += message + '<br>';
      debugRef.current.scrollTop = debugRef.current.scrollHeight;
    }
  };

  const parseScore = (scoreText) => {
    log("Starting to parse score");
    const lines = scoreText.trim().split('\n');
    log(`Score split into ${lines.length} lines`);
    const [tempo, timeSignature] = lines[0].split(';');
    log(`Parsed tempo: ${tempo}, time signature: ${timeSignature}`);
    const tracks = [];

    // ... (rest of the parseScore function)

    log(`Finished parsing score. Total tracks: ${tracks.length}`);
    return {
      tempo: parseInt(tempo),
      timeSignature: timeSignature.split('/').map(Number),
      tracks
    };
  };

  const parseInstrument = (instrumentInfo) => {
    // ... (implementation of parseInstrument function)
  };

  const parseEffect = (effectInfo) => {
    // ... (implementation of parseEffect function)
  };

  const initializePlayer = () => {
    if (parseBtnRef.current) {
      parseBtnRef.current.addEventListener('click', () => {
        const scoreText = scoreInputRef.current.value;
        try {
          score = parseScore(scoreText);
          setupPlayer();
          playBtnRef.current.disabled = false;
          stopBtnRef.current.disabled = false;
          rewindBtnRef.current.disabled = false;
          loopBtnRef.current.disabled = false;
        } catch (error) {
          console.error('Error parsing score:', error);
          alert('Invalid score format. Please check your input.');
        }
      });
    }
  };

  const setupPlayer = () => {
    log('Initializing player with score:');
    log(JSON.stringify(score, null, 2));

    Tone.Transport.cancel();
    console.log("score.tracks");
    console.log(score.tracks);

    tracks = score.tracks.map((track, index) => {
      // ... (rest of the setupPlayer function)
    });

    Tone.Transport.timeSignature = score.timeSignature;
    Tone.Transport.bpm.value = score.tempo;
    log(`Set tempo to ${score.tempo} BPM and time signature to ${score.timeSignature}`);

    const totalDuration = calculateTotalDuration();
    Tone.Transport.loop = false;
    Tone.Transport.loopEnd = totalDuration;
    log(`Total duration: ${totalDuration}`);

    scheduleNotes();
    drawStaticVisualization();

    playBtnRef.current.onclick = async () => {
      log('Play button clicked');
      await Tone.start();
      log('Tone.js started');
      Tone.Transport.start();
      log('Transport started');
      drawVisualizer();
      log('Visualizer started');
    };

    stopBtnRef.current.onclick = () => {
      log('Stop button clicked');
      Tone.Transport.stop();
      log('Playback stopped');
    };

    rewindBtnRef.current.onclick = () => {
      log('Rewind button clicked');
      Tone.Transport.position = 0;
      log('Transport position reset to 0');
    };

    loopBtnRef.current.onclick = () => {
      Tone.Transport.loop = !Tone.Transport.loop;
      loopBtnRef.current.textContent = `Loop: ${Tone.Transport.loop ? 'On' : 'Off'}`;
      log(`Looping ${Tone.Transport.loop ? 'enabled' : 'disabled'}`);
    };
  };

  const calculateTotalDuration = () => {
    // ... (implementation of calculateTotalDuration function)
  };

  const scheduleNotes = () => {
    // ... (implementation of scheduleNotes function)
  };

  const resizeCanvas = () => {
    // ... (implementation of resizeCanvas function)
  };

  const getRandomColor = () => {
    return `hsl(${Math.random() * 360}, 70%, 60%)`;
  };

  const drawVisualizer = () => {
    // ... (implementation of drawVisualizer function)
  };

  const drawStaticVisualization = () => {
    // ... (implementation of drawStaticVisualization function)
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className={styles['retro-container']}>
      <h1 className={styles['retro-header']}>🎵 Compact Music Player 🎶</h1>
      
      <div className={styles['retro-panel']}>
        <textarea
          ref={scoreInputRef}
          rows="10"
          className={styles['retro-textarea']}
          placeholder="Enter your score here..."
        ></textarea>
        <div className={styles['retro-controls']}>
          <button ref={parseBtnRef} className={styles['retro-button']}>Parse Score</button>
          <button ref={playBtnRef} className={styles['retro-button']} disabled>Play</button>
          <button ref={stopBtnRef} className={styles['retro-button']} disabled>Stop</button>
          <button ref={rewindBtnRef} className={styles['retro-button']} disabled>Rewind</button>
          <button ref={loopBtnRef} className={styles['retro-button']} disabled>Loop: Off</button>
        </div>
        
        <div className={styles['retro-visualizer-container']}>
          <canvas ref={visualizerRef} className={styles['retro-visualizer']}></canvas>
          <canvas ref={staticVisualizerRef} className={styles['retro-static-visualizer']}></canvas>
        </div>
      </div>
      
      <div ref={debugRef} className={styles['retro-debug']}></div>
    </div>
  );
};

export default CompactMusicPlayer;
