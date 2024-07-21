import { MAP_WIDTH, MAP_HEIGHT, SPACE, WALL } from './config.js';
import { createEmojiSprite } from './characters.js';

export function generateMap(scene, tileSize) {
    let map = [];

    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = Array(MAP_WIDTH).fill(SPACE);
        for (let x = 0; x < MAP_WIDTH; x++) {
            scene.add.text(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, SPACE, { fontSize: `${tileSize * 0.7}px` }).setOrigin(0.5);
        }
    }

    return [map];
}

export function getRandomEmptyPosition(map) {
    let x, y;
    do {
        x = Phaser.Math.Between(0, MAP_WIDTH - 1);
        y = Phaser.Math.Between(0, Math.floor(MAP_HEIGHT / 2)); // Enemies only spawn in top half
    } while (map[y][x] !== SPACE);
    return { x, y };
}

export function canMoveTo(x, y, map) {
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && map[y][x] !== WALL;
}