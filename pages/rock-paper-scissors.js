import React, { useState, useEffect } from 'react';
import { Shuffle, RotateCcw, Info, User, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const elements = {
  fire: { 
    emoji: '🔥', 
    strongAgainst: ['earth', 'ice', 'plant'], 
    weakAgainst: ['water', 'air'],
    statusEffect: 'burn',
    removeEffect: 'freeze'
  },
  water: { 
    emoji: '💧', 
    strongAgainst: ['fire', 'earth'], 
    weakAgainst: ['ice', 'plant'],
    statusEffect: 'flood',
    removeEffect: 'burn'
  },
  earth: { 
    emoji: '🪨', 
    strongAgainst: ['air', 'ice', 'fire'], 
    weakAgainst: ['water', 'plant'],
    statusEffect: 'quake',
    removeEffect: 'shock'
  },
  air: { 
    emoji: '💨', 
    strongAgainst: ['fire', 'plant', 'water'], 
    weakAgainst: ['earth', 'ice'],
    statusEffect: 'shock',
    removeEffect: 'flood'
  },
  ice: { 
    emoji: '❄️', 
    strongAgainst: ['water', 'plant', 'air'], 
    weakAgainst: ['fire', 'earth'],
    statusEffect: 'freeze',
    removeEffect: 'burn'
  },
  plant: { 
    emoji: '🌿', 
    strongAgainst: ['water', 'earth', 'air'], 
    weakAgainst: ['fire', 'ice'],
    statusEffect: 'root',
    removeEffect: 'quake'
  },
};

const statusEffects = {
  burn: { name: 'Burn', emoji: '🔥', effect: 'Deals 5 damage per turn' },
  freeze: { name: 'Freeze', emoji: '🧊', effect: 'Skip next turn' },
  shock: { name: 'Shock', emoji: '⚡', effect: 'Reduce damage by 50%' },
  root: { name: 'Root', emoji: '🌱', effect: 'Limit to 3 random elements' },
  flood: { name: 'Flood', emoji: '🌊', effect: 'Water damage +50%' },
  quake: { name: 'Quake', emoji: '🌋', effect: '30% chance of 10 extra damage' }
};

const combos = {
  'fire,fire,fire': { name: 'Inferno', damage: 40, effect: 'burn' },
  'water,water,water': { name: 'Tsunami', damage: 40, effect: 'flood' },
  'earth,earth,earth': { name: 'Mountain', damage: 40, effect: 'quake' },
  'air,air,air': { name: 'Tornado', damage: 40, effect: 'shock' },
  'ice,ice,ice': { name: 'Blizzard', damage: 40, effect: 'freeze' },
  'plant,plant,plant': { name: 'Forest', damage: 40, effect: 'root' },
  'fire,air,earth': { name: 'Volcanic Eruption', damage: 50, effect: 'burn' },
  'water,ice,air': { name: 'Arctic Storm', damage: 50, effect: 'freeze' },
  'earth,plant,water': { name: 'Gaia\'s Blessing', damage: 50, effect: 'root' },
};

class AIStrategy {
  constructor() {
    this.memory = [];
    this.combo = [];
    this.elementalPreference = this.randomElement();
  }

  decide(gameState) {
    const { playerHealth, aiHealth, playerStatus, aiStatus, turn } = gameState;

    // Continue combo if possible
    if (this.combo.length > 0 && this.combo.length < 3) {
      return this.continueCombo();
    }

    // Analyze past moves
    const playerPattern = this.analyzePattern(this.memory.slice(-5));
    
    // Defensive strategy when low on health or affected by negative status
    if (aiHealth < 30 || this.hasNegativeStatus(aiStatus)) {
      return this.defensiveStrategy(playerPattern, aiStatus);
    }
    
    // Aggressive strategy when player is low on health or affected by negative status
    if (playerHealth < 30 || this.hasNegativeStatus(playerStatus)) {
      return this.aggressiveStrategy(playerStatus);
    }
    
    // Adapt strategy based on turn count
    if (turn % 5 === 0) {
      this.elementalPreference = this.randomElement();
    }
    
    // Start a new combo or use counter strategy
    return Math.random() < 0.7 ? this.startCombo() : this.counterStrategy(playerPattern);
  }

  analyzePattern(recentMoves) {
    // Advanced pattern recognition
    if (recentMoves.length >= 3) {
      const lastThree = recentMoves.slice(-3);
      if (new Set(lastThree).size === 1) {
        return lastThree[0]; // Player might be trying this combo
      }
    }
    return null;
  }

  hasNegativeStatus(status) {
    return status && ['burn', 'freeze', 'shock', 'root'].includes(status);
  }

  defensiveStrategy(playerPattern, aiStatus) {
    if (aiStatus && elements[this.randomElement()].removeEffect === aiStatus) {
      return this.randomElement();
    }
    if (playerPattern) {
      return elements[playerPattern].weakAgainst[0];
    }
    return this.randomElement();
  }

  aggressiveStrategy(playerStatus) {
    if (playerStatus) {
      return Object.keys(elements).find(elem => elements[elem].statusEffect === playerStatus);
    }
    return this.startCombo();
  }

  counterStrategy(playerPattern) {
    if (playerPattern) {
      return elements[playerPattern].weakAgainst[Math.floor(Math.random() * elements[playerPattern].weakAgainst.length)];
    }
    return this.randomElement();
  }

  startCombo() {
    this.combo = [this.elementalPreference];
    return this.elementalPreference;
  }

  continueCombo() {
    const lastElement = this.combo[this.combo.length - 1];
    const nextElement = elements[lastElement].strongAgainst[Math.floor(Math.random() * elements[lastElement].strongAgainst.length)];
    this.combo.push(nextElement);
    return nextElement;
  }

  randomElement() {
    return Object.keys(elements)[Math.floor(Math.random() * Object.keys(elements).length)];
  }

  recordMove(move) {
    this.memory.push(move);
    if (this.memory.length > 10) this.memory.shift();
    if (this.combo.length === 3 || move !== this.combo[this.combo.length - 1]) {
      this.combo = [];
    }
  }
}

// const RockPaperScissors = () => {


const RockPaperScissors = () => {
  const [playerHealth, setPlayerHealth] = useState(100);
  const [aiHealth, setAiHealth] = useState(100);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [aiChoice, setAiChoice] = useState(null);
  const [result, setResult] = useState('');
  const [turn, setTurn] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [playerCombo, setPlayerCombo] = useState([]);
  const [playerStatus, setPlayerStatus] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);
  
  const ai = React.useRef(new AIStrategy());
  // const [playerHealth, setPlayerHealth] = useState(100);
  // const [aiHealth, setAiHealth] = useState(100);
  // const [playerChoice, setPlayerChoice] = useState(null);
  // const [aiChoice, setAiChoice] = useState(null);
  // const [result, setResult] = useState('');
  // const [turn, setTurn] = useState(0);
  // const [gameOver, setGameOver] = useState(false);
  // const [playerCombo, setPlayerCombo] = useState([]);
  // const [playerStatus, setPlayerStatus] = useState(null);
  // const [aiStatus, setAiStatus] = useState(null);
  
  // const ai = React.useRef(new AIStrategy());

  const handlePlayerChoice = (choice) => {
    if (gameOver) return;

    // Update player combo
    const newCombo = [...playerCombo, choice];
    setPlayerCombo(newCombo.length <= 3 ? newCombo : [choice]);

    setPlayerChoice(choice);
    const gameState = { playerHealth, aiHealth, playerStatus, aiStatus, turn };
    const aiDecision = ai.current.decide(gameState);
    setAiChoice(aiDecision);
    ai.current.recordMove(choice);

    const outcome = determineOutcome(choice, aiDecision, newCombo, ai.current.combo);
    applyOutcome(outcome);
    setTurn(turn + 1);
  };

  const determineOutcome = (player, ai, playerCombo, aiCombo) => {
    let playerDamage = 10;
    let aiDamage = 10;
    let playerEffect = null;
    let aiEffect = null;

    // Check for combos
    const playerComboKey = playerCombo.join(',');
    const aiComboKey = aiCombo.join(',');
    if (combos[playerComboKey]) {
      playerDamage = combos[playerComboKey].damage;
      playerEffect = combos[playerComboKey].effect;
    }
    if (combos[aiComboKey]) {
      aiDamage = combos[aiComboKey].damage;
      aiEffect = combos[aiComboKey].effect;
    }

    // Apply elemental advantages
    if (elements[player].strongAgainst.includes(ai)) {
      playerDamage *= 1.5;
    }
    if (elements[ai].strongAgainst.includes(player)) {
      aiDamage *= 1.5;
    }

    // Apply status effects
    if (playerStatus === 'shock') playerDamage *= 0.5;
    if (aiStatus === 'shock') aiDamage *= 0.5;
    if (playerStatus === 'flood' && ai === 'water') aiDamage *= 1.5;
    if (aiStatus === 'flood' && player === 'water') playerDamage *= 1.5;

    return { playerDamage, aiDamage, playerEffect, aiEffect };
  };

  const applyOutcome = (outcome) => {
    let resultText = '';
    
    // Apply damage
    setAiHealth(prev => Math.max(0, prev - outcome.playerDamage));
    setPlayerHealth(prev => Math.max(0, prev - outcome.aiDamage));
  
    // Apply new status effects
    if (outcome.playerEffect) setAiStatus(outcome.playerEffect);
    if (outcome.aiEffect) setPlayerStatus(outcome.aiEffect);
  
    // Remove status effects if applicable
    if (playerChoice && elements[playerChoice].removeEffect === aiStatus) setAiStatus(null);
    if (aiChoice && elements[aiChoice].removeEffect === playerStatus) setPlayerStatus(null);
  
    // Determine round result
    if (outcome.playerDamage > outcome.aiDamage) {
      resultText = `You win this round! Dealt ${outcome.playerDamage} damage.`;
    } else if (outcome.playerDamage < outcome.aiDamage) {
      resultText = `AI wins this round! Dealt ${outcome.aiDamage} damage.`;
    } else {
      resultText = "It's a draw!";
    }
  
    setResult(resultText);
  
    // Check for game over
    if (playerHealth <= 0 || aiHealth <= 0) {
      setGameOver(true);
      setResult(playerHealth > aiHealth ? 'You won the game!' : 'AI won the game!');
    }
  
    // Apply ongoing status effects
    if (playerStatus === 'burn') setPlayerHealth(prev => Math.max(0, prev - 5));
    if (aiStatus === 'burn') setAiHealth(prev => Math.max(0, prev - 5));
    if (playerStatus === 'quake' && Math.random() < 0.3) setPlayerHealth(prev => Math.max(0, prev - 10));
    if (aiStatus === 'quake' && Math.random() < 0.3) setAiHealth(prev => Math.max(0, prev - 10));
  };

  const resetGame = () => {
    setPlayerHealth(100);
    setAiHealth(100);
    setPlayerChoice(null);
    setAiChoice(null);
    setResult('');
    setTurn(0);
    setGameOver(false);
    setPlayerCombo([]);
    setPlayerStatus(null);
    setAiStatus(null);
    ai.current = new AIStrategy();
  };

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h1 className="text-2xl font-bold mb-4">Elemental Mastery</h1>
//       <div className="mb-4">
//         <div className="flex justify-between items-center mb-2">
//           <span>Player Health: {playerHealth}</span>
//           <Progress value={playerHealth} className="w-1/2" />
//         </div>
//         <div className="flex justify-between items-center mb-2">
//           <span>AI Health: {aiHealth}</span>
//           <Progress value={aiHealth} className="w-1/2" />
//         </div>
//         <div>Player Status: {playerStatus ? `${statusEffects[playerStatus].emoji} ${statusEffects[playerStatus].name}` : 'None'}</div>
//         <div>AI Status: {aiStatus ? `${statusEffects[aiStatus].emoji} ${statusEffects[aiStatus].name}` : 'None'}</div>
//         <div>Current Combo: {playerCombo.map(elem => elements[elem].emoji).join(' ')}</div>
//       </div>
//       <div className="grid grid-cols-3 gap-2 mb-4">
//         {Object.entries(elements).map(([element, { emoji }]) => (
//           <Button
//             key={element}
//             onClick={() => handlePlayerChoice(element)}
//             className="text-2xl p-2"
//             disabled={gameOver || (playerStatus === 'freeze' && turn % 2 === 1) || (playerStatus === 'root' && !['fire', 'water', 'earth'].includes(element))}
//           >
//             {emoji}
//           </Button>
//         ))}
//       </div>
//       <Button onClick={resetGame} className="mb-4">
//         <RotateCcw className="mr-2 h-4 w-4" /> Reset Game</Button>
//       {result && (
//         <Alert>
//           <AlertTitle>Round {turn} Result</AlertTitle>
//           <AlertDescription>
//             You chose {elements[playerChoice]?.emoji} - AI chose {elements[aiChoice]?.emoji}
//             <br />
//             {result}
//           </AlertDescription>
//         </Alert>
//       )}
//     </div>
//   );
// };

const HealthBar = ({ value, max, label }) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm font-medium">{value}/{max}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
      <div 
        className="bg-green-600 h-4 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  </div>
);

