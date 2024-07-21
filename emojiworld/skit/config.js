export const MAP_WIDTH = 15;
export const MAP_HEIGHT = 10;

export const VILLAGER = '👨';
export const KNIGHT = '🤺';
export const DRAGON = '🐉';
export const HOUSE = '🏠';
export const TREE = '🌳';
export const GRASS = '🟩';

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

// These will be imported from game.js
import { create, update } from './game.js';