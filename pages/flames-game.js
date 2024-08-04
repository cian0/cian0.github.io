import React, { useState, useEffect, useCallback } from 'react';

const FlamesGame = () => {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState('');
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showVisualization, setShowVisualization] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const flamesEmojis = {
    F: '👫 Friends',
    L: '💖 Lovers',
    A: '😍 Attraction',
    M: '💑 Marriage',
    E: '😈 Enemies',
    S: '🤝 Siblings'
  };

  // Sound effect functions
  const playSound = useCallback((frequency, duration) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }, []);

  const playTypingSound = useCallback(() => {
    playSound(440, 0.05);
  }, [playSound]);

  const playCalculatingSound = useCallback(() => {
    playSound(330, 0.1);
  }, [playSound]);

  const playResultSound = useCallback(() => {
    setTimeout(() => playSound(523.25, 0.1), 0);
    setTimeout(() => playSound(659.25, 0.1), 100);
    setTimeout(() => playSound(783.99, 0.1), 200);
  }, [playSound]);

  const calculateFlames = (name1, name2) => {
    const steps = [];
    const n1 = name1.toLowerCase().replace(/\s/g, '');
    const n2 = name2.toLowerCase().replace(/\s/g, '');
    steps.push(`We start with: ${n1} and ${n2}`);

    let remainingChars = n1 + n2;
    steps.push(`We put the names together: ${remainingChars}`);

    for (let char of n1) {
      if (n2.includes(char)) {
        remainingChars = remainingChars.replace(new RegExp(char, 'g'), '');
      }
    }
    steps.push(`We take out letters that are in both names: ${remainingChars}`);

    const count = remainingChars.length;
    steps.push(`We count the letters left: ${count}`);

    const flamesArray = ['F', 'L', 'A', 'M', 'E', 'S'];
    let currentIndex = 0;

    while (flamesArray.length > 1) {
      currentIndex = (currentIndex + count - 1) % flamesArray.length;
      const removedLetter = flamesArray.splice(currentIndex, 1);
      steps.push(`We count ${count} and remove ${removedLetter}. Left with: ${flamesArray.join('')}`);
    }

    const result = flamesEmojis[flamesArray[0]];
    steps.push(`The last letter is ${flamesArray[0]}, which means: ${result}`);

    return { result, steps };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name1 && name2) {
      setIsCalculating(true);
      setCurrentStep(0);
      setShowVisualization(false);
      const { result, steps } = calculateFlames(name1, name2);
      setResult(result);
      setSteps(steps);
      playCalculatingSound();
    }
  };

  useEffect(() => {
    if (isCalculating && currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
        playTypingSound();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isCalculating && currentStep === steps.length) {
      const timer = setTimeout(() => {
        setShowVisualization(true);
        setIsCalculating(false);
        playResultSound();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isCalculating, currentStep, steps, playTypingSound, playResultSound]);

  return (
    <div className="retro-container">
      <div className="retro-post">
        <div className="retro-header">
          🔥 FLAMES Game 🔥
        </div>
        <div className="retro-section">
          <p>Type two names to see how they match!</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="retro-input"
              placeholder="Type first name"
              value={name1}
              onChange={(e) => { setName1(e.target.value); playTypingSound(); }}
              disabled={isCalculating}
            />
            <input
              type="text"
              className="retro-input"
              placeholder="Type second name"
              value={name2}
              onChange={(e) => { setName2(e.target.value); playTypingSound(); }}
              disabled={isCalculating}
            />
            <button type="submit" className="retro-button" disabled={isCalculating}>
              💻 Check Match
            </button>
          </form>
        </div>
        {isCalculating && (
          <div className="retro-section">
            <p className="retro-text blink">Calculating...</p>
            {steps.slice(0, currentStep).map((step, index) => (
              <p key={index} className="retro-compact-text fade-in">{step}</p>
            ))}
          </div>
        )}
        {showVisualization && (
          <div className="retro-section">
            <p className="retro-text fade-in">The match says: {result}</p>
            <div className="retro-visualization fade-in">
              <p>{name1} + {name2}</p>
              <p className="hearts">{'💖'.repeat(5)}</p>
              <p className="result bounce">{result}</p>
              <p className="hearts">{'💖'.repeat(5)}</p>
            </div>
          </div>
        )}
        <div className="retro-section">
          <p className="retro-compact-text">What the letters mean:</p>
          {Object.entries(flamesEmojis).map(([key, value]) => (
            <p key={key} className="retro-compact-text">
              {key} means {value}
            </p>
          ))}
        </div>
      </div>
      <style jsx>{`
        .blink {
          animation: blink-animation 1s steps(5, start) infinite;
        }
        @keyframes blink-animation {
          to {
            visibility: hidden;
          }
        }
        .fade-in {
          animation: fadeIn 0.5s;
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .retro-visualization {
          text-align: center;
        }
        .hearts {
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .result {
          font-size: 1.5em;
          animation: bounce 1s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default FlamesGame;