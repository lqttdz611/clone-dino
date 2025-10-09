import { Maximize, Moon, Settings, Sun, Trophy } from "lucide-react";

const GameHeader = ({
  isDark,
  setIsDark,
  score,
  highScore,
  showSettings,
  setShowSettings,
  showLeaderboard,
  setShowLeaderboard,
  onFullscreen,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex gap-4 items-center">
        <div
          className={`px-4 py-2 rounded-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          <p
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
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
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
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
          onClick={onFullscreen}
          className={`p-3 rounded-lg ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700"
              : "bg-white hover:bg-gray-100"
          } shadow-lg transition-all`}
          title="Fullscreen"
        >
          <Maximize
            className={isDark ? "text-blue-400" : "text-blue-600"}
            size={24}
          />
        </button>
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
  );
};

export default GameHeader;
