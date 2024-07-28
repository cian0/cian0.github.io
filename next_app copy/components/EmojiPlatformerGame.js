import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const EmojiPlatformerGame = () => {
    const gameRef = useRef(null);

    useEffect(() => {
        let game;
        const initPhaser = async () => {
            const Phaser = (await import('phaser')).default;
            
            const config = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                parent: 'game-container',
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

            function preload() {
                this.load.image('sky', 'https://labs.phaser.io/assets/skies/space3.png');
            }

            function create() {
                this.add.image(400, 300, 'sky');

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
                this.add.text(player.x, player.y, PLAYER, { fontSize: '40px' }).setOrigin(0.5);
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
                    this.add.text(zombie.x, zombie.y, ZOMBIE, { fontSize: '40px' }).setOrigin(0.5);
                    zombie.setVisible(false);
                }

                cursors = this.input.keyboard.createCursorKeys();

                this.physics.add.collider(player, platforms);
                this.physics.add.collider(zombies, platforms);

                this.physics.add.collider(player, zombies, hitZombie, null, this);

                scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#fff' });

                // Update emoji positions
                this.events.on('update', () => {
                    this.children.list.forEach(child => {
                        if (child.type === 'Text' && child.text !== 'Score: 0') {
                            const gameObject = this.children.list.find(obj => 
                                obj.type === 'Sprite' && 
                                Math.abs(obj.x - child.x) < 1 && 
                                Math.abs(obj.y - child.y) < 1
                            );
                            if (gameObject) {
                                child.x = gameObject.x;
                                child.y = gameObject.y;
                            }
                        }
                    });
                });
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
                zombies.children.entries.forEach(zombie => {
                    if (zombie.x < player.x) {
                        zombie.setVelocityX(50);
                    } else {
                        zombie.setVelocityX(-50);
                    }
                });

                score += 1;
                scoreText.setText('Score: ' + score);
            }

            function hitZombie(player, zombie) {
                this.physics.pause();
                player.setTint(0xff0000);
                gameOver = true;
                this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
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
        <div className="nes-container with-title">
            <p className="title">Emoji Platformer Game</p>
            <div ref={gameRef} id="game-container" style={{ width: '800px', height: '600px', border: '1px solid #000' }}></div>
            <div className="nes-container is-rounded" style={{ marginTop: '1rem' }}>
                <p>Use arrow keys to move and jump. Avoid the zombies!</p>
            </div>
        </div>
    );
};

export default dynamic(() => Promise.resolve(EmojiPlatformerGame), {
    ssr: false
});