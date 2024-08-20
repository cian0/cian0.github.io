import React, { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../styles/EmojiBattleRoyale.module.css';

const EmojiBattleRoyale = () => {
  const gameContainerRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  // Game constants
  const GAME_CONFIG = useMemo(() => ({
    INITIAL_EMOJI_COUNT: 200,  // Reduced from 500
    MAX_SPEED: 300,  // Reduced from 500
    EMOJI_SIZE: 24,
    WORLD_WIDTH: 1600,  // Reduced from 2400
    WORLD_HEIGHT: 1200,  // Reduced from 1800
    SEPARATION_DISTANCE: 30,  // Increased from 20
    ALIGNMENT_DISTANCE: 50,  // Reduced from 60
    COHESION_DISTANCE: 70,  // Reduced from 80
    MAX_FORCE: 1.5,  // Reduced from 2
    WANDER_STRENGTH: 500,  // Reduced from 1000
    PREY_ATTRACTION_STRENGTH: 5000,  // Reduced from 10000
    POWER_UP_DURATION: 5000,
    POWER_UP_SPAWN_INTERVAL: 200,  // Increased from 100
    NINJA_POWER_UP_SPAWN_INTERVAL: 100,  // Increased from 50
    TILE_SIZE: 64,  // Increased from 48
    CELL_SIZE: 100  // Increased from 50
  }), []);

  const EMOJI_TYPES = useMemo(() => ['🗿', '📄', '✂️', '🔥', '💧', '🌱'], []);
  const POWER_UP_EMOJI = '⭐';
  const NINJA_POWER_UP_EMOJI = '🥷';

  const TERRAIN_TYPES = useMemo(() => ({
    ground: '🟫',
    grass: '🟩',
    water: '🟦',
    sand: '🟨',
    mountain: '⛰️'
  }), []);

  // Memoized game rules
  const GAME_RULES = useMemo(() => ({
    '🗿': ['✂️', '🔥'],
    '📄': ['🗿', '💧'],
    '✂️': ['📄', '🌱'],
    '🔥': ['📄', '🌱'],
    '💧': ['🔥', '🗿'],
    '🌱': ['💧', '✂️']
  }), []);

  useEffect(() => {
    if (typeof window !== 'undefined' && gameStarted) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.55.2/phaser.min.js';
      script.async = true;
      document.body.appendChild(script);

      script.onload = initGame;

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [gameStarted]);

  const initGame = () => {
    const config = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameContainerRef.current,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);

    const resizeGame = () => {
      game.scale.resize(gameContainerRef.current.clientWidth, gameContainerRef.current.clientHeight);
    };

    window.addEventListener('resize', resizeGame);
    resizeGame();

    return () => {
      window.removeEventListener('resize', resizeGame);
      game.destroy(true);
    };
  };

  // Game variables
  let emojis, powerUps, ninjaPowerUps, spatialHash = {}, emojiCounts = {};

  const preload = function() {
    // Preload is empty as we're using emoji characters
  };

  const create = function() {
    this.cameras.main.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
    this.physics.world.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);

    createTerrain(this);

    emojis = this.physics.add.group();
    powerUps = this.physics.add.group();
    ninjaPowerUps = this.physics.add.group();
    EMOJI_TYPES.forEach(type => emojiCounts[type] = 0);

    for (let i = 0; i < GAME_CONFIG.INITIAL_EMOJI_COUNT; i++) {
      createEmoji(this);
    }
    
    this.physics.add.collider(emojis, emojis, handleCollision, null, this);
    this.physics.add.overlap(emojis, ninjaPowerUps, handleNinjaPowerUpCollision, null, this);
    this.physics.add.overlap(emojis, powerUps, handlePowerUpCollision, null, this);

    const cameraTarget = this.add.circle(GAME_CONFIG.WORLD_WIDTH / 2, GAME_CONFIG.WORLD_HEIGHT / 2, 1, 0xffffff, 0);
    this.cameras.main.startFollow(cameraTarget, true, 0.05, 0.05);

    this.time.addEvent({
      delay: 5000,
      callback: updateCameraMovement,
      callbackScope: this,
      loop: true
    });

    this.time.addEvent({
      delay: 10000,
      callback: updateCameraZoom,
      callbackScope: this,
      loop: true
    });

    this.time.addEvent({
      delay: GAME_CONFIG.POWER_UP_SPAWN_INTERVAL,
      callback: () => spawnPowerUp(this),
      callbackScope: this,
      loop: true
    });

    this.time.addEvent({
      delay: GAME_CONFIG.NINJA_POWER_UP_SPAWN_INTERVAL,
      callback: () => spawnNinjaPowerUp(this),
      callbackScope: this,
      loop: true
    });
  };

  const update = function() {
    updateSpatialHash();

    emojis.getChildren().forEach(emoji => {
      if (emoji.active) {
        applyFlockingBehavior(emoji);
        
        emoji.x = Phaser.Math.Wrap(emoji.x, 0, GAME_CONFIG.WORLD_WIDTH);
        emoji.y = Phaser.Math.Wrap(emoji.y, 0, GAME_CONFIG.WORLD_HEIGHT);

        if (emoji.getData('ninjaPowerUp')) {
          emoji.setScale(1.8);
        } else if (emoji.getData('powerUp')) {
          emoji.setScale(1.5);
        } else {
          emoji.setScale(1);
        }
      }
    });

    this.physics.world.collide(emojis, emojis, handleCollision, null, this);

    if (this.time.now % 60 === 0) {  // Update debug info every 60 frames
      updateDebugInfo();
    }

    if (this.time.now % 300 === 0) {  // Check for winner every 300 frames
      const remainingTypes = Object.keys(emojiCounts).filter(type => emojiCounts[type] > 0);
      if (remainingTypes.length === 1) {
        setWinner(remainingTypes[0]);
        this.scene.pause();
      }
    }
  };

  // Helper functions for Emoji Battle Royale

const createTerrain = (scene) => {
    const { WORLD_WIDTH, WORLD_HEIGHT, TILE_SIZE } = GAME_CONFIG;
    const scale = 0.05;
    for (let x = 0; x < WORLD_WIDTH; x += TILE_SIZE) {
      for (let y = 0; y < WORLD_HEIGHT; y += TILE_SIZE) {
        const noiseValue = noise(x * scale, y * scale);
        const terrainType = getTerrainType(noiseValue);
        scene.add.text(x, y, terrainType, { fontSize: `${TILE_SIZE}px` }).setOrigin(0);
      }
    }
  };
  
  const getTerrainType = (noiseValue) => {
    if (noiseValue < -1.5) return TERRAIN_TYPES.water;
    if (noiseValue < -1.2) return TERRAIN_TYPES.mountain;
    if (noiseValue < -0.8) return TERRAIN_TYPES.sand;
    if (noiseValue < 2) return TERRAIN_TYPES.grass;
    return TERRAIN_TYPES.ground;
  };
  
  const createEmoji = (scene, x, y) => {
    const { WORLD_WIDTH, WORLD_HEIGHT, EMOJI_SIZE } = GAME_CONFIG;
    x = x || Phaser.Math.Between(0, WORLD_WIDTH);
    y = y || Phaser.Math.Between(0, WORLD_HEIGHT);
    const type = Phaser.Math.RND.pick(EMOJI_TYPES);
    
    const emoji = scene.add.text(x, y, type, { fontSize: '24px' }).setOrigin(0.5);
    scene.physics.add.existing(emoji);
    
    emoji.body.setCircle(EMOJI_SIZE / 2);
    emoji.body.setCollideWorldBounds(true);
    emoji.body.setBounce(1, 1);
    
    emoji.setData('type', type);
    emoji.setData('powerUp', false);
    emojis.add(emoji);
    emojiCounts[type]++;
    
    return emoji;
  };
  
  const spawnPowerUp = (scene) => {
    const { WORLD_WIDTH, WORLD_HEIGHT, EMOJI_SIZE } = GAME_CONFIG;
    const x = Phaser.Math.Between(0, WORLD_WIDTH);
    const y = Phaser.Math.Between(0, WORLD_HEIGHT);
    
    const powerUp = scene.add.text(x, y, POWER_UP_EMOJI, { fontSize: '24px' }).setOrigin(0.5);
    scene.physics.add.existing(powerUp);
    
    powerUp.body.setCircle(EMOJI_SIZE / 2);
    powerUps.add(powerUp);
  };
  
  const spawnNinjaPowerUp = (scene) => {
    const { WORLD_WIDTH, WORLD_HEIGHT, EMOJI_SIZE } = GAME_CONFIG;
    const x = Phaser.Math.Between(0, WORLD_WIDTH);
    const y = Phaser.Math.Between(0, WORLD_HEIGHT);
    
    const ninjaPowerUp = scene.add.text(x, y, NINJA_POWER_UP_EMOJI, { fontSize: '24px' }).setOrigin(0.5);
    scene.physics.add.existing(ninjaPowerUp);
    
    ninjaPowerUp.body.setCircle(EMOJI_SIZE / 2);
    ninjaPowerUps.add(ninjaPowerUp);
  };
  
  const handleNinjaPowerUpCollision = (emoji, ninjaPowerUp) => {
    const { POWER_UP_DURATION } = GAME_CONFIG;
    ninjaPowerUp.destroy();
    emoji.setData('ninjaPowerUp', true);
    
    emoji.scene.time.delayedCall(POWER_UP_DURATION, () => {
      emoji.setData('ninjaPowerUp', false);
    });
  };

  const handlePowerUpCollision = (emoji, powerUp) => {
    const { POWER_UP_DURATION } = GAME_CONFIG;
    powerUp.destroy();
    emoji.setData('powerUp', true);
    
    emoji.scene.time.delayedCall(POWER_UP_DURATION, () => {
      emoji.setData('powerUp', false);
    });
  };

  const handleCollision = (emoji1, emoji2) => {
    const type1 = emoji1.getData('type');
    const type2 = emoji2.getData('type');
  
    if (emoji1.getData('ninjaPowerUp')) {
      transformEmoji(emoji2, type1);
      applyRepulsionForce(emoji1, emoji2);
    } else if (emoji2.getData('ninjaPowerUp')) {
      transformEmoji(emoji1, type2);
      applyRepulsionForce(emoji2, emoji1);
    } else if (GAME_RULES[type1].includes(type2)) {
      if (!emoji2.getData('powerUp')) {
        transformEmoji(emoji2, type1);
        applyRepulsionForce(emoji1, emoji2);
      }
    } else if (GAME_RULES[type2].includes(type1)) {
      if (!emoji1.getData('powerUp')) {
        transformEmoji(emoji1, type2);
        applyRepulsionForce(emoji2, emoji1);
      }
    } else {
      applyRepulsionForce(emoji1, emoji2);
    }
  };
  
  const transformEmoji = (loser, winnerType) => {
    const loserType = loser.getData('type');
    emojiCounts[loserType]--;
    emojiCounts[winnerType]++;
    loser.setData('type', winnerType);
    loser.setText(winnerType);
  };
  
  const applyRepulsionForce = (emoji1, emoji2) => {
    const angle = Phaser.Math.Angle.Between(emoji1.x, emoji1.y, emoji2.x, emoji2.y);
    const repulsionForce = 1;
    emoji1.body.velocity.x -= Math.cos(angle) * repulsionForce;
    emoji1.body.velocity.y -= Math.sin(angle) * repulsionForce;
    emoji2.body.velocity.x += Math.cos(angle) * repulsionForce;
    emoji2.body.velocity.y += Math.sin(angle) * repulsionForce;
  };
  
  const updateSpatialHash = () => {
    spatialHash = {};
    const { CELL_SIZE } = GAME_CONFIG;
    emojis.getChildren().forEach(emoji => {
      const cellX = Math.floor(emoji.x / CELL_SIZE);
      const cellY = Math.floor(emoji.y / CELL_SIZE);
      const cellKey = `${cellX},${cellY}`;
      if (!spatialHash[cellKey]) {
        spatialHash[cellKey] = [];
      }
      spatialHash[cellKey].push(emoji);
    });
  };
  
  const applyFlockingBehavior = (emoji) => {
    const neighbors = findNeighbors(emoji);
    if (neighbors.length > 0) {
      const separation = separate(emoji, neighbors);
      const alignment = align(emoji, neighbors);
      const cohesion = cohere(emoji, neighbors);
      const wander = getWanderForce();
      const preyAttraction = getPrayAttractionForce(emoji);
    
      const { MAX_SPEED } = GAME_CONFIG;
    
      emoji.body.velocity.x += separation.x * 1.5 + alignment.x + cohesion.x + wander.x + preyAttraction.x;
      emoji.body.velocity.y += separation.y * 1.5 + alignment.y + cohesion.y + wander.y + preyAttraction.y;
    
      const speed = Math.sqrt(emoji.body.velocity.x ** 2 + emoji.body.velocity.y ** 2);
      if (speed > MAX_SPEED) {
        emoji.body.velocity.x = (emoji.body.velocity.x / speed) * MAX_SPEED;
        emoji.body.velocity.y = (emoji.body.velocity.y / speed) * MAX_SPEED;
      }
    }
  };
  
  const findNeighbors = (emoji) => {
    const { CELL_SIZE, COHESION_DISTANCE } = GAME_CONFIG;
    const cellX = Math.floor(emoji.x / CELL_SIZE);
    const cellY = Math.floor(emoji.y / CELL_SIZE);
    const neighbors = [];
  
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cellKey = `${cellX + dx},${cellY + dy}`;
        if (spatialHash[cellKey]) {
          spatialHash[cellKey].forEach(other => {
            if (other !== emoji && 
                Phaser.Math.Distance.Between(emoji.x, emoji.y, other.x, other.y) < COHESION_DISTANCE &&
                emoji.getData('type') === other.getData('type')) {
              neighbors.push(other);
            }
          });
        }
      }
    }
  
    return neighbors;
  };
  
  const separate = (emoji, neighbors) => {
    const steer = { x: 0, y: 0 };
    const { SEPARATION_DISTANCE } = GAME_CONFIG;
    neighbors.forEach(neighbor => {
      const distance = Phaser.Math.Distance.Between(emoji.x, emoji.y, neighbor.x, neighbor.y);
      if (distance < SEPARATION_DISTANCE) {
        const diff = { x: emoji.x - neighbor.x, y: emoji.y - neighbor.y };
        steer.x += diff.x / distance;
        steer.y += diff.y / distance;
      }
    });
    return limitForce(steer);
  };
  
  const align = (emoji, neighbors) => {
    const steer = { x: 0, y: 0 };
    if (neighbors.length > 0) {
      neighbors.forEach(neighbor => {
        steer.x += neighbor.body.velocity.x;
        steer.y += neighbor.body.velocity.y;
      });
      steer.x /= neighbors.length;
      steer.y /= neighbors.length;
    }
    return limitForce(steer);
  };
  
  const cohere = (emoji, neighbors) => {
    const steer = { x: 0, y: 0 };
    if (neighbors.length > 0) {
      neighbors.forEach(neighbor => {
        steer.x += neighbor.x;
        steer.y += neighbor.y;
      });
      steer.x /= neighbors.length;
      steer.y /= neighbors.length;
      steer.x -= emoji.x;
      steer.y -= emoji.y;
    }
    return limitForce(steer);
  };
  
  const limitForce = (force) => {
    const { MAX_FORCE } = GAME_CONFIG;
    const magnitude = Math.sqrt(force.x ** 2 + force.y ** 2);
    if (magnitude > MAX_FORCE) {
      force.x = (force.x / magnitude) * MAX_FORCE;
      force.y = (force.y / magnitude) * MAX_FORCE;
    }
    return force;
  };
  
  const getWanderForce = () => {
    const { WANDER_STRENGTH } = GAME_CONFIG;
    return {
      x: (Math.random() - 0.5) * WANDER_STRENGTH,
      y: (Math.random() - 0.5) * WANDER_STRENGTH
    };
  };
  
  const getPrayAttractionForce = (emoji) => {
    const target = findNearestPrey(emoji);
    if (target) {
      const dx = target.x - emoji.x;
      const dy = target.y - emoji.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const { PREY_ATTRACTION_STRENGTH } = GAME_CONFIG;
      return {
        x: (dx / distance) * PREY_ATTRACTION_STRENGTH,
        y: (dy / distance) * PREY_ATTRACTION_STRENGTH
      };
    }
    return { x: 0, y: 0 };
  };
  
  const findNearestPrey = (emoji) => {
    let nearestPrey = null;
    let shortestDistance = Infinity;
    const { CELL_SIZE } = GAME_CONFIG;
    const cellX = Math.floor(emoji.x / CELL_SIZE);
    const cellY = Math.floor(emoji.y / CELL_SIZE);
  
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cellKey = `${cellX + dx},${cellY + dy}`;
        if (spatialHash[cellKey]) {
          spatialHash[cellKey].forEach(otherEmoji => {
            if (emoji !== otherEmoji && GAME_RULES[emoji.getData('type')].includes(otherEmoji.getData('type'))) {
              const distance = Phaser.Math.Distance.Between(emoji.x, emoji.y, otherEmoji.x, otherEmoji.y);
              if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestPrey = otherEmoji;
              }
            }
          });
        }
      }
    }
  
    return nearestPrey;
  };
  
  const updateCameraMovement = function() {
    const { WORLD_WIDTH, WORLD_HEIGHT } = GAME_CONFIG;
    const newX = Phaser.Math.Between(0, WORLD_WIDTH);
    const newY = Phaser.Math.Between(0, WORLD_HEIGHT);
    this.cameras.main.pan(newX, newY, 5000, 'Sine.easeInOut');
  };
  
  const updateCameraZoom = function() {
    const newZoom = Phaser.Math.FloatBetween(0.5, 1.5);
    this.cameras.main.zoomTo(newZoom, 5000, 'Sine.easeInOut');
  };
  
  const updateDebugInfo = () => {
    let debugInfo = ['🔢 Emoji Counts:'];
    EMOJI_TYPES.forEach(type => {
      debugInfo.push(`  ${type}: ${emojiCounts[type]}`);
    });
    debugInfo.push(''); // Add an empty line for spacing
    debugInfo.push(`🦸 Active Emojis: ${emojis.countActive()}`);
    debugInfo.push(`⭐ Power-ups: ${powerUps.countActive()}`);
    debugInfo.push(`🥷 Ninja Power-ups: ${ninjaPowerUps.countActive()}`);
    setDebugInfo(debugInfo.join('\n'));
  };
  
  // Implement the Perlin noise function for terrain generation
