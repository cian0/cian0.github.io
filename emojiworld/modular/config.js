export const MAP_WIDTH = 10;
export const MAP_HEIGHT = 10;

export const PLAYER = '🐱';
export const WALL = '🌳';
export const GRASS = '🟩';
export const WEAPON = '🗡️';
export const MONSTER = '👾';
export const FAIRY = '🧚';
export const CASTLE = '🏰';
export const SKULL = '💀';

export const config = {
    type: Phaser.AUTO,
    parent: 'game-canvas',
    backgroundColor: '#9CCC65',
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

// Import these from game.js
import { create, update } from './game.js';