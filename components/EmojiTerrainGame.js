import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const EmojiTerrainGame = () => {
    const gameRef = useRef(null);
    const [gameInstance, setGameInstance] = useState(null);

    useEffect(() => {
        if (gameInstance) return; // Prevent reinitializing if game already exists

        const initPhaser = async () => {
            console.log('Initializing Phaser...');
            const Phaser = (await import('phaser')).default;
            console.log('Phaser imported successfully:', Phaser);
            
            const config = {
                type: Phaser.AUTO,
                width: 800,
                height: 600,
                parent: 'game-container',
                backgroundColor: '#9CCC65',
                scene: {
                    preload,
                    create,
                    update
                }
            };
            console.log('Game configuration:', config);

            const PLAYER = '🤠';
            const TREE = '🌳';
            const GRASS = '🟩';

            let player;
            let cursors;
            let map = [];
            let terrainGroup;

            function preload() {
                this.load.image('pixel', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==');
            }

            function create() {
                console.log('Create function called');
                
                const MAP_WIDTH = 10;
                const MAP_HEIGHT = 8;
                const tileSize = config.width / MAP_WIDTH;

                terrainGroup = this.add.group();

                // Create terrain
                for (let y = 0; y < MAP_HEIGHT; y++) {
                    map[y] = [];
                    for (let x = 0; x < MAP_WIDTH; x++) {
                        map[y][x] = Math.random() < 0.2 ? TREE : GRASS;
                        terrainGroup.add(this.add.text(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, map[y][x], 
                            { fontSize: `${tileSize * 0.7}px` }).setOrigin(0.5));
                    }
                }
                console.log('Terrain created:', map);

                // Create player
                const playerPos = getRandomEmptyPosition(map);
                player = this.add.text(playerPos.x * tileSize + tileSize / 2, playerPos.y * tileSize + tileSize / 2, PLAYER, 
                    { fontSize: `${tileSize * 0.7}px` }).setOrigin(0.5);
                player.gridX = playerPos.x;
                player.gridY = playerPos.y;
                console.log('Player created:', player);

                // Set up cursor keys
                cursors = this.input.keyboard.createCursorKeys();
                console.log('Cursor keys set up:', cursors);

                console.log('Create function completed');
            }

            function update() {
                if (Phaser.Input.Keyboard.JustDown(cursors.left)) movePlayer(-1, 0);
                else if (Phaser.Input.Keyboard.JustDown(cursors.right)) movePlayer(1, 0);
                else if (Phaser.Input.Keyboard.JustDown(cursors.up)) movePlayer(0, -1);
                else if (Phaser.Input.Keyboard.JustDown(cursors.down)) movePlayer(0, 1);
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

            if (gameRef.current && !gameInstance) {
                console.log('Creating new Phaser game instance');
                const game = new Phaser.Game(config);
                setGameInstance(game);
                console.log('Phaser game instance created:', game);
            }
        };

        initPhaser().catch(error => {
            console.error('Error initializing Phaser:', error);
        });

        return () => {
            if (gameInstance) {
                console.log('Destroying Phaser game instance');
                gameInstance.destroy(true);
                setGameInstance(null);
            }
        };
    }, [gameInstance]);

    return (
        <div className="nes-container with-title">
            <p className="title">Emoji Terrain Game</p>
            <div ref={gameRef} id="game-container" style={{ width: '800px', height: '600px', border: '1px solid #000' }}></div>
            <div className="nes-container is-rounded" style={{ marginTop: '1rem' }}>
                <p>Use arrow keys to move the cowboy emoji around the terrain!</p>
            </div>
        </div>
    );
};

// Use dynamic import with ssr: false for this component
export default dynamic(() => Promise.resolve(EmojiTerrainGame), {
    ssr: false
});