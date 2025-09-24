import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

const FaceVerification = () => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("Loading models...");
  const [capturedDescriptor, setCapturedDescriptor] = useState(null);
  const [isFirstCapture, setIsFirstCapture] = useState(true);

  // ✅ Load models on component mount
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
      } catch (error) {
        console.error("Model loading failed:", error);
        setStatus("❌ Failed to load models. Check console.");
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
        }
      })
      .catch((err) => {
        console.error("Camera access denied:", err);
        setStatus("❌ Camera access denied.");
      });
  };

  // ✅ Detect face and return descriptor
  const detectFace = async () => {
    if (!videoRef.current) {
      setStatus("❌ Video not ready.");
      return null;
    }

    const detection = await faceapi
      .detectSingleFace(videoRef.current)
      .withFaceLandmarks(true)
      .withFaceDescriptor();

    if (!detection) {
      setStatus("❌ No face detected. Try again.");
      return null;
    }

    return detection.descriptor;
  };

  // ✅ Calculate similarity between two descriptors
  const calculateSimilarity = (descriptor1, descriptor2) => {
    // Euclidean distance between two descriptors
    let distance = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      distance += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    distance = Math.sqrt(distance);
    
    // Convert distance to similarity score (0-1, where 1 is identical)
    // Typical face recognition threshold is around 0.6
    const similarity = 1 - Math.min(distance / 2, 1);
    return similarity;
  };

  // ✅ Handle capture/verify button click
  const handleCapture = async () => {
    setStatus("📸 Detecting face...");

    const descriptor = await detectFace();
    if (!descriptor) return;

    if (isFirstCapture) {
      // First click - capture reference image
      setCapturedDescriptor(descriptor);
      setIsFirstCapture(false);
      setStatus("✅ Reference face captured! Click again to verify.");
    } else {
      // Second click - verify against captured image
      const similarity = calculateSimilarity(capturedDescriptor, descriptor);
      const threshold = 0.6; // Adjust this threshold as needed
      
      console.log(`Similarity score: ${similarity.toFixed(3)}`);

      if (similarity >= threshold) {
        setStatus(`✅ Verification successful! Similarity: ${(similarity * 100).toFixed(1)}%`);
      } else {
        setStatus(`❌ Verification failed. Similarity: ${(similarity * 100).toFixed(1)}%`);
      }

      // Reset for next capture cycle
      setCapturedDescriptor(null);
      setIsFirstCapture(true);
    }
  };

  // ✅ Reset capture state
  const handleReset = () => {
    setCapturedDescriptor(null);
    setIsFirstCapture(true);
    setStatus("Ready to capture new reference face.");
  };

  return (
    <div className="flex flex-col items-center py-6">
      <h1 className="text-2xl font-bold mb-4">🔐 Face Verification</h1>
      <p className="mb-4 text-gray-700">{status}</p>

      <video
        ref={videoRef}
        autoPlay
        muted
        width="400"
        height="300"
        style={{
          borderRadius: "12px",
          border: "3px solid #2563eb",
          boxShadow: "0 0 20px rgba(37, 99, 235, 0.4)",
        }}
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleCapture}
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          {isFirstCapture ? "📸 Capture Reference" : "🔍 Verify Face"}
        </button>
        
        {!isFirstCapture && (
          <button
            onClick={handleReset}
            className="px-5 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
          >
            🔄 Reset
          </button>
        )}
      </div>

      {capturedDescriptor && (
        <div className="mt-4 p-3 bg-green-100 rounded-lg">
          <p className="text-green-700">✅ Reference face captured and ready for verification</p>
        </div>
      )}
    </div>
  );
};

export default FaceVerification;