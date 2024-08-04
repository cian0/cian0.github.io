import React, { useState, useRef, useEffect } from 'react';
import Editor from "@monaco-editor/react";

const MODELS = [
  'Xenova/tiny_starcoder_py',
  'Xenova/codegen-350M-mono',
];

export default function RetroCyberCodeCompletionPage() {
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
    
    // Set editor options for a more retro look
    monaco.editor.defineTheme('retroTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '888888' },
        { token: 'keyword', foreground: 'ff00ff' },
        { token: 'string', foreground: '00ffff' },
      ],
      colors: {
        'editor.background': '#000000',
        'editor.foreground': '#00ff00',
        'editor.lineHighlightBackground': '#1a1a1a',
        'editorCursor.foreground': '#00ff00',
        'editorLineNumber.foreground': '#00ff00',
      }
    });
    
    monaco.editor.setTheme('retroTheme');
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
    <div className="retro-container">
      <div className="retro-post">
        <div className="retro-header">
          🖥️ CyberCode Completion 🚀
        </div>
        <div className="retro-section">
          <div className="retro-control-panel">
            <select 
              className="retro-input" 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
            >
              {MODELS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <input
              className="retro-input"
              type="number"
              value={maxNewTokens}
              onChange={(e) => setMaxNewTokens(parseInt(e.target.value))}
              min="1"
              max="512"
            />
            <button 
              className="retro-button" 
              onClick={handleGenerate} 
              disabled={isLoading}
            >
              {isLoading ? '⏳ Processing...' : '🔮 Generate'}
            </button>
          </div>
        </div>
        <div className="retro-section retro-editor-container">
          {isLoading && (
            <div className="retro-loading-overlay">
              <div className="retro-loading-content">
                <div>⚙️ Initializing Cyber Brain ⚙️</div>
                <div className="retro-progress-bar">
                  <div 
                    className="retro-progress-bar-fill" 
                    style={{width: `${loadingProgress}%`}}
                  />
                </div>
                <div>{loadingProgress.toFixed(0)}%</div>
              </div>
            </div>
          )}
          <Editor
            height="400px"
            language="python"
            value={code}
            onChange={(value) => setCode(value)}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              glyphMargin: false,
              folding: false,
              lineDecorationsWidth: 0,
              lineNumbersMinChars: 3,
            }}
          />
        </div>
      </div>
    </div>
  );
}