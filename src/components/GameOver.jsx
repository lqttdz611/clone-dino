import { RotateCcw } from "lucide-react";

const GameOver = ({ score, highScore, startGame }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
      <h2 className="text-5xl font-bold text-red-500 mb-4">GAME OVER</h2>
      <p className="text-3xl text-white mb-2">Score: {score}</p>
      {score === highScore && score > 0 && (
        <p className="text-2xl text-yellow-400 mb-4">🏆 NEW HIGH SCORE! 🏆</p>
      )}
      <button
        onClick={startGame}
        className="flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xl font-bold shadow-lg transition-all transform hover:scale-105"
      >
        <RotateCcw size={28} /> PLAY AGAIN
      </button>
      <p className="text-white mt-4 text-sm">Press ENTER to restart</p>
    </div>
  );
};

export default GameOver;
