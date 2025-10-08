import { Moon, Play, RotateCcw, Settings, Sun, Trophy } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const DinoGame = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("menu"); // menu, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const [bgGradientIndex, setBgGradientIndex] = useState(0);
  // Theme settings
  const [theme, setTheme] = useState({
    bgColor1: isDark ? "#1a1a2e" : "#87ceeb",
    bgColor2: isDark ? "#16213e" : "#b0e0e6",
    groundColor: isDark ? "#0f3460" : "#8b7355",
    dinoColor: "#00ff88",
    obstacleColor: "#ff006e",
    birdColor: "#ffbe0b",
  });
  const bgGradients = [
    // Gradient 1: Original
    {
      color1: isDark ? "#1a1a2e" : "#87ceeb",
      color2: isDark ? "#16213e" : "#b0e0e6",
    },
    // Gradient 2: Purple Dream
    {
      color1: isDark ? "#2d1b69" : "#ee9ca7",
      color2: isDark ? "#1a0f3d" : "#ffdde1",
    },
    // Gradient 3: Ocean Blue
    {
      color1: isDark ? "#0f2027" : "#56ccf2",
      color2: isDark ? "#203a43" : "#2f80ed",
    },
    // Gradient 4: Sunset Orange
    {
      color1: isDark ? "#36096d" : "#f83600",
      color2: isDark ? "#1a0033" : "#f9d423",
    },
    // Gradient 5: Forest Green
    {
      color1: isDark ? "#0a3d2c" : "#56ab2f",
      color2: isDark ? "#04160f" : "#a8e063",
    },
    // Gradient 6: Pink Paradise
    {
      color1: isDark ? "#4a1942" : "#f857a6",
      color2: isDark ? "#2d0a2b" : "#ff5858",
    },
  ];
  const gameLoop = useRef(null);
  const gameData = useRef({
    dino: {
      x: 50,
      y: 0,
      vy: 0,
      width: 40,
      height: 50,
      jumping: false,
      ducking: false,
    },
    obstacles: [],
    birds: [],
    ground: 0,
    speed: 6,
    frame: 0,
    gravity: 0.8,
    jumpPower: -15,
  });

  // Sound effects
  const sounds = useRef({
    jump: null,
    score: null,
    gameOver: null,
    highScore: null,
  });

  // Image assets
  const images = useRef({
    playerRun: null,
    playerJump: null,
    playerDuck: null,
    playerIdle: null,
  });
  const animationFrame = useRef(0);

  useEffect(() => {
    // Preload audio files
    const jumpAudio = new Audio("/sounds/jump.mp3");
    const scoreAudio = new Audio("/sounds/score.mp3");
    const gameOverAudio = new Audio("/sounds/gameover.mp3");
    const highScoreAudio = new Audio("/sounds/highscore.mp3");
    // Set volumes
    jumpAudio.volume = 0.3;
    scoreAudio.volume = 1.0;
    gameOverAudio.volume = 0.7;
    highScoreAudio.volume = 0.6;
    // Preload
    jumpAudio.load();
    scoreAudio.load();
    gameOverAudio.load();
    highScoreAudio.load();

    sounds.current.jump = () => {
      jumpAudio.currentTime = 0;
      jumpAudio.play().catch((e) => console.log("Audio play failed:", e));
    };

    sounds.current.score = () => {
      scoreAudio.currentTime = 0;
      scoreAudio.play().catch((e) => console.log("Audio play failed:", e));
    };

    sounds.current.gameOver = () => {
      gameOverAudio.currentTime = 0;
      gameOverAudio.play().catch((e) => console.log("Audio play failed:", e));
    };
    sounds.current.highScore = () => {
      highScoreAudio.currentTime = 0;
      highScoreAudio.play().catch((e) => console.log("Audio play failed:", e));
    };

    // Load 4 sprite images (1024x1024 each)
    const playerSprite = new Image();
    playerSprite.src = "/dino_skin/all2.png"; // Đường dẫn đến ảnh của bạn

    images.current.playerRun = playerSprite;
    images.current.playerJump = playerSprite;
    images.current.playerDuck = playerSprite;
    images.current.playerIdle = playerSprite;

    // Load saved data từ memory thay vì localStorage
    const saved = window.dinoHighScore || 0;
    if (saved) setHighScore(parseInt(saved));

    const savedLeaderboard = window.dinoLeaderboard || [];
    if (savedLeaderboard) setLeaderboard(savedLeaderboard);
  }, []);

  useEffect(() => {
    setTheme({
      bgColor1: isDark ? "#1a1a2e" : "#87ceeb",
      bgColor2: isDark ? "#16213e" : "#b0e0e6",
      groundColor: isDark ? "#0f3460" : "#8b7355",
      dinoColor: "#00ff88",
      obstacleColor: "#ff006e",
      birdColor: "#ffbe0b",
    });
  }, [isDark]);

  const updateTheme = (key, value) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const startGame = () => {
    const canvas = canvasRef.current;
    const groundY = canvas.height - 100;
    setBgGradientIndex(0);
    gameData.current = {
      dino: {
        x: 50,
        y: groundY,
        vy: 0,
        width: 60,
        height: 75,
        jumping: false,
        ducking: false,
      },
      obstacles: [],
      birds: [],
      ground: 0,
      speed: 6,
      frame: 0,
      gravity: 0.8,
      jumpPower: -15,
      groundY: groundY,
    };

    setScore(0);
    setGameState("playing");
  };

  const jump = useCallback(() => {
    const { dino, groundY } = gameData.current;
    if (!dino.jumping && dino.y >= groundY && !dino.ducking) {
      dino.vy = gameData.current.jumpPower;
      dino.jumping = true;
      sounds.current.jump();
    }
  }, []);

  const duck = useCallback(() => {
    const { dino, groundY } = gameData.current;
    if (!dino.jumping && dino.y >= groundY) {
      dino.ducking = true;
    }
  }, []);

  const standUp = useCallback(() => {
    gameData.current.dino.ducking = false;
  }, []);

  const gameOver = () => {
    setGameState("gameover");
    sounds.current.gameOver();

    if (score > highScore) {
      setHighScore(score);
      window.dinoHighScore = score;
    }

    // Update leaderboard
    if (playerName && score > 0) {
      const newLeaderboard = [
        ...leaderboard,
        { name: playerName, score, date: new Date().toLocaleDateString() },
      ]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      setLeaderboard(newLeaderboard);
      window.dinoLeaderboard = newLeaderboard;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const groundY = canvas.height - 100;
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

      // Draw dino với 4 sprite images riêng biệt
      let currentSprite = null;

      if (dino.ducking) {
        currentSprite = images.current.playerDuck;
      } else if (dino.jumping) {
        currentSprite = images.current.playerJump;
      } else if (dino.y >= groundY) {
        // Đang chạy trên mặt đất
        currentSprite = images.current.playerRun;
      } else {
        // Idle (fallback)
        currentSprite = images.current.playerIdle;
      }

      // Vẽ sprite nếu đã load xong
      if (currentSprite && currentSprite.complete) {
        const drawWidth = dino.ducking ? dino.width + 10 : dino.width;
        const drawHeight = dino.ducking ? dino.height - 5 : dino.height;
        const drawY = dino.ducking ? dino.y + 25 : dino.y;

        // Crop chỉ lấy nhân vật to (bỏ nhân vật nhỏ)
        ctx.drawImage(currentSprite, dino.x, drawY, drawWidth, drawHeight);
      } else {
        // Fallback: vẽ hình chữ nhật đơn giản nếu sprite chưa load
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
            if (newScore > highScore) {
              sounds.current.highScore();
            }
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
            if (newScore > highScore) {
              sounds.current.highScore();
            }
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
        const targetSpeed = 6 + (score / 100) * 0.5;
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

    gameLoop.current = setInterval(draw, 1000 / 60);

    return () => {
      if (gameLoop.current) clearInterval(gameLoop.current);
    };
  }, [gameState, theme, gameOver, isDark]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameState === "playing") {
        if (e.code === "Space" || e.code === "ArrowUp") {
          e.preventDefault();
          jump();
        } else if (e.code === "ArrowDown") {
          e.preventDefault();
          duck();
        }
      } else if (gameState === "gameover" && e.code === "Enter") {
        startGame();
      }
    };

    const handleKeyUp = (e) => {
      if (gameState === "playing" && e.code === "ArrowDown") {
        e.preventDefault();
        standUp();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, jump, duck, standUp]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 ${
        isDark ? "bg-gray-900" : "bg-blue-100"
      }`}
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4 items-center">
            <div
              className={`px-4 py-2 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Score
              </p>
              <p
                className={`text-2xl font-bold ${
                  isDark ? "text-green-400" : "text-green-600"
                }`}
              >
                {score}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-lg ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-lg`}
            >
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                High Score
              </p>
              <p
                className={`text-2xl font-bold ${
                  isDark ? "text-yellow-400" : "text-yellow-600"
                }`}
              >
                {highScore}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className={`p-3 rounded-lg ${
                isDark
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-100"
              } shadow-lg transition-all`}
            >
              <Trophy
                className={isDark ? "text-yellow-400" : "text-yellow-600"}
                size={24}
              />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-3 rounded-lg ${
                isDark
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-100"
              } shadow-lg transition-all`}
            >
              <Settings
                className={isDark ? "text-gray-400" : "text-gray-600"}
                size={24}
              />
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-3 rounded-lg ${
                isDark
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-white hover:bg-gray-100"
              } shadow-lg transition-all`}
            >
              {isDark ? (
                <Sun className="text-yellow-400" size={24} />
              ) : (
                <Moon className="text-blue-600" size={24} />
              )}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            onClick={gameState === "playing" ? jump : undefined}
            className={`w-full rounded-lg shadow-2xl ${
              isDark ? "border-4 border-gray-700" : "border-4 border-white"
            }`}
          />

          {/* Menu Overlay */}
          {gameState === "menu" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
              <h1 className="text-6xl font-bold text-white mb-4">
                DINO RUNNER
              </h1>

              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-64 px-4 py-2 rounded-lg mb-4 text-center text-lg bg-gray-700 text-white border border-gray-500 placeholder:text-gray-400"
                maxLength={15}
              />

              <button
                onClick={startGame}
                className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xl font-bold shadow-lg transition-all transform hover:scale-105"
              >
                <Play size={28} /> START GAME
              </button>

              <p className="text-white mt-4 text-sm">
                Press SPACE or ARROW UP to jump
              </p>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === "gameover" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
              <h2 className="text-5xl font-bold text-red-500 mb-4">
                GAME OVER
              </h2>
              <p className="text-3xl text-white mb-2">Score: {score}</p>
              {score === highScore && score > 0 && (
                <p className="text-2xl text-yellow-400 mb-4">
                  🏆 NEW HIGH SCORE! 🏆
                </p>
              )}
              <button
                onClick={startGame}
                className="flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xl font-bold shadow-lg transition-all transform hover:scale-105"
              >
                <RotateCcw size={28} /> PLAY AGAIN
              </button>
              <p className="text-white mt-4 text-sm">Press ENTER to restart</p>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div
            className={`mt-4 p-6 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Theme Settings
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(theme).map(([key, value]) => (
                <div key={key}>
                  <label
                    className={`block text-sm mb-1 capitalize ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => updateTheme(key, e.target.value)}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {showLeaderboard && (
          <div
            className={`mt-4 p-6 rounded-lg ${
              isDark ? "bg-gray-800" : "bg-white"
            } shadow-lg`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              🏆 Leaderboard
            </h3>
            {leaderboard.length === 0 ? (
              <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                No scores yet. Play to set a record!
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center p-3 rounded ${
                      isDark ? "bg-gray-700" : "bg-gray-100"
                    } ${idx < 3 ? "border-2 border-yellow-400" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-2xl font-bold ${
                          idx === 0
                            ? "text-yellow-400"
                            : idx === 1
                            ? "text-gray-300"
                            : idx === 2
                            ? "text-orange-400"
                            : isDark
                            ? "text-gray-400"
                            : "text-gray-600"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className={`font-semibold ${
                          isDark ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {entry.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          isDark ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        {entry.score}
                      </p>
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {entry.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DinoGame;
