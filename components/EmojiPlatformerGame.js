import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const EmojiPlatformerGame = () => {
    const gameRef = useRef(null);
    const [gameSize, setGameSize] = useState({ width: 800, height: 600 });

    useEffect(() => {
        const handleResize = () => {
            const container = document.getElementById('game-container');
            if (container) {
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;
                const aspectRatio = 4 / 3;
                let width, height;

                if (containerWidth / containerHeight > aspectRatio) {
                    height = containerHeight;
                    width = height * aspectRatio;
                } else {
                    width = containerWidth;
                    height = width / aspectRatio;
                }

                setGameSize({ width, height });
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        let game;
        const initPhaser = async () => {
            const Phaser = (await import('phaser')).default;
            
            const config = {
                type: Phaser.AUTO,
                width: gameSize.width,
                height: gameSize.height,
                parent: 'game-container',
                backgroundColor: '#000000',
                physics: {
                    default: 'arcade',
                    arcade: {
                        gravity: { y: 300 },
                        debug: false
                    }
                },
                scene: {
                    preload: preload,
                    create: create,
                    update: update
                },
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH
                }
            };

            const PLAYER = '🏃';
            const ZOMBIE = '🧟';
            const PLATFORM = '🟫';

            let player;
            let zombies;
            let platforms;
            let cursors;
            let score = 0;
            let scoreText;
            let gameOver = false;
            let playerEmoji;
            let zombieEmojis = [];

            function preload() {
                // No need to preload sky image
            }

            function create() {
                platforms = this.physics.add.staticGroup();

                // Create ground
                for (let i = 0; i < 20; i++) {
                    platforms.create(i * 40, 568, 'platform').setScale(0.5).refreshBody();
                }

                // Create some platforms
                platforms.create(600, 400, 'platform');
                platforms.create(50, 250, 'platform');
                platforms.create(750, 220, 'platform');

                // Replace platform sprites with emojis
                platforms.children.entries.forEach(platform => {
                    this.add.text(platform.x, platform.y, PLATFORM, { fontSize: '40px' }).setOrigin(0.5);
                    platform.setVisible(false);
                });

                // Player
                player = this.physics.add.sprite(100, 450, 'player');
                player.setCollideWorldBounds(true);
                playerEmoji = this.add.text(player.x, player.y, PLAYER, { fontSize: '40px' }).setOrigin(0.5);
                player.setVisible(false);

                // Zombies
                zombies = this.physics.add.group();
                for (let i = 0; i < 5; i++) {
                    const x = Phaser.Math.Between(0, 800);
                    const y = Phaser.Math.Between(0, 300);
                    const zombie = zombies.create(x, y, 'zombie');
                    zombie.setBounce(1);
                    zombie.setCollideWorldBounds(true);
                    zombie.setVelocity(Phaser.Math.Between(-200, 200), 20);
                    const zombieEmoji = this.add.text(zombie.x, zombie.y, ZOMBIE, { fontSize: '40px' }).setOrigin(0.5);
                    zombieEmojis.push(zombieEmoji);
                    zombie.setVisible(false);
                }

                cursors = this.input.keyboard.createCursorKeys();

                this.physics.add.collider(player, platforms);
                this.physics.add.collider(zombies, platforms);

                this.physics.add.overlap(player, zombies, hitZombie, null, this);

                scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '16px', fill: '#0ff' });
            }

            function update() {
                if (gameOver) {
                    return;
                }

                if (cursors.left.isDown) {
                    player.setVelocityX(-160);
                } else if (cursors.right.isDown) {
                    player.setVelocityX(160);
                } else {
                    player.setVelocityX(0);
                }

                if (cursors.up.isDown && player.body.touching.down) {
                    player.setVelocityY(-330);
                }

                // Move zombies towards player
                zombies.children.entries.forEach((zombie, index) => {
                    if (zombie.x < player.x) {
                        zombie.setVelocityX(50);
                    } else {
                        zombie.setVelocityX(-50);
                    }
                    zombieEmojis[index].x = zombie.x;
                    zombieEmojis[index].y = zombie.y;
                });

                // Update player emoji position
                playerEmoji.x = player.x;
                playerEmoji.y = player.y;

                score += 1;
                scoreText.setText('Score: ' + score);
            }

            function hitZombie(player, zombie) {
                this.physics.pause();
                player.setTint(0xff0000);
                gameOver = true;
                this.add.text(400, 300, 'Game Over', { fontSize: '32px', fill: '#f0f' }).setOrigin(0.5);
            }

            if (gameRef.current) {
                game = new Phaser.Game(config);
            }
        };

        initPhaser();

        return () => {
            if (game) {
                game.destroy(true);
            }
        };
    }, []);

    return (
        <div className="nes-container is-dark with-title" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <p className="title">Emoji Platformer</p>
            <div id="game-container" style={{ 
                width: '100%', 
                height: '80vh', 
                maxWidth: '800px', 
                maxHeight: '600px', 
                border: '2px solid var(--retro-border)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div ref={gameRef} style={{ width: '100%', height: '100%' }}></div>
            </div>
            <div className="nes-container is-rounded is-dark" style={{ marginTop: '1rem' }}>
                <p>Use arrow keys to move and jump. Avoid the zombies!</p>
                <button className="nes-btn is-primary" onClick={() => window.location.reload()}>Restart Game</button>
            </div>
        </div>
    );
};

export default dynamic(() => Promise.resolve(EmojiPlatformerGame), {
    ssr: false
});
