import { config, PLAYER, MONSTER, FAIRY, CASTLE, WEAPON, SKULL, MAP_WIDTH, MAP_HEIGHT } from './config.js';
import { generateMap, canMoveTo } from './map.js';
import { createCharacter, moveCharacter } from './characters.js';
import { addBouncePulseAnimation } from './animations.js';
import { setupInputHandlers } from './input.js';
import { updateStory, updateInventory } from './ui.js';

let player, monster, fairy, castle;
let walls, weapons;
let map = [];
let inventory = [];
let isMonsterDefeated = false;
let isFairyCaptured = false;
let canMove = true;
let isGameOver = false;

const game = new Phaser.Game(config);

function create() {
    console.log('Create function called');
    this.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x9CCC65).setOrigin(0);
    
    const tileSize = config.scale.width / MAP_WIDTH;
    
    [map, walls, weapons] = generateMap(this, tileSize);
    
    player = createCharacter(this, PLAYER, tileSize, map);
    monster = createCharacter(this, MONSTER, tileSize, map);
    fairy = createCharacter(this, FAIRY, tileSize, map);
    castle = createCharacter(this, CASTLE, tileSize, map);

    [player, monster, fairy, castle].forEach(char => addBouncePulseAnimation(this, char));

    setupInputHandlers(this, handlePlayerMove);

    // Add this line to check if characters are created
    console.log('Characters created:', player, monster, fairy, castle);
}

function update() {
    if (!canMove || isGameOver) return;
    // Input handling is now in input.js
}

function handlePlayerMove(newX, newY) {
    if (!canMoveTo(newX, newY, map)) return;

    canMove = false;
    moveCharacter(player, newX, newY, () => {
        checkCollisions();
        moveMonster();
        moveFairy();
        canMove = true;
    });
}

function moveMonster() {
    if (!isMonsterDefeated) {
        const dx = Phaser.Math.Clamp(player.gridX - monster.gridX, -1, 1);
        const dy = Phaser.Math.Clamp(player.gridY - monster.gridY, -1, 1);
        
        if (canMoveTo(monster.gridX + dx, monster.gridY + dy, map)) {
            moveCharacter(monster, monster.gridX + dx, monster.gridY + dy);
        }
        checkCollisions();
    }
}

function moveFairy() {
    if (!isFairyCaptured) {
        let bestMove = { x: fairy.gridX, y: fairy.gridY };
        let maxDistance = 0;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const newX = fairy.gridX + dx;
                const newY = fairy.gridY + dy;
                
                if (canMoveTo(newX, newY, map)) {
                    const distanceToPlayer = Math.abs(newX - player.gridX) + Math.abs(newY - player.gridY);
                    if (distanceToPlayer > maxDistance) {
                        maxDistance = distanceToPlayer;
                        bestMove = { x: newX, y: newY };
                    }
                }
            }
        }

        if (bestMove.x !== fairy.gridX || bestMove.y !== fairy.gridY) {
            moveCharacter(fairy, bestMove.x, bestMove.y);
        }
    }
}

function checkCollisions() {
    if (player.gridX === monster.gridX && player.gridY === monster.gridY) fightMonster();
    if (player.gridX === fairy.gridX && player.gridY === fairy.gridY) captureFairy();
    if (player.gridX === castle.gridX && player.gridY === castle.gridY) enterCastle();

    weapons.children.entries.forEach(weapon => {
        if (player.gridX === weapon.gridX && player.gridY === weapon.gridY) {
            collectWeapon(weapon);
        }
    });
}

function collectWeapon(weapon) {
    weapon.destroy();
    inventory.push(WEAPON);
    updateInventory(inventory);
    updateStory("You found a weapon! Now you can face the monster!");
}

function fightMonster() {
    if (inventory.includes(WEAPON) && !isMonsterDefeated) {
        monster.destroy();
        isMonsterDefeated = true;
        inventory = inventory.filter(item => item !== WEAPON);
        updateInventory(inventory);
        updateStory("You defeated the monster! Now capture the fairy and reach the castle!");
    } else if (!isMonsterDefeated) {
        player.setText(SKULL);
        isGameOver = true;
        canMove = false;
        updateStory("Oh no! The monster caught you. Game Over!");
        setTimeout(() => { location.reload(); }, 3000);
    }
}

function captureFairy() {
    if (!isFairyCaptured) {
        fairy.destroy();
        isFairyCaptured = true;
        updateStory("You captured the fairy! Now reach the castle to win!");
    }
}

function enterCastle() {
    if (isMonsterDefeated && isFairyCaptured) {
        updateStory("Congratulations! You've completed your quest!");
        isGameOver = true;
        canMove = false;
    } else {
        let message = "You need to ";
        if (!isMonsterDefeated) message += "defeat the monster ";
        if (!isMonsterDefeated && !isFairyCaptured) message += "and ";
        if (!isFairyCaptured) message += "capture the fairy ";
        message += "before entering the castle!";
        updateStory(message);
    }
}

export { create, update };