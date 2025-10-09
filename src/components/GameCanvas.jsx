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
        ctx.fillStyle = theme.dinoColor;
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

      // Update obstacles - Tối ưu hóa spawn logic
      if (frame % 70 === 0 && Math.random() > 0.2) {
        const obstacleTypes = [1, 2, 3, 4];
        const randomType = obstacleTypes[Math.floor(Math.random() * 4)];

        // Kích thước hiển thị khác nhau cho từng loại obstacle
        const obstacleSizes = {
          1: { displayWidth: 80, displayHeight: 100 }, // Obstacle1 lớn nhất
          2: { displayWidth: 85, displayHeight: 95 }, // Obstacle2 lớn
          3: { displayWidth: 60, displayHeight: 70 }, // Obstacle3 bình thường
          4: { displayWidth: 80, displayHeight: 100 }, // Obstacle4 lớn nhất
        };

        // 40% cơ hội tạo khối obstacle lớn (2 obstacles cạnh nhau)
        if (Math.random() < 0.4) {
          // Khối obstacle lớn
          const secondType =
            obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          const size1 = obstacleSizes[randomType];
          const size2 = obstacleSizes[secondType];

          obstacles.push({
            x: canvas.width,
            y: groundY,
            width: 80, // Hitbox width gấp đôi cho khối lớn
            height: 50, // Hitbox height giữ nguyên
            displayWidth: Math.max(size1.displayWidth, size2.displayWidth), // Lấy kích thước lớn nhất
            displayHeight: Math.max(size1.displayHeight, size2.displayHeight), // Lấy kích thước lớn nhất
            type: randomType, // Obstacle đầu tiên
            secondType: secondType, // Obstacle thứ hai
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
      // Update birds - Kiểm tra khoảng cách với obstacles (tối ưu hóa)
      if (frame % 120 === 0 && Math.random() > 0.5) {
        // Kiểm tra có obstacle nào gần không (giảm khoảng cách từ 400px xuống 200px)
        let hasNearbyObstacle = false;
        for (let i = 0; i < obstacles.length; i++) {
          const obs = obstacles[i];
          if (obs.x > canvas.width - 200 && obs.x < canvas.width + 50) {
            hasNearbyObstacle = true;
            break; // Thoát sớm khi tìm thấy
          }
        }

        // Nếu có obstacle gần, giảm cơ hội spawn chim (không hoàn toàn 0%)
        if (hasNearbyObstacle && Math.random() > 0.1) {
          return; // Chỉ 10% cơ hội spawn chim khi có obstacle gần
        }

        // Kiểm tra có bird nào gần không (giảm khoảng cách từ 200px xuống 150px)
        let hasNearbyBird = false;
        for (let i = 0; i < birds.length; i++) {
          const bird = birds[i];
          if (bird.x > canvas.width - 150 && bird.x < canvas.width + 50) {
            hasNearbyBird = true;
            break; // Thoát sớm khi tìm thấy
          }
        }

        // Nếu có bird gần, giảm cơ hội spawn chim mới
        if (hasNearbyBird && Math.random() > 0.3) {
          return; // 30% cơ hội spawn chim mới
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

        // Chọn ảnh tương ứng
        let obstacleImage = null;
        if (obs.type === 1) {
          obstacleImage = images.current.obstacle1;
        } else if (obs.type === 2) {
          obstacleImage = images.current.obstacle2;
        } else if (obs.type === 3) {
          obstacleImage = images.current.obstacle3;
        } else if (obs.type === 4) {
          obstacleImage = images.current.obstacle4;
        }

        // Vẽ obstacle từ ảnh với kích thước hiển thị lớn hơn
        if (obstacleImage && obstacleImage.complete) {
          if (obs.isLarge) {
            // Khối obstacle lớn - vẽ 2 obstacles cạnh nhau
            const secondObstacleImage =
              obs.secondType === 1
                ? images.current.obstacle1
                : obs.secondType === 2
                ? images.current.obstacle2
                : obs.secondType === 3
                ? images.current.obstacle3
                : images.current.obstacle4;

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
          ctx.fillStyle = theme.obstacleColor;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }

        // Collision detection - Chỉ kiểm tra khi obstacle gần dino (tối ưu hóa)
        if (obs.x < dino.x + 100 && obs.x + obs.width > dino.x - 50) {
          if (
            dino.x < obs.x + obs.width &&
            dino.x + (dino.ducking ? dino.width + 10 : dino.width) > obs.x &&
            dino.y + (dino.ducking ? 25 : 0) < obs.y + obs.height &&
            dino.y + dino.height > obs.y
          ) {
            gameOver();
          }
        }

        if (obs.x + obs.width < 0) {
          obstacles.splice(i, 1);
          setScore((s) => {
            const newScore = s + (obs.isLarge ? 25 : 10); // Khối lớn cho 25 điểm, đơn cho 10 điểm
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

        // Collision detection - Chỉ kiểm tra khi bird gần dino (tối ưu hóa)
        if (bird.x < dino.x + 100 && bird.x + bird.width > dino.x - 50) {
          if (
            dino.x < birdHitbox.x + birdHitbox.width &&
            dino.x + (dino.ducking ? dino.width + 10 : dino.width) >
              birdHitbox.x &&
            dino.y + (dino.ducking ? 25 : 0) <
              birdHitbox.y + birdHitbox.height &&
            dino.y + dino.height > birdHitbox.y
          ) {
            gameOver();
          }
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
