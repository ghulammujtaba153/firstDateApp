// src/pages/VideoCallPage.jsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import { BASE_URL } from "../../../config/url";
import axios from "axios";
import { useSocket } from "../../../context/socketContext";
import { useAuth } from "../../../context/authContext";
import CallCancellationModal from "../../../components/dashboard/chats/CallCancellationModal";

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const TOKEN_ENDPOINT = `${BASE_URL}/generate-token`;

const VideoCallPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const callData = location.state;
  const { socket, isConnected } = useSocket();
  const { user: currentUser } = useAuth();

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
  const [callCancelled, setCallCancelled] = useState(false);
  const [cancelledBy, setCancelledBy] = useState(null);

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

  // Listen for call cancellation/rejection
  useEffect(() => {
    if (!socket || !isConnected || !callData) return;

    const handleCallResponse = async (data) => {
      const { from, responseType, callData: responseCallData } = data;
      
      // Check if this is a rejection/cancellation for this call
      // Since we're the caller (initiator), any reject/cancel from the receiver means they cancelled
      if (responseType === 'call_reject' || responseType === 'call_cancel' || responseType === 'call_end') {
        // Only handle if this is from the other participant (receiver)
        const otherParticipantId = callData?.otherParticipant?._id?.toString();
        const fromId = from?.toString();
        
        // If the response is from the other participant, they cancelled
        if (otherParticipantId && fromId === otherParticipantId) {
          // Use the other participant's name from callData, or fetch it
          const cancelledByName = callData?.otherParticipant?.username || 
                                  callData?.otherParticipant?.email || 
                                  'Unknown User';
          
          setCancelledBy(cancelledByName);
          setCallCancelled(true);
        } else if (!otherParticipantId) {
          // If we don't have otherParticipant info, fetch it
          try {
            const userResponse = await axios.get(`${BASE_URL}/api/auth/${from}`);
            const cancelledByUser = userResponse.data;
            setCancelledBy(cancelledByUser?.username || cancelledByUser?.email || 'Unknown User');
            setCallCancelled(true);
          } catch (error) {
            console.error('Error fetching user who cancelled:', error);
            setCancelledBy('Unknown User');
            setCallCancelled(true);
          }
        }
      }
    };

    socket.on('call:response', handleCallResponse);

    return () => {
      socket.off('call:response', handleCallResponse);
    };
  }, [socket, isConnected, callData, currentUser?._id]);

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
      <div className="flex items-center justify-center min-h-screen bg-[#202124] text-white">
        <div className="text-center">
          <p className="text-xl mb-4 text-gray-300">No call data found</p>
          <button
            onClick={() => navigate('/dashboard/chats')}
            className="px-6 py-2.5 bg-[#1a73e8] rounded-lg hover:bg-[#1765cc] transition-colors text-sm font-medium"
          >
            Go Back to Chats
          </button>
        </div>
      </div>
    );
  }

  const callType = callData?.callType || 'video';
  const otherParticipant = callData?.otherParticipant;
  const participantName = otherParticipant?.username || 'Unknown User';

  // Handle navigation after call cancellation dialog
  const handleCancelDialogClose = () => {
    setCallCancelled(false);
  };

  return (
    <div className="relative min-h-screen bg-[#202124] text-white overflow-hidden">
      {/* Call Cancelled Modal */}
      <CallCancellationModal
        isOpen={callCancelled}
        cancelledBy={cancelledBy}
        onClose={handleCancelDialogClose}
      />
      {/* Top Bar - Minimal like Google Meet */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a73e8] flex items-center justify-center">
            <span className="text-sm font-semibold">
              {participantName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {remoteUserJoined ? participantName : 'Connecting...'}
            </p>
            {connectionStatus === "connected" && (
              <p className="text-xs text-gray-400">
                {remoteUserJoined ? 'Connected' : 'Waiting for participant'}
              </p>
            )}
          </div>
        </div>
        
        {connectionStatus === "connecting" && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <div className="w-2 h-2 bg-[#1a73e8] rounded-full animate-pulse"></div>
            <span>Connecting...</span>
          </div>
        )}
      </div>

      {/* Main Video Area - Full Screen */}
      <div className="relative w-full h-screen flex items-center justify-center bg-[#1a1a1a]">
        {/* Remote Video/Audio - Main Display */}
        <div className="relative w-full h-full flex items-center justify-center">
          {callType === 'video' ? (
            <div
              ref={remoteVideoRef}
              className="absolute inset-0 w-full h-full bg-[#1a1a1a]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full">
              {remoteUserJoined ? (
                <>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#4285f4] flex items-center justify-center mb-6 shadow-2xl">
                    <span className="text-5xl font-semibold text-white">
                      {participantName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-2xl font-medium text-gray-200 mb-2">{participantName}</p>
                  <p className="text-sm text-gray-400">Audio call</p>
                </>
              ) : (
                <>
                  <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center mb-6 animate-pulse">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-lg text-gray-400">Waiting for participant...</p>
                </>
              )}
            </div>
          )}

          {/* Waiting State Overlay for Video */}
          {callType === 'video' && !remoteUserJoined && connectionStatus === "connected" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-lg text-gray-400">{participantName}</p>
              <p className="text-sm text-gray-500 mt-1">Waiting for participant to join...</p>
            </div>
          )}

          {/* Connecting State */}
          {connectionStatus === "connecting" && !tracksReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]">
              <div className="w-16 h-16 border-4 border-[#1a73e8] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Connecting to call...</p>
            </div>
          )}

          {/* Error State */}
          {connectionStatus === "error" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1a1a]">
              <div className="text-center max-w-md px-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-xl font-medium text-white mb-2">Connection Failed</p>
                <p className="text-sm text-gray-400 mb-6">{errorMessage || "Unable to connect to the call"}</p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-5 py-2.5 bg-[#1a73e8] rounded-lg hover:bg-[#1765cc] transition-colors text-sm font-medium"
                  >
                    Retry
                  </button>
                  <button 
                    onClick={() => navigate('/dashboard/chats')}
                    className="px-5 py-2.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          {errorMessage && connectionStatus !== "error" && (
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30">
              <div className="bg-yellow-500/90 text-black px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                ⚠️ {errorMessage}
              </div>
            </div>
          )}
        </div>

        {/* Local Video Preview - Bottom Right (Google Meet Style) */}
        {callType === 'video' && tracksReady && localTracks.current.cam && (
          <div className="absolute bottom-24 right-6 z-30 w-48 h-36 rounded-lg overflow-hidden shadow-2xl border-2 border-white/20 bg-black">
            <div
              ref={localVideoRef}
              className="w-full h-full bg-[#1a1a1a]"
            />
            {!cameraEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/50 rounded text-xs text-white backdrop-blur-sm">
              You
            </div>
          </div>
        )}
      </div>

      {/* Control Bar - Bottom Center (Google Meet Style) */}
      {connectionStatus !== "error" && (
        <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center pb-6">
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-full px-4 py-3 shadow-2xl">
            {/* Mic Toggle */}
            <button
              onClick={toggleMic}
              disabled={!localTracks.current.mic}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                micEnabled
                  ? 'bg-white hover:bg-gray-100'
                  : 'bg-red-500 hover:bg-red-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={micEnabled ? 'Turn off microphone' : 'Turn on microphone'}
            >
              {micEnabled ? (
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              )}
            </button>

            {/* Camera Toggle (Video Calls Only) */}
            {callType === 'video' && (
              <button
                onClick={toggleCamera}
                disabled={!localTracks.current.cam}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  cameraEnabled
                    ? 'bg-white hover:bg-gray-100'
                    : 'bg-red-500 hover:bg-red-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraEnabled ? (
                  <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                )}
              </button>
            )}

            {/* Leave Call Button */}
            <button
              onClick={leaveCall}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 transition-colors"
              title="Leave call"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l-8 8m0-8l8 8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallPage;