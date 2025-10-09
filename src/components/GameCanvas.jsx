import { useEffect } from "react";

const GameCanvas = ({
  canvasRef,
  gameState,
  gameData,
  images,
  sounds,
  theme,
  isDark,
  bgGradients,
  bgGradientIndex,
  setScore,
  setBgGradientIndex,
  gameOver,
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const groundY = canvas.height - 120;
    gameData.current.groundY = groundY;

    const draw = () => {
      if (gameState !== "playing") return;

      const { dino, obstacles, birds, ground, speed, frame } = gameData.current;

      // Clear canvas
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      const currentGradient = bgGradients[bgGradientIndex];
      gradient.addColorStop(0, currentGradient.color1);
      gradient.addColorStop(1, currentGradient.color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = theme.groundColor;
      ctx.fillRect(0, groundY + 50, canvas.width, 50);

      // Ground pattern
      ctx.strokeStyle = isDark ? "#1a1a2e" : "#6b5d4f";
      ctx.lineWidth = 2;
      for (let i = 0; i < canvas.width + 40; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i - ground, groundY + 50);
        ctx.lineTo(i - ground, groundY + 100);
        ctx.stroke();
      }

      // Update dino
      dino.vy += gameData.current.gravity;
      dino.y += dino.vy;

      if (dino.y >= groundY) {
        dino.y = groundY;
        dino.vy = 0;
        dino.jumping = false;
      }

      // Draw dino với sprite
      let currentSprite = null;

      if (dino.ducking) {
        currentSprite = images.current.playerDuck;
      } else if (dino.jumping) {
        currentSprite = images.current.playerJump;
      } else if (dino.y >= groundY) {
        currentSprite = images.current.playerRun;
      } else {
        currentSprite = images.current.playerIdle;
      }

      // Vẽ sprite nếu đã load xong
      if (currentSprite && currentSprite.complete) {
        const drawWidth = dino.ducking ? dino.width + 10 : dino.width;
        const drawHeight = dino.ducking ? dino.height - 5 : dino.height;
        const drawY = dino.ducking ? dino.y + 15 - 15 : dino.y - 15;

        ctx.drawImage(currentSprite, dino.x, drawY, drawWidth, drawHeight);
      } else {
        // Fallback: vẽ hình chữ nhật đơn giản
        ctx.fillStyle = theme.dinoColor;
        const drawHeight = dino.ducking ? dino.height - 20 : dino.height;
        const drawY = dino.ducking ? dino.y + 25 : dino.y;
        ctx.fillRect(dino.x, drawY, dino.width, drawHeight);
      }

      // Update obstacles
      if (frame % 70 === 0 && Math.random() > 0.2) {
        obstacles.push({
          x: canvas.width,
          y: groundY + 20,
          width: 20 + Math.random() * 30,
          height: 30 + Math.random() * 40,
          type: "cactus",
        });
      }

      // Update birds
      if (frame % 120 === 0 && Math.random() > 0.5) {
        const randomHeight = Math.random();
        birds.push({
          x: canvas.width,
          y:
            randomHeight < 0.3
              ? groundY - 20 - Math.random() * 30
              : groundY - 50 - Math.random() * 100,
          width: 45,
          height: 30,
          wingUp: true,
        });
      }

      // Draw and update obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= speed;

        ctx.fillStyle = theme.obstacleColor;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Cactus spikes
        ctx.fillRect(obs.x + obs.width * 0.3, obs.y - 10, 8, 10);
        ctx.fillRect(obs.x + obs.width * 0.7, obs.y - 8, 8, 10);

        // Collision detection
        if (
          dino.x < obs.x + obs.width &&
          dino.x + (dino.ducking ? dino.width + 10 : dino.width) > obs.x &&
          dino.y + (dino.ducking ? 25 : 0) < obs.y + obs.height &&
          dino.y + dino.height > obs.y
        ) {
          gameOver();
        }

        if (obs.x + obs.width < 0) {
          obstacles.splice(i, 1);
          setScore((s) => {
            const newScore = s + 10;
            const crossedHundred =
              Math.floor(s / 100) < Math.floor(newScore / 100);
            if (crossedHundred) {
              sounds.current.score();
              setBgGradientIndex((prev) => (prev + 1) % bgGradients.length);
            }
            return newScore;
          });
        }
      }

      // Draw and update birds
      for (let i = birds.length - 1; i >= 0; i--) {
        const bird = birds[i];
        bird.x -= speed + 2;
        bird.wingUp = Math.floor(frame / 5) % 2 === 0;

        ctx.fillStyle = theme.birdColor;

        // Bird body
        ctx.fillRect(bird.x + 15, bird.y + 10, 20, 12);

        // Bird head
        ctx.fillRect(bird.x + 30, bird.y + 8, 15, 14);

        // Bird eye
        ctx.fillStyle = "#000";
        ctx.fillRect(bird.x + 38, bird.y + 12, 4, 4);

        // Bird wings
        ctx.fillStyle = theme.birdColor;
        const wingY = bird.wingUp ? bird.y : bird.y + 15;
        ctx.fillRect(bird.x + 5, wingY, 15, 8);
        ctx.fillRect(bird.x + 30, wingY, 15, 8);

        // Collision detection
        if (
          dino.x < bird.x + bird.width &&
          dino.x + (dino.ducking ? dino.width + 10 : dino.width) > bird.x &&
          dino.y + (dino.ducking ? 25 : 0) < bird.y + bird.height &&
          dino.y + dino.height > bird.y
        ) {
          gameOver();
        }

        if (bird.x + bird.width < 0) {
          birds.splice(i, 1);
          setScore((s) => {
            const newScore = s + 15;
            const crossedHundred =
              Math.floor(s / 100) < Math.floor(newScore / 100);
            if (crossedHundred) {
              sounds.current.score();
              setBgGradientIndex((prev) => (prev + 1) % bgGradients.length);
            }
            return newScore;
          });
        }
      }

      // Update ground scroll
      gameData.current.ground = (ground + speed) % 40;

      // Increase speed over time
      if (frame % 100 === 0) {
        const targetSpeed = 6 + (setScore / 100) * 0.5;
        if (speed < targetSpeed && speed < 18) {
          gameData.current.speed = Math.min(targetSpeed, 18);
        }
      }

      // HARDCORE MODE - Multiple difficulty increases
      if (frame % 180 === 0) {
        if (speed < 16) {
          gameData.current.speed += 0.8;
        }

        if (gameData.current.gravity < 1.2) {
          gameData.current.gravity += 0.02;
        }

        if (gameData.current.jumpPower > -18) {
          gameData.current.jumpPower -= 0.3;
        }
      }

      gameData.current.frame++;
    };

    const gameLoop = setInterval(draw, 1000 / 60);

    return () => {
      clearInterval(gameLoop);
    };
  }, [
    gameState,
    theme,
    isDark,
    bgGradients,
    bgGradientIndex,
    setScore,
    setBgGradientIndex,
    gameOver,
    gameData,
    images,
    sounds,
    canvasRef,
  ]);
};

export default GameCanvas;
