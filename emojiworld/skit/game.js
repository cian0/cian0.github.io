import { config, VILLAGER, KNIGHT, DRAGON, HOUSE, TREE, MAP_WIDTH, MAP_HEIGHT, ROAD } from './config.js';
import { generateMap, getRandomEmptyPosition } from './map.js';
import { createEmojiSprite, moveCharacter } from './characters.js';
import { addBouncePulseAnimation } from './animations.js';
import { updateStory } from './ui.js';
import { createChatBubble } from './chatBubble.js';
import { initializeAudio } from './soundGenerator.js';

let villager1, villager2, knight, dragon;
let houses, trees, decorations;
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
    
    [map, trees, houses, decorations] = generateMap(this, tileSize);
    
    villager1 = createEmojiSprite(this, getRandomEmptyPosition(map), VILLAGER, tileSize);
    villager2 = createEmojiSprite(this, getRandomEmptyPosition(map), VILLAGER, tileSize);
    knight = createEmojiSprite(this, { x: 0, y: Math.floor(MAP_HEIGHT / 2) }, KNIGHT, tileSize);
    dragon = createEmojiSprite(this, { x: MAP_WIDTH - 1, y: Math.floor(MAP_HEIGHT / 2) }, DRAGON, tileSize);

    [villager1, villager2, knight, dragon].forEach(char => addBouncePulseAnimation(this, char));

    // Initialize audio
    initializeAudio();

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
        createChatBubble(this, villager1, "Did you hear about the dragon?", 2500);
        this.time.delayedCall(2000, () => {
            createChatBubble(this, villager2, "Oh no! Near the river?", 2500);
        });
        updateStory("Villagers discuss the dragon sightings near the river.");
    });
    return moveDuration + 4500; // Additional delay for dialogue
}

function knightEnters() {
    const moveDuration = moveCharacter(knight, 2, Math.floor(MAP_HEIGHT / 2), map, () => {
        createChatBubble(this, knight, "Fear not, citizens!", 2500);
        updateStory("A brave knight arrives to protect the village.");
    });
    return moveDuration + 2500; // Additional delay for dialogue
}

function dragonAppears() {
    const moveDuration = moveCharacter(dragon, MAP_WIDTH - 3, Math.floor(MAP_HEIGHT / 2), map, () => {
        createChatBubble(this, dragon, "ROAR! This village is mine!", 2500);
        updateStory("The fearsome dragon appears at the edge of the village.");
    });
    return moveDuration + 2500; // Additional delay for dialogue
}

function fight() {
    const moveDuration = moveCharacter(knight, dragon.gridX - 1, dragon.gridY, map, () => {
        createChatBubble(this, knight, "Have at thee, beast!", 2500);
        this.time.delayedCall(1500, () => {
            createChatBubble(this, dragon, "You dare challenge me?", 2500);
        });
        updateStory("An epic battle ensues between the knight and the dragon!");
    });
    return moveDuration + 4000; // Additional delay for the "battle"
}

function endScene() {
    dragon.destroy();
    createChatBubble(this, knight, "Victory! The village is safe!", 3000);
    updateStory("The dragon is defeated! The village and its precious water source are safe once more!");
}

export function update() {
    // Not needed for this skit, as everything is time-based
}

const game = new Phaser.Game(config);