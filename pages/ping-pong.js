import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import Phaser from 'phaser';

const PingPong = () => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      }
    };

    const game = new Phaser.Game(config);

    let player1, player2, ball, cursors;

    function preload() {
      this.load.image('paddle', 'https://labs.phaser.io/assets/games/breakout/paddle1.png');
      this.load.image('ball', 'https://labs.phaser.io/assets/games/breakout/ball1.png');
    }

    function create() {
      player1 = this.physics.add.sprite(50, 300, 'paddle');
      player2 = this.physics.add.sprite(750, 300, 'paddle');
      ball = this.physics.add.sprite(400, 300, 'ball');

      player1.setCollideWorldBounds(true);
      player2.setCollideWorldBounds(true);
      ball.setCollideWorldBounds(true);
      ball.setBounce(1);

      player1.setImmovable();
      player2.setImmovable();

      this.physics.add.collider(ball, player1);
      this.physics.add.collider(ball, player2);

      cursors = this.input.keyboard.createCursorKeys();

      ball.setVelocity(300, 200);

      // Full screen button
      const fullscreenButton = this.add.text(700, 20, 'Fullscreen', { fill: '#00FFFF' })
        .setInteractive()
        .on('pointerdown', () => {
          if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
          } else {
            this.scale.startFullscreen();
          }
        });
    }

    function update() {
      // Player 1 controls (mouse/touch)
      player1.y = this.input.y;

      // AI for player 2
      if (player2.y < ball.y) {
        player2.y += 3;
      } else if (player2.y > ball.y) {
        player2.y -= 3;
      }

      // Keep paddles within bounds
      Phaser.Math.Clamp(player1.y, 52, 548);
      Phaser.Math.Clamp(player2.y, 52, 548);
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <Layout>
      <div className="retro-container">
        <div className="retro-post">
          <h1>Ping Pong</h1>
          <p>Move your mouse or touch the screen to control the left paddle!</p>
          <div id="game-container" style={{ border: '2px solid #00FFFF', margin: '0 auto' }}></div>
        </div>
      </div>
    </Layout>
  );
};

export default PingPong;
