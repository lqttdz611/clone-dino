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
      if (frame % 200 === 0 && Math.random() > 0.1) {
        // 70% cơ hội spawn
        const cloudType = Math.random() > 0.5 ? "cloud1" : "cloud2"; // Random chọn loại mây
        gameData.current.clouds.push({
          x: canvas.width,
          y: 50 + Math.random() * 100, // Random từ y=50 đến y=150 (cao hơn)
          width: 80,
          height: 30,
          speed: 1 + Math.random() * 2, // Tốc độ bay chậm 1-3px/frame
          type: cloudType,
        });
      }
      // Draw and update clouds
      const clouds = gameData.current.clouds;
      for (let i = clouds.length - 1; i >= 0; i--) {
        const cloud = clouds[i];
        cloud.x -= cloud.speed;

        // Vẽ cloud từ ảnh dựa trên loại mây
        const cloudImage =
          cloud.type === "cloud1"
            ? images.current.bgCloud
            : images.current.bgCloud2;

        if (cloudImage && cloudImage.complete) {
          ctx.drawImage(
            cloudImage,
            cloud.x,
            cloud.y,
            cloud.width,
            cloud.height
          );
        } else {
          // Fallback: vẽ hình chữ nhật nếu ảnh chưa load
          ctx.fillStyle = isDark
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(0, 0, 0, 0.1)";
          ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
        }

        // Xóa cloud khi ra khỏi màn hình
        if (cloud.x + cloud.width < 0) {
          clouds.splice(i, 1);
        }
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

      // Update obstacles - Kiểm tra khoảng cách với birds
      if (frame % 70 === 0 && Math.random() > 0.2) {
        // Kiểm tra có bird nào gần không (trong vòng 300px)
        const hasNearbyBird = birds.some(
          (bird) => bird.x > canvas.width - 300 && bird.x < canvas.width + 150
        );

        // Nếu có bird gần, giảm cơ hội spawn obstacle
        if (hasNearbyBird && Math.random() > 0.1) {
          return; // Không spawn obstacle (chỉ 10% cơ hội)
        }

        obstacles.push({
          x: canvas.width,
          y: groundY + 20,
          width: 20 + Math.random() * 30,
          height: 30 + Math.random() * 40,
          type: "cactus",
        });
      }

      // Update birds - Kiểm tra khoảng cách với obstacles
      if (frame % 120 === 0 && Math.random() > 0.5) {
        // Kiểm tra có obstacle nào gần không (trong vòng 400px)
        const hasNearbyObstacle = obstacles.some(
          (obs) => obs.x > canvas.width - 400 && obs.x < canvas.width + 200
        );

        // Nếu có obstacle gần, KHÔNG spawn chim (0% cơ hội)
        if (hasNearbyObstacle) {
          return; // Không spawn chim
        }

        // Kiểm tra có bird nào gần không (tránh spawn nhiều bird cùng lúc)
        const hasNearbyBird = birds.some(
          (bird) => bird.x > canvas.width - 200 && bird.x < canvas.width + 100
        );

        // Nếu có bird gần, giảm cơ hội spawn chim mới
        if (hasNearbyBird && Math.random() > 0.2) {
          return; // Chỉ 20% cơ hội spawn chim mới
        }

        const randomHeight = Math.random();
        birds.push({
          x: canvas.width,
          y:
            randomHeight < 0.3
              ? groundY - 30 - Math.random() * 30 // Chim bay thấp: y = groundY-30 đến groundY-60
              : groundY - 80 - Math.random() * 120, // Chim bay cao: y = groundY-80 đến groundY-200
          width: 100,
          height: 100,
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

        // Vẽ bird từ ảnh
        if (images.current.birdSprite && images.current.birdSprite.complete) {
          ctx.drawImage(
            images.current.birdSprite,
            bird.x,
            bird.y,
            bird.width,
            bird.height
          );
        } else {
          // Fallback: vẽ hình chữ nhật nếu ảnh chưa load
          ctx.fillStyle = theme.birdColor;
          ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
        }

        // Collision detection - Điều chỉnh cho chim 100x100px
        const birdHitbox = {
          x: bird.x + 10, // Bỏ 10px từ trái
          y: bird.y + 10, // Bỏ 10px từ trên
          width: bird.width - 20, // Giảm 20px width
          height: bird.height - 20, // Giảm 20px height
        };

        if (
          dino.x < birdHitbox.x + birdHitbox.width &&
          dino.x + (dino.ducking ? dino.width + 10 : dino.width) >
            birdHitbox.x &&
          dino.y + (dino.ducking ? 25 : 0) < birdHitbox.y + birdHitbox.height &&
          dino.y + dino.height > birdHitbox.y
        ) {
          gameOver();
        }

        if (bird.x + bird.width < 0) {
          birds.splice(i, 1);
          setScore((s) => {
            const newScore = s + 20; // Tăng điểm từ 15 lên 20 cho chim lớn
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