//   const noise = (x, y) => {
//     // Implement Perlin noise algorithm here
//     // This is a placeholder implementation
//     return Math.sin(x * 0.1) * Math.cos(y * 0.1);
//   };

const p = new Array(512);
const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

for (let i = 0; i < 256; i++) {
    p[i] = p[i + 256] = permutation[i];
}

const grad = (hash, x, y) => {
    const h = hash & 15;
    const grad = 1 + (h & 7);
    return ((h & 8) ? -grad : grad) * x + ((h & 4) ? -grad : grad) * y;
}

  const noise = (x, y) => {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = fade(x);
    const v = fade(y);
    const A = p[X] + Y, B = p[X + 1] + Y;
    return lerp(v, lerp(u, grad(p[A], x, y), grad(p[B], x - 1, y)),
                   lerp(u, grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1)));
}

const lerp = (t, a, b) => { return a + t * (b - a); }
const fade = (t) => { return t * t * t * (t * (t * 6 - 15) + 10); }
  // ... (rest of the code remains the same)

  return (
    <div className={styles.retroContainer}>
      <div className={styles.retroPost}>
        <div className={styles.retroHeader}>
          🎮 Emoji Battle Royale 🏆
        </div>
        {!gameStarted ? (
          <div className={styles.retroSection}>
            <p className={styles.retroText}>Ready to enter the emoji arena?</p>
            <p className={styles.retroText}>New feature: Ninja power-up! 🥷 Defeat any emoji!</p>
            <button className={styles.retroButton} onClick={() => setGameStarted(true)}>
              🚀 Start Battle
            </button>
          </div>
        ) : (
          <>
            <div 
              ref={gameContainerRef} 
              className={styles.gameContainer}
              style={{ width: '100%', height: 'calc(100vh - 200px)', maxHeight: '600px' }}
            ></div>
            <div className={styles.retroSection}>
              <pre className={styles.debugInfo}>{debugInfo}</pre>
            </div>
            {winner && (
              <div className={styles.retroSection}>
                <p className={styles.retroText}>{winner} Wins the Battle!</p>
              </div>
            )}
          </>
        )}
        <div className={styles.retroSection}>
          <Link href="/" className={styles.retroButton}>
            🏠 Return to Cyberhome
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmojiBattleRoyale;
