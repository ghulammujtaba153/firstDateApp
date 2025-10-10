// src/pages/VideoCallPage.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "c905455f70de484ca552c6d1cb4564ba"; // 🔑 Replace with your Agora App ID
const TOKEN_ENDPOINT =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const VideoCallPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const callData = location.state;

  const clientRef = useRef(
    AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })
  );
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localTracks = useRef({ mic: null, cam: null });
  const joinedRef = useRef(false);
  const joiningRef = useRef(false);

  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [localVideoPlaying, setLocalVideoPlaying] = useState(false);
  const [tracksReady, setTracksReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initCall = async () => {
      if (joinedRef.current || joiningRef.current) {
        console.warn("⚠️ Already joining/joined, skipping re-init");
        return;
      }

      joiningRef.current = true;

      try {
        setConnectionStatus("connecting");

        // Create mic + camera tracks FIRST (before joining)
        console.log("📹 Creating local tracks...");
        const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          { echoCancellation: true },
          { 
            width: 640, 
            height: 480, 
            frameRate: 15
          }
        );

        localTracks.current = { mic: micTrack, cam: camTrack };
        console.log("🎤 Mic Track:", micTrack);
        console.log("📹 Cam Track:", camTrack);
        console.log("📹 Cam Track enabled:", camTrack.enabled);
        console.log("📹 Cam Track muted:", camTrack.muted);

        // Set tracks ready - this will trigger the UI to render
        setTracksReady(true);
        
        // DON'T play here - wait for UI to render first

        // Fetch fresh token
        const tokenResponse = await fetch(`${TOKEN_ENDPOINT}/generate-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channelName: callData.channelName,
            uid: callData.uid,
          }),
        });

        if (!tokenResponse.ok) {
          throw new Error(`Token generation failed: ${tokenResponse.status}`);
        }

        const tokenData = await tokenResponse.json();
        console.log("✅ Token received:", tokenData);

        if (!APP_ID) {
          throw new Error("Agora APP_ID is missing");
        }

        // Join Agora channel
        await clientRef.current.join(
          APP_ID,
          tokenData.channelName,
          tokenData.token,
          tokenData.uid
        );

        joinedRef.current = true;
        setConnectionStatus("connected");
        console.log("🎉 Joined channel:", tokenData.channelName);

        // Publish local tracks
        await clientRef.current.publish([micTrack, camTrack]);
        console.log("📤 Published local tracks");

        // Handle remote users
        clientRef.current.on("user-published", async (user, mediaType) => {
          console.log("📡 Remote user published:", user.uid, mediaType);
          await clientRef.current.subscribe(user, mediaType);

          if (mediaType === "video" && remoteVideoRef.current && isMounted) {
            try {
              await user.videoTrack.play(remoteVideoRef.current, { fit: 'cover' });
              console.log("✅ Remote video playing");
            } catch (error) {
              console.error("❌ Error playing remote video:", error);
            }
          }
          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        });

        clientRef.current.on("user-unpublished", (user, mediaType) => {
          console.log("🚫 Remote user unpublished:", user.uid, mediaType);
          if (mediaType === "video" && remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML =
              '<div class="text-gray-400 flex items-center justify-center h-full">Remote video stopped</div>';
          }
        });

        clientRef.current.on("user-left", (user) => {
          console.log("👋 Remote user left:", user.uid);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML =
              '<div class="text-gray-400 flex items-center justify-center h-full">Remote user left</div>';
          }
        });
      } catch (error) {
        console.error("❌ Agora init error:", error);
        setConnectionStatus("error");
      } finally {
        joiningRef.current = false;
      }
    };

    if (isMounted && callData) {
      initCall();
    }

    return () => {
      isMounted = false;
      const cleanup = async () => {
        try {
          if (localTracks.current.mic) {
            localTracks.current.mic.stop();
            localTracks.current.mic.close();
          }
          if (localTracks.current.cam) {
            localTracks.current.cam.stop();
            localTracks.current.cam.close();
          }
          if (joinedRef.current) {
            await clientRef.current.leave();
            joinedRef.current = false;
          }
          console.log("🧹 Cleanup completed");
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      };
      cleanup();
    };
  }, [callData]);

  // Separate effect to play local video after UI renders
  useEffect(() => {
    const playLocalVideo = async () => {
      if (tracksReady && localVideoRef.current && localTracks.current.cam && !localVideoPlaying) {
        console.log("▶️ Playing local video NOW (UI is rendered)");
        try {
          await localTracks.current.cam.play(localVideoRef.current, { fit: 'cover' });
          console.log("✅ Local video playing!");
          setLocalVideoPlaying(true);
        } catch (error) {
          console.error("❌ Error playing local video:", error);
        }
      }
    };

    playLocalVideo();
  }, [tracksReady, localVideoPlaying]);

  // --- Controls ---
  const toggleMic = async () => {
    if (localTracks.current.mic) {
      const newState = !micEnabled;
      await localTracks.current.mic.setEnabled(newState);
      setMicEnabled(newState);
    }
  };

  const toggleCamera = async () => {
    if (localTracks.current.cam) {
      const newState = !cameraEnabled;
      await localTracks.current.cam.setEnabled(newState);
      setCameraEnabled(newState);
    }
  };

  const leaveCall = async () => {
    try {
      if (localTracks.current.mic) {
        localTracks.current.mic.stop();
        localTracks.current.mic.close();
      }
      if (localTracks.current.cam) {
        localTracks.current.cam.stop();
        localTracks.current.cam.close();
      }
      if (joinedRef.current) {
        await clientRef.current.leave();
        joinedRef.current = false;
      }
      navigate("/");
    } catch (error) {
      console.error("Leave call error:", error);
      navigate("/");
    }
  };

  // --- UI ---
  if (!callData) {
    return <div className="text-white p-4">No call data found</div>;
  }

  // Show UI even while connecting, so video containers are available
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-4">
        📹 Channel: {callData.channelName}
      </h1>

      {connectionStatus === "connecting" && !tracksReady && (
        <div className="text-yellow-400 mb-4">🔄 Connecting to call...</div>
      )}

      {connectionStatus === "error" && (
        <div className="text-red-500 mb-4">
          <p>❌ Connection Failed</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded mt-2"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-6 mb-6">
        {/* Local Video */}
        <div className="flex flex-col items-center">
          <div
            ref={localVideoRef}
            className="w-72 h-52 bg-gray-800 rounded-lg border-2 border-blue-500 overflow-hidden relative"
          />
          <p className="text-sm text-gray-400 mt-2">You</p>
        </div>

        {/* Remote Video */}
        <div className="flex flex-col items-center">
          <div
            ref={remoteVideoRef}
            className="w-72 h-52 bg-gray-800 rounded-lg border-2 border-gray-600 overflow-hidden relative"
          />
          <p className="text-sm text-gray-400 mt-2">Remote User</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex space-x-4">
        <button 
          onClick={toggleMic} 
          className={`px-4 py-2 rounded ${micEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          {micEnabled ? "🎤 Mic On" : "🔇 Mic Off"}
        </button>
        <button
          onClick={toggleCamera}
          className={`px-4 py-2 rounded ${cameraEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
        >
          {cameraEnabled ? "📹 Camera On" : "📷 Camera Off"}
        </button>
        <button onClick={leaveCall} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
          📞 Leave
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;