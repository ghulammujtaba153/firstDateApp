import React, { useState, useRef } from "react";
import { BASE_URL } from "../config/url";
import upload from "../utils/upload"; // ✅ Cloudinary upload util

const FaceTryVerification = () => {
  const [selfie, setSelfie] = useState(null);
  const [idImage, setIdImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      alert("Unable to access camera");
    }
  };

  // Capture selfie and upload to Cloudinary
  const captureSelfie = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!video) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");

    // Convert base64 to file for upload
    const blob = await fetch(imageData).then((res) => res.blob());
    const file = new File([blob], "selfie.png", { type: "image/png" });

    const uploadedUrl = await upload(file); // ✅ Upload to Cloudinary
    setSelfie(uploadedUrl);
  };

  // Upload ID image to Cloudinary
  const handleIdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadedUrl = await upload(file); // ✅ Cloudinary upload
    setIdImage(uploadedUrl);
  };

  // Compare both images via backend proxy (avoiding CORS)
  const handleCompare = async () => {
    if (!selfie || !idImage) {
      alert("Please capture a selfie and upload an ID image first");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await fetch(`${BASE_URL}/api/verify-face`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfie, idImage }),
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (data?.result?.match === true) {
        setResult("✅ Faces Match!");
      } else if (data?.result?.match === false) {
        setResult("❌ Faces Do Not Match!");
      } else {
        setResult(data?.message || "Verification failed. Try again.");
      }
    } catch (error) {
      console.error("Error during face verification:", error);
      setResult("Error during verification. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>🧠 Face Verification</h2>

      {/* Camera Preview */}
      <video
        ref={videoRef}
        autoPlay
        width="320"
        height="240"
        style={{ borderRadius: "10px", border: "2px solid #007bff" }}
      ></video>
      <br />

      <button onClick={startCamera}>Start Camera</button>
      <button onClick={captureSelfie} style={{ marginLeft: "10px" }}>
        Capture & Upload Selfie
      </button>

      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {selfie && (
        <div style={{ marginTop: "10px" }}>
          <p>📸 Captured Selfie:</p>
          <img
            src={selfie}
            alt="Selfie"
            width="200"
            style={{ borderRadius: "10px", border: "1px solid #ccc" }}
          />
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <p>🪪 Upload ID Document:</p>
        <input type="file" accept="image/*" onChange={handleIdUpload} />
      </div>

      {idImage && (
        <div style={{ marginTop: "10px" }}>
          <p>🖼 Uploaded ID Image:</p>
          <img
            src={idImage}
            alt="ID"
            width="200"
            style={{ borderRadius: "10px", border: "1px solid #ccc" }}
          />
        </div>
      )}

      <button
        onClick={handleCompare}
        disabled={loading}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {loading ? "Verifying..." : "Compare Faces"}
      </button>

      {result && (
        <p style={{ marginTop: "20px", fontWeight: "bold" }}>{result}</p>
      )}
    </div>
  );
};

export default FaceTryVerification;
