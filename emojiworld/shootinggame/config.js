export const MAP_WIDTH = 10;
export const MAP_HEIGHT = 10;

export const PLAYER = '🚀';
export const WALL = '🌑';
export const SPACE = '⬛';
export const BULLET = '💥';
export const ENEMY = '👾';

export const config = {
    type: Phaser.AUTO,
    parent: 'game-canvas',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: MAP_WIDTH * 60,
        height: MAP_HEIGHT * 60
    },
    scene: {
        create: create,
        update: update
    }
};

// These will be imported from game.js
import { create, update } from './game.js';