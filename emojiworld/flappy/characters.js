export function createEmojiSprite(scene, position, emoji, size) {
    const text = scene.add.text(position.x, position.y, emoji, { fontSize: `${size}px` }).setOrigin(0.5);
    scene.physics.add.existing(text);
    return text;
}