import { MAP_WIDTH, MAP_HEIGHT } from './config.js';
import { playTalkSound } from './soundGenerator.js';

export class ChatBubble {
    constructor(scene, x, y, width, height, text) {
        this.scene = scene;
        this.bubble = scene.add.graphics({ x: x, y: y });
        this.text = scene.add.text(x + 10, y + 10, text, {
            fontSize: '14px',
            wordWrap: { width: width - 20 },
            align: 'center',
            color: '#000000'
        });

        this.width = width;
        this.height = height;

        this.draw();
        this.bubble.setDepth(1000);
        this.text.setDepth(1001);

        // Adjust position if it's beyond map boundaries
        this.adjustPosition();

        // Play talk sound
        playTalkSound(text);
    }

    draw() {
        this.bubble.clear();
        this.bubble.fillStyle(0xffffff, 1);
        this.bubble.lineStyle(2, 0x000000, 1);
        this.bubble.fillRoundedRect(0, 0, this.width, this.height, 10);
        this.bubble.strokeRoundedRect(0, 0, this.width, this.height, 10);
    }

    setPosition(x, y) {
        this.bubble.x = x;
        this.bubble.y = y;
        this.text.x = x + 10;
        this.text.y = y + 10;
        this.adjustPosition();
    }

    adjustPosition() {
        const tileSize = this.scene.scale.width / MAP_WIDTH;
        const maxX = this.scene.scale.width - this.width;
        const maxY = this.scene.scale.height - this.height;

        this.bubble.x = Math.max(0, Math.min(this.bubble.x, maxX));
        this.bubble.y = Math.max(0, Math.min(this.bubble.y, maxY));

        this.text.x = this.bubble.x + 10;
        this.text.y = this.bubble.y + 10;
    }

    destroy() {
        this.bubble.destroy();
        this.text.destroy();
    }
}

let activeBubbles = [];

export function createChatBubble(scene, character, text, duration = 2000) {
    const tileSize = scene.scale.width / MAP_WIDTH;
    
    // Remove any existing bubble for this character
    removeBubbleForCharacter(character);

    // Adjust position to avoid overlapping
    let bubbleY = character.y - tileSize * 2;
    while (isBubbleOverlapping(character.x - tileSize, bubbleY, tileSize * 3, tileSize)) {
        bubbleY -= tileSize / 2;
    }

    const bubble = new ChatBubble(
        scene,
        character.x - tileSize,
        bubbleY,
        tileSize * 3,
        tileSize,
        text
    );

    activeBubbles.push({ character, bubble });

    scene.time.delayedCall(duration, () => {
        removeBubbleForCharacter(character);
    });

    return bubble;
}

function removeBubbleForCharacter(character) {
    const index = activeBubbles.findIndex(item => item.character === character);
    if (index !== -1) {
        activeBubbles[index].bubble.destroy();
        activeBubbles.splice(index, 1);
    }
}

function isBubbleOverlapping(x, y, width, height) {
    return activeBubbles.some(item => {
        const bubble = item.bubble;
        return !(x + width < bubble.bubble.x || x > bubble.bubble.x + bubble.width ||
                 y + height < bubble.bubble.y || y > bubble.bubble.y + bubble.height);
    });
}