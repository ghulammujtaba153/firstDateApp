

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
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState("success");
  const [showRetryOptions, setShowRetryOptions] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const { user } = useAuth();
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

  // ✅ Fetch latest user data (with images)
  const fetchUser = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/${user._id}`);
      const userData = response.data;
      console.log("Fetched user:", userData);

      if (userData?.images?.length > 0) {
        await loadReferenceImages(userData.images);
      } else {
        setStatus("❌ No reference images found for this user.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setStatus("❌ Failed to load user data.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setStatus("Models loaded ✅ — starting camera...");
        startVideo();
        fetchUser();
      } catch (error) {
        console.error("Model loading failed:", error);
        setStatus("❌ Failed to load models. Check console.");
        setLoading(false);
      }
    };
    loadModels();
  }, []);

  // ✅ Start webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      })
      .catch((err) => {
        console.error("Camera access denied:", err);
        setStatus("❌ Camera access denied.");
      });
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
        setStatus("✅ Reference images loaded. Ready to verify.");
      } else {
        setStatus("❌ No faces detected in reference images.");
      }
    } catch (err) {
      console.error("Error loading reference images:", err);
      setStatus("❌ Failed to process reference images.");
    }
  };

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

        <div className="relative w-full mb-4">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full rounded-[50%] border-4 border-primary shadow-lg aspect-square object-cover"
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