const TutorialDialog = () => (
  <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Welcome to Elemental Mastery!</DialogTitle>
        <DialogDescription>
          Learn about the game mechanics and start your journey to become an Elemental Master.
        </DialogDescription>
      </DialogHeader>
      <Accordion type="single" collapsible>
        <AccordionItem value="elements">
          <AccordionTrigger>Elements</AccordionTrigger>
          <AccordionContent>
            <ul>
              {Object.entries(elements).map(([name, { emoji, strongAgainst, weakAgainst }]) => (
                <li key={name}>
                  {emoji} {name.charAt(0).toUpperCase() + name.slice(1)}
                  <br />
                  Strong against: {strongAgainst.join(', ')}
                  <br />
                  Weak against: {weakAgainst.join(', ')}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="status-effects">
          <AccordionTrigger>Status Effects</AccordionTrigger>
          <AccordionContent>
            <ul>
              {Object.entries(statusEffects).map(([name, { emoji, effect }]) => (
                <li key={name}>
                  {emoji} {name.charAt(0).toUpperCase() + name.slice(1)}: {effect}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="combos">
          <AccordionTrigger>Combos</AccordionTrigger>
          <AccordionContent>
            <ul>
              {Object.entries(combos).map(([combo, { name, damage, effect }]) => (
                <li key={combo}>
                  {name}: {combo.split(',').map(elem => elements[elem].emoji).join(' ')}
                  <br />
                  Damage: {damage}, Effect: {effect}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <Button onClick={() => setShowTutorial(false)}>Start Game</Button>
    </DialogContent>
  </Dialog>
);

const elementOrder = ['fire', 'water', 'earth', 'air', 'ice', 'plant'];

return (
  <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
    <TutorialDialog />
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-center">Elemental Mastery</CardTitle>
        <CardDescription className="text-center">Master the elements and defeat your opponent!</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <User className="mr-2" /> Player
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HealthBar value={playerHealth} max={100} label="Health" />
              <div className="mt-2">
                Status: {playerStatus ? (
                  <span className="inline-flex items-center">
                    {statusEffects[playerStatus].emoji} {statusEffects[playerStatus].name}
                  </span>
                ) : 'None'}
              </div>
              <div>
                Combo: {playerCombo.length > 0 ? (
                  <span className="text-2xl">{playerCombo.map(elem => elements[elem].emoji).join(' ')}</span>
                ) : 'None'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Monitor className="mr-2" /> AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HealthBar value={aiHealth} max={100} label="Health" />
              <div className="mt-2">
                Status: {aiStatus ? (
                  <span className="inline-flex items-center">
                    {statusEffects[aiStatus].emoji} {statusEffects[aiStatus].name}
                  </span>
                ) : 'None'}
              </div>
            </CardContent>
          </Card>
        </div>
        
        
        <div className="flex flex-wrap justify-center gap-4 mb-4 max-w-sm mx-auto">
            {elementOrder.map((element, index) => (
              <Button
                key={element}
                onClick={() => handlePlayerChoice(element)}
                className="text-4xl p-2 h-24 w-24 flex items-center justify-center"
                disabled={gameOver || (playerStatus === 'freeze' && turn % 2 === 1) || (playerStatus === 'root' && !['fire', 'water', 'earth'].includes(element))}
              >
                {elements[element].emoji}
              </Button>
            ))}
          </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={resetGame} variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" /> Reset Game
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Info className="mr-2 h-4 w-4" /> Game Info
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Game Information</DialogTitle>
            </DialogHeader>
            <TutorialDialog />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
    {result && (
      <Alert>
        <AlertTitle>Round {turn} Result</AlertTitle>
        <AlertDescription>
          <div className="flex justify-center items-center text-3xl mb-2">
            {elements[playerChoice]?.emoji} vs {elements[aiChoice]?.emoji}
          </div>
          <div className="text-center">{result}</div>
        </AlertDescription>
      </Alert>
    )}
  </div>
);
};

export default RockPaperScissors;
