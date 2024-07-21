import { config, PLAYER, ENEMY, BULLET, WALL, SPACE, MAP_WIDTH, MAP_HEIGHT } from './config.js';
import { generateMap, canMoveTo, getRandomEmptyPosition } from './map.js';
import { createEmojiSprite, moveCharacter } from './characters.js';
import { addBouncePulseAnimation } from './animations.js';
import { setupInputHandlers } from './input.js';
import { updateScore } from './ui.js';

let player, bullets, enemies;
let cursors, spaceKey;
let map = [];
let score = 0;
let canShoot = true;
let isGameOver = false;

export function create() {
    this.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x000000).setOrigin(0);
    
    const tileSize = config.scale.width / MAP_WIDTH;
    
    [map] = generateMap(this, tileSize);
    
    player = createEmojiSprite(this, {x: Math.floor(MAP_WIDTH/2), y: MAP_HEIGHT-1}, PLAYER, tileSize);
    bullets = this.add.group();
    enemies = this.add.group();

    // Set player on the scene so it's accessible in input handlers
    this.player = player;
    this.map = map;

    spawnEnemies(this, 5);

    cursors = setupInputHandlers(this, handlePlayerMove);
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    updateScore(score);
}

export function update() {
    if (isGameOver) return;

    let dx = 0;

    if (cursors.left.isDown) dx = -1;
    else if (cursors.right.isDown) dx = 1;

    if (dx !== 0) {
        handlePlayerMove(player.gridX + dx, player.gridY);
    }

    if (spaceKey.isDown && canShoot) {
        shootBullet(this);
    }

    updateBullets();
    updateEnemies(this);
    checkCollisions(this);
}

function handlePlayerMove(newX, newY) {
    if (newX >= 0 && newX < MAP_WIDTH) {
        moveCharacter(player, newX, newY);
    }
}

function shootBullet(scene) {
    canShoot = false;
    const bullet = createEmojiSprite(scene, {x: player.gridX, y: player.gridY - 1}, BULLET, config.scale.width / MAP_WIDTH);
    bullets.add(bullet);
    scene.time.delayedCall(500, () => { canShoot = true; });
}

function updateBullets() {
    bullets.children.entries.forEach(bullet => {
        bullet.gridY--;
        bullet.y = bullet.gridY * (config.scale.height / MAP_HEIGHT) + (config.scale.height / MAP_HEIGHT / 2);
        if (bullet.gridY < 0) {
            bullet.destroy();
        }
    });
}

function spawnEnemies(scene, count) {
    for (let i = 0; i < count; i++) {
        const enemy = createEmojiSprite(scene, getRandomEmptyPosition(map), ENEMY, config.scale.width / MAP_WIDTH);
        enemies.add(enemy);
        addBouncePulseAnimation(scene, enemy);
    }
}

function updateEnemies(scene) {
    enemies.children.entries.forEach(enemy => {
        if (Math.random() < 0.02) {
            const dx = Phaser.Math.Between(-1, 1);
            const newX = Phaser.Math.Clamp(enemy.gridX + dx, 0, MAP_WIDTH - 1);
            const newY = Math.min(enemy.gridY + 1, MAP_HEIGHT - 1);
            moveCharacter(enemy, newX, newY);
        }
    });

    if (enemies.children.entries.length < 5 && Math.random() < 0.02) {
        spawnEnemies(scene, 1);
    }
}

function checkCollisions(scene) {
    bullets.children.entries.forEach(bullet => {
        enemies.children.entries.forEach(enemy => {
            if (bullet.gridX === enemy.gridX && bullet.gridY === enemy.gridY) {
                bullet.destroy();
                enemy.destroy();
                score += 10;
                updateScore(score);
            }
        });
    });

    enemies.children.entries.forEach(enemy => {
        if (enemy.gridX === player.gridX && enemy.gridY === player.gridY) {
            gameOver(scene);
        }
    });
}

function gameOver(scene) {
    isGameOver = true;
    scene.add.text(config.scale.width/2, config.scale.height/2, 'Game Over!', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    scene.add.text(config.scale.width/2, config.scale.height/2 + 40, `Final Score: ${score}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
    scene.add.text(config.scale.width/2, config.scale.height/2 + 80, 'Click to restart', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
    scene.input.on('pointerdown', () => {
        scene.scene.restart();
        score = 0;
        isGameOver = false;
    });
}

const game = new Phaser.Game(config);