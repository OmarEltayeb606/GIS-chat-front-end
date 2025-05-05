import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const ImgView = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [fileName, setFileName] = useState('');
  const [metadata, setMetadata] = useState(null);
  const transformComponentRef = useRef(null);
  const imageRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/tiff'];
      if (!validTypes.includes(file.type)) {
        alert('Unsupported file format. Please upload JPEG, PNG, or TIFF.');
        return;
      }
      setFileName(file.name);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleImageLoad = (e) => {
    const img = e.target;
    const dimensions = `${img.naturalWidth} x ${img.naturalHeight}`;
    const aspectRatio = (img.naturalWidth / img.naturalHeight).toFixed(2);
    setMetadata({
      dimensions,
      aspectRatio,
      size: fileName ? `${(fileName.size / 1024).toFixed(2)} KB` : 'Unknown',
    });
  };

  const resetZoom = () => {
    if (transformComponentRef.current) {
      const { resetTransform } = transformComponentRef.current;
      resetTransform();
    }
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`,
  };

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  return (
    <motion.div 
      className={`imgview-container ${isFullscreen ? 'fullscreen' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="imgview-header">
        <h1>Advanced Image Viewer</h1>
        <p>Upload, zoom, pan, and analyze your geospatial imagery</p>
      </div>

      <div className="controls-wrapper">
        <motion.div 
          className="controls"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="control-group">
            <label htmlFor="image-upload" className="upload-button">
              <span className="icon">📂</span>
              Choose Image
            </label>
            <input
              id="image-upload"
              type="file"
              onChange={handleImageChange}
              accept="image/jpeg, image/png, image/tiff"
              style={{ display: 'none' }}
            />
          </div>

          <div className="control-group buttons">
            <motion.button 
              onClick={resetZoom} 
              disabled={!imageUrl}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="control-button"
              aria-label="Reset image zoom"
            >
              <span className="icon">🔍</span>
              Reset View
            </motion.button>
            
            <motion.button 
              onClick={toggleEditMode} 
              disabled={!imageUrl}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`control-button ${isEditing ? 'active' : ''}`}
              aria-label={isEditing ? 'Exit edit mode' : 'Enter edit mode'}
            >
              <span className="icon">✏️</span>
              {isEditing ? 'Exit Edit' : 'Edit Image'}
            </motion.button>
            
            <motion.button 
              onClick={toggleFullscreen} 
              disabled={!imageUrl}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="control-button"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <span className="icon">{isFullscreen ? '⤓' : '⤢'}</span>
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {isEditing && imageUrl && (
            <motion.div 
              className="editing-controls"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="slider-control">
                <label>Brightness: {brightness}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                />
              </div>
              
              <div className="slider-control">
                <label>Contrast: {contrast}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                />
              </div>
              
              <div className="slider-control">
                <label>Saturation: {saturation}%</label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                />
              </div>
              
              <motion.button 
                onClick={resetFilters}
                className="reset-filters-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Reset image filters"
              >
                Reset Filters
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="imgview-main">
        <div className="imgview-border">
          {!imageUrl && (
            <motion.div 
              className="placeholder"
              animate={{ 
                scale: [1, 1.02, 1],
                opacity: [0.7, 0.8, 0.7] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              <div className="upload-icon">🖼️</div>
              <p>Upload an image to begin</p>
              <p className="supported-formats">Supported formats: JPEG, PNG, TIFF</p>
            </motion.div>
          )}
          
          {imageUrl && (
            <TransformWrapper
              ref={transformComponentRef}
              initialScale={1}
              minScale={0.1}
              maxScale={10}
              centerOnInit={true}
              limitToBounds={false}
              wheel={{ step: 0.1 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <React.Fragment>
                  <div className="zoom-controls">
                    <motion.button 
                      onClick={() => zoomIn()}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="zoom-button"
                      aria-label="Zoom in"
                    >
                      +
                    </motion.button>
                    <motion.button 
                      onClick={() => zoomOut()}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="zoom-button"
                      aria-label="Zoom out"
                    >
                      -
                    </motion.button>
                    <motion.button 
                      onClick={() => resetTransform()}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="zoom-button reset"
                      aria-label="Reset zoom"
                    >
                      ↺
                    </motion.button>
                  </div>
                  
                  <TransformComponent>
                    <img
                      ref={imageRef}
                      src={imageUrl}
                      alt="Uploaded image"
                      style={filterStyle}
                      onLoad={handleImageLoad}
                      className="viewer-image"
                    />
                  </TransformComponent>
                </React.Fragment>
              )}
            </TransformWrapper>
          )}
        </div>
        
        <AnimatePresence>
          {imageUrl && metadata && (
            <motion.div 
              className="image-metadata"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <h3>Image Information</h3>
              <div className="metadata-grid">
                <div className="metadata-item">
                  <span className="label">File Name:</span>
                  <span className="value">{fileName}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Dimensions:</span>
                  <span className="value">{metadata.dimensions}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">Aspect Ratio:</span>
                  <span className="value">{metadata.aspectRatio}</span>
                </div>
                <div className="metadata-item">
                  <span className="label">File Size:</span>
                  <span className="value">{metadata.size}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="image-tips">
        <h3>Tips</h3>
        <ul>
          <li>Use the mouse wheel to zoom in and out</li>
          <li>Click and drag to pan around the image</li>
          <li>Use the edit tools to adjust brightness, contrast, and saturation</li>
          <li>Enable fullscreen mode for a better viewing experience</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default ImgView;