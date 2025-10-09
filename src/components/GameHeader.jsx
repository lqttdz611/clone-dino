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
    <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sm:mb-4 gap-2 sm:gap-0">
      <div className="flex gap-2 sm:gap-4 items-center">
        <div
          className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          <p
            className={`text-xs sm:text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Score
          </p>
          <p
            className={`text-lg sm:text-2xl font-bold ${
              isDark ? "text-green-400" : "text-green-600"
            }`}
          >
            {score}
          </p>
        </div>
        <div
          className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg ${
            isDark ? "bg-gray-800" : "bg-white"
          } shadow-lg`}
        >
          <p
            className={`text-xs sm:text-sm ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            High Score
          </p>
          <p
            className={`text-lg sm:text-2xl font-bold ${
              isDark ? "text-yellow-400" : "text-yellow-600"
            }`}
          >
            {highScore}
          </p>
        </div>
      </div>

      <div className="flex gap-1 sm:gap-2">
        <button
          onClick={onFullscreen}
          className={`p-2 sm:p-3 rounded-lg ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 active:bg-gray-600"
              : "bg-white hover:bg-gray-100 active:bg-gray-200"
          } shadow-lg transition-all touch-manipulation`}
          title="Fullscreen"
        >
          <Maximize
            className={isDark ? "text-blue-400" : "text-blue-600"}
            size={20}
          />
        </button>
        <button
          onClick={() => setShowLeaderboard(!showLeaderboard)}
          className={`p-2 sm:p-3 rounded-lg ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 active:bg-gray-600"
              : "bg-white hover:bg-gray-100 active:bg-gray-200"
          } shadow-lg transition-all touch-manipulation`}
        >
          <Trophy
            className={isDark ? "text-yellow-400" : "text-yellow-600"}
            size={20}
          />
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 sm:p-3 rounded-lg ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 active:bg-gray-600"
              : "bg-white hover:bg-gray-100 active:bg-gray-200"
          } shadow-lg transition-all touch-manipulation`}
        >
          <Settings
            className={isDark ? "text-gray-400" : "text-gray-600"}
            size={20}
          />
        </button>
        <button
          onClick={() => setIsDark(!isDark)}
          className={`p-2 sm:p-3 rounded-lg ${
            isDark
              ? "bg-gray-800 hover:bg-gray-700 active:bg-gray-600"
              : "bg-white hover:bg-gray-100 active:bg-gray-200"
          } shadow-lg transition-all touch-manipulation`}
        >
          {isDark ? (
            <Sun className="text-yellow-400" size={20} />
          ) : (
            <Moon className="text-blue-600" size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default GameHeader;
