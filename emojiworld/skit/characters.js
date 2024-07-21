import { MAP_WIDTH, MAP_HEIGHT, WALKABLE_TILES } from './config.js';

export function createEmojiSprite(scene, position, emoji, tileSize) {
    const text = scene.add.text(position.x * tileSize + tileSize / 2, position.y * tileSize + tileSize / 2, emoji, { fontSize: `${tileSize * 0.7}px` }).setOrigin(0.5);
    text.gridX = position.x;
    text.gridY = position.y;
    return text;
}

function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function getNeighbors(x, y, map) {
    const neighbors = [];
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        if (newX >= 0 && newX < MAP_WIDTH && newY >= 0 && newY < MAP_HEIGHT && WALKABLE_TILES.includes(map[newY][newX])) {
            neighbors.push({x: newX, y: newY});
        }
    }
    return neighbors;
}

function aStarPathfinding(startX, startY, endX, endY, map) {
    const openSet = [{x: startX, y: startY, g: 0, h: manhattanDistance(startX, startY, endX, endY), f: 0}];
    const closedSet = new Set();
    const cameFrom = {};

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();

        if (current.x === endX && current.y === endY) {
            let path = [];
            let temp = current;
            while (temp) {
                path.push({x: temp.x, y: temp.y});
                temp = cameFrom[`${temp.x},${temp.y}`];
            }
            return path.reverse();
        }

        closedSet.add(`${current.x},${current.y}`);

        for (const neighbor of getNeighbors(current.x, current.y, map)) {
            if (closedSet.has(`${neighbor.x},${neighbor.y}`)) continue;

            const tentativeG = current.g + 1;
            const existing = openSet.find(node => node.x === neighbor.x && node.y === neighbor.y);

            if (!existing || tentativeG < existing.g) {
                const h = manhattanDistance(neighbor.x, neighbor.y, endX, endY);
                const f = tentativeG + h;
                if (!existing) {
                    openSet.push({x: neighbor.x, y: neighbor.y, g: tentativeG, h: h, f: f});
                } else {
                    existing.g = tentativeG;
                    existing.f = f;
                }
                cameFrom[`${neighbor.x},${neighbor.y}`] = current;
            }
        }
    }

    return null; // No path found
}

export function moveCharacter(character, newX, newY, map, onComplete) {
    const path = aStarPathfinding(character.gridX, character.gridY, newX, newY, map);
    if (!path) {
        console.error("No path found!");
        if (onComplete) onComplete();
        return 0;
    }

    const tileSize = character.scene.scale.width / MAP_WIDTH;
    const stepDuration = 500; // Duration for each step in milliseconds

    function takeStep(index) {
        if (index >= path.length) {
            if (onComplete) onComplete();
            return;
        }

        const step = path[index];
        character.scene.tweens.add({
            targets: character,
            x: step.x * tileSize + tileSize / 2,
            y: step.y * tileSize + tileSize / 2,
            duration: stepDuration,
            ease: 'Linear',
            onComplete: () => {
                character.gridX = step.x;
                character.gridY = step.y;
                takeStep(index + 1);
            }
        });
    }

    takeStep(0);
    return path.length * stepDuration; // Return total duration of movement
}