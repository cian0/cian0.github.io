import { config, VILLAGER, KNIGHT, DRAGON, HOUSE, TREE, MAP_WIDTH, MAP_HEIGHT } from './config.js';
import { generateMap, getRandomEmptyPosition } from './map.js';
import { createEmojiSprite, moveCharacter } from './characters.js';
import { addBouncePulseAnimation } from './animations.js';
import { updateStory } from './ui.js';

let villager1, villager2, knight, dragon;
let houses, trees;
let map = [];
let currentScene = 0;
const scenes = [
    { action: setupScene, delay: 0 },
    { action: villagersTalk, delay: 2000 },
    { action: knightEnters, delay: 3000 },
    { action: dragonAppears, delay: 3000 },
    { action: fight, delay: 2000 },
    { action: endScene, delay: 5000 }
];

export function create() {
    this.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x9CCC65).setOrigin(0);
    
    const tileSize = config.scale.width / MAP_WIDTH;
    
    [map, trees, houses] = generateMap(this, tileSize);
    
    villager1 = createEmojiSprite(this, getRandomEmptyPosition(map), VILLAGER, tileSize);
    villager2 = createEmojiSprite(this, getRandomEmptyPosition(map), VILLAGER, tileSize);
    knight = createEmojiSprite(this, { x: -1, y: Math.floor(MAP_HEIGHT / 2) }, KNIGHT, tileSize);
    dragon = createEmojiSprite(this, { x: MAP_WIDTH, y: Math.floor(MAP_HEIGHT / 2) }, DRAGON, tileSize);

    [villager1, villager2, knight, dragon].forEach(char => addBouncePulseAnimation(this, char));

    this.time.delayedCall(1000, runNextScene, [], this);
}

function runNextScene() {
    if (currentScene < scenes.length) {
        const scene = scenes[currentScene];
        const delay = scene.action.call(this) || scene.delay;
        currentScene++;
        this.time.delayedCall(delay, runNextScene, [], this);
    }
}

function setupScene() {
    updateStory("A peaceful day in the village...");
}

function villagersTalk() {
    const targetX = Math.min(villager2.gridX - 1, villager1.gridX);
    const moveDuration = moveCharacter(villager1, targetX, villager2.gridY, map, () => {
        updateStory("Villagers: Did you hear about the dragon sightings?");
    });
    return moveDuration + 1000; // Additional delay for dialogue
}

function knightEnters() {
    const moveDuration = moveCharacter(knight, 1, knight.gridY, map, () => {
        updateStory("Knight: Fear not, citizens! I shall protect you!");
    });
    return moveDuration + 1000; // Additional delay for dialogue
}

function dragonAppears() {
    const moveDuration = moveCharacter(dragon, MAP_WIDTH - 2, dragon.gridY, map, () => {
        updateStory("Dragon: ROAR! The village is mine!");
    });
    return moveDuration + 1000; // Additional delay for dialogue
}

function fight() {
    const moveDuration = moveCharacter(knight, dragon.gridX - 1, dragon.gridY, map, () => {
        updateStory("An epic battle ensues between the knight and the dragon!");
    });
    return moveDuration + 2000; // Additional delay for the "battle"
}

function endScene() {
    dragon.destroy();
    updateStory("Knight: The dragon is defeated! The village is safe once more!");
}

export function update() {
    // Not needed for this skit, as everything is time-based
}

const game = new Phaser.Game(config);