import { MAP_WIDTH, MAP_HEIGHT, FLOOR, WALL, KEY, RIDDLE, PUZZLE } from './config.js';
import { createEmojiSprite } from './characters.js';

export function generateMap(scene, tileSize) {
    let map = [];
    let walls = scene.add.group();
    let keys = scene.add.group();
    let riddles = scene.add.group();
    let puzzles = scene.add.group();

    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = Array(MAP_WIDTH).fill(FLOOR);
        for (let x = 0; x < MAP_WIDTH; x++) {
            scene.add.text(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, FLOOR, { fontSize: `${tileSize * 0.7}px` }).setOrigin(0.5);
        }
    }

    placeElements(scene, walls, WALL, 20, tileSize, map);
    placeElements(scene, keys, KEY, 1, tileSize, map);
    placeElements(scene, riddles, RIDDLE, 3, tileSize, map);
    placeElements(scene, puzzles, PUZZLE, 2, tileSize, map);

    return [map, walls, keys, riddles, puzzles];
}

function placeElements(scene, group, emoji, count, tileSize, map) {
    for (let i = 0; i < count; i++) {
        const position = getRandomEmptyPosition(map);
        map[position.y][position.x] = emoji;
        const element = createEmojiSprite(scene, position, emoji, tileSize);
        group.add(element);
    }
}

export function getRandomEmptyPosition(map) {
    let x, y;
    do {
        x = Phaser.Math.Between(0, MAP_WIDTH - 1);
        y = Phaser.Math.Between(0, MAP_HEIGHT - 1);
    } while (map[y][x] !== FLOOR);
    return { x, y };
}

export function canMoveTo(x, y, map) {
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && map[y][x] !== WALL;
}