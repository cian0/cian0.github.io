export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const BIRD = '🐦';
export const PIPE = '🟩';
export const CLOUD = '☁️';
export const STAR = '⭐';

export const config = {
    type: Phaser.AUTO,
    parent: 'game-canvas',
    backgroundColor: '#87CEEB',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// These will be imported from game.js
import { preload, create, update } from './game.js';