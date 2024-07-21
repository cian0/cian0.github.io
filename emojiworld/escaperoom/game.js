import { config, PLAYER, KEY, DOOR, RIDDLE, PUZZLE, MAP_WIDTH } from './config.js';
import { generateMap, canMoveTo, getRandomEmptyPosition } from './map.js';
import { createEmojiSprite, moveCharacter } from './characters.js';
import { addBouncePulseAnimation } from './animations.js';
import { setupInputHandlers } from './input.js';
import { updateStory, updateInventory, showRiddle, showPuzzle } from './ui.js';

let player, door;
let walls, keys, riddles, puzzles;
let cursors;
let map = [];
let inventory = [];
let solvedRiddles = 0;
let solvedPuzzles = 0;
let canMove = true;
let isGameOver = false;

export function create() {
    this.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x2C3E50).setOrigin(0);
    
    const tileSize = config.scale.width / MAP_WIDTH;
    
    [map, walls, keys, riddles, puzzles] = generateMap(this, tileSize);
    
    door = createEmojiSprite(this, getRandomEmptyPosition(map), DOOR, tileSize);
    player = createEmojiSprite(this, getRandomEmptyPosition(map), PLAYER, tileSize);

    this.player = player;
    this.map = map;

    [player, door].forEach(char => addBouncePulseAnimation(this, char));

    cursors = setupInputHandlers(this, handlePlayerMove);

    updateStory("Welcome to the Escape Room! Solve riddles, complete puzzles, and find the key to escape.");
}

export function update() {
    if (!canMove || isGameOver) return;

    let dx = 0;
    let dy = 0;

    if (cursors.left.isDown) dx = -1;
    else if (cursors.right.isDown) dx = 1;
    else if (cursors.up.isDown) dy = -1;
    else if (cursors.down.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
        handlePlayerMove(player.gridX + dx, player.gridY + dy);
    }
}

function handlePlayerMove(newX, newY) {
    if (!canMoveTo(newX, newY, map)) return;

    canMove = false;
    moveCharacter(player, newX, newY, () => {
        checkCollisions();
        canMove = true;
    });
}

function checkCollisions() {
    if (player.gridX === door.gridX && player.gridY === door.gridY) tryEscape();

    keys.children.entries.forEach(key => {
        if (player.gridX === key.gridX && player.gridY === key.gridY) {
            collectKey(key);
        }
    });

    riddles.children.entries.forEach(riddle => {
        if (player.gridX === riddle.gridX && player.gridY === riddle.gridY) {
            showRiddle(solveRiddle);
        }
    });

    puzzles.children.entries.forEach(puzzle => {
        if (player.gridX === puzzle.gridX && player.gridY === puzzle.gridY) {
            showPuzzle(solvePuzzle);
        }
    });
}

function collectKey(key) {
    key.destroy();
    inventory.push(KEY);
    updateInventory(inventory);
    updateStory("You found a key! Can you escape now?");
}

function solveRiddle(isCorrect) {
    if (isCorrect) {
        solvedRiddles++;
        updateStory(`Correct! You've solved ${solvedRiddles} riddle(s).`);
    } else {
        updateStory("That's not quite right. Try again!");
    }
}

function solvePuzzle(isCorrect) {
    if (isCorrect) {
        solvedPuzzles++;
        updateStory(`Well done! You've completed ${solvedPuzzles} puzzle(s).`);
    } else {
        updateStory("That's not the solution. Keep trying!");
    }
}

function tryEscape() {
    if (inventory.includes(KEY) && solvedRiddles >= 3 && solvedPuzzles >= 2) {
        updateStory("Congratulations! You've escaped the room!");
        isGameOver = true;
        canMove = false;
    } else {
        let message = "You need to ";
        if (!inventory.includes(KEY)) message += "find the key, ";
        if (solvedRiddles < 3) message += `solve ${3 - solvedRiddles} more riddle(s), `;
        if (solvedPuzzles < 2) message += `complete ${2 - solvedPuzzles} more puzzle(s), `;
        message = message.slice(0, -2) + " to escape!";
        updateStory(message);
    }
}

const game = new Phaser.Game(config);