import { canMoveTo } from './map.js';

export function setupInputHandlers(scene, movePlayerCallback) {
    const cursors = scene.input.keyboard.createCursorKeys();
    const tileSize = scene.scale.width / scene.MAP_WIDTH;

    scene.input.on('pointerdown', function (pointer) {
        const touchX = Math.floor(pointer.x / tileSize);
        const touchY = Math.floor(pointer.y / tileSize);
        handleTouchInput(touchX, touchY, scene.player, movePlayerCallback);
    });

    scene.events.on('update', function() {
        if (scene.canMove && !scene.isGameOver) {
            let dx = 0;
            let dy = 0;

            if (cursors.left.isDown) dx = -1;
            else if (cursors.right.isDown) dx = 1;
            else if (cursors.up.isDown) dy = -1;
            else if (cursors.down.isDown) dy = 1;

            if (dx !== 0 || dy !== 0) {
                movePlayerCallback(scene.player.gridX + dx, scene.player.gridY + dy);
            }
        }
    });
}

function handleTouchInput(touchX, touchY, player, movePlayerCallback) {
    const dx = touchX - player.gridX;
    const dy = touchY - player.gridY;

    const [primaryDir, secondaryDir] = Math.abs(dx) > Math.abs(dy) 
        ? [{ x: Math.sign(dx), y: 0 }, { x: 0, y: Math.sign(dy) }]
        : [{ x: 0, y: Math.sign(dy) }, { x: Math.sign(dx), y: 0 }];

    if (canMoveTo(player.gridX + primaryDir.x, player.gridY + primaryDir.y, player.scene.map)) {
        movePlayerCallback(player.gridX + primaryDir.x, player.gridY + primaryDir.y);
    } else if (canMoveTo(player.gridX + secondaryDir.x, player.gridY + secondaryDir.y, player.scene.map)) {
        movePlayerCallback(player.gridX + secondaryDir.x, player.gridY + secondaryDir.y);
    }
}