import { useState, useEffect, useRef } from 'react'
import { Progress } from "@/components/ui/progress"

export default function AutomaticSpeechRecognition() {
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
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="text-5xl font-bold mb-2 text-center">Automatic Speech Recognition</h1>
      
      {!isModelReady && (
        <div className="w-full max-w-md mb-4">
          <Progress value={progress} className="w-full" />
          <p className="text-center mt-2">Loading model: {progress.toFixed(2)}%</p>
        </div>
      )}

      <input
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="w-full max-w-md p-2 border border-gray-300 rounded mb-4"
      />

      <button
        onClick={handleTranscribe}
        disabled={!isModelReady || isLoading || !selectedFile}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
      </button>

      {error && <div className="text-red-500 mt-4">{error}</div>}
      {result && (
        <div className="mt-4 w-full max-w-md">
          <h2 className="text-2xl font-bold">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded mt-2 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}