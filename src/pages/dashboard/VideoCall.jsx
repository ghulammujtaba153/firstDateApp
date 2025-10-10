import React, { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaPhoneSlash,
  FaHeadphones,
  FaUser,
} from "react-icons/fa";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const CHANNEL = import.meta.env.VITE_AGORA_CHANNEL;
const TOKEN_ENDPOINT = `${import.meta.env.VITE_BACKEND_URL}/generate-token`;
const UID = Math.floor(Math.random() * 10000);

const VideoCall = () => {
  const client = useRef(null);
  const localContainer = useRef(null);
  const remoteContainer = useRef(null);

  const [joined, setJoined] = useState(false);
  const [mode, setMode] = useState(null); // "audio" | "video"
  const [micTrack, setMicTrack] = useState(null);
  const [camTrack, setCamTrack] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  const [username, setUsername] = useState("");
  const [remoteName, setRemoteName] = useState("Remote User");

  const joinCall = async (selectedMode) => {
    if (!username.trim()) {
      alert("Please enter your name before joining!");
      return;
    }

    setMode(selectedMode);
    client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    try {
      const res = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName: CHANNEL, uid: UID }),
      });

      const data = await res.json();
      const token = data.token;

      await client.current.join(APP_ID, CHANNEL, token, UID);

      const [mic, cam] =
        selectedMode === "video"
          ? await AgoraRTC.createMicrophoneAndCameraTracks()
          : [await AgoraRTC.createMicrophoneAudioTrack(), null];

      setMicTrack(mic);
      setCamTrack(cam);

      if (cam && localContainer.current) {
        cam.play(localContainer.current);
      }

      await client.current.publish(cam ? [mic, cam] : [mic]);

      client.current.on("user-published", async (user, mediaType) => {
        await client.current.subscribe(user, mediaType);

        if (mediaType === "video" && remoteContainer.current) {
          user.videoTrack.play(remoteContainer.current);
        }
        if (mediaType === "audio") {
          user.audioTrack.play();
        }

        // 👉 Assign remote username (for demo, just "User {uid}")
        setRemoteName(`User ${user.uid}`);
      });

      setJoined(true);
    } catch (err) {
      console.error("Agora Init Error:", err);
    }
  };

  const toggleMic = async () => {
    if (micTrack) {
      await micTrack.setEnabled(!isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCam = async () => {
    if (camTrack) {
      await camTrack.setEnabled(!isCamOn);
      setIsCamOn(!isCamOn);
    }
  };

  const leaveCall = async () => {
    if (micTrack) micTrack.close();
    if (camTrack) camTrack.close();
    await client.current.leave();
    setJoined(false);
    setMode(null);
    setRemoteName("Remote User");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      {/* Pre-Join Screen */}
      {!joined && !mode && (
        <div className="text-center w-full max-w-md bg-gray-800 p-6 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Join a Call</h1>

          {/* Username Input */}
          <div className="flex items-center gap-2 mb-6 bg-gray-700 px-4 py-2 rounded-lg">
            <FaUser className="text-gray-300" />
            <input
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-transparent outline-none text-white placeholder-gray-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-6 justify-center">
            <button
              onClick={() => joinCall("audio")}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
            >
              <FaHeadphones /> Audio Call
            </button>
            <button
              onClick={() => joinCall("video")}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 transition"
            >
              <FaVideo /> Video Call
            </button>
          </div>
        </div>
      )}

      {/* Call Screen */}
      {joined && (
        <>
          <div className="flex gap-6 mb-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">{username || "You"}</h2>
              <div
                ref={localContainer}
                className="w-[400px] h-[300px] bg-black rounded-lg shadow-lg"
              />
            </div>
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">{remoteName}</h2>
              <div
                ref={remoteContainer}
                className="w-[400px] h-[300px] bg-black rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-6 mt-4">
            <button
              onClick={toggleMic}
              className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition"
            >
              {isMicOn ? (
                <FaMicrophone size={24} className="text-green-400" />
              ) : (
                <FaMicrophoneSlash size={24} className="text-red-400" />
              )}
            </button>

            {mode === "video" && (
              <button
                onClick={toggleCam}
                className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 transition"
              >
                {isCamOn ? (
                  <FaVideo size={24} className="text-green-400" />
                ) : (
                  <FaVideoSlash size={24} className="text-red-400" />
                )}
              </button>
            )}

            <button
              onClick={leaveCall}
              className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition"
            >
              <FaPhoneSlash size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoCall;
