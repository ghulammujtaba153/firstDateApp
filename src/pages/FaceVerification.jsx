import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { BASE_URL } from "../config/url";
import axios from "axios";
import { useAuth } from "../context/authContext";
import Loader from "../components/common/Loader";
import Notification from "../components/common/Notification";
import { useNavigate } from "react-router-dom";

const FaceVerification = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("Loading models...");
  const [referenceDescriptors, setReferenceDescriptors] = useState([]);
  const [pageLoader, setPageLoader] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("success");
  const [showRetryOptions, setShowRetryOptions] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const { user, loading } = useAuth();
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

  // ✅ Fetch latest user data (with images)
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/${user._id}`);
      const userData = response.data;
      console.log("Fetched user:", userData);

      if (userData?.images?.length > 0) {
        await loadReferenceImages(userData.images);
        setStatus("✅ Ready to verify your face");
      } else {
        setStatus("❌ No reference images found for this user.");
      }
      return true;
    } catch (error) {
      console.error("Error fetching user data:", error);
      setStatus("❌ Failed to load user data.");
      return false;
    }
  };

  // ✅ Extract face descriptors from user's saved images
  const loadReferenceImages = async (images) => {
    try {
      const descriptors = [];
      for (const imgUrl of images) {
        const img = await faceapi.fetchImage(imgUrl);
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks(true)
          .withFaceDescriptor();
        if (detection) {
          descriptors.push(detection.descriptor);
        }
      }
      if (descriptors.length > 0) {
        setReferenceDescriptors(descriptors);
      } else {
        throw new Error("No faces detected in reference images");
      }
    } catch (err) {
      console.error("Error loading reference images:", err);
      throw err;
    }
  };

  // ✅ Load models, then user data, then start camera (SEQUENTIAL)
  useEffect(() => {
    if (loading) return; // Wait for auth context to load

    const initializeVerification = async () => {
      try {
        setPageLoader(true);
        setStatus("Loading models...");

        // Step 1: Load all models
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setStatus("Models loaded ✅ Loading user data...");

        // Step 2: Fetch user and reference images
        const userLoaded = await fetchUser();
        
        if (!userLoaded) {
          setPageLoader(false);
          return;
        }

        // Step 3: Start camera only after everything is ready
        setStatus("Starting camera...");
        await startVideo();
        setStatus("✅ Ready to verify your face");

      } catch (error) {
        console.error("Initialization failed:", error);
        setStatus("❌ Failed to initialize. Please refresh the page.");
      } finally {
        setPageLoader(false);
      }
    };

    initializeVerification();
  }, [loading, user?._id]);

  // ✅ Detect face from live camera
  const detectFaceFromCamera = async () => {
    if (!videoRef.current) return null;
    const detection = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks(true)
      .withFaceDescriptor();
    return detection ? detection.descriptor : null;
  };

  // ✅ Compare camera face with reference faces
  const handleVerify = async () => {
    if (referenceDescriptors.length === 0) {
      setStatus("❌ No reference descriptors available.");
      return;
    }

    setStatus("📸 Detecting face from camera...");
    const liveDescriptor = await detectFaceFromCamera();
    if (!liveDescriptor) {
      setStatus("❌ No face detected. Try again.");
      setShowRetryOptions(true);
      setVerificationResult({
        success: false,
        similarity: 0,
        message: "No face detected. Please ensure your face is clearly visible."
      });
      return;
    }

    let bestSimilarity = 0;
    referenceDescriptors.forEach((refDesc) => {
      const dist = faceapi.euclideanDistance(liveDescriptor, refDesc);
      const similarity = 1 - Math.min(dist / 2, 1);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
      }
    });

    const threshold = 0.75;
    if (bestSimilarity >= threshold) {
      try {
        setSubmitting(true);
        await axios.put(`${BASE_URL}/api/auth/onboarding/${user._id}`, {
          verified: true
        });

        // Stop camera before navigating
        stopCamera();
        router("/login");
      } catch (error) {
        console.error("Error verifying face:", error);
        setStatus("❌ Error updating verification status.");
      } finally {
        setSubmitting(false);
      }

      setVerificationResult({
        success: true,
        similarity: bestSimilarity,
        message: `Verification successful! Similarity: ${(bestSimilarity * 100).toFixed(1)}%`
      });
      setNotificationType("success");
      setShowNotification(true);
    } else {
      setVerificationResult({
        success: false,
        similarity: bestSimilarity,
        message: `Verification failed. Best similarity: ${(bestSimilarity * 100).toFixed(1)}%`
      });
      setStatus(`❌ Verification failed. Best similarity: ${(bestSimilarity * 100).toFixed(1)}%`);
      setShowRetryOptions(true);
      setNotificationType("error");
      setShowNotification(true);
    }
  };

  // ✅ Retry verification
  const handleRetry = () => {
    setShowRetryOptions(false);
    setVerificationResult(null);
    setStatus("Ready to verify. Click 'Verify Face' to try again.");
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
        <p className="text-center text-gray-600 mb-4">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
        <p className="mb-4 text-sm text-gray-700 text-center">{status}</p>

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

        {!showRetryOptions ? (
          // Normal state - Verify Face button
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleVerify}
              disabled={submitting}
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
                Similarity: {verificationResult?.similarity ? (verificationResult.similarity * 100).toFixed(1) + '%' : 'N/A'}
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