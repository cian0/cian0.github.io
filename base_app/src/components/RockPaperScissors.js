import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import "nes.css/css/nes.min.css";

const choices = [
  { name: 'Rock', emoji: '🪨' },
  { name: 'Paper', emoji: '📄' },
  { name: 'Scissors', emoji: '✂️' }
];

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState({ player: 0, computer: 0 });

  const playSound = (frequency, duration) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  };

  const handleChoice = (choice) => {
    setPlayerChoice(choice);
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    setComputerChoice(computerChoice);
    playSound(440, 0.1); // Play a sound when making a choice
    determineWinner(choice, computerChoice);
  };

  const determineWinner = (player, computer) => {
    if (player.name === computer.name) {
      setResult("It's a tie!");
      playSound(330, 0.3); // Play a 'tie' sound
    } else if (
      (player.name === 'Rock' && computer.name === 'Scissors') ||
      (player.name === 'Paper' && computer.name === 'Rock') ||
      (player.name === 'Scissors' && computer.name === 'Paper')
    ) {
      setResult('You win!');
      setScore(prevScore => ({ ...prevScore, player: prevScore.player + 1 }));
      playSound(523, 0.3); // Play a 'win' sound
    } else {
      setResult('Computer wins!');
      setScore(prevScore => ({ ...prevScore, computer: prevScore.computer + 1 }));
      playSound(262, 0.3); // Play a 'lose' sound
    }
    setShowResult(true);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');
    setShowResult(false);
  };

  return (
    <div className="nes-container with-title is-centered max-w-2xl mx-auto my-8">
      <p className="title">Rock Paper Scissors</p>
      <div className="nes-container is-rounded mb-4">
        <p className="mb-4">Choose your weapon!</p>
        <div className="flex justify-center gap-4">
          {choices.map((choice) => (
            <button
              key={choice.name}
              className="nes-btn"
              onClick={() => handleChoice(choice)}
            >
              {choice.emoji}
            </button>
          ))}
        </div>
      </div>
      <div className="nes-container is-rounded mb-4">
        <p className="mb-2">Score</p>
        <p>
          Player: <span className="nes-text is-primary">{score.player}</span> - 
          Computer: <span className="nes-text is-error">{score.computer}</span>
        </p>
      </div>
      <AlertDialog open={showResult} onOpenChange={setShowResult}>
        <AlertDialogContent className="nes-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="nes-text is-primary">{result}</AlertDialogTitle>
            <AlertDialogDescription>
              You chose {playerChoice?.emoji} - Computer chose {computerChoice?.emoji}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetGame} className="nes-btn is-primary">
              Play Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RockPaperScissors;