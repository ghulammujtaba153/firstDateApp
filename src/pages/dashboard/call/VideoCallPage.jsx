// src/pages/VideoCallPage.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import { BASE_URL } from "../../../config/url";
import axios from "axios";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const TOKEN_ENDPOINT = `${BASE_URL}/generate-token`;

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

        if (!APP_ID) {
          throw new Error("Agora APP_ID is missing. Please set VITE_AGORA_APP_ID in your .env file.");
        }

        const callType = callData?.callType || 'video'; // 'audio' or 'video'
        
        // Create tracks based on call type
        console.log(`Creating ${callType} call tracks...`);
        let micTrack, camTrack;
        
        if (callType === 'audio') {
          // Audio-only call
          micTrack = await AgoraRTC.createMicrophoneAudioTrack({ echoCancellation: true });
          camTrack = null;
          setTracksReady(true);
        } else {
          // Video call
          [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
            { echoCancellation: true },
            { 
              width: 640, 
              height: 480, 
              frameRate: 15
            }
          );
          setTracksReady(true);
        }

        localTracks.current = { mic: micTrack, cam: camTrack };
        console.log("🎤 Mic Track:", micTrack);
        if (camTrack) console.log("📹 Cam Track:", camTrack);

        // Use token from callData if available, otherwise fetch new one
        let tokenData;
        if (callData.token && callData.channelName && callData.uid) {
          // Use existing token
          tokenData = {
            token: callData.token,
            channelName: callData.channelName,
            uid: callData.uid
          };
          console.log("✅ Using provided token");
        } else {
          // Fetch new token from server
          const tokenResponse = await axios.post(TOKEN_ENDPOINT, {
            channelName: callData.channelName,
            uid: callData.uid,
          });
          tokenData = tokenResponse.data;
          console.log("✅ Token received from server:", tokenData);
        }

        // Join Agora channel
        const numericUid = typeof tokenData.uid === 'string' ? parseInt(tokenData.uid) : tokenData.uid;
        await clientRef.current.join(
          APP_ID,
          tokenData.channelName,
          tokenData.token,
          numericUid
        );

        joinedRef.current = true;
        setConnectionStatus("connected");
        console.log("🎉 Joined channel:", tokenData.channelName);

        // Publish local tracks
        const tracksToPublish = camTrack ? [micTrack, camTrack] : [micTrack];
        await clientRef.current.publish(tracksToPublish);
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
      // Navigate back to chats
      navigate("/dashboard/chats");
    } catch (error) {
      console.error("Leave call error:", error);
      navigate("/dashboard/chats");
    }
  };

  // --- UI ---
  if (!callData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-xl mb-4">No call data found</p>
          <button
            onClick={() => navigate('/dashboard/chats')}
            className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Go Back to Chats
          </button>
        </div>
      </div>
    );
  }

  const callType = callData?.callType || 'video';
  const otherParticipant = callData?.otherParticipant;

  // Show UI even while connecting, so video containers are available
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white p-4">
      <div className="flex items-center justify-between w-full max-w-6xl mb-4">
        <h1 className="text-xl font-bold">
          {callType === 'video' ? '📹 Video' : '📞 Audio'} Call
        </h1>
        {otherParticipant && (
          <p className="text-lg text-gray-300">
            {otherParticipant.username || 'Unknown User'}
          </p>
        )}
      </div>

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
        {/* Local Video/Audio */}
        {callType === 'video' && (
          <div className="flex flex-col items-center">
            <div
              ref={localVideoRef}
              className="w-72 h-52 bg-gray-800 rounded-lg border-2 border-blue-500 overflow-hidden relative"
            />
            <p className="text-sm text-gray-400 mt-2">You</p>
          </div>
        )}

        {/* Remote Video/Audio */}
        <div className="flex flex-col items-center">
          {callType === 'video' ? (
            <div
              ref={remoteVideoRef}
              className="w-72 h-52 bg-gray-800 rounded-lg border-2 border-gray-600 overflow-hidden relative flex items-center justify-center"
            >
              {!tracksReady && (
                <p className="text-gray-400">Waiting for remote video...</p>
              )}
            </div>
          ) : (
            <div className="w-72 h-52 bg-gray-800 rounded-lg border-2 border-gray-600 overflow-hidden relative flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📞</span>
                </div>
                <p className="text-gray-400">Audio Call</p>
              </div>
            </div>
          )}
          <p className="text-sm text-gray-400 mt-2">
            {otherParticipant?.username || 'Remote User'}
          </p>
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
        {callType === 'video' && (
          <button
            onClick={toggleCamera}
            className={`px-4 py-2 rounded ${cameraEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            {cameraEnabled ? "📹 Camera On" : "📷 Camera Off"}
          </button>
        )}
        <button onClick={leaveCall} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
          📞 Leave
        </button>
      </div>
    </div>
  );
};

export default VideoCallPage;