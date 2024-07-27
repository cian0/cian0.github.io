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

const choices = [
  { name: 'Rock', emoji: '🗿' },
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
    if (typeof window !== 'undefined') {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    }
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
    <div className="nes-container with-title is-centered" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <p className="title">Rock Paper Scissors</p>
      <div className="nes-container is-rounded">
        <p>Choose your weapon!</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          {choices.map((choice) => (
            <button
              key={choice.name}
              className="nes-btn"
              onClick={() => handleChoice(choice)}
              style={{ fontSize: '2rem' }}
            >
              {choice.emoji}
            </button>
          ))}
        </div>
      </div>
      <div className="nes-container is-rounded" style={{ marginTop: '1rem' }}>
        <p>Score</p>
        <p>Player: {score.player} - Computer: {score.computer}</p>
      </div>
      <AlertDialog open={showResult} onOpenChange={setShowResult}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{result}</AlertDialogTitle>
            <AlertDialogDescription>
              You chose {playerChoice?.emoji} - Computer chose {computerChoice?.emoji}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetGame}>Play Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RockPaperScissors;