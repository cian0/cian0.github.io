import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const EmojiTerrainGame = () => {
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
                backgroundColor: '#538d4e', // Retro green color
                scene: {
                    create: create,
                    update: update
                }
            };

            const PLAYER = '🤠';
            const TREE = '🌳';
            const GRASS = '🟩';

            let player;
            let cursors;
            let map = [];

            function create() {
                const MAP_WIDTH = 10;
                const MAP_HEIGHT = 8;
                const tileSize = config.width / MAP_WIDTH;

                // Create terrain
                for (let y = 0; y < MAP_HEIGHT; y++) {
                    map[y] = [];
                    for (let x = 0; x < MAP_WIDTH; x++) {
                        map[y][x] = Math.random() < 0.2 ? TREE : GRASS;
                        this.add.text(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, map[y][x], 
                            { fontSize: `${tileSize * 0.7}px`, fontFamily: '"Press Start 2P"' }).setOrigin(0.5);
                    }
                }

                // Create player
                const playerPos = getRandomEmptyPosition(map);
                player = this.add.text(playerPos.x * tileSize + tileSize / 2, playerPos.y * tileSize + tileSize / 2, PLAYER, 
                    { fontSize: `${tileSize * 0.7}px`, fontFamily: '"Press Start 2P"' }).setOrigin(0.5);
                player.gridX = playerPos.x;
                player.gridY = playerPos.y;

                // Set up cursor keys
                cursors = this.input.keyboard.createCursorKeys();
            }

            function update() {
                if (cursors.left.isDown) movePlayer(-1, 0);
                else if (cursors.right.isDown) movePlayer(1, 0);
                else if (cursors.up.isDown) movePlayer(0, -1);
                else if (cursors.down.isDown) movePlayer(0, 1);
            }

            function movePlayer(dx, dy) {
                const newX = player.gridX + dx;
                const newY = player.gridY + dy;

                if (canMoveTo(newX, newY)) {
                    const tileSize = config.width / map[0].length;
                    player.x = newX * tileSize + tileSize / 2;
                    player.y = newY * tileSize + tileSize / 2;
                    player.gridX = newX;
                    player.gridY = newY;
                }
            }

            function canMoveTo(x, y) {
                return x >= 0 && x < map[0].length && y >= 0 && y < map.length && map[y][x] !== TREE;
            }

            function getRandomEmptyPosition(map) {
                let x, y;
                do {
                    x = Math.floor(Math.random() * map[0].length);
                    y = Math.floor(Math.random() * map.length);
                } while (map[y][x] === TREE);
                return { x, y };
            }

            if (gameRef.current) {
                game = new Phaser.Game(config);
            }
        };

        initPhaser().catch(error => {
            console.error('Error initializing Phaser:', error);
        });

        return () => {
            if (game) {
                game.destroy(true);
            }
        };
    }, []);

    return (
        <div className="nes-container with-title is-centered">
            <p className="title">Emoji Terrain Game</p>
            <div className="nes-container is-dark with-title">
                <p className="title">Game Area</p>
                <div ref={gameRef} id="game-container" style={{ width: '800px', height: '600px', margin: '0 auto' }}></div>
            </div>
            <div className="nes-container is-rounded" style={{ marginTop: '1rem' }}>
                <p>Use arrow keys to move the cowboy emoji around the terrain!</p>
            </div>
        </div>
    );
};

export default dynamic(() => Promise.resolve(EmojiTerrainGame), {
    ssr: false
});