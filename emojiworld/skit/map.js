import { MAP_WIDTH, MAP_HEIGHT, GRASS, TREE, HOUSE, ROAD, FLOWER, ROCK, WATER } from './config.js';
import { createEmojiSprite } from './characters.js';

export function generateMap(scene, tileSize) {
    let map = [];
    let trees = scene.add.group();
    let houses = scene.add.group();
    let decorations = scene.add.group();

    // Initialize map with grass
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = Array(MAP_WIDTH).fill(GRASS);
    }

    // Generate main road
    const roadY = Math.floor(MAP_HEIGHT / 2);
    for (let x = 0; x < MAP_WIDTH; x++) {
        map[roadY][x] = ROAD;
    }

    // Generate houses along the road
    for (let x = 2; x < MAP_WIDTH - 2; x += 3) {
        if (Math.random() < 0.7) {
            placeElement(scene, houses, HOUSE, x, roadY - 1, tileSize, map);
        }
    }

    // Generate trees
    for (let i = 0; i < 15; i++) {
        placeRandomElement(scene, trees, TREE, tileSize, map);
    }

    // Generate water
    const waterX = MAP_WIDTH - 3;
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y][waterX] = WATER;
        map[y][waterX + 1] = WATER;
    }

    // Generate decorations (flowers and rocks)
    for (let i = 0; i < 10; i++) {
        placeRandomElement(scene, decorations, FLOWER, tileSize, map);
        placeRandomElement(scene, decorations, ROCK, tileSize, map);
    }

    // Render the map
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            scene.add.text(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, map[y][x], { fontSize: `${tileSize * 0.7}px` }).setOrigin(0.5);
        }
    }

    return [map, trees, houses, decorations];
}

function placeElement(scene, group, emoji, x, y, tileSize, map) {
    map[y][x] = emoji;
    const element = createEmojiSprite(scene, { x, y }, emoji, tileSize);
    group.add(element);
}

function placeRandomElement(scene, group, emoji, tileSize, map) {
    const position = getRandomEmptyPosition(map);
    placeElement(scene, group, emoji, position.x, position.y, tileSize, map);
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
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && (map[y][x] === GRASS || map[y][x] === ROAD || map[y][x] === FLOWER);
}