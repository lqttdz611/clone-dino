const Leaderboard = ({ isDark, leaderboard }) => {
  return (
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
  );
};

export default Leaderboard;
