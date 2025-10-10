// src/pages/SettingsPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const navigate = useNavigate();

  const handleSave = () => {
    // You could save to localStorage or backend here if needed
    localStorage.setItem("cameraEnabled", cameraEnabled);
    localStorage.setItem("micEnabled", micEnabled);
    alert("Settings saved!");
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-80 space-y-6">
        <div className="flex items-center justify-between">
          <span>Enable Camera</span>
          <input
            type="checkbox"
            checked={cameraEnabled}
            onChange={(e) => setCameraEnabled(e.target.checked)}
            className="w-5 h-5"
          />
        </div>

        <div className="flex items-center justify-between">
          <span>Enable Microphone</span>
          <input
            type="checkbox"
            checked={micEnabled}
            onChange={(e) => setMicEnabled(e.target.checked)}
            className="w-5 h-5"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Save Settings
        </button>
      </div>

      <button
        onClick={() => navigate("/")}
        className="mt-4 text-gray-400 hover:text-gray-200"
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default SettingsPage;
