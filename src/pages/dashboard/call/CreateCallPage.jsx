// src/pages/CreateCallPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateCallPage = () => {
  const [channelName, setChannelName] = useState("");
  const [uid, setUid] = useState(() => Math.floor(Math.random() * 10000)); // auto-generate UID
  const navigate = useNavigate();

  const handleCreate = (e) => {
    e.preventDefault();

    if (!channelName) {
      alert("Please enter a Channel Name");
      return;
    }

    // In a real app, you might request a token from backend here
    const token = "dummy-token"; 

    navigate("/waiting", { state: { channelName, uid, token } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Create a Call</h1>

      <form
        onSubmit={handleCreate}
        className="bg-gray-800 p-6 rounded-2xl shadow-lg w-80 space-y-4"
      >
        <div>
          <label className="block text-sm mb-1">Channel Name</label>
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-black"
            placeholder="Enter new channel name"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Your UID</label>
          <input
            type="text"
            value={uid}
            readOnly
            className="w-full px-3 py-2 rounded-lg text-gray-400 bg-gray-700"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Create Call
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

export default CreateCallPage;
