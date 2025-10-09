import { useEffect, useRef } from "react";

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
  const animationFrameId = useRef(null);
  const gameLoopRef = useRef(null);

  // Store dynamic values in refs to avoid dependency issues
  const dynamicRefs = useRef({
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
  });

  // Update refs when props change
  dynamicRefs.current = {
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
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== "playing") {
      // Dừng vòng lặp cũ nếu có
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const ctx = canvas.getContext("2d");
    const groundY = canvas.height - 120;
    dynamicRefs.current.gameData.current.groundY = groundY;

    const draw = () => {
      // Nếu không phải đang chơi, dừng lại
      if (gameState !== "playing") return;

      const { dino, obstacles, birds, ground, speed, frame } =
        dynamicRefs.current.gameData.current;

      // Clear canvas
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      const currentGradient =
        dynamicRefs.current.bgGradients[dynamicRefs.current.bgGradientIndex];
      gradient.addColorStop(0, currentGradient.color1);
      gradient.addColorStop(1, currentGradient.color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ground
      ctx.fillStyle = dynamicRefs.current.theme.groundColor;
      ctx.fillRect(0, groundY + 50, canvas.width, 50);

      // Ground pattern
      ctx.strokeStyle = dynamicRefs.current.isDark ? "#1a1a2e" : "#6b5d4f";
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
        dynamicRefs.current.gameData.current.clouds.push({
          x: canvas.width,
          y: 50 + Math.random() * 100, // Random từ y=50 đến y=150 (cao hơn)
          width: 80,
          height: 30,
          speed: 1 + Math.random() * 2, // Tốc độ bay chậm 1-3px/frame
          type: cloudType,
        });
      }
      // Draw and update clouds
      const clouds = dynamicRefs.current.gameData.current.clouds;
      for (let i = clouds.length - 1; i >= 0; i--) {
        const cloud = clouds[i];
        cloud.x -= cloud.speed;

        // Vẽ cloud từ ảnh dựa trên loại mây
        const cloudImage =
          cloud.type === "cloud1"
            ? dynamicRefs.current.images.current.bgCloud
            : dynamicRefs.current.images.current.bgCloud2;

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
          ctx.fillStyle = dynamicRefs.current.isDark
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
      dino.vy += dynamicRefs.current.gameData.current.gravity;
      dino.y += dino.vy;

      if (dino.y >= groundY) {
        dino.y = groundY;
        dino.vy = 0;
        dino.jumping = false;
      }

      // Draw dino với sprite
      let currentSprite = null;

      if (dino.ducking) {
        currentSprite = dynamicRefs.current.images.current.playerDuck;
      } else if (dino.jumping) {
        currentSprite = dynamicRefs.current.images.current.playerJump;
      } else if (dino.y >= groundY) {
        currentSprite = dynamicRefs.current.images.current.playerRun;
      } else {
        currentSprite = dynamicRefs.current.images.current.playerIdle;
      }

      // Vẽ sprite nếu đã load xong
      if (currentSprite && currentSprite.complete) {
        if (dino.ducking) {
          // Dino ducking với kích thước hiển thị lớn hơn
          const displayWidth = dino.width + 50; // Tăng width từ +10 lên +20
          const displayHeight = dino.height + 10; // Tăng height từ -5 lên +10
          const displayX = dino.x - (displayWidth - dino.width) / 2; // Căn giữa
          const displayY = dino.y + 15 - 15 - 5; // Điều chỉnh Y position

          ctx.drawImage(
            currentSprite,
            displayX,
            displayY,
            displayWidth,
            displayHeight
          );
        } else {
          // Dino bình thường
          ctx.drawImage(
            currentSprite,
            dino.x,
            dino.y - 15,
            dino.width,
            dino.height
          );
        }
      } else {
        // Fallback: vẽ hình chữ nhật đơn giản
        ctx.fillStyle = dynamicRefs.current.theme.dinoColor;
        if (dino.ducking) {
          // Fallback cho ducking với kích thước lớn hơn
          const fallbackWidth = dino.width + 30;
          const fallbackHeight = dino.height + 20;
          const fallbackX = dino.x - (fallbackWidth - dino.width) / 2;
          const fallbackY = dino.y + 25 - 5;
          ctx.fillRect(fallbackX, fallbackY, fallbackWidth, fallbackHeight);
        } else {
          // Fallback cho dino bình thường
          ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        }
      }

      // Update obstacles - Dynamic spawn rate based on score
      const currentScore = dynamicRefs.current.gameData.current.score || 0;
      let obstacleSpawnRate = 90; // Default spawn rate
      let obstacleSpawnChance = 0.4; // Default spawn chance

      // Adjust spawn rate based on score milestones
      if (currentScore >= 1000) {
        obstacleSpawnRate = 70; // Faster spawning
        obstacleSpawnChance = 0.55; // More frequent
      } else if (currentScore >= 800) {
        obstacleSpawnRate = 75; // Faster spawning
        obstacleSpawnChance = 0.5; // More frequent
      } else if (currentScore >= 500) {
        obstacleSpawnRate = 80; // Faster spawning
        obstacleSpawnChance = 0.45; // More frequent
      }

      if (
        frame % obstacleSpawnRate === 0 &&
        Math.random() > obstacleSpawnChance
      ) {
        const obstacleTypes = [1, 2, 3];
        const randomType = obstacleTypes[Math.floor(Math.random() * 3)];

        // Kích thước hiển thị khác nhau cho từng loại obstacle
        const obstacleSizes = {
          1: { displayWidth: 80, displayHeight: 100 }, // Obstacle1 lớn nhất
          2: { displayWidth: 85, displayHeight: 95 }, // Obstacle2 lớn
          3: { displayWidth: 80, displayHeight: 100 }, // Obstacle3 lớn nhất
        };

        // Dynamic large obstacle chance based on score
        let largeObstacleChance = 0.25; // Default chance
        if (currentScore >= 1000) {
          largeObstacleChance = 0.35; // More large obstacles at high score
        } else if (currentScore >= 800) {
          largeObstacleChance = 0.3; // More large obstacles
        } else if (currentScore >= 500) {
          largeObstacleChance = 0.28; // Slightly more large obstacles
        }

        if (Math.random() < largeObstacleChance) {
          // Khối obstacle lớn - chỉ cho phép obstacle1 và obstacle3
          let firstType, secondType;
          if (Math.random() > 0.5) {
            firstType = 1; // obstacle1
            secondType = 3; // obstacle3
          } else {
            firstType = 3; // obstacle3
            secondType = 1; // obstacle1
          }

          const size1 = obstacleSizes[firstType];
          const size2 = obstacleSizes[secondType];

          obstacles.push({
            x: canvas.width,
            y: groundY,
            width: 80, // Hitbox width gấp đôi cho khối lớn
            height: 50, // Hitbox height giữ nguyên
            displayWidth: Math.max(size1.displayWidth, size2.displayWidth), // Lấy kích thước lớn nhất
            displayHeight: Math.max(size1.displayHeight, size2.displayHeight), // Lấy kích thước lớn nhất
            type: firstType, // Obstacle đầu tiên (1 hoặc 3)
            secondType: secondType, // Obstacle thứ hai (3 hoặc 1)
            isLarge: true,
          });
        } else {
          // Obstacle đơn
          const size = obstacleSizes[randomType];

          obstacles.push({
            x: canvas.width,
            y: groundY,
            width: 40, // Hitbox width (giữ nguyên cho collision)
            height: 50, // Hitbox height (giữ nguyên cho collision)
            displayWidth: size.displayWidth, // Kích thước hiển thị theo loại
            displayHeight: size.displayHeight, // Kích thước hiển thị theo loại
            type: randomType, // 1, 2, hoặc 3
            isLarge: false,
          });
        }
      }
      // Update birds - Dynamic spawn rate based on score
      let birdSpawnRate = 150; // Default spawn rate
      let birdSpawnChance = 0.6; // Default spawn chance

      // Adjust bird spawn rate based on score milestones
      if (currentScore >= 1000) {
        birdSpawnRate = 120; // Faster spawning
        birdSpawnChance = 0.7; // More frequent
      } else if (currentScore >= 800) {
        birdSpawnRate = 130; // Faster spawning
        birdSpawnChance = 0.65; // More frequent
      } else if (currentScore >= 500) {
        birdSpawnRate = 140; // Faster spawning
        birdSpawnChance = 0.62; // More frequent
      }

      if (frame % birdSpawnRate === 0 && Math.random() > birdSpawnChance) {
        // Kiểm tra có obstacle nào gần không (early return optimization)
        let hasNearbyObstacle = false;
        for (let i = 0; i < obstacles.length; i++) {
          const obs = obstacles[i];
          if (obs.x > canvas.width - 300) {
            hasNearbyObstacle = true;
            break;
          }
        }

        // Nếu có obstacle gần, giảm cơ hội spawn chim
        if (hasNearbyObstacle && Math.random() > 0.2) {
          return;
        }

        // Kiểm tra có bird nào gần không (early return optimization)
        let hasNearbyBird = false;
        for (let i = 0; i < birds.length; i++) {
          const bird = birds[i];
          if (bird.x > canvas.width - 250) {
            hasNearbyBird = true;
            break;
          }
        }

        // Nếu có bird gần, giảm cơ hội spawn chim mới
        if (hasNearbyBird && Math.random() > 0.4) {
          return;
        }

        const randomHeight = Math.random();
        birds.push({
          x: canvas.width,
          y:
            randomHeight < 0.3
              ? groundY - 30 - Math.random() * 30
              : groundY - 80 - Math.random() * 120,
          width: 80, // Giảm kích thước bird
          height: 80,
          wingUp: true,
        });
      }

      // Draw and update obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= speed;

        // Chọn ảnh tương ứng
        let obstacleImage = null;
        if (obs.type === 1) {
          obstacleImage = dynamicRefs.current.images.current.obstacle1;
        } else if (obs.type === 2) {
          obstacleImage = dynamicRefs.current.images.current.obstacle2;
        } else if (obs.type === 3) {
          obstacleImage = dynamicRefs.current.images.current.obstacle3;
        }

        // Vẽ obstacle từ ảnh với kích thước hiển thị lớn hơn
        if (obstacleImage && obstacleImage.complete) {
          if (obs.isLarge) {
            // Khối obstacle lớn - vẽ 2 obstacles cạnh nhau
            const secondObstacleImage =
              obs.secondType === 1
                ? dynamicRefs.current.images.current.obstacle1
                : obs.secondType === 2
                ? dynamicRefs.current.images.current.obstacle2
                : obs.secondType === 3
                ? dynamicRefs.current.images.current.obstacle3
                : dynamicRefs.current.images.current.obstacle1;

            if (secondObstacleImage && secondObstacleImage.complete) {
              // Vẽ obstacle đầu tiên
              const displayX1 = obs.x - (obs.displayWidth - obs.width) / 2;
              const displayY1 = obs.y - (obs.displayHeight - obs.height) / 2;
              ctx.drawImage(
                obstacleImage,
                displayX1,
                displayY1,
                obs.displayWidth,
                obs.displayHeight
              );

              // Vẽ obstacle thứ hai bên cạnh
              const displayX2 =
                obs.x + obs.width / 2 - (obs.displayWidth - obs.width) / 2;
              const displayY2 = obs.y - (obs.displayHeight - obs.height) / 2;
              ctx.drawImage(
                secondObstacleImage,
                displayX2,
                displayY2,
                obs.displayWidth,
                obs.displayHeight
              );
            }
          } else {
            // Obstacle đơn
            const displayX = obs.x - (obs.displayWidth - obs.width) / 2;
            const displayY = obs.y - (obs.displayHeight - obs.height) / 2;
            ctx.drawImage(
              obstacleImage,
              displayX,
              displayY,
              obs.displayWidth,
              obs.displayHeight
            );
          }
        } else {
          // Fallback: vẽ hình chữ nhật nếu ảnh chưa load
          ctx.fillStyle = dynamicRefs.current.theme.obstacleColor;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }

        // Collision detection - Chỉ kiểm tra khi obstacle gần dino (tối ưu hóa)
        if (
          gameState === "playing" &&
          obs.x < dino.x + 100 &&
          obs.x + obs.width > dino.x - 50
        ) {
          if (
            dino.x < obs.x + obs.width &&
            dino.x + (dino.ducking ? dino.width + 20 : dino.width) > obs.x &&
            dino.y + (dino.ducking ? 30 : 0) < obs.y + obs.height &&
            dino.y + dino.height > obs.y
          ) {
            dynamicRefs.current.gameOver();
            return; // Dừng ngay sau khi gameOver để tránh multiple calls
          }
        }

        if (obs.x + obs.width < 0) {
          obstacles.splice(i, 1);
          const scoreIncrement = obs.isLarge ? 25 : 10;
          dynamicRefs.current.setScore((s) => {
            const newScore = s + scoreIncrement;
            // Update gameData score for speed calculation
            dynamicRefs.current.gameData.current.score = newScore;
            const crossedHundred =
              Math.floor(s / 100) < Math.floor(newScore / 100);
            if (crossedHundred) {
              dynamicRefs.current.sounds.current.score();
              dynamicRefs.current.setBgGradientIndex(
                (prev) => (prev + 1) % dynamicRefs.current.bgGradients.length
              );
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
        if (
          dynamicRefs.current.images.current.birdSprite &&
          dynamicRefs.current.images.current.birdSprite.complete
        ) {
          ctx.drawImage(
            dynamicRefs.current.images.current.birdSprite,
            bird.x,
            bird.y,
            bird.width,
            bird.height
          );
        } else {
          // Fallback: vẽ hình chữ nhật nếu ảnh chưa load
          ctx.fillStyle = dynamicRefs.current.theme.birdColor;
          ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
        }

        // Collision detection - Điều chỉnh cho chim 80x80px
        const birdHitbox = {
          x: bird.x + 10, // Bỏ 10px từ trái
          y: bird.y + 10, // Bỏ 10px từ trên
          width: bird.width - 20, // Giảm 20px width
          height: bird.height - 20, // Giảm 20px height
        };

        // Collision detection - Chỉ kiểm tra khi bird gần dino (tối ưu hóa)
        if (
          gameState === "playing" &&
          bird.x < dino.x + 100 &&
          bird.x + bird.width > dino.x - 50
        ) {
          if (
            dino.x < birdHitbox.x + birdHitbox.width &&
            dino.x + (dino.ducking ? dino.width + 20 : dino.width) >
              birdHitbox.x &&
            dino.y + (dino.ducking ? 30 : 0) <
              birdHitbox.y + birdHitbox.height &&
            dino.y + dino.height > birdHitbox.y
          ) {
            dynamicRefs.current.gameOver();
            return; // Dừng ngay sau khi gameOver để tránh multiple calls
          }
        }

        if (bird.x + bird.width < 0) {
          birds.splice(i, 1);
          dynamicRefs.current.setScore((s) => {
            const newScore = s + 15; // Reduced from 20
            // Update gameData score for speed calculation
            dynamicRefs.current.gameData.current.score = newScore;
            const crossedHundred =
              Math.floor(s / 100) < Math.floor(newScore / 100);
            if (crossedHundred) {
              dynamicRefs.current.sounds.current.score();
              dynamicRefs.current.setBgGradientIndex(
                (prev) => (prev + 1) % dynamicRefs.current.bgGradients.length
              );
            }
            return newScore;
          });
        }
      }

      // Update ground scroll
      dynamicRefs.current.gameData.current.ground = (ground + speed) % 40;

      // Increase speed over time - Fix setScore bug
      if (frame % 100 === 0) {
        // Get current score from gameData instead of setScore function
        const currentScore = dynamicRefs.current.gameData.current.score || 0;
        let targetSpeed = 6 + (currentScore / 100) * 0.5;

        // DIFFICULTY MILESTONES - Tăng độ khó theo điểm
        if (currentScore >= 1000) {
          targetSpeed += 4; // +4 speed boost at 1000 points
        } else if (currentScore >= 800) {
          targetSpeed += 3; // +3 speed boost at 800 points
        } else if (currentScore >= 500) {
          targetSpeed += 2; // +2 speed boost at 500 points
        }

        if (speed < targetSpeed && speed < 20) {
          // Increased max speed to 20
          dynamicRefs.current.gameData.current.speed = Math.min(
            targetSpeed,
            20
          );
        }
      }

      // HARDCORE MODE - Balanced difficulty increases
      if (frame % 300 === 0) {
        // Every 5 seconds instead of 3
        if (speed < 16) {
          dynamicRefs.current.gameData.current.speed += 0.4; // Reduced from 0.8
        }

        if (dynamicRefs.current.gameData.current.gravity < 1.2) {
          dynamicRefs.current.gameData.current.gravity += 0.01; // Reduced from 0.02
        }

        if (dynamicRefs.current.gameData.current.jumpPower > -18) {
          dynamicRefs.current.gameData.current.jumpPower -= 0.2; // Reduced from 0.3
        }
      }

      dynamicRefs.current.gameData.current.frame++;
    };

    gameLoopRef.current = setInterval(draw, 1000 / 60);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState]); // CHỈ giữ gameState - loại bỏ tất cả dependencies khác để tránh re-render không cần thiết
  return null;
};

export default GameCanvas;
