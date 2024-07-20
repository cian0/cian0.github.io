import { config, GAME_WIDTH, GAME_HEIGHT, BIRD, PIPE, CLOUD, STAR } from './config.js';
import { createEmojiSprite } from './characters.js';
import { addBouncePulseAnimation } from './animations.js';
import { updateScore, updateHighScore } from './ui.js';

let bird;
let pipes;
let clouds;
let stars;
let cursors;
let score = 0;
let highScore = 0;
let gameOver = false;

export function preload() {
    // No assets to preload for now
}

export function create() {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x87CEEB).setOrigin(0);

    bird = createEmojiSprite(this, { x: GAME_WIDTH / 4, y: GAME_HEIGHT / 2 }, BIRD, 40);
    bird.body.setCollideWorldBounds(true);

    addBouncePulseAnimation(this, bird);

    pipes = this.physics.add.group();
    clouds = this.physics.add.group();
    stars = this.physics.add.group();

    cursors = this.input.keyboard.createCursorKeys();

    this.time.addEvent({
        delay: 1500,
        callback: addPipePair,
        callbackScope: this,
        loop: true
    });

    this.time.addEvent({
        delay: 3000,
        callback: addCloud,
        callbackScope: this,
        loop: true
    });

    this.time.addEvent({
        delay: 5000,
        callback: addStar,
        callbackScope: this,
        loop: true
    });

    this.physics.add.collider(bird, pipes, gameOverHandler, null, this);
    this.physics.add.overlap(bird, stars, collectStar, null, this);

    this.input.on('pointerdown', flapBird);
}

export function update() {
    if (gameOver) return;

    if (cursors.space.isDown) {
        flapBird();
    }

    pipes.children.entries.forEach(pipe => {
        if (pipe.x < -pipe.width) {
            pipe.destroy();
            score += 0.5;
            updateScore(Math.floor(score));
        }
    });

    clouds.children.entries.forEach(cloud => {
        if (cloud.x < -cloud.width) {
            cloud.destroy();
        }
    });

    stars.children.entries.forEach(star => {
        if (star.x < -star.width) {
            star.destroy();
        }
    });
}

function addPipePair() {
    const gap = 200;
    const pipeWidth = 80;
    const topPipeHeight = Phaser.Math.Between(50, GAME_HEIGHT - gap - 50);

    const topPipe = createEmojiSprite(this, { x: GAME_WIDTH, y: topPipeHeight / 2 }, PIPE, pipeWidth);
    topPipe.setDisplaySize(pipeWidth, topPipeHeight);
    pipes.add(topPipe);

    const bottomPipe = createEmojiSprite(this, { x: GAME_WIDTH, y: topPipeHeight + gap + (GAME_HEIGHT - topPipeHeight - gap) / 2 }, PIPE, pipeWidth);
    bottomPipe.setDisplaySize(pipeWidth, GAME_HEIGHT - topPipeHeight - gap);
    pipes.add(bottomPipe);

    topPipe.body.setVelocityX(-200);
    bottomPipe.body.setVelocityX(-200);
    
    topPipe.body.setAllowGravity(false);
    bottomPipe.body.setAllowGravity(false);
}

function addCloud() {
    const cloud = createEmojiSprite(this, { x: GAME_WIDTH, y: Phaser.Math.Between(50, GAME_HEIGHT - 50) }, CLOUD, 60);
    clouds.add(cloud);
    cloud.body.setVelocityX(-100);
    cloud.body.setAllowGravity(false);
}

function addStar() {
    const star = createEmojiSprite(this, { x: GAME_WIDTH, y: Phaser.Math.Between(50, GAME_HEIGHT - 50) }, STAR, 40);
    stars.add(star);
    star.body.setVelocityX(-150);
    star.body.setAllowGravity(false);
}

function flapBird() {
    if (gameOver) return;
    bird.body.setVelocityY(-200);
}

function gameOverHandler() {
    this.physics.pause();
    gameOver = true;

    if (score > highScore) {
        highScore = score;
        updateHighScore(Math.floor(highScore));
    }

    updateScore(`Game Over! Score: ${Math.floor(score)}`);

    this.time.addEvent({
        delay: 2000,
        callback: resetGame,
        callbackScope: this,
        loop: false
    });
}

function collectStar(bird, star) {
    star.destroy();
    score += 5;
    updateScore(Math.floor(score));
}

function resetGame() {
    this.scene.restart();
    score = 0;
    gameOver = false;
    updateScore(0);
}

const game = new Phaser.Game(config);