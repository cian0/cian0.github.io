import React, { useState, useRef, useEffect } from 'react';
import Editor from "@monaco-editor/react";

const MODELS = [
  'Xenova/tiny_starcoder_py',
  'Xenova/codegen-350M-mono',
];

export default function CodeCompletionPage() {
  const [model, setModel] = useState(MODELS[0]);
  const [code, setCode] = useState('def fibonacci(n):\n    """Calculate the Fibonacci sequence up to n."""\n    ');
  const [maxNewTokens, setMaxNewTokens] = useState(45);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const worker = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL('../scripts/code-completion-worker.js', import.meta.url), {
        type: 'module'
      });

      worker.current.postMessage({
        model: MODELS[0],
        text: '',
        max_new_tokens: 0,
      });
    }

    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case 'update':
          setCode(e.data.output);
          break;
        case 'initiate':
        case 'progress':
          setIsLoading(true);
          setLoadingProgress(e.data.progress || 0);
          break;
        case 'ready':
          setIsLoading(false);
          setLoadingProgress(100);
          break;
      }
    };

    worker.current.addEventListener('message', onMessageReceived);
    return () => worker.current.removeEventListener('message', onMessageReceived);
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const handleGenerate = () => {
    if (editorRef.current) {
      const currentCode = editorRef.current.getValue();
      worker.current.postMessage({
        model,
        text: currentCode,
        max_new_tokens: maxNewTokens,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px' }}>
      <div style={{ marginBottom: '10px' }}>
        <select value={model} onChange={(e) => setModel(e.target.value)}>
          {MODELS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="number"
          value={maxNewTokens}
          onChange={(e) => setMaxNewTokens(parseInt(e.target.value))}
          min="1"
          max="512"
          style={{ marginLeft: '10px' }}
        />
        <button onClick={handleGenerate} style={{ marginLeft: '10px' }} disabled={isLoading}>
          Generate
        </button>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}>
            <div style={{ color: 'white', textAlign: 'center' }}>
              <div>Loading model...</div>
              <div style={{ 
                width: '200px', 
                height: '20px', 
                backgroundColor: '#444', 
                marginTop: '10px',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${loadingProgress}%`,
                  height: '100%',
                  backgroundColor: '#0f0',
                  transition: 'width 0.3s ease-in-out'
                }} />
              </div>
              <div>{loadingProgress.toFixed(0)}%</div>
            </div>
          </div>
        )}
        <Editor
          height="100%"
          language="python"
          value={code}
          onChange={(value) => setCode(value)}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
          }}
        />
      </div>
    </div>
  );
}