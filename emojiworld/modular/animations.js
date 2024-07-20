export function addBouncePulseAnimation(scene, sprite) {
    scene.tweens.add({
        targets: sprite,
        scaleX: 1.1,
        scaleY: 1.1,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        duration: 800
    });
}