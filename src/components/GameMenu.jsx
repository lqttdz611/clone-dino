import { Play } from "lucide-react";

const GameMenu = ({ playerName, setPlayerName, startGame }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg p-4">
      <h1 className="text-3xl sm:text-6xl font-bold text-white mb-4 text-center">
        DINO RUNNER
      </h1>

      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        className="w-full max-w-64 px-4 py-2 rounded-lg mb-4 text-center text-lg bg-gray-700 text-white border border-gray-500 placeholder:text-gray-400"
        maxLength={15}
      />

      <button
        onClick={startGame}
        className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-lg text-lg sm:text-xl font-bold shadow-lg transition-all transform hover:scale-105 active:scale-95 touch-manipulation"
      >
        <Play size={24} /> <span className="hidden sm:inline">START GAME</span>
        <span className="sm:hidden">START</span>
      </button>

      <p className="text-white mt-4 text-xs sm:text-sm text-center px-4">
        <span className="hidden sm:inline">
          Press SPACE or ARROW UP to jump
        </span>
        <span className="sm:hidden">Tap screen or SPACE to jump</span>
      </p>
    </div>
  );
};

export default GameMenu;
