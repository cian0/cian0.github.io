import { canMoveTo } from './map.js';
import { MAP_WIDTH, MAP_HEIGHT } from './config.js';

export function setupInputHandlers(scene, movePlayerCallback) {
    console.log('Setting up input handlers');
    const cursors = scene.input.keyboard.createCursorKeys();
    const gameWidth = scene.scale.width;
    const gameHeight = scene.scale.height;
    const tileSize = gameWidth / MAP_WIDTH;

    console.log(`Game dimensions: ${gameWidth}x${gameHeight}, Tile size: ${tileSize}, MAP_WIDTH: ${MAP_WIDTH}`);

    scene.input.on('pointerdown', function (pointer) {
        console.log('Touch event detected');
        console.log(`Raw touch coordinates: (${pointer.x}, ${pointer.y})`);
        
        // Use Phaser's built-in methods to get the correct touch coordinates
        const relativeX = pointer.x - scene.cameras.main.scrollX;
        const relativeY = pointer.y - scene.cameras.main.scrollY;
        
        console.log(`Relative touch coordinates: (${relativeX}, ${relativeY})`);
        
        const touchX = Math.floor(relativeX / tileSize);
        const touchY = Math.floor(relativeY / tileSize);
        
        console.log(`Calculated tile coordinates: (${touchX}, ${touchY})`);
        console.log('Scene object:', scene);
        console.log('Player object:', scene.player);
        
        // Additional logging
        console.log('Camera scroll:', scene.cameras.main.scrollX, scene.cameras.main.scrollY);
        console.log('Camera zoom:', scene.cameras.main.zoom);
        console.log('Camera bounds:', scene.cameras.main.getBounds());
        
        handleTouchInput(touchX, touchY, scene.player, movePlayerCallback, scene.map);
    });

    return cursors;
}

function handleTouchInput(touchX, touchY, player, movePlayerCallback, map) {
    console.log('Entering handleTouchInput');
    console.log('Player:', player);
    console.log('Move callback:', movePlayerCallback);
    console.log('Map:', map);

    if (!player) {
        console.error('Player object is undefined');
        return;
    }

    if (isNaN(touchX) || isNaN(touchY) || touchX < 0 || touchX >= MAP_WIDTH || touchY < 0 || touchY >= MAP_HEIGHT) {
        console.error(`Invalid touch coordinates: (${touchX}, ${touchY})`);
        return;
    }

    const dx = touchX - player.gridX;
    const dy = touchY - player.gridY;

    console.log(`Player position: (${player.gridX}, ${player.gridY})`);
    console.log(`Movement delta: (${dx}, ${dy})`);

    const [primaryDir, secondaryDir] = Math.abs(dx) > Math.abs(dy) 
        ? [{ x: Math.sign(dx), y: 0 }, { x: 0, y: Math.sign(dy) }]
        : [{ x: 0, y: Math.sign(dy) }, { x: Math.sign(dx), y: 0 }];

    console.log('Primary direction:', primaryDir);
    console.log('Secondary direction:', secondaryDir);

    if (canMoveTo(player.gridX + primaryDir.x, player.gridY + primaryDir.y, map)) {
        console.log('Moving in primary direction');
        movePlayerCallback(player.gridX + primaryDir.x, player.gridY + primaryDir.y);
    } else if (canMoveTo(player.gridX + secondaryDir.x, player.gridY + secondaryDir.y, map)) {
        console.log('Moving in secondary direction');
        movePlayerCallback(player.gridX + secondaryDir.x, player.gridY + secondaryDir.y);
    } else {
        console.log('No valid move found');
    }
}