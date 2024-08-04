'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

export default function Home() {
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(null);
  const worker = useRef(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('../scripts/worker.js', import.meta.url), {
        type: 'module'
      });
    }

    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'initiate':
          setReady(false);
          break;
        case 'ready':
          setReady(true);
          break;
        case 'complete':
          setResult(e.data.output[0])
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);

    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, []);

  const classify = useCallback((text) => {
    if (worker.current) {
      worker.current.postMessage({ text });
    }
  }, []);

  return (
    <div className="retro-container">

      <div className="retro-post">
        <div className="retro-header">
          🤖 Transformers.js 🚀
        </div>
        <div className="retro-section">
          <p className="mb-4">Enter text to classify:</p>
          <input
            className="retro-input w-full max-w-xs mb-4"
            type="text"
            placeholder="&gt; Input text here_"
            onInput={e => {
              classify(e.target.value);
            }}
          />
          
          {ready !== null && (
            <div className="retro-terminal">
              <div className="retro-terminal-header">
                &gt; Classification Result:
              </div>
              <pre className="retro-terminal-content">
                {(!ready || !result) ? 'Initializing cybernetic classification...' : JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}