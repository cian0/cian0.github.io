import React, { useEffect, useRef } from 'react';

const CompactMusicPlayer = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/tone';
      iframe.contentDocument.head.appendChild(script);

      const tailwindScript = document.createElement('script');
      tailwindScript.src = 'https://cdn.tailwindcss.com';
      iframe.contentDocument.head.appendChild(tailwindScript);

      const content = `
        <div class="container mx-auto px-4 py-8">
          <h1 class="text-4xl font-bold text-center text-gray-800 mb-8">Compact Music Player</h1>
          
          <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
            <textarea id="scoreInput" rows="10" class="w-full p-2 border rounded mb-4" placeholder="Enter your score here..."></textarea>
            <div id="controls" class="flex flex-wrap justify-center items-center gap-4 mb-6">
              <button id="parseBtn" class="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-600 transition duration-300">Parse Score</button>
              <button id="playBtn" disabled class="bg-green-500 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition duration-300">Play</button>
              <button id="stopBtn" disabled class="bg-red-500 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-600 transition duration-300">Stop</button>
              <button id="rewindBtn" disabled class="bg-yellow-500 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-600 transition duration-300">Rewind</button>
              <button id="loopBtn" disabled class="bg-purple-500 text-white py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition duration-300">Loop: Off</button>
            </div>
            
            <div class="relative">
              <canvas id="visualizer" class="w-full h-64 bg-gray-200 rounded"></canvas>
              <canvas id="staticVisualizer" class="w-full h-64 bg-transparent rounded absolute top-0 left-0"></canvas>
            </div>
          </div>
          
          <div id="debug" class="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto font-mono text-sm"></div>
        </div>
      `;

      iframe.contentDocument.body.innerHTML = content;

      const playerScript = document.createElement('script');
      playerScript.textContent = \`
        // Add your existing JavaScript code here
        // Make sure to remove any references to document and replace them with iframe.contentDocument
        // For example:
        // const scoreInput = iframe.contentDocument.getElementById('scoreInput');
        // ...
      \`;
      iframe.contentDocument.body.appendChild(playerScript);
    }
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="Compact Music Player"
      className="w-full h-[800px] border-none"
    />
  );
};

export default CompactMusicPlayer;
