const MAP_WIDTH = 10;
const MAP_HEIGHT = 10;

const PLAYER = '🐱';
const WALL = '🌳';
const GRASS = '🟩';
const WEAPON = '🗡️';
const MONSTER = '👾';
const FAIRY = '🧚';
const CASTLE = '🏰';
const SKULL = '💀';

let player, monster, fairy, castle;
let walls, weapons;
let cursors;
let map = [];
let inventory = [];
let isMonsterDefeated = false;
let isFairyCaptured = false;
let canMove = true;
let isGameOver = false;

const config = {
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

const game = new Phaser.Game(config);

function create() {
    this.add.rectangle(0, 0, config.scale.width, config.scale.height, 0x9CCC65).setOrigin(0);
    
    const tileSize = config.scale.width / MAP_WIDTH;
    
    generateMap(this, tileSize);
    cursors = this.input.keyboard.createCursorKeys();

    this.input.on('pointerdown', function (pointer) {
        const touchX = Math.floor(pointer.x / tileSize);
        const touchY = Math.floor(pointer.y / tileSize);
        handleTouchInput(touchX, touchY);
    });

    [player, monster, fairy, castle].forEach(char => addBouncePulseAnimation(this, char));
}

function generateMap(scene, tileSize) {
    walls = scene.add.group();
    weapons = scene.add.group();

    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = Array(MAP_WIDTH).fill(GRASS);
        for (let x = 0; x < MAP_WIDTH; x++) {
            scene.add.text(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, GRASS, { fontSize: `${tileSize * 0.7}px` }).setOrigin(0.5);
        }
    }

    placeElements(scene, walls, WALL, 15, tileSize);
    placeElements(scene, weapons, WEAPON, 1, tileSize);

    castle = createEmojiSprite(scene, getRandomEmptyPosition(), CASTLE, tileSize);
    player = createEmojiSprite(scene, getRandomEmptyPosition(), PLAYER, tileSize);
    monster = createEmojiSprite(scene, getRandomEmptyPosition(), MONSTER, tileSize);
    fairy = createEmojiSprite(scene, getRandomEmptyPosition(), FAIRY, tileSize);
}

function getRandomEmptyPosition() {
    let x, y;
    do {
        x = Phaser.Math.Between(0, MAP_WIDTH - 1);
        y = Phaser.Math.Between(0, MAP_HEIGHT - 1);
    } while (map[y][x] !== GRASS);
    return { x, y };
}

function createEmojiSprite(scene, position, emoji, tileSize) {
    const text = scene.add.text(position.x * tileSize + tileSize / 2, position.y * tileSize + tileSize / 2, emoji, { fontSize: `${tileSize * 0.7}px` }).setOrigin(0.5);
    text.gridX = position.x;
    text.gridY = position.y;
    return text;
}

function placeElements(scene, group, emoji, count, tileSize) {
    for (let i = 0; i < count; i++) {
        const position = getRandomEmptyPosition();
        map[position.y][position.x] = emoji;
        const element = scene.add.text(position.x * tileSize + tileSize / 2, position.y * tileSize + tileSize / 2, emoji, { fontSize: `${tileSize * 0.7}px` }).setOrigin(0.5);
        element.gridX = position.x;
        element.gridY = position.y;
        group.add(element);
    }
}

