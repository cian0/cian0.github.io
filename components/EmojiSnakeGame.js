import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_FOOD = { x: 15, y: 15 };

const EmojiSnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gridSize, setGridSize] = useState(GRID_SIZE);
  const [cellSize, setCellSize] = useState(20);

  useEffect(() => {
    const handleResize = () => {
      const smallerDimension = Math.min(window.innerWidth, window.innerHeight) - 40;
      const newGridSize = Math.floor(smallerDimension / 20);
      setGridSize(newGridSize);
      setCellSize(smallerDimension / newGridSize);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    head.x += direction.x;
    head.y += direction.y;

    // Check collision with walls
    if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
      setGameOver(true);
      return;
    }

    // Check collision with self
    if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
      setScore(prevScore => prevScore + 1);
      setFood(getRandomFood());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, getRandomFood]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [direction]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, 200);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  const getRandomFood = () => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(INITIAL_FOOD);
    setGameOver(false);
    setScore(0);
  };

  return (
    <div className="nes-container with-title">
      <p className="title">Emoji Snake Game</p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
        gap: '1px',
        backgroundColor: '#000',
        border: '1px solid #000',
        width: 'fit-content',
        margin: '0 auto'
      }}>
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = index % gridSize;
          const y = Math.floor(index / gridSize);
          const isSnake = snake.some(segment => segment.x === x && segment.y === y);
          const isFood = food.x === x && food.y === y;
          let content = '🟩';
          if (isSnake) content = '🐍';
          if (isFood) content = '🍎';
          return (
            <div key={index} style={{ width: CELL_SIZE, height: CELL_SIZE, fontSize: '16px', textAlign: 'center' }}>
              {content}
            </div>
          );
        })}
      </div>
      <div className="nes-container is-rounded" style={{ marginTop: '1rem' }}>
        <p>Score: {score}</p>
        {gameOver && (
          <>
            <p className="nes-text is-error">Game Over!</p>
            <button className="nes-btn is-primary" onClick={resetGame}>Restart</button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmojiSnakeGame;
