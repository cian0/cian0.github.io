import { MAP_WIDTH } from './config.js';

export function createEmojiSprite(scene, position, emoji, tileSize) {
    const text = scene.add.text(position.x * tileSize + tileSize / 2, position.y * tileSize + tileSize / 2, emoji, { fontSize: `${tileSize * 0.7}px` }).setOrigin(0.5);
    text.gridX = position.x;
    text.gridY = position.y;
    return text;
}

export function moveCharacter(character, newX, newY, onComplete) {
    const tileSize = character.scene.scale.width / MAP_WIDTH;
    character.scene.tweens.add({
        targets: character,
        x: newX * tileSize + tileSize / 2,
        y: newY * tileSize + tileSize / 2,
        duration: 200,
        ease: 'Linear',
        onComplete: () => {
            character.gridX = newX;
            character.gridY = newY;
            if (onComplete) onComplete();
        }
    });
}