function addBouncePulseAnimation(scene, sprite) {
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

function update() {
    if (!canMove || isGameOver) return;

    let dx = 0;
    let dy = 0;

    if (cursors.left.isDown) dx = -1;
    else if (cursors.right.isDown) dx = 1;
    else if (cursors.up.isDown) dy = -1;
    else if (cursors.down.isDown) dy = 1;

    if (dx !== 0 || dy !== 0) {
        movePlayer(player.gridX + dx, player.gridY + dy);
    }
}

function handleTouchInput(touchX, touchY) {
    if (!canMove || isGameOver) return;

    const dx = touchX - player.gridX;
    const dy = touchY - player.gridY;

    const [primaryDir, secondaryDir] = Math.abs(dx) > Math.abs(dy) 
        ? [{ x: Math.sign(dx), y: 0 }, { x: 0, y: Math.sign(dy) }]
        : [{ x: 0, y: Math.sign(dy) }, { x: Math.sign(dx), y: 0 }];

    if (canMoveTo(player.gridX + primaryDir.x, player.gridY + primaryDir.y)) {
        movePlayer(player.gridX + primaryDir.x, player.gridY + primaryDir.y);
    } else if (canMoveTo(player.gridX + secondaryDir.x, player.gridY + secondaryDir.y)) {
        movePlayer(player.gridX + secondaryDir.x, player.gridY + secondaryDir.y);
    }
}

function canMoveTo(x, y) {
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && map[y][x] !== WALL;
}

function movePlayer(newX, newY) {
    if (!canMoveTo(newX, newY)) return;

    canMove = false;
    const tileSize = config.scale.width / MAP_WIDTH;
    
    player.scene.tweens.add({
        targets: player,
        x: newX * tileSize + tileSize / 2,
        y: newY * tileSize + tileSize / 2,
        duration: 200,
        ease: 'Linear',
        onComplete: () => {
            player.gridX = newX;
            player.gridY = newY;
            checkCollisions();
            moveMonster();
            moveFairy();
            canMove = true;
        }
    });
}

function moveCharacter(character, newX, newY) {
    const tileSize = config.scale.width / MAP_WIDTH;
    character.scene.tweens.add({
        targets: character,
        x: newX * tileSize + tileSize / 2,
        y: newY * tileSize + tileSize / 2,
        duration: 200,
        ease: 'Linear',
        onComplete: () => {
            character.gridX = newX;
            character.gridY = newY;
        }
    });
}

function checkCollisions() {
    if (player.gridX === monster.gridX && player.gridY === monster.gridY) fightMonster();
    if (player.gridX === fairy.gridX && player.gridY === fairy.gridY) captureFairy();
    if (player.gridX === castle.gridX && player.gridY === castle.gridY) enterCastle();

    weapons.children.entries.forEach(weapon => {
        if (player.gridX === weapon.gridX && player.gridY === weapon.gridY) {
            collectWeapon(weapon);
        }
    });
}

function moveMonster() {
    if (!isMonsterDefeated) {
        const dx = Phaser.Math.Clamp(player.gridX - monster.gridX, -1, 1);
        const dy = Phaser.Math.Clamp(player.gridY - monster.gridY, -1, 1);
        
        if (canMoveTo(monster.gridX + dx, monster.gridY + dy)) {
            moveCharacter(monster, monster.gridX + dx, monster.gridY + dy);
        }
        checkCollisions();
    }
}

function moveFairy() {
    if (!isFairyCaptured) {
        let bestMove = { x: fairy.gridX, y: fairy.gridY };
        let maxDistance = 0;

        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                
                const newX = fairy.gridX + dx;
                const newY = fairy.gridY + dy;
                
                if (canMoveTo(newX, newY)) {
                    const distanceToPlayer = Math.abs(newX - player.gridX) + Math.abs(newY - player.gridY);
                    if (distanceToPlayer > maxDistance) {
                        maxDistance = distanceToPlayer;
                        bestMove = { x: newX, y: newY };
                    }
                }
            }
        }

        if (bestMove.x !== fairy.gridX || bestMove.y !== fairy.gridY) {
            moveCharacter(fairy, bestMove.x, bestMove.y);
        }
    }
}

function collectWeapon(weapon) {
    weapon.destroy();
    inventory.push(WEAPON);
    updateInventory();
    updateStory("You found a weapon! Now you can face the monster!");
}

function fightMonster() {
    if (inventory.includes(WEAPON) && !isMonsterDefeated) {
        monster.destroy();
        isMonsterDefeated = true;
        inventory = inventory.filter(item => item !== WEAPON);
        updateInventory();
        updateStory("You defeated the monster! Now capture the fairy and reach the castle!");
    } else if (!isMonsterDefeated) {
        player.setText(SKULL);
        isGameOver = true;
        canMove = false;
        updateStory("Oh no! The monster caught you. Game Over!");
        setTimeout(() => { location.reload(); }, 3000);
    }
}

function captureFairy() {
    if (!isFairyCaptured) {
        fairy.destroy();
        isFairyCaptured = true;
        updateStory("You captured the fairy! Now reach the castle to win!");
    }
}

function enterCastle() {
    if (isMonsterDefeated && isFairyCaptured) {
        updateStory("Congratulations! You've completed your quest!");
        isGameOver = true;
        canMove = false;
    } else {
        let message = "You need to ";
        if (!isMonsterDefeated) message += "defeat the monster ";
        if (!isMonsterDefeated && !isFairyCaptured) message += "and ";
        if (!isFairyCaptured) message += "capture the fairy ";
        message += "before entering the castle!";
        updateStory(message);
    }
}

function updateStory(message) {
    document.getElementById('story').textContent = message;
}

function updateInventory() {
    document.getElementById('inventory').textContent = 'Inventory: ' + (inventory.length > 0 ? inventory.join(', ') : 'Empty');
}