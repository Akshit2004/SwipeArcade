import React, { useEffect, useRef, useState, useCallback } from 'react';
import './Spaceshooter.css';

const SpaceShooter = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    lives: 3,
    gameOver: false,
    paused: false
  });

  // Game objects
  const player = useRef({
    x: 400,
    y: 500,
    width: 60,
    height: 40,
    speed: 5,
    health: 100
  });

  const bullets = useRef([]);
  const enemies = useRef([]);
  const particles = useRef([]);
  const stars = useRef([]);
  const powerUps = useRef([]);
  const enemyBullets = useRef([]);
  const audioContext = useRef(null);

  // Sound effects
  const playSound = useCallback((frequency, duration, type = 'sine', volume = 0.1) => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);
    
    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  }, []);

  // Initialize stars for background
  const initStars = useCallback(() => {
    stars.current = [];
    for (let i = 0; i < 100; i++) {
      stars.current.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 0.5
      });
    }
  }, []);

  // Create particle effect
  const createParticles = (x, y, color = '#ff4444', count = 8) => {
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30,
        maxLife: 30,
        color,
        size: Math.random() * 4 + 2
      });
    }
  };

  // Spawn enemies
  const spawnEnemy = useCallback(() => {
    const types = ['basic', 'fast', 'heavy'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let enemy = {
      x: Math.random() * 740,
      y: -50,
      type,
      health: type === 'heavy' ? 3 : type === 'fast' ? 1 : 2,
      maxHealth: type === 'heavy' ? 3 : type === 'fast' ? 1 : 2,
      lastShot: 0
    };

    switch (type) {
      case 'basic':
        enemy = { ...enemy, width: 40, height: 30, speed: 2, color: '#ff6666' };
        break;
      case 'fast':
        enemy = { ...enemy, width: 30, height: 25, speed: 4, color: '#66ff66' };
        break;
      case 'heavy':
        enemy = { ...enemy, width: 50, height: 40, speed: 1, color: '#6666ff' };
        break;
    }

    enemies.current.push(enemy);
  }, []);

  // Spawn power-up
  const spawnPowerUp = (x, y) => {
    if (Math.random() < 0.3) { // 30% chance
      powerUps.current.push({
        x,
        y,
        width: 25,
        height: 25,
        speed: 2,
        type: Math.random() < 0.5 ? 'health' : 'multishot',
        rotation: 0
      });
    }
  };

  // Input handling
  const keys = useRef({});

  const handleKeyDown = useCallback((e) => {
    keys.current[e.code] = true;
    
    if (e.code === 'Space') {
      e.preventDefault();
      if (!gameState.gameOver && !gameState.paused) {
        // Shoot bullet
        bullets.current.push({
          x: player.current.x + player.current.width / 2 - 2,
          y: player.current.y,
          width: 4,
          height: 15,
          speed: 8,
          damage: 1
        });
        
        // Play shoot sound
        playSound(800, 0.1, 'square', 0.05);
      }
    }
    
    if (e.code === 'KeyP') {
      setGameState(prev => ({ ...prev, paused: !prev.paused }));
    }
    
    if (e.code === 'KeyR' && gameState.gameOver) {
      restartGame();
    }
  }, [gameState.gameOver, gameState.paused]);

  const handleKeyUp = useCallback((e) => {
    keys.current[e.code] = false;
  }, []);

  const restartGame = () => {
    setGameState({
      score: 0,
      level: 1,
      lives: 3,
      gameOver: false,
      paused: false
    });
    
    player.current = {
      x: 400,
      y: 500,
      width: 60,
      height: 40,
      speed: 5,
      health: 100
    };
    
    bullets.current = [];
    enemies.current = [];
    particles.current = [];
    powerUps.current = [];
    enemyBullets.current = [];
    initStars();
  };

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState.gameOver || gameState.paused) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Clear canvas with gradient background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#000011');
    bgGradient.addColorStop(0.5, '#000033');
    bgGradient.addColorStop(1, '#000055');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    stars.current.forEach(star => {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.size / 3})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
      star.y += star.speed;
      if (star.y > canvas.height) {
        star.y = -star.size;
        star.x = Math.random() * canvas.width;
      }
    });

    // Player movement
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
      player.current.x = Math.max(0, player.current.x - player.current.speed);
    }
    if (keys.current['ArrowRight'] || keys.current['KeyD']) {
      player.current.x = Math.min(canvas.width - player.current.width, player.current.x + player.current.speed);
    }
    if (keys.current['ArrowUp'] || keys.current['KeyW']) {
      player.current.y = Math.max(0, player.current.y - player.current.speed);
    }
    if (keys.current['ArrowDown'] || keys.current['KeyS']) {
      player.current.y = Math.min(canvas.height - player.current.height, player.current.y + player.current.speed);
    }

    // Draw player with glow effect and detailed spaceship
    ctx.save();
    
    // Engine trail effect
    ctx.shadowColor = '#00aaff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(player.current.x + 15, player.current.y + 35, 10, 20);
    ctx.fillRect(player.current.x + 35, player.current.y + 35, 10, 20);
    
    // Main body
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(player.current.x + 10, player.current.y + 10, 40, 25);
    
    // Cockpit
    ctx.shadowBlur = 5;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.current.x + 20, player.current.y + 5, 20, 15);
    
    // Wings
    ctx.fillStyle = '#0088cc';
    ctx.fillRect(player.current.x, player.current.y + 15, 15, 20);
    ctx.fillRect(player.current.x + 45, player.current.y + 15, 15, 20);
    
    // Weapon pods
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(player.current.x + 5, player.current.y + 8, 6, 8);
    ctx.fillRect(player.current.x + 49, player.current.y + 8, 6, 8);
    
    ctx.restore();

    // Update and draw bullets with trail effect
    bullets.current = bullets.current.filter(bullet => {
      bullet.y -= bullet.speed;
      
      // Bullet trail
      ctx.save();
      ctx.shadowColor = '#ffff00';
      ctx.shadowBlur = 8;
      
      // Main bullet
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      
      // Bullet glow core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bullet.x + 1, bullet.y + 2, bullet.width - 2, bullet.height - 4);
      
      ctx.restore();
      
      return bullet.y > -bullet.height;
    });

    // Update and draw enemy bullets
    enemyBullets.current = enemyBullets.current.filter(bullet => {
      bullet.y += bullet.speed;
      
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 5;
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      ctx.shadowBlur = 0;
      
      // Check collision with player
      if (bullet.x < player.current.x + player.current.width &&
          bullet.x + bullet.width > player.current.x &&
          bullet.y < player.current.y + player.current.height &&
          bullet.y + bullet.height > player.current.y) {
        player.current.health -= 10;
        playSound(300, 0.2, 'triangle', 0.07); // Hit sound
        createParticles(bullet.x, bullet.y, '#ff4444');
        
        if (player.current.health <= 0) {
          setGameState(prev => {
            const newLives = prev.lives - 1;
            if (newLives <= 0) {
              return { ...prev, gameOver: true };
            } else {
              player.current.health = 100;
              return { ...prev, lives: newLives };
            }
          });
        }
        return false;
      }
      
      return bullet.y < canvas.height + bullet.height;
    });

    // Spawn enemies
    if (Math.random() < 0.02 + gameState.level * 0.005) {
      spawnEnemy();
    }

    // Update and draw enemies
    enemies.current = enemies.current.filter(enemy => {
      enemy.y += enemy.speed;
      
      // Enemy shooting
      const now = Date.now();
      if (now - enemy.lastShot > 2000 && Math.random() < 0.01) {
        enemyBullets.current.push({
          x: enemy.x + enemy.width / 2 - 2,
          y: enemy.y + enemy.height,
          width: 4,
          height: 10,
          speed: 3
        });
        enemy.lastShot = now;
      }
      
      // Draw enemy with enhanced design
      ctx.save();
      ctx.shadowColor = enemy.color;
      ctx.shadowBlur = 8;
      
      // Main body
      ctx.fillStyle = enemy.color;
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      
      // Enemy details based on type
      if (enemy.type === 'heavy') {
        // Armor plating
        ctx.fillStyle = '#444444';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, enemy.width - 10, enemy.height - 10);
        // Weapons
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(enemy.x - 2, enemy.y + 10, 6, 8);
        ctx.fillRect(enemy.x + enemy.width - 4, enemy.y + 10, 6, 8);
      } else if (enemy.type === 'fast') {
        // Streamlined design
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(enemy.x + 10, enemy.y + 8, enemy.width - 20, enemy.height - 16);
        // Engine glow
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(enemy.x + 8, enemy.y + enemy.height - 5, 4, 8);
        ctx.fillRect(enemy.x + enemy.width - 12, enemy.y + enemy.height - 5, 4, 8);
      } else {
        // Basic enemy details
        ctx.fillStyle = '#990000';
        ctx.fillRect(enemy.x + 8, enemy.y + 8, enemy.width - 16, enemy.height - 16);
      }
      
      // Health bar
      const healthPercent = enemy.health / enemy.maxHealth;
      ctx.fillStyle = '#333';
      ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
      ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
      ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
      
      ctx.restore();
      
      // Check collision with bullets
      bullets.current = bullets.current.filter(bullet => {
        if (bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y) {
          
          enemy.health -= bullet.damage;
          createParticles(bullet.x, bullet.y, enemy.color);
          
          if (enemy.health <= 0) {
            createParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#ffff00', 12);
            playSound(200, 0.3, 'sawtooth', 0.08); // Explosion sound
            setGameState(prev => ({ 
              ...prev, 
              score: prev.score + (enemy.type === 'heavy' ? 30 : enemy.type === 'fast' ? 20 : 10)
            }));
            spawnPowerUp(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            return false; // Remove enemy
          }
          
          return false; // Remove bullet
        }
        return true;
      });
      
      return enemy.y < canvas.height + enemy.height && enemy.health > 0;
    });

    // Update and draw power-ups
    powerUps.current = powerUps.current.filter(powerUp => {
      powerUp.y += powerUp.speed;
      powerUp.rotation += 0.1;
      
      ctx.save();
      ctx.translate(powerUp.x + powerUp.width/2, powerUp.y + powerUp.height/2);
      ctx.rotate(powerUp.rotation);
      
      ctx.fillStyle = powerUp.type === 'health' ? '#00ff00' : '#ffaa00';
      ctx.shadowColor = powerUp.type === 'health' ? '#00ff00' : '#ffaa00';
      ctx.shadowBlur = 10;
      ctx.fillRect(-powerUp.width/2, -powerUp.height/2, powerUp.width, powerUp.height);
      
      ctx.shadowBlur = 0;
      ctx.restore();
      
      // Check collision with player
      if (powerUp.x < player.current.x + player.current.width &&
          powerUp.x + powerUp.width > player.current.x &&
          powerUp.y < player.current.y + player.current.height &&
          powerUp.y + powerUp.height > player.current.y) {
        
        if (powerUp.type === 'health') {
          player.current.health = Math.min(100, player.current.health + 25);
        }
        playSound(600, 0.2, 'sine', 0.06); // Power-up sound
        createParticles(powerUp.x, powerUp.y, '#00ff00');
        return false;
      }
      
      return powerUp.y < canvas.height + powerUp.height;
    });

    // Update and draw particles
    particles.current = particles.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
      ctx.fillRect(particle.x, particle.y, particle.size * alpha, particle.size * alpha);
      
      return particle.life > 0;
    });

    // Draw UI with enhanced styling
    ctx.save();
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 20px Orbitron, monospace';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 5;
    ctx.fillText(`SCORE: ${gameState.score.toLocaleString()}`, 10, 30);
    ctx.fillText(`LEVEL: ${gameState.level}`, 10, 55);
    ctx.fillText(`LIVES: ${gameState.lives}`, 10, 80);
    
    // Enhanced health bar
    ctx.shadowBlur = 3;
    ctx.fillStyle = '#333333';
    ctx.fillRect(10, 85, 202, 17);
    ctx.fillStyle = '#000000';
    ctx.fillRect(11, 86, 200, 15);
    
    const healthPercent = player.current.health / 100;
    const healthGradient = ctx.createLinearGradient(11, 86, 211, 86);
    healthGradient.addColorStop(0, healthPercent > 0.5 ? '#00ff00' : '#ff0000');
    healthGradient.addColorStop(0.5, healthPercent > 0.25 ? '#88ff00' : '#ff8800');
    healthGradient.addColorStop(1, healthPercent > 0.5 ? '#00ff00' : '#ff0000');
    
    ctx.fillStyle = healthGradient;
    ctx.fillRect(11, 86, 200 * healthPercent, 15);
    
    // Health text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Orbitron, monospace';
    ctx.shadowBlur = 2;
    ctx.fillText(`HULL: ${player.current.health}%`, 15, 97);
    
    ctx.restore();
    
    // Level progression
    if (gameState.score > gameState.level * 500) {
      setGameState(prev => ({ ...prev, level: prev.level + 1 }));
    }
  }, [gameState, spawnEnemy]);

  useEffect(() => {
    initStars();
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    gameRef.current = setInterval(gameLoop, 1000 / 60); // 60 FPS
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameRef.current) {
        clearInterval(gameRef.current);
      }
    };
  }, [gameLoop, handleKeyDown, handleKeyUp, initStars]);

  return (
    <div className="space-shooter-container">
      <h2 className="game-title">
        🚀 GALACTIC DEFENDER 🚀
      </h2>
      
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="game-canvas"
      />
      
      <div>
        {gameState.gameOver && (
          <div className="game-status game-over">
            GAME OVER! Press R to restart
          </div>
        )}
        
        {gameState.paused && (
          <div className="game-status game-paused">
            PAUSED - Press P to continue
          </div>
        )}
        
        <div className="game-controls">
          <div>🎮 CONTROLS:</div>
          <div>WASD/Arrow Keys: Move Ship</div>
          <div>Spacebar: Fire Weapons</div>
          <div>P: Pause Game</div>
          <div>R: Restart (when game over)</div>
          <br />
          <div>🎯 OBJECTIVES:</div>
          <div>• Destroy enemy ships for points</div>
          <div>• Collect power-ups for advantages</div>
          <div>• Survive waves to advance levels</div>
          <div>• Achieve the highest score possible</div>
        </div>
      </div>
    </div>
  );
};

SpaceShooter.rules = [
  'Use arrow keys or WASD to move your spaceship.',
  'Press Spacebar to shoot.',
  'Destroy all enemy ships to advance to the next level.',
  'Avoid enemy fire and obstacles.',
  'Collect power-ups for special abilities.',
  'Survive as long as possible to achieve a high score.'
];

export default SpaceShooter;
