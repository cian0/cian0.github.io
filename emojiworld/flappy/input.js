export function setupInputHandlers(scene, flapCallback) {
    const cursors = scene.input.keyboard.createCursorKeys();

    scene.input.on('pointerdown', function (pointer) {
        flapCallback();
    });

    return cursors;
}