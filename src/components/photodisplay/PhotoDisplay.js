import React, { useState } from 'react';
import Header from '../common/Header';
import './PhotoDisplay.css';

const PhotoDisplay = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }));
    setPreviewUrls(urls);
  };

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="photo-display-container">
          <div className="photo-display-content">
            <div className="upload-section">
              <h2>Upload Photos</h2>
              <div className="file-input-container">
                <label className="file-input-label">
                  <i className="fas fa-cloud-upload-alt"></i>
                  Choose Files
                  <input
                    type="file"
                    className="file-input"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </div>

            {previewUrls.length > 0 && (
              <div className="preview-section">
                {previewUrls.map((preview, index) => (
                  <div key={index} className="preview-card">
                    <img
                      src={preview.url}
                      alt={preview.name}
                      className="preview-image"
                    />
                    <div className="preview-info">
                      <h3>{preview.name}</h3>
                      <p>{preview.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default PhotoDisplay; 