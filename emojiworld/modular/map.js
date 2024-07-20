import { MAP_WIDTH, MAP_HEIGHT, GRASS, WALL, WEAPON } from './config.js';
import { createEmojiSprite } from './characters.js';

export function generateMap(scene, tileSize) {
    let map = [];
    let walls = scene.add.group();
    let weapons = scene.add.group();

    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = Array(MAP_WIDTH).fill(GRASS);
        for (let x = 0; x < MAP_WIDTH; x++) {
            scene.add.text(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, GRASS, { fontSize: `${tileSize * 0.7}px` }).setOrigin(0.5);
        }
    }

    placeElements(scene, walls, WALL, 15, tileSize, map);
    placeElements(scene, weapons, WEAPON, 1, tileSize, map);

    return [map, walls, weapons];
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
    } while (map[y][x] !== GRASS);
    return { x, y };
}

export function canMoveTo(x, y, map) {
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && map[y][x] !== WALL;
}