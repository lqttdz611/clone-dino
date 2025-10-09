import { Play } from "lucide-react";

const GameMenu = ({ playerName, setPlayerName, startGame }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
      <h1 className="text-6xl font-bold text-white mb-4">DINO RUNNER</h1>

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

      <p className="text-white mt-4 text-sm">Press SPACE or ARROW UP to jump</p>
    </div>
  );
};

export default GameMenu;
