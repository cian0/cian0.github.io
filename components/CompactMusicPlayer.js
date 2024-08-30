import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import styles from '../styles/CompactMusicPlayer.module.css';

const CompactMusicPlayer = () => {
  const [score, setScore] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  const scoreInputRef = useRef(null);
  const parseBtnRef = useRef(null);
  const playBtnRef = useRef(null);
  const stopBtnRef = useRef(null);
  const rewindBtnRef = useRef(null);
  const loopBtnRef = useRef(null);
  const visualizerRef = useRef(null);
  const staticVisualizerRef = useRef(null);
  const debugRef = useRef(null);

  useEffect(() => {
    initializePlayer();
    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel();
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

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].startsWith('T:')) {
        log(`Parsing track line: ${lines[i]}`);
        const [namePart, ...rest] = lines[i].split(';');
        const name = namePart.substring(2); // Remove 'T:' prefix
        log(`Parsed name: ${name}`);

        let instrumentInfo = rest.shift();
        while (instrumentInfo.split('{').length !== instrumentInfo.split('}').length && rest.length) {
          instrumentInfo += ';' + rest.shift(); // Rejoin parts of Sampler config if split
        }
        log(`Parsed instrumentInfo: ${instrumentInfo}`);

        const [instrumentType, instrumentOptions] = parseInstrument(instrumentInfo);
        log(`Parsed instrument type: ${instrumentType}`);
        log(`Parsed instrument options: ${JSON.stringify(instrumentOptions)}`);

        const effects = [];
        let volume = 0;

        rest.forEach(item => {
          if (item.includes('{')) {
            log(`Parsing effect: ${item}`);
            effects.push(parseEffect(item));
          } else {
            volume = parseFloat(item);
            log(`Parsed volume: ${volume}`);
          }
        });

        tracks.push({
          name,
          instrument: { type: instrumentType, options: instrumentOptions },
          effects,
          volume,
          notes: []
        });
        log(`Added track: ${JSON.stringify(tracks[tracks.length - 1])}`);
      } else if (lines[i].startsWith('N:')) {
        log(`Parsing note line: ${lines[i]}`);
        const notes = lines[i].substring(2).split(';');
        log(`Split into ${notes.length} notes`);
        notes.forEach(note => {
          const [pitch, duration, time] = note.split(',');
          log(`Parsed note - pitch: ${pitch}, duration: ${duration}, time: ${time}`);
          tracks[tracks.length - 1].notes.push({ pitch, duration, time });
        });
      }
    }

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
        sampleMap[note.trim()] = url.trim();
        log(`Added sample mapping: ${note.trim()} -> ${url.trim()}`);
      });
      log(`Completed Sampler parsing: ${JSON.stringify(sampleMap)}`);
      return ['Sampler', sampleMap];
    }
  
    // ... (rest of the function remains the same)
  };

  const parseEffect = (effectInfo) => {
    log(`Parsing effect: ${effectInfo}`);
    const [type, options] = effectInfo.split('{');
    const parsedOptions = {};
    options.slice(0, -1).split(',').forEach((option, index) => {
      const key = ['delayTime', 'feedback', 'wet'][index];
      parsedOptions[key] = option.includes('n') ? option : Number(option);
      log(`Parsed effect option ${key}: ${parsedOptions[key]}`);
    });
    log(`Completed effect parsing: ${type.trim()} ${JSON.stringify(parsedOptions)}`);
    return { type: type.trim(), options: parsedOptions };
  };

  const initializePlayer = () => {
    if (parseBtnRef.current) {
      parseBtnRef.current.onclick = () => {
        const scoreText = scoreInputRef.current.value;
        try {
          const parsedScore = parseScore(scoreText);
          setScore(parsedScore);
          setupPlayer(parsedScore);
        } catch (error) {
          console.error('Error parsing score:', error);
          alert('Invalid score format. Please check your input.');
        }
      };
    }
  };

  const setupPlayer = (parsedScore) => {
    log('Initializing player with score:');
    log(JSON.stringify(parsedScore, null, 2));

    Tone.Transport.cancel();
    console.log("parsedScore.tracks");
    console.log(parsedScore.tracks);

    const newTracks = parsedScore.tracks.map((track, index) => {
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

    Tone.Transport.timeSignature = parsedScore.timeSignature;
    Tone.Transport.bpm.value = parsedScore.tempo;
    log(`Set tempo to ${parsedScore.tempo} BPM and time signature to ${parsedScore.timeSignature}`);

    const totalDuration = calculateTotalDuration(parsedScore);
    Tone.Transport.loop = isLooping;
    Tone.Transport.loopEnd = totalDuration;
    log(`Total duration: ${totalDuration}`);

    scheduleNotes(newTracks, parsedScore);
    drawStaticVisualization(newTracks, parsedScore);

    setTracks(newTracks);

    playBtnRef.current.disabled = false;
    stopBtnRef.current.disabled = false;
    rewindBtnRef.current.disabled = false;
    loopBtnRef.current.disabled = false;
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
          <button ref={parseBtnRef} className={styles['retro-button']} onClick={initializePlayer}>Parse Score</button>
          <button ref={playBtnRef} className={styles['retro-button']} onClick={handlePlay} disabled={!score || isPlaying}>Play</button>
          <button ref={stopBtnRef} className={styles['retro-button']} onClick={handleStop} disabled={!score || !isPlaying}>Stop</button>
          <button ref={rewindBtnRef} className={styles['retro-button']} onClick={handleRewind} disabled={!score}>Rewind</button>
          <button ref={loopBtnRef} className={styles['retro-button']} onClick={handleLoop} disabled={!score}>
            Loop: {isLooping ? 'On' : 'Off'}
          </button>
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
  const handlePlay = async () => {
    log('Play button clicked');
    await Tone.start();
    log('Tone.js started');
    Tone.Transport.start();
    log('Transport started');
    setIsPlaying(true);
    drawVisualizer();
    log('Visualizer started');
  };

  const handleStop = () => {
    log('Stop button clicked');
    Tone.Transport.stop();
    setIsPlaying(false);
    log('Playback stopped');
  };

  const handleRewind = () => {
    log('Rewind button clicked');
    Tone.Transport.position = 0;
    log('Transport position reset to 0');
  };

  const handleLoop = () => {
    const newLoopState = !isLooping;
    setIsLooping(newLoopState);
    Tone.Transport.loop = newLoopState;
    log(`Looping ${newLoopState ? 'enabled' : 'disabled'}`);
  };
