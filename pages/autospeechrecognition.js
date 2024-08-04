import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const AutomaticSpeechRecognition = () => {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const worker = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!worker.current) {
      console.log("Main: Creating new worker");
      worker.current = new Worker(new URL('../scripts/asr-worker.js', import.meta.url), {
        type: 'module'
      });

      worker.current.onmessage = (e) => {
        console.log("Main: Received message from worker", e.data);
        if (e.data.status === 'ready') {
          setIsModelReady(true);
          setIsLoading(false);
        } else if (e.data.status === 'complete') {
          setResult(e.data.output);
          setIsLoading(false);
        } else if (e.data.status === 'error') {
          setError(e.data.error);
          setIsLoading(false);
        } else if (e.data.status === 'progress') {
          setProgress(e.data.progress || 0);
        }
      };

      worker.current.onerror = (error) => {
        console.error("Main: Worker error", error);
        setError("Worker error: " + error.message);
        setIsLoading(false);
      };

      // Trigger model loading
      worker.current.postMessage({ command: 'load_model' });
    }
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleTranscribe = async () => {
    if (!selectedFile) {
      setError("Please select an audio file first.");
      return;
    }

    console.log("Main: Starting transcription");
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const audioData = audioBuffer.getChannelData(0);
      worker.current.postMessage({ command: 'transcribe', audioData }, [audioData.buffer]);
    } catch (error) {
      console.error("Error processing audio file:", error);
      setError("Error processing audio file: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="retro-container">
      <div className="retro-post">
        <div className="retro-header">
          🎙️ Retro Speech Recognition 🖥️
        </div>
        
        <div className="retro-section">
          <p className="retro-text">Welcome to the Retro Speech Recognition!</p>
          <p className="retro-text">Transform your audio into text with our cutting-edge 8-bit technology.</p>
        </div>

        {!isModelReady && (
          <div className="retro-section">
            <div className="nes-progress is-primary">
              <progress value={progress} max="100"></progress>
            </div>
            <p className="retro-text">Loading model: {progress.toFixed(2)}%</p>
          </div>
        )}

        <div className="retro-section">
          <label className="nes-btn">
            <span>Select Audio File</span>
            <input type="file" accept="audio/*" onChange={handleFileChange} style={{display: 'none'}} />
          </label>
          {selectedFile && <p className="retro-text">Selected: {selectedFile.name}</p>}
        </div>

        <div className="retro-section">
          <button
            onClick={handleTranscribe}
            disabled={!isModelReady || isLoading || !selectedFile}
            className={`nes-btn ${isModelReady && !isLoading && selectedFile ? 'is-primary' : 'is-disabled'}`}
          >
            {isLoading ? 'Decoding...' : 'Transcribe Audio'}
          </button>
        </div>

        {error && (
          <div className="nes-container is-rounded is-error">
            <p className="retro-text">{error}</p>
          </div>
        )}

        {result && (
          <div className="retro-section">
            <div className="nes-container is-rounded with-title">
              <p className="title">Transcription Result</p>
              <p className="retro-text">{JSON.stringify(result, null, 2)}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AutomaticSpeechRecognition;