import React, { useEffect, useState } from 'react';
import axios from 'axios';
import cors from 'cors'

const API_URL = "http://localhost:3000";

function App() {
  const [file, setFile] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Fetch gallery images from S3
  const fetchGallery = async () => {
    try {
      const res = await axios.get(`${API_URL}/gallery`);
      setGallery(res.data.images);
    } catch (err) {
      console.error("Gallery fetch failed:", err);
      alert("Failed to load gallery.");
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Choose a file first!");
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post(`${API_URL}/upload`, formData);
      alert("Upload successful!");
      setFile(null);
      fetchGallery(); // refresh gallery after upload
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h2>🖼️ AWS S3 Image Uploader</h2>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      <hr />

      <h3>Gallery</h3>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {gallery.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`img-${i}`}
            width={200}
            style={{ margin: 10, borderRadius: 8 }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
