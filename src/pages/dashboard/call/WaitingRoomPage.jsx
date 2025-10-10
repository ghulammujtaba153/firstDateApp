// src/pages/WaitingRoomPage.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const WaitingRoomPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const callData = location.state;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!callData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-2xl font-bold">No call data found</h1>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const { channelName, uid } = callData;

  const handleEnterCall = async () => {
  setLoading(true);
  setError("");

  try {
    const randomUID = Math.floor(Math.random() * 100000);
    const res = await axios.post("http://localhost:5000/generate-token", {
      channelName,
      uid: randomUID,
    });

    const token = res.data.token;

    navigate("/call", { state: { channelName, uid: randomUID, token } });
  } catch (err) {
    console.error(err);
    setError("Failed to get token. Try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Waiting Room</h1>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg w-96 space-y-4">
        <p>
          <strong>Channel:</strong> {channelName}
        </p>
        <p>
          <strong>Your UID:</strong> {uid}
        </p>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <button
        onClick={handleEnterCall}
        className="mt-6 px-6 py-3 bg-green-600 rounded-lg shadow hover:bg-green-700 transition"
        disabled={loading}
      >
        {loading ? "Joining..." : "Enter Call"}
      </button>

      <button
        onClick={() => navigate("/")}
        className="mt-4 text-gray-400 hover:text-gray-200"
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default WaitingRoomPage;
