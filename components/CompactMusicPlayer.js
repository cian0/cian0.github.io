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
    log(`Parsing instrument: ${instrumentInfo}`);
    const [type, ...optionsParts] = instrumentInfo.split('{');
    log(`Instrument type: ${type.trim()}`);
    const options = optionsParts.join('{').slice(0, -1);
    log(`Instrument options string: ${options}`);
    
    if (type.trim() === 'Sampler') {
      log("Parsing Sampler instrument");
      const sampleMap = {};
      options.split('|').forEach(sample => {
        const [note, url] = sample.split(':');
        sampleMap[note] = url;
        log(`Added sample mapping: ${note} -> ${url}`);
      });
      log(`Completed Sampler parsing: ${JSON.stringify(sampleMap)}`);
      return ['Sampler', sampleMap];
    }
    
    if (!options) {
      log("No options provided for instrument");
      return [type, {}];
    }

    const parsedOptions = {};
    options.split(';').forEach(option => {
      log(`Parsing option: ${option}`);
      if (option.startsWith('env:')) {
        const [attack, decay, sustain, release] = option.substring(4).split(',').map(Number);
        parsedOptions.envelope = { attack, decay, sustain, release };
        log(`Parsed envelope: ${JSON.stringify(parsedOptions.envelope)}`);
      } else if (option.startsWith('mod:')) {
        const [modType, ...modOptions] = option.substring(4).split(',');
        parsedOptions.modulation = { type: modType };
        log(`Parsed modulation type: ${modType}`);
        if (modOptions.length === 4) {
          const [attack, decay, sustain, release] = modOptions.map(Number);
          parsedOptions.modulationEnvelope = { attack, decay, sustain, release };
          log(`Parsed modulation envelope: ${JSON.stringify(parsedOptions.modulationEnvelope)}`);
        }
      } else {
        const [key, value] = option.split(':');
        parsedOptions[key] = isNaN(value) ? value : Number(value);
        log(`Parsed option ${key}: ${parsedOptions[key]}`);
      }
    });

    log(`Completed instrument parsing: ${JSON.stringify(parsedOptions)}`);
    return [type.trim(), parsedOptions];
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
      log(`Initializing track: ${track.name}`);
      log(`Instrument type: ${track.instrument.type}`);
      log(`Instrument options: ${JSON.stringify(track.instrument.options)}`);
      const instruments = [];
      const createInstrument = () => {
        try {
          log(`Creating instrument for track: ${track.name}`);
          log(`Instrument type: ${track.instrument.type}`);
          log(`Instrument options: ${JSON.stringify(track.instrument.options)}`);
          let instrument;
          if (track.instrument.type === 'Sampler') {
            log("Creating Sampler instrument");
            instrument = new Tone.Sampler({
              urls: track.instrument.options,
              baseUrl: "" // Assuming the URLs are relative to the current page
            }).toDestination();
          } else {
            log(`Creating ${track.instrument.type} instrument`);
            instrument = new Tone[track.instrument.type](track.instrument.options).toDestination();
          }
          instrument.volume.value = track.volume;
          log(`Set instrument volume to ${track.volume}`);

          if (track.effects && track.effects.length > 0) {
            log(`Applying ${track.effects.length} effects to the instrument`);
            const effectsChain = track.effects.map(effect => {
              log(`Creating effect: ${effect.type}`);
              return new Tone[effect.type](effect.options);
            });
            instrument.chain(...effectsChain, Tone.Destination);
          }
          log("Instrument created successfully");
          return instrument;
        } catch (error) {
          console.error(`Error creating instrument for track ${track.name}:`, error);
          log(`Failed to create instrument for track ${track.name}. Error: ${error.message}`);
          log("Using default Synth as fallback");
          return new Tone.Synth().toDestination();
        }
      };

      instruments.push(createInstrument());

      return { 
        instruments, 
        name: track.name, 
        createInstrument,
        color: getRandomColor(),
        index
      };
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
