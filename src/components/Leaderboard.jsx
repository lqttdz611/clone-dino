const Leaderboard = ({ isDark, leaderboard }) => {
  const formatDateTime = (ts, fallback) => {
    try {
      if (!ts) return fallback || "";
      const d = new Date(ts);
      if (Number.isNaN(d.getTime())) return fallback || "";
      return d.toLocaleString();
    } catch {
      return fallback || "";
    }
  };

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
        <div className="relative">
          <div
            className={`absolute left-4 top-0 bottom-0 w-px ${
              isDark ? "bg-gray-600" : "bg-gray-300"
            }`}
          ></div>
          <div className="space-y-3">
            {leaderboard.map((entry, idx) => {
              const displayDate = formatDateTime(entry.timestamp, entry.date);
              return (
                <div key={idx} className="pl-10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        idx === 0
                          ? "border-yellow-400 bg-yellow-400"
                          : idx === 1
                          ? "border-gray-300 bg-gray-300"
                          : idx === 2
                          ? "border-orange-400 bg-orange-400"
                          : isDark
                          ? "border-gray-500 bg-gray-500"
                          : "border-gray-400 bg-gray-400"
                      }`}
                    />
                    <div
                      className="flex-1 flex justify-between items-center p-3 rounded-lg"
                      style={{
                        backgroundColor: isDark ? "#374151" : "#f3f4f6",
                        border: idx < 3 ? "2px solid #f59e0b" : "none",
                      }}
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
                            isDark ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {displayDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
