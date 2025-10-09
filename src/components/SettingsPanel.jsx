const SettingsPanel = ({ isDark, theme, updateTheme }) => {
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
  );
};

export default SettingsPanel;
