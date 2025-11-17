import React, { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../config/url";
import axios from "axios";
import { useAuth } from "../context/authContext";
import Loader from "../components/common/Loader";
import Notification from "../components/common/Notification";
import { useNavigate } from "react-router-dom";

const FaceVerification = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("Please upload your photo and start camera...");
  const [userPhoto, setUserPhoto] = useState(null); // Reference image (data URL)
  const [capturedSelfie, setCapturedSelfie] = useState(null); // Captured selfie (data URL)
  const [pageLoader, setPageLoader] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("success");
  const [showRetryOptions, setShowRetryOptions] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const { user, loading, setUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const router = useNavigate();

  // ✅ Cleanup function to stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // ✅ Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);


  // ✅ Keep camera stream alive - prevent timeout
  useEffect(() => {
    if (!streamRef.current) return;

    const keepAliveInterval = setInterval(() => {
      if (streamRef.current?.active) {
        // Check if stream is still active
        const tracks = streamRef.current.getTracks();
        const allActive = tracks.every(track => track.readyState === "live");
        
        if (!allActive) {
          console.warn("⚠️ Stream became inactive, attempting to restart...");
          setStatus("⚠️ Camera interrupted, restarting...");
          startVideo();
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(keepAliveInterval);
  }, [streamRef.current]);

  // ✅ Start webcam with better error handling
  const startVideo = async () => {
    try {
      console.log("📹 Requesting camera access...");
      
      // Request camera with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false
      });

      console.log("📹 Stream received, tracks:", stream.getTracks().length);

      // Wait for ref to be available
      setTimeout(() => {
        if (videoRef.current) {
          console.log("✅ Video ref available, attaching stream");
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Ensure video plays
          videoRef.current.play().catch(err => {
            console.error("Video play error:", err);
          });
          
          // Monitor stream tracks
          stream.getTracks().forEach(track => {
            console.log("📹 Track started:", track.kind, track.readyState);
            track.onended = () => {
              console.warn("Camera track ended unexpectedly");
              setStatus("⚠️ Camera disconnected. Please refresh.");
            };
          });

          console.log("✅ Camera started successfully");
          setStatus("✅ Camera ready");
        } else {
          console.error("❌ Video ref still not available after delay");
          setStatus("❌ Video element not found");
        }
      }, 100);

    } catch (err) {
      console.error("Camera error:", err);
      setStatus(`❌ Camera error: ${err.message}`);
    }
  };

  // ✅ Convert File to data URL
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ✅ Handle user photo upload (reference image)
  const handleUserPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setStatus("📸 Loading your photo...");
      const dataUrl = await fileToDataUrl(file);
      setUserPhoto(dataUrl);
      setStatus("✅ Photo uploaded. Please start camera and capture your selfie.");
    } catch (err) {
      console.error("Failed to read file:", err);
      setStatus("❌ Failed to read photo. Please try again.");
      alert("Failed to read photo");
    }
  };

  // ✅ Capture selfie from camera
  const captureSelfie = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!video || !canvas) {
      setStatus("❌ Camera not ready. Please start camera first.");
      return;
    }

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    setCapturedSelfie(imageData);
    setStatus("✅ Selfie captured! Click 'Verify Face' to compare.");
  };

  // ✅ Initialize camera on mount
  useEffect(() => {
    if (loading) return; // Wait for auth context to load

    const initializeCamera = async () => {
      try {
        setStatus("Starting camera...");
        await startVideo();
        setStatus("✅ Camera ready. Please upload your photo first.");
      } catch (error) {
        console.error("Camera initialization failed:", error);
        setStatus("❌ Failed to start camera. Please refresh the page.");
      }
    };

    initializeCamera();
  }, [loading, user?._id]);

  // ✅ Convert dataURL to Blob for API
  const dataURLToBlob = (dataURL) => {
    const parts = dataURL.split(',');
    const m = parts[0].match(/:(.*?);/);
    const mime = m ? m[1] : 'image/png';
    const binary = atob(parts[1]);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
    return new Blob([u8], { type: mime });
  };

  // ✅ Poll workflow status
  const pollWorkflowStatus = async (sessionId, maxAttempts = 30, interval = 2000) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${BASE_URL}/api/workflow/status/${sessionId}`);
        const data = await response.json();

        console.log(`Status check ${attempt + 1}:`, data);

        // Check if workflow is complete
        if (data.status === "completed" || data.status === "success" || data.status === "failed") {
          return data;
        }

        // If still processing, wait and try again
        if (data.status === "processing" || data.status === "pending") {
          setStatus(`🔄 Verifying... (${attempt + 1}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, interval));
          continue;
        }

        // Return current status
        return data;
      } catch (error) {
        console.error("Error polling status:", error);
        if (attempt === maxAttempts - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    throw new Error("Workflow status check timeout");
  };

  // ✅ Compare captured selfie with user photo using Didit KYC Workflow
  const handleVerify = async () => {
    if (!userPhoto) {
      setStatus("❌ Please upload your photo first.");
      return;
    }

    if (!capturedSelfie) {
      setStatus("❌ Please capture your selfie first.");
      return;
    }

    setSubmitting(true);
    setStatus("🔄 Starting verification workflow...");

    try {
      // 1️⃣ Start workflow with images
      const form = new FormData();
      form.append("ref_image", dataURLToBlob(userPhoto), "user_photo.png");
      form.append("selfie_image", dataURLToBlob(capturedSelfie), "selfie.png");

      const startRes = await fetch(`${BASE_URL}/api/workflow/start`, {
        method: "POST",
        body: form,
      });

      if (!startRes.ok) {
        const errorData = await startRes.json().catch(() => ({ message: "Failed to start workflow" }));
        throw new Error(errorData.message || "Failed to start workflow");
      }

      const startData = await startRes.json();
      const sessionId = startData.sessionId;

      if (!sessionId) {
        throw new Error("No session ID received from workflow");
      }

      console.log("Workflow started, sessionId:", sessionId);
      setStatus("🔄 Processing verification...");

      // 2️⃣ Poll for workflow status
      const statusData = await pollWorkflowStatus(sessionId);

      console.log("Final workflow status:", statusData);

      // 3️⃣ Extract verification result
      // DIDIT workflow response structure may vary, so we check multiple possible fields
      const result = statusData.result || statusData.data || statusData;
      const faceMatch = result?.face_match || result?.verification || result;
      
      // Extract score - check multiple possible locations
      let score = null;
      if (faceMatch?.score !== undefined) {
        score = faceMatch.score;
      } else if (faceMatch?.confidence !== undefined) {
        score = faceMatch.confidence;
      } else if (result?.score !== undefined) {
        score = result.score;
      } else if (statusData.score !== undefined) {
        score = statusData.score;
      } else if (faceMatch?.similarity !== undefined) {
        score = faceMatch.similarity * 100; // Convert 0-1 to percentage
      }

      // Check verification status
      const isVerified = 
        statusData.status === "completed" || 
        statusData.status === "success" ||
        faceMatch?.status === "verified" ||
        faceMatch?.match === true ||
        (typeof score === "number" && score >= 85);

      // 4️⃣ Handle verification result
      if (isVerified && typeof score === "number" && score >= 85) {
        // Verification successful - update user status
        try {
          const updateRes = await axios.put(`${BASE_URL}/api/auth/onboarding/${user._id}`, {
            verified: true
          });

          setUser(updateRes.data);

          // Stop camera before navigating
          stopCamera();
          
          setVerificationResult({
            success: true,
            similarity: score / 100,
            message: `✅ Verification successful! Score: ${score.toFixed(1)}%`
          });
          setNotificationType("success");
          setShowNotification(true);
          
          // Navigate after a short delay
          setTimeout(() => {
            router("/login");
          }, 2000);
        } catch (error) {
          console.error("Error updating verification status:", error);
          setStatus("❌ Error updating verification status.");
          setVerificationResult({
            success: false,
            similarity: score / 100,
            message: `Verification passed (${score.toFixed(1)}%) but failed to update status. Please try again.`
          });
          setNotificationType("error");
          setShowNotification(true);
        }
      } else {
        // Verification failed
        const scoreDisplay = typeof score === "number" ? score.toFixed(1) : "N/A";
        const reason = faceMatch?.reason || statusData.message || "Verification did not meet requirements";
        
        setVerificationResult({
          success: false,
          similarity: typeof score === "number" ? score / 100 : 0,
          message: `❌ Verification failed. Score: ${scoreDisplay}% (Required: 85%+)`
        });
        setStatus(`❌ Verification failed. Score: ${scoreDisplay}%`);
        setShowRetryOptions(true);
        setNotificationType("error");
        setShowNotification(true);
      }
    } catch (error) {
      console.error("Error during face verification:", error);
      setStatus(`❌ Error: ${error.message || "Please try again."}`);
      setVerificationResult({
        success: false,
        similarity: 0,
        message: error.message || "Error during verification. Check console for details."
      });
      setShowRetryOptions(true);
      setNotificationType("error");
      setShowNotification(true);
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Retry verification
  const handleRetry = () => {
    setShowRetryOptions(false);
    setVerificationResult(null);
    setCapturedSelfie(null);
    setStatus("✅ Ready to verify. Please capture a new selfie and click 'Verify Face'.");
  };

  const handleLeave = () => {
    stopCamera();
    router("/login");
  };

  if (pageLoader) return <Loader />;

  if (loading) return <Loader />;

  return (
    <div className="flex px-4 flex-col justify-center items-center min-h-screen gap-6 w-full">
      {showNotification && (
        <Notification
          message={verificationResult?.message || status}
          onClose={() => setShowNotification(false)}
          type={notificationType}
          linkText={notificationType === "success" ? "Continue" : undefined}
          link={notificationType === "success" ? "/dashboard" : undefined}
        />
      )}
      
      <div className="flex flex-col items-center border-2 border-primary p-8 rounded-[30px] shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-2">Verify your face 👱🏻‍♂️</h1>
        <p className="text-center text-gray-600 mb-4">Upload your photo and capture a selfie to verify your identity.</p>
        <p className="mb-4 text-sm text-gray-700 text-center">{status}</p>

        {/* User Photo Upload */}
        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📸 Upload Your Photo
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleUserPhotoUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {userPhoto && (
            <div className="mt-2">
              <p className="text-xs text-green-600 mb-1">✅ Photo uploaded</p>
              <img
                src={userPhoto}
                alt="User photo"
                className="w-24 h-24 rounded-lg object-cover border-2 border-primary"
              />
            </div>
          )}
        </div>

        {/* Camera Video */}
        <div className="relative w-full mb-4 bg-black rounded-[50%]">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            controls={false}
            className="w-full rounded-[50%] border-4 border-primary shadow-lg aspect-square object-cover bg-black"
            onLoadedMetadata={() => {
              console.log("✅ Video metadata loaded, dimensions:", videoRef.current?.videoWidth, "x", videoRef.current?.videoHeight);
            }}
            onCanPlay={() => {
              console.log("✅ Video can play");
            }}
            onPlay={() => {
              console.log("✅ Video is playing");
            }}
            onError={(e) => {
              console.error("Video element error:", e);
              setStatus("❌ Video playback error");
            }}
          />
          <div className="absolute inset-0 rounded-[50%] border-4 border-dashed border-primary/30 pointer-events-none"></div>
        </div>

        {/* Captured Selfie Preview */}
        {capturedSelfie && (
          <div className="w-full mb-4">
            <p className="text-xs text-green-600 mb-1">✅ Selfie captured</p>
            <img
              src={capturedSelfie}
              alt="Captured selfie"
              className="w-24 h-24 rounded-lg object-cover border-2 border-primary mx-auto"
            />
          </div>
        )}

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {!showRetryOptions ? (
          // Normal state - Capture Selfie and Verify Face buttons
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={captureSelfie}
              disabled={submitting || !userPhoto}
              className="px-5 py-3 bg-blue-500 text-white font-semibold rounded-full hover:opacity-90 transition disabled:opacity-50"
            >
              📸 Capture Selfie
            </button>

            <button
              onClick={handleVerify}
              disabled={submitting || !userPhoto || !capturedSelfie}
              className="px-5 py-3 bg-primary text-white font-semibold rounded-full hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? "Verifying..." : "Verify Face"}
            </button>

            <button
              onClick={handleLeave}
              className="px-5 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition"
            >
              Leave
            </button>
          </div>
        ) : (
          // Retry state - Show retry options after failed verification
          <div className="flex flex-col gap-3 w-full">
            <div className="text-center mb-2">
              <p className="text-red-600 font-medium">Verification Failed</p>
              <p className="text-sm text-gray-600 mt-1">
                Score: {verificationResult?.similarity ? (verificationResult.similarity * 100).toFixed(1) + '%' : 'N/A'} (Required: 85%+)
              </p>
            </div>
            
            <button
              onClick={handleRetry}
              className="px-5 py-3 bg-primary text-white font-semibold rounded-full hover:opacity-90 transition"
            >
              Try Again
            </button>

            <button
              onClick={handleLeave}
              className="px-5 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 transition"
            >
              Leave
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceVerification;