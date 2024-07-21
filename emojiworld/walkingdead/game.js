import { config, PLAYER, ZOMBIE, SURVIVOR, SAFEHOUSE, WEAPON, SKULL, MAP_WIDTH } from './config.js';
import { generateMap, canMoveTo, getRandomEmptyPosition } from './map.js';
import { createEmojiSprite, moveCharacter } from './characters.js';
import { addBouncePulseAnimation } from './animations.js';
import { setupInputHandlers } from './input.js';
import { updateStory, updateInventory } from './ui.js';

let player, zombie, survivor, safehouse;
let walls, weapons;
let cursors;
let map = [];
let inventory = [];
let isZombieDefeated = false;
let isSurvivorRescued = false;
let canMove = true;
let isGameOver = false;

export function create() {
    this.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x4a5c44).setOrigin(0);
    
    const tileSize = config.scale.width / MAP_WIDTH;
    
    [map, walls, weapons] = generateMap(this, tileSize);
    
    safehouse = createEmojiSprite(this, getRandomEmptyPosition(map), SAFEHOUSE, tileSize);
    player = createEmojiSprite(this, getRandomEmptyPosition(map), PLAYER, tileSize);
    zombie = createEmojiSprite(this, getRandomEmptyPosition(map), ZOMBIE, tileSize);
    survivor = createEmojiSprite(this, getRandomEmptyPosition(map), SURVIVOR, tileSize);

    this.player = player;
    this.map = map;

    [player, zombie, survivor, safehouse].forEach(char => addBouncePulseAnimation(this, char));

    cursors = setupInputHandlers(this, handlePlayerMove);

    updateStory("Welcome to The Walking Dead Quest! Find a weapon, defeat the zombie, rescue the survivor, and reach the safehouse!");
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
        moveZombie();
        moveSurvivor();
        canMove = true;
    });
}

function moveZombie() {
    if (!isZombieDefeated) {
        const dx = Phaser.Math.Clamp(player.gridX - zombie.gridX, -1, 1);
        const dy = Phaser.Math.Clamp(player.gridY - zombie.gridY, -1, 1);
        
        if (canMoveTo(zombie.gridX + dx, zombie.gridY + dy, map)) {
            moveCharacter(zombie, zombie.gridX + dx, zombie.gridY + dy);
        }
        checkCollisions();
    }
}

function moveSurvivor() {
    if (!isSurvivorRescued) {
        let bestMove = { x: survivor.gridX, y: survivor.gridY };
        let maxDistance = 0;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const newX = survivor.gridX + dx;
                const newY = survivor.gridY + dy;
                
                if (canMoveTo(newX, newY, map)) {
                    const distanceToPlayer = Math.abs(newX - player.gridX) + Math.abs(newY - player.gridY);
                    if (distanceToPlayer > maxDistance) {
                        maxDistance = distanceToPlayer;
                        bestMove = { x: newX, y: newY };
                    }
                }
            }
        }

        if (bestMove.x !== survivor.gridX || bestMove.y !== survivor.gridY) {
            moveCharacter(survivor, bestMove.x, bestMove.y);
        }
    }
}

function checkCollisions() {
    if (player.gridX === zombie.gridX && player.gridY === zombie.gridY) fightZombie();
    if (player.gridX === survivor.gridX && player.gridY === survivor.gridY) rescueSurvivor();
    if (player.gridX === safehouse.gridX && player.gridY === safehouse.gridY) enterSafehouse();

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
    updateStory("You found a gun! Now you can face the zombie!");
}

function fightZombie() {
    if (inventory.includes(WEAPON) && !isZombieDefeated) {
        zombie.destroy();
        isZombieDefeated = true;
        inventory = inventory.filter(item => item !== WEAPON);
        updateInventory(inventory);
        updateStory("You defeated the zombie! Now rescue the survivor and reach the safehouse!");
    } else if (!isZombieDefeated) {
        player.setText(SKULL);
        isGameOver = true;
        canMove = false;
        updateStory("Oh no! The zombie got you. Game Over!");
        setTimeout(() => { location.reload(); }, 3000);
    }
}

function rescueSurvivor() {
    if (!isSurvivorRescued) {
        survivor.destroy();
        isSurvivorRescued = true;
        updateStory("You rescued the survivor! Now reach the safehouse to win!");
    }
}

function enterSafehouse() {
    if (isZombieDefeated && isSurvivorRescued) {
        updateStory("Congratulations! You've completed your mission and reached safety!");
        isGameOver = true;
        canMove = false;
    } else {
        let message = "You need to ";
        if (!isZombieDefeated) message += "defeat the zombie ";
        if (!isZombieDefeated && !isSurvivorRescued) message += "and ";
        if (!isSurvivorRescued) message += "rescue the survivor ";
        message += "before entering the safehouse!";
        updateStory(message);
    }
}

const game = new Phaser.Game(config);