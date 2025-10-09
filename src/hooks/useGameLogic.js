import { useCallback, useRef, useState } from "react";

export const useGameLogic = () => {
  const [gameState, setGameState] = useState("menu"); // menu, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [bgGradientIndex, setBgGradientIndex] = useState(0);

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
    clouds: [],
    ground: 0,
    speed: 8,
    frame: 0,
    gravity: 0.8,
    jumpPower: -18, // Tăng từ -15 lên -18 để nhảy cao hơn
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

  const startGame = useCallback(() => {
    setBgGradientIndex(0);
    gameData.current = {
      dino: {
        x: 50,
        y: 0,
        vy: 0,
        width: 60,
        height: 75,
        jumping: false,
        ducking: false,
      },
      obstacles: [],
      birds: [],
      clouds: [],
      ground: 0,
      speed: 8,
      frame: 0,
      gravity: 0.8,
      jumpPower: -15,
      score: 0, // Add score tracking to gameData
    };
    setScore(0);
    setGameState("playing");
  }, []);

  const gameOver = useCallback(
    (playerName, leaderboard, setLeaderboard) => {
      setGameState("gameover");
      sounds.current.gameOver();

      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem("dinoHighScore", score);
        sounds.current.highScore();
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
        localStorage.setItem("dinoLeaderboard", JSON.stringify(newLeaderboard));
      }
    },
    [score, highScore]
  );

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
    dino.ducking = true;

    // Nếu đang nhảy, lao xuống nhanh
    if (dino.jumping && dino.y < groundY) {
      dino.vy = 2; // Tốc độ rơi nhanh (số càng lớn rơi càng nhanh)
    }
  }, []);

  const standUp = useCallback(() => {
    gameData.current.dino.ducking = false;
  }, []);

  return {
    gameState,
    setGameState,
    score,
    setScore,
    highScore,
    setHighScore,
    bgGradientIndex,
    setBgGradientIndex,
    gameLoop,
    gameData,
    sounds,
    images,
    startGame,
    gameOver,
    jump,
    duck,
    standUp,
  };
};
