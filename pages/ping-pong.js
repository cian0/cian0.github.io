import React, { useEffect, useRef } from 'react';
import Layout from '../components/Layout';

const PingPong = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Game variables
    let paddleHeight = canvas.height / 6;
    let paddleWidth = 10;
    let ballRadius = 5;
    let player1Y = (canvas.height - paddleHeight) / 2;
    let player2Y = (canvas.height - paddleHeight) / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 3;

    // Touch and mouse control
    let lastTouchY = 0;
    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const y = (e.clientY || e.touches[0].clientY) - rect.top;
      player1Y = y - paddleHeight / 2;
      lastTouchY = y;
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove);
    canvas.addEventListener('touchstart', handleMove);

    // AI for player 2
    const movePlayer2 = () => {
      const player2Center = player2Y + paddleHeight / 2;
      if (player2Center < ballY - 35) {
        player2Y += 4;
      } else if (player2Center > ballY + 35) {
        player2Y -= 4;
      }
    };

    // Draw functions
    const drawPaddle = (x, y) => {
      ctx.fillStyle = '#00FFFF';
      ctx.fillRect(x, y, paddleWidth, paddleHeight);
    };

    const drawBall = () => {
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#00FFFF';
      ctx.fill();
      ctx.closePath();
    };

    // Game loop
    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move the ball
      ballX += ballSpeedX;
      ballY += ballSpeedY;

      // Ball collision with top and bottom walls
      if (ballY - ballRadius < 0 || ballY + ballRadius > canvas.height) {
        ballSpeedY = -ballSpeedY;
      }

      // Ball collision with paddles
      if (
        (ballX - ballRadius < paddleWidth && ballY > player1Y && ballY < player1Y + paddleHeight) ||
        (ballX + ballRadius > canvas.width - paddleWidth && ballY > player2Y && ballY < player2Y + paddleHeight)
      ) {
        ballSpeedX = -ballSpeedX;
      }

      // Ball out of bounds
      if (ballX < 0 || ballX > canvas.width) {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
      }

      movePlayer2();

      drawPaddle(0, player1Y);
      drawPaddle(canvas.width - paddleWidth, player2Y);
      drawBall();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchstart', handleMove);
    };
  }, []);

  return (
    <Layout>
      <div className="retro-container">
        <div className="retro-post">
          <h1>Ping Pong</h1>
          <p>Drag anywhere or touch the screen to move your paddle!</p>
          <canvas ref={canvasRef} style={{ border: '2px solid #00FFFF', display: 'block', margin: '0 auto' }}></canvas>
        </div>
      </div>
    </Layout>
  );
};

export default PingPong;
