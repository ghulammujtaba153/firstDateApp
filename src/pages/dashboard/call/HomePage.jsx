// src/pages/HomePage.jsx
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to Video Call App</h1>
      <div className="space-y-4">
        <button
          onClick={() => navigate("/create")}
          className="px-6 py-3 bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Start New Call
        </button>
        <button
          onClick={() => navigate("/join")}
          className="px-6 py-3 bg-green-600 rounded-lg shadow hover:bg-green-700 transition"
        >
          Join Call
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="px-6 py-3 bg-gray-700 rounded-lg shadow hover:bg-gray-600 transition"
        >
          Settings
        </button>
      </div>
    </div>
  );
};

export default HomePage;
