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
  const [errorMessage, setErrorMessage] = useState("");
  const [localVideoPlaying, setLocalVideoPlaying] = useState(false);
  const [tracksReady, setTracksReady] = useState(false);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let initStarted = false;
    let cleanupCalled = false;

    const initCall = async () => {
      // Prevent double initialization from React Strict Mode
      if (joinedRef.current || joiningRef.current || initStarted) {
        console.warn("⚠️ Already joining/joined/initializing, skipping re-init");
        return;
      }

      initStarted = true;
      joiningRef.current = true;
      cleanupCalled = false; // Reset cleanup flag when starting

      try {
        setConnectionStatus("connecting");
        setErrorMessage("");

        if (!APP_ID) {
          throw new Error("Agora APP_ID is missing. Please set VITE_AGORA_APP_ID in your .env file.");
        }

        // First, ensure any existing tracks are properly released
        if (localTracks.current.mic) {
          try {
            localTracks.current.mic.stop();
            localTracks.current.mic.close();
          } catch (e) {
            // Ignore errors during cleanup
          }
          localTracks.current.mic = null;
        }
        if (localTracks.current.cam) {
          try {
            localTracks.current.cam.stop();
            localTracks.current.cam.close();
          } catch (e) {
            // Ignore errors during cleanup
          }
          localTracks.current.cam = null;
        }
        
        // Small delay to ensure camera is fully released
        await new Promise(resolve => setTimeout(resolve, 200));

        const callType = callData?.callType || 'video';
        
        // Create tracks based on call type
        console.log(`Creating ${callType} call tracks...`);
        let micTrack, camTrack;
        
        // Always try to get microphone first (required)
        try {
          micTrack = await AgoraRTC.createMicrophoneAudioTrack({ echoCancellation: true });
          console.log("✅ Microphone track created");
        } catch (micError) {
          console.error("❌ Error creating microphone:", micError);
          setErrorMessage("Microphone access failed. Please check permissions.");
          throw new Error("Microphone is required for calls");
        }
        
        // Try to get camera only if it's a video call
        if (callType === 'video') {
          try {
            camTrack = await AgoraRTC.createCameraVideoTrack({
              width: 640, 
              height: 480, 
              frameRate: 15
            });
            console.log("✅ Camera track created");
          } catch (camError) {
            console.warn("⚠️ Camera access failed, continuing with audio-only:", camError);
            camTrack = null;
            setErrorMessage("Camera unavailable. Continuing with audio-only call.");
            // Don't throw - we can continue with just audio
          }
        } else {
          camTrack = null;
        }
        
        if (!isMounted) {
          // Clean up if component unmounted during track creation
          if (micTrack) {
            micTrack.stop();
            micTrack.close();
          }
          if (camTrack) {
            camTrack.stop();
            camTrack.close();
          }
          return;
        }
        
        localTracks.current = { mic: micTrack, cam: camTrack };
        setTracksReady(true);
        console.log("✅ Tracks ready - Mic:", !!micTrack, "Cam:", !!camTrack);

        // Always fetch a fresh token to ensure it's valid and matches current UID
        // Don't reuse tokens from callData as they might be expired or for different UID
        let tokenData;
        try {
          console.log("📡 Fetching fresh token from server...");
          console.log("  - Channel Name:", callData.channelName);
          console.log("  - UID (original):", callData.uid);
          
          const tokenResponse = await axios.post(TOKEN_ENDPOINT, {
            channelName: callData.channelName,
            uid: callData.uid,
          });
          
          tokenData = tokenResponse.data;
          console.log("✅ Fresh token received from server");
          console.log("  - Token UID (numeric):", tokenData.uid);
          console.log("  - Token Channel:", tokenData.channelName);
          console.log("  - Token length:", tokenData.token?.length || 0);
          
          // Verify token data is valid
          if (!tokenData.token || !tokenData.channelName || tokenData.uid === undefined) {
            throw new Error("Invalid token response from server");
          }
        } catch (tokenError) {
          console.error("❌ Error getting token:", tokenError);
          console.error("  - Error details:", tokenError.response?.data || tokenError.message);
          throw new Error("Failed to get authentication token. Please try again.");
        }

        // Set up event listeners BEFORE joining
        clientRef.current.on("user-joined", (user) => {
          console.log("👤 Remote user joined:", user.uid);
          if (isMounted) {
            setRemoteUserJoined(true);
            setRemoteUser(user);
          }
        });

        clientRef.current.on("user-published", async (user, mediaType) => {
          console.log("📡 Remote user published:", user.uid, mediaType);
          
          if (isMounted) {
            setRemoteUserJoined(true);
            setRemoteUser(user);
          }

          try {
            await clientRef.current.subscribe(user, mediaType);
            console.log("✅ Subscribed to remote user:", user.uid, mediaType);

            if (mediaType === "video" && remoteVideoRef.current && isMounted) {
              try {
                if (remoteVideoRef.current.innerHTML) {
                  remoteVideoRef.current.innerHTML = '';
                }
                await user.videoTrack.play(remoteVideoRef.current, { fit: 'cover' });
                console.log("✅ Remote video playing");
              } catch (error) {
                console.error("❌ Error playing remote video:", error);
              }
            }
            
            if (mediaType === "audio" && isMounted) {
              try {
                user.audioTrack.play();
                console.log("✅ Remote audio playing");
              } catch (error) {
                console.error("❌ Error playing remote audio:", error);
              }
            }
          } catch (error) {
            console.error("❌ Error subscribing to remote user:", error);
          }
        });

        clientRef.current.on("user-unpublished", (user, mediaType) => {
          console.log("🚫 Remote user unpublished:", user.uid, mediaType);
          if (mediaType === "video" && remoteVideoRef.current && isMounted) {
            if (user.videoTrack) {
              user.videoTrack.stop();
            }
            remoteVideoRef.current.innerHTML = '';
          }
          if (mediaType === "audio" && user.audioTrack) {
            user.audioTrack.stop();
          }
        });

        clientRef.current.on("user-left", (user) => {
          console.log("👋 Remote user left:", user.uid);
          if (isMounted) {
            setRemoteUserJoined(false);
            setRemoteUser(null);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.innerHTML = '';
            }
          }
        });

        // Handle connection state changes
        clientRef.current.on("connection-state-change", (curState, prevState) => {
          console.log(`Connection state changed: ${prevState} -> ${curState}`);
          if (curState === "DISCONNECTED") {
            console.warn("⚠️ Connection lost");
            if (isMounted) {
              setConnectionStatus("error");
              setErrorMessage("Connection lost. Please retry.");
            }
          }
        });

        // Configure Agora
        AgoraRTC.setParameter("ENABLE_WEB_SDK_ANALYTICS", false);

        // Join Agora channel
        // IMPORTANT: Use the numeric UID from tokenData (server already converted it using hash)
        // Don't convert it again as ObjectId strings can result in same numeric values
        try {
          const numericUid = tokenData.uid; // Server already returns numeric UID from hash function
          console.log("Joining channel:", tokenData.channelName, "with UID:", numericUid);
          await clientRef.current.join(
            APP_ID,
            tokenData.channelName,
            tokenData.token,
            numericUid
          );

          if (!isMounted) return;

          joinedRef.current = true;
          // Connection status will be set after publishing tracks
          console.log("🎉 Joined channel:", tokenData.channelName);
        } catch (joinError) {
          console.error("❌ Error joining channel:", joinError);
          throw new Error("Failed to join call channel");
        }

        // Check for existing remote users
        setTimeout(async () => {
          if (!isMounted) return;
          
          const remoteUsers = clientRef.current.remoteUsers;
          console.log("👥 Checking for existing remote users:", remoteUsers.length);
          
          if (remoteUsers.length > 0) {
            const existingUser = remoteUsers[0];
            console.log("✅ Found existing remote user:", existingUser.uid);
            
            if (isMounted) {
              setRemoteUserJoined(true);
              setRemoteUser(existingUser);
              
              for (const user of remoteUsers) {
                if (user.videoTrack) {
                  try {
                    if (remoteVideoRef.current && isMounted) {
                      remoteVideoRef.current.innerHTML = '';
                      await user.videoTrack.play(remoteVideoRef.current, { fit: 'cover' });
                      console.log("✅ Playing existing remote video");
                    }
                  } catch (error) {
                    console.error("❌ Error playing existing video:", error);
                  }
                }
                
                if (user.audioTrack) {
                  try {
                    user.audioTrack.play();
                    console.log("✅ Playing existing remote audio");
                  } catch (error) {
                    console.error("❌ Error playing existing audio:", error);
                  }
                }
              }
            }
          }
        }, 500);

        // Publish local tracks
        // Publish tracks (at least mic should be available)
        try {
          const tracksToPublish = [];
          if (localTracks.current.mic) {
            tracksToPublish.push(localTracks.current.mic);
          }
          if (localTracks.current.cam) {
            tracksToPublish.push(localTracks.current.cam);
          }
          
          if (tracksToPublish.length > 0) {
            await clientRef.current.publish(tracksToPublish);
            console.log("📤 Published local tracks:", tracksToPublish.length);
          } else {
            console.warn("⚠️ No tracks to publish - this shouldn't happen");
            // Even if we can't publish, we can still receive
            setErrorMessage("Could not publish your media. You can still listen.");
          }
        } catch (publishError) {
          console.error("❌ Error publishing tracks:", publishError);
          // Don't fail the whole call - user can still receive
          setErrorMessage("Could not publish your media. You can still listen.");
        }
        
        // Mark as connected even if camera failed
        if (isMounted && !cleanupCalled) {
          setConnectionStatus("connected");
          console.log("✅ Call setup complete - Status: connected");
        }

      } catch (error) {
        console.error("❌ Agora init error:", error);
        if (isMounted) {
          setConnectionStatus("error");
          setErrorMessage(error.message || "Failed to connect to call");
        }
      } finally {
        joiningRef.current = false;
      }
    };

    if (isMounted && callData) {
      initCall();
    }

    return () => {
      // Prevent cleanup from running during initialization (React Strict Mode)
      if (cleanupCalled) {
        console.log("⚠️ Cleanup already called, skipping");
        return;
      }
      
      // If we haven't joined yet, this is likely React Strict Mode cleanup
      // Don't clean up tracks that are still being initialized
      if (!joinedRef.current && joiningRef.current) {
        console.log("⚠️ Still initializing, skipping cleanup (React Strict Mode)");
        return;
      }
      
      cleanupCalled = true;
      isMounted = false;
      
      const cleanup = async () => {
        try {
          // Wait a bit if we're still initializing to avoid conflicts
          if (joiningRef.current && !joinedRef.current) {
            console.log("Still initializing, waiting before cleanup...");
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
          
          // Only cleanup if we're actually leaving
          if (!joinedRef.current) {
            console.log("Not joined, skipping cleanup");
            joiningRef.current = false;
            return;
          }
          
          if (localTracks.current.mic) {
            try {
              localTracks.current.mic.stop();
              localTracks.current.mic.close();
            } catch (e) {
              // Ignore cleanup errors
            }
            localTracks.current.mic = null;
          }
          if (localTracks.current.cam) {
            try {
              localTracks.current.cam.stop();
              localTracks.current.cam.close();
            } catch (e) {
              // Ignore cleanup errors
            }
            localTracks.current.cam = null;
          }
          if (joinedRef.current && clientRef.current) {
            try {
              await clientRef.current.leave();
              joinedRef.current = false;
            } catch (e) {
              // Ignore leave errors
              joinedRef.current = false;
            }
          }
          joiningRef.current = false;
          console.log("🧹 Cleanup completed");
        } catch (error) {
          console.error("Cleanup error:", error);
          // Reset flags even on error
          joiningRef.current = false;
        }
      };
      cleanup();
    };
  }, [callData]);

  // Play local video
  useEffect(() => {
    const playLocalVideo = async () => {
      if (tracksReady && localVideoRef.current && localTracks.current.cam && !localVideoPlaying) {
        console.log("▶️ Playing local video");
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

  // Controls
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
      navigate("/dashboard/chats");
    } catch (error) {
      console.error("Leave call error:", error);
      navigate("/dashboard/chats");
    }
  };

  // UI
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

      {errorMessage && connectionStatus !== "error" && (
        <div className="text-yellow-400 mb-4 text-sm">
          ⚠️ {errorMessage}
        </div>
      )}

      {connectionStatus === "connected" && !remoteUserJoined && (
        <div className="text-blue-400 mb-4 text-center">
          <div className="animate-pulse">⏳ Waiting for other user to join...</div>
        </div>
      )}

      {connectionStatus === "error" && (
        <div className="text-red-500 mb-4 text-center">
          <p className="mb-2">❌ {errorMessage || "Connection Failed"}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Retry
            </button>
            <button 
              onClick={() => navigate('/dashboard/chats')}
              className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {connectionStatus !== "error" && (
        <>
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
                  {!remoteUserJoined && connectionStatus === "connected" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="animate-pulse text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-3xl">👤</span>
                        </div>
                        <p className="text-gray-400 text-sm">Waiting for user...</p>
                      </div>
                    </div>
                  )}
                  {!tracksReady && connectionStatus === "connecting" && (
                    <p className="text-gray-400">Connecting...</p>
                  )}
                </div>
              ) : (
                <div className="w-72 h-52 bg-gray-800 rounded-lg border-2 border-gray-600 overflow-hidden relative flex items-center justify-center">
                  {!remoteUserJoined && connectionStatus === "connected" ? (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-4xl">⏳</span>
                      </div>
                      <p className="text-gray-400">Waiting for user...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📞</span>
                      </div>
                      <p className="text-gray-400">Audio Call</p>
                    </div>
                  )}
                </div>
              )}
              <p className="text-sm text-gray-400 mt-2">
                {remoteUserJoined && otherParticipant?.username 
                  ? otherParticipant.username 
                  : remoteUserJoined 
                    ? 'Remote User' 
                    : 'Waiting for user...'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex space-x-4">
            <button 
              onClick={toggleMic} 
              className={`px-4 py-2 rounded ${micEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
              disabled={!localTracks.current.mic}
            >
              {micEnabled ? "🎤 Mic On" : "🔇 Mic Off"}
            </button>
            {callType === 'video' && (
              <button
                onClick={toggleCamera}
                className={`px-4 py-2 rounded ${cameraEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                disabled={!localTracks.current.cam}
              >
                {cameraEnabled ? "📹 Camera On" : "📷 Camera Off"}
              </button>
            )}
            <button onClick={leaveCall} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
              📞 Leave
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoCallPage;