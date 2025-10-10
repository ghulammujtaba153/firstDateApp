// src/pages/JoinCallPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinCallPage = () => {
  const [channelName, setChannelName] = useState("");
  const [uid, setUid] = useState("");
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();

    if (!channelName || !uid) {
      alert("Please enter both Channel Name and UID");
      return;
    }

    // Pass call data using React Router state
    navigate("/waiting", { state: { channelName, uid } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Join a Call</h1>

      <form
        onSubmit={handleJoin}
        className="bg-gray-800 p-6 rounded-2xl shadow-lg w-80 space-y-4"
      >
        <div>
          <label className="block text-sm mb-1">Channel Name</label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-black"
            placeholder="Enter channel name"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">UID</label>
          <input
            type="text"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-black"
            placeholder="Enter your UID"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-green-600 rounded-lg shadow hover:bg-green-700 transition"
        >
          Join Call
        </button>
      </form>

      <button
        onClick={() => navigate("/")}
        className="mt-4 text-gray-400 hover:text-gray-200"
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default JoinCallPage;
