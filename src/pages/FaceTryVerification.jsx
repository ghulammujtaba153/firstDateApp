import React, { useState, useRef, useEffect } from "react";
import { BASE_URL } from "../config/url";

const FaceTryVerification = () => {
  const [selfie, setSelfie] = useState(null); // data URL
  const [idImage, setIdImage] = useState(null); // data URL
  const [result, setResult] = useState("");
  const [apiData, setApiData] = useState(null); // <-- new: store Didit response
  const [loading, setLoading] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Start webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Camera access denied:", error);
      alert("Unable to access camera");
    }
  };

  // Stop webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Capture selfie as data URL (no Cloudinary)
  const captureSelfie = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    setSelfie(imageData);
  };

  // Convert File -> data URL
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Handle ID upload: convert to data URL (no Cloudinary)
  const handleIdUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      setIdImage(dataUrl);
    } catch (err) {
      console.error("Failed to read file:", err);
      alert("Failed to read ID image");
    }
  };

  // helper: convert dataURL -> Blob
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

  // Compare both images via backend proxy (send multipart/form-data)
  const handleCompare = async () => {
    if (!selfie || !idImage) {
      alert("Please capture a selfie and upload an ID image first");
      return;
    }

    setLoading(true);
    setResult("");
    setApiData(null);

    try {
      const form = new FormData();
      form.append("user_image", dataURLToBlob(selfie), "selfie.png");
      form.append("ref_image", dataURLToBlob(idImage), "id.png");

      const res = await fetch(`${BASE_URL}/api/verify-face`, {
        method: "POST",
        body: form,
      });

      // attempt to parse JSON safely
      let data;
      try {
        data = await res.json();
      } catch (err) {
        const text = await res.text().catch(() => "");
        data = text ? { raw: text } : null;
      }

      console.log("API Response:", data);
      setApiData(data);

      // derive friendly result if Didit returned expected shape
      const faceMatch = data?.face_match ?? data?.result ?? data;
      const status = faceMatch?.status ?? data?.match ?? data?.is_match;
      const score = faceMatch?.score ?? data?.confidence;

      if (res.ok) {
        if (typeof score === "number") {
          setResult(score >= 75 ? `✅ Faces Match — score ${score}` : `❌ Faces Do Not Match — score ${score}`);
        } else if (typeof status === "string") {
          setResult(status === "Approved" || status === "Match" ? `✅ ${status}` : `❌ ${status}`);
        } else {
          setResult("✅ Verification completed — see details below");
        }
      } else {
        setResult(data?.message || "Verification failed. See details below.");
      }
    } catch (error) {
      console.error("Error during face verification:", error);
      setResult("Error during verification. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <h2>🧠 Face Verification</h2>

      <div style={{ marginTop: 12 }}>
        <video
          ref={videoRef}
          autoPlay
          width="320"
          height="240"
          style={{ borderRadius: 10, border: "2px solid #007bff" }}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={startCamera} style={{ marginRight: 8 }}>
          Start Camera
        </button>
        <button onClick={captureSelfie} style={{ marginRight: 8 }}>
          Capture Selfie
        </button>
        <button onClick={stopCamera}>Stop Camera</button>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {selfie && (
        <div style={{ marginTop: 12 }}>
          <p>📸 Captured Selfie:</p>
          <img
            src={selfie}
            alt="Selfie"
            width="200"
            style={{ borderRadius: 10, border: "1px solid #ccc" }}
          />
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <p>🪪 Upload ID Document:</p>
        <input type="file" accept="image/*" onChange={handleIdUpload} />
      </div>

      {idImage && (
        <div style={{ marginTop: 12 }}>
          <p>🖼 Uploaded ID Image:</p>
          <img
            src={idImage}
            alt="ID"
            width="200"
            style={{ borderRadius: 10, border: "1px solid #ccc" }}
          />
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleCompare}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          {loading ? "Verifying..." : "Compare Faces"}
        </button>
      </div>

      {result && (
        <p style={{ marginTop: 20, fontWeight: "bold" }}>{result}</p>
      )}

      {/* Show a friendly parsed summary and raw JSON for debugging */}
      {apiData && (
        <div style={{ textAlign: "left", maxWidth: 720, margin: "20px auto", background: "#fafafa", padding: 12, borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Verification details</h3>

          {/* Friendly summary */}
          <div style={{ marginBottom: 8 }}>
            <strong>Request ID:</strong> {apiData.request_id ?? apiData.id ?? "-"}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Status:</strong> {apiData?.face_match?.status ?? apiData?.status ?? "-"}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Score:</strong> {apiData?.face_match?.score ?? apiData?.confidence ?? "-"}
          </div>

          {/* Optional entities info */}
          {apiData?.face_match?.user_image?.entities && (
            <div style={{ marginBottom: 8 }}>
              <strong>User image entities:</strong>
              <ul>
                {apiData.face_match.user_image.entities.map((e, i) => (
                  <li key={i}>age:{e.age ?? "-"} confidence:{(e.confidence ?? "-").toString().slice(0,6)}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Raw JSON */}
          <details style={{ marginTop: 8 }}>
            <summary>Raw response (click to expand)</summary>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 400, overflow: "auto", marginTop: 8 }}>
              {JSON.stringify(apiData, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default FaceTryVerification;
