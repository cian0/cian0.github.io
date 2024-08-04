import React, { useState, useEffect, useRef, useCallback } from 'react';
import Papa from 'papaparse';
import Link from 'next/link';

export default function RetroCyberpunkEmbeddingGeneration() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [csvData, setCsvData] = useState([]);
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const worker = useRef(null);

  const addLog = (message) => {
    setLogs(prevLogs => [...prevLogs, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('../scripts/feature-extraction-worker.js', import.meta.url), {
        type: 'module'
      });
    }

    const onMessageReceived = (e) => {
      addLog(`Received message from worker: ${JSON.stringify(e.data)}`);
      switch (e.data.status) {
        case 'progress':
          setProgress(e.data.progress || 0);
          setIsLoading(true);
          break;
        case 'ready':
          setReady(true);
          setIsLoading(false);
          break;
        case 'complete':
          setResults(e.data.output);
          setIsLoading(false);
          addLog(`Received ${e.data.output.length} embeddings`);
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);
    addLog('Initializing worker...');
    worker.current.postMessage({ text: 'Init' });

    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    addLog(`Parsing CSV file: ${file.name}`);
    Papa.parse(file, {
      complete: (results) => {
        addLog(`CSV parsed. Row count: ${results.data.length}`);
        setCsvData(results.data);
      },
      header: true
    });
  };

  const generateEmbeddings = useCallback(() => {
    if (worker.current && csvData.length > 0) {
      setResults(null);
      const texts = csvData.slice(1).map(row => row.policyName).filter(text => text);
      addLog(`Generating embeddings for ${texts.length} texts`);
      addLog(`Texts: ${JSON.stringify(texts)}`);
      worker.current.postMessage({ texts });
    }
  }, [csvData]);

  const downloadResults = () => {
    if (!results) return;

    const csvContent = csvData.map((row, index) => {
      const embedding = results[index] ? results[index].data.join(',') : '';
      return `${row.policyName},"${embedding}"`;
    }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'embeddings_output.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    addLog('Results downloaded');
  };

  const renderPreview = () => {
    if (!results || results.length === 0 || !csvData || csvData.length === 0) {
      return 'No results to preview';
    }

    const firstResult = results[0];
    const firstEmbedding = firstResult && firstResult.data ? firstResult.data.slice(0, 5).join(', ') : 'N/A';

    return `Total entries processed: ${results.length}
First entry: ${csvData[0].policyName || 'N/A'}
Embedding (first 5 values): [${firstEmbedding}...]`;
  };

  return (
    <div className="retro-container">
      <div className="retro-post">
        <div className="retro-header">
          🧠 CSV Embedding Generation 🔢
        </div>
        <div className="retro-section">
          <p>Using Transformers.js to generate embeddings from CSV data</p>
        </div>

        {isLoading && (
          <div className="retro-section">
            <div className="retro-progress-bar">
              <div 
                className="retro-progress-bar-fill" 
                style={{width: `${progress}%`}}
              ></div>
            </div>
            <p className="text-center mt-2">
              {ready ? '🔧 Generating embeddings' : '📥 Downloading model'}: {typeof progress === 'number' ? progress.toFixed(2) : 0}%
            </p>
          </div>
        )}

        <div className="retro-section">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="retro-input mb-4"
          />

          <button
            className="retro-button"
            onClick={generateEmbeddings}
            disabled={!ready || csvData.length === 0}
          >
            🚀 Generate Embeddings
          </button>

          {results && (
            <button
              className="retro-button ml-4"
              onClick={downloadResults}
            >
              💾 Download Results
            </button>
          )}
        </div>

        {results && (
          <div className="retro-section">
            <div className="retro-header">🔍 Preview:</div>
            <pre className="bg-black p-2 rounded mt-2 max-w-lg overflow-auto text-cyan-300">
              {renderPreview()}
            </pre>
          </div>
        )}

        <div className="retro-section">
          <div className="retro-header">📟 Logs:</div>
          <pre className="bg-black p-2 rounded mt-2 max-h-60 overflow-auto text-cyan-300">
            {logs.join('\n')}
          </pre>
        </div>

      </div>
    </div>
  );
}