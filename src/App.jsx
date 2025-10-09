import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import GameCanvas from "./components/GameCanvas";
import GameHeader from "./components/GameHeader";
import GameMenu from "./components/GameMenu";
import GameOver from "./components/GameOver";
import Leaderboard from "./components/Leaderboard";
import SettingsPanel from "./components/SettingsPanel";
import { useGameLogic } from "./hooks/useGameLogic";

const DinoGame = () => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDark, setIsDark] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [playerName, setPlayerName] = useState("");
  const lastTouchTime = useRef(0);

  // Game logic hook
  const {
    gameState,
    score,
    setScore,
    highScore,
    setHighScore,
    bgGradientIndex,
    setBgGradientIndex,
    gameData,
    sounds,
    images,
    startGame,
    gameOver,
    jump,
    duck,
    standUp,
  } = useGameLogic();

  // Theme settings
  const [theme, setTheme] = useState({
    bgColor1: isDark ? "#1a1a2e" : "#87ceeb",
    bgColor2: isDark ? "#16213e" : "#b0e0e6",
    groundColor: isDark ? "#0f3460" : "#8b7355",
    dinoColor: "#00ff88",
    obstacleColor: "#ff006e",
    birdColor: "#ffbe0b",
  });

  const bgGradients = useMemo(
    () => [
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
    ],
    [isDark]
  );

  const updateTheme = (key, value) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const handleGameOver = useCallback(() => {
    gameOver(playerName, leaderboard, setLeaderboard);
  }, [gameOver, playerName, leaderboard, setLeaderboard]);
  const handleFullscreen = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container) return;

    // Detect iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      // iOS Solution: Maximize canvas and hide UI elements
      const isMaximized = container.classList.contains("ios-maximized");

      if (!isMaximized) {
        // Enter "maximize" mode
        container.classList.add("ios-maximized");

        // Hide header temporarily
        const header = container.querySelector(".game-header");
        if (header) header.style.display = "none";

        // Make canvas larger
        if (canvas) {
          canvas.style.maxHeight = "80vh";
          canvas.style.transition = "all 0.3s ease";
        }

        // Hide address bar
        setTimeout(() => window.scrollTo(0, 1), 100);

        // Show exit button
        const exitBtn = document.createElement("button");
        exitBtn.innerHTML = "✕";
        exitBtn.className = "ios-exit-btn";
        exitBtn.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          width: 40px;
          height: 40px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 50%;
          font-size: 24px;
          z-index: 9999;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        exitBtn.onclick = () => handleFullscreen();
        document.body.appendChild(exitBtn);
      } else {
        // Exit "maximize" mode
        container.classList.remove("ios-maximized");

        // Show header
        const header = container.querySelector(".game-header");
        if (header) header.style.display = "flex";

        // Reset canvas size
        if (canvas) {
          canvas.style.maxHeight = "50vh";
        }

        // Remove exit button
        const exitBtn = document.querySelector(".ios-exit-btn");
        if (exitBtn) exitBtn.remove();
      }

      return;
    }

    // Android/Desktop fullscreen logic (giữ nguyên code cũ)
    const isFullscreenSupported = !!(
      document.fullscreenEnabled || document.webkitFullscreenEnabled
    );

    if (!isFullscreenSupported) {
      window.scrollTo(0, 1);
      return;
    }

    const isFullscreen = !!(
      document.fullscreenElement || document.webkitFullscreenElement
    );

    if (!isFullscreen) {
      const requestFullscreen =
        container.requestFullscreen || container.webkitRequestFullscreen;

      if (requestFullscreen) {
        requestFullscreen.call(container).catch((err) => {
          console.log("Fullscreen error:", err);
        });
      }
    } else {
      const exitFullscreen =
        document.exitFullscreen || document.webkitExitFullscreen;

      if (exitFullscreen) {
        exitFullscreen.call(document).catch(() => {});
      }
    }
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

  // Simple resize handler
  useEffect(() => {
    const handleResize = () => {
      // Simple resize - just trigger a re-render
      const canvas = canvasRef.current;
      if (canvas) {
        // Keep original canvas size
        canvas.width = 1000;
        canvas.height = 500;
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Preload audio files
    const jumpAudio = new Audio("./sounds/jump.mp3");
    const scoreAudio = new Audio("./sounds/score.mp3");
    const gameOverAudio = new Audio("./sounds/gameover.mp3");
    const highScoreAudio = new Audio("./sounds/highscore.mp3");

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

    // Load sprite image
    const playerSprite = new Image();
    playerSprite.src = "./dino_skin/all2.png";
    const playerDucking = new Image();
    playerDucking.src = "./dino_skin/ducking.png";
    images.current.playerRun = playerSprite;
    images.current.playerJump = playerSprite;
    images.current.playerDuck = playerDucking;
    images.current.playerIdle = playerSprite;

    const bgCloud = new Image();
    bgCloud.src = "./game_canvas/background.png";
    images.current.bgCloud = bgCloud;

    const bgCloud2 = new Image();
    bgCloud2.src = "./game_canvas/cloud2.png";
    images.current.bgCloud2 = bgCloud2;
    // Load saved data
    const saved = window.dinoHighScore || 0;
    if (saved) setHighScore(parseInt(saved));

    const birdSprite = new Image();
    birdSprite.src = "./game_canvas/bird.png";
    images.current.birdSprite = birdSprite;

    const obstacle1 = new Image();
    obstacle1.src = "./game_canvas/obs1.png";
    images.current.obstacle1 = obstacle1;

    const obstacle2 = new Image();
    obstacle2.src = "./game_canvas/obs2.png";
    images.current.obstacle2 = obstacle2;

    const obstacle3 = new Image();
    obstacle3.src = "./game_canvas/obs3.png";
    images.current.obstacle3 = obstacle3;

    const savedHighScore = localStorage.getItem("dinoHighScore") || 0;
    setHighScore(parseInt(savedHighScore, 10));

    const savedLeaderboard =
      JSON.parse(localStorage.getItem("dinoLeaderboard")) || [];
    setLeaderboard(savedLeaderboard);
  }, [setHighScore, setLeaderboard, sounds, images]);

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
  }, [gameState, jump, duck, standUp, startGame]);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 ${
        isDark ? "bg-gray-900" : "bg-blue-100"
      }`}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div className="w-full max-w-4xl" ref={containerRef}>
        {/* Header */}
        <GameHeader
          isDark={isDark}
          setIsDark={setIsDark}
          score={score}
          highScore={highScore}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          showLeaderboard={showLeaderboard}
          setShowLeaderboard={setShowLeaderboard}
          onFullscreen={handleFullscreen}
        />

        {/* Canvas */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={1000}
            height={500}
            onClick={gameState === "playing" ? jump : undefined}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const now = Date.now();
              if (
                gameState === "playing" &&
                now - lastTouchTime.current > 150
              ) {
                lastTouchTime.current = now;
                jump();
              }
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={`w-full h-auto max-h-[60vh] sm:max-h-[500px] rounded-lg shadow-2xl ${
              isDark
                ? "border-2 sm:border-4 border-gray-700"
                : "border-2 sm:border-4 border-white"
            }`}
            style={{
              aspectRatio: "1000/500",
              touchAction: "manipulation",
            }}
          />

          {/* Game Overlays */}
          {gameState === "menu" && (
            <GameMenu
              playerName={playerName}
              setPlayerName={setPlayerName}
              startGame={startGame}
            />
          )}

          {gameState === "gameover" && (
            <GameOver
              score={score}
              highScore={highScore}
              startGame={startGame}
            />
          )}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <SettingsPanel
            isDark={isDark}
            theme={theme}
            updateTheme={updateTheme}
          />
        )}

        {/* Leaderboard */}
        {showLeaderboard && (
          <Leaderboard isDark={isDark} leaderboard={leaderboard} />
        )}
      </div>

      {/* Game Canvas Logic */}
      {gameState === "playing" && (
        <GameCanvas
          canvasRef={canvasRef}
          gameState={gameState}
          gameData={gameData}
          images={images}
          sounds={sounds}
          theme={theme}
          isDark={isDark}
          bgGradients={bgGradients}
          score={score}
          bgGradientIndex={bgGradientIndex}
          setScore={setScore}
          setBgGradientIndex={setBgGradientIndex}
          gameOver={handleGameOver}
        />
      )}
    </div>
  );
};

export default DinoGame;
