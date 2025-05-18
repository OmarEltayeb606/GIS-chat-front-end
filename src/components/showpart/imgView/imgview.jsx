import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useLanguage } from '../../../context/LanguageContext';
import { useTheme } from '../../../context/ThemeContext';
import './imgview.css';

const ImgView = () => {
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const transformComponentRef = useRef(null);
  const displayRef = useRef(null);

  const text = {
    ar: {
      title: 'عارض الصور المتقدم',
      subtitle: 'قم بتحميل الصور الجغرافية لتحويلها',
      uploadButton: 'اختر صورة',
      uploadPrompt: 'قم بتحميل صورة لبدء العمل',
      loading: 'جاري التحميل...',
      loadError: 'فشل في تحميل الصورة. حاول مرة أخرى أو استخدم صورة مختلفة.',
      timeoutError: 'انتهت مهلة تحميل الصورة. حاول مرة أخرى أو تحقق من اتصالك بالخادم.',
      supportedFormats: 'الصيغ المدعومة: JPEG، PNG، TIFF',
      alert: 'صيغة ملف غير مدعومة. يرجى تحميل صورة بصيغة JPEG، PNG، أو TIFF.',
      processingError: 'فشل في معالجة الصورة. تأكد من أن الملف صالح أو جرب ملفًا آخر.',
      serverError: 'فشل في الاتصال بالخادم لمعالجة الصورة. تأكد من أن الخادم يعمل.',
      zoomIn: 'تكبير',
      zoomOut: 'تصغير',
      resetZoom: 'إعادة تعيين',
    },
    en: {
      title: 'Advanced Image Viewer',
      subtitle: 'Upload geospatial imagery for conversion',
      uploadButton: 'Choose Image',
      uploadPrompt: 'Upload an image to begin',
      loading: 'Loading...',
      loadError: 'Failed to load the image. Please try again or use a different image.',
      timeoutError: 'Image loading timed out. Please try again or check your server connection.',
      supportedFormats: 'Supported formats: JPEG, PNG, TIFF',
      alert: 'Unsupported file format. Please upload JPEG, PNG, or TIFF.',
      processingError: 'Failed to process the image. Ensure the file is valid or try another file.',
      serverError: 'Failed to connect to the server to process the image. Ensure the server is running.',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      resetZoom: 'Reset',
    }
  };

  const handleImageChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const validTypes = ['image/jpeg', 'image/png', 'image/tiff'];
      if (!validTypes.includes(selectedFile.type)) {
        alert(text[lang].alert);
        return;
      }
      setFile(selectedFile);
      setIsLoading(true);
      setError(null);
      setImageData(null);

      const timeout = setTimeout(() => {
        setIsLoading(false);
        setError(text[lang].timeoutError);
        console.error('Image loading timed out after 10 seconds.');
      }, 10000);

      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('http://localhost:8000/convert-tiff', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (!result.success) {
          console.error('Backend error:', result.error);
          alert(text[lang].processingError);
          setIsLoading(false);
          clearTimeout(timeout);
          return;
        }

        setImageData(`data:image/png;base64,${result.data}`);
        setIsLoading(false);
        clearTimeout(timeout);
      } catch (error) {
        console.error('Error uploading image to backend:', error);
        alert(text[lang].serverError);
        setIsLoading(false);
        setError(text[lang].serverError);
        clearTimeout(timeout);
      }
    }
  };

  const handleZoomIn = () => {
    transformComponentRef.current?.zoomIn(0.2);
  };

  const handleZoomOut = () => {
    transformComponentRef.current?.zoomOut(0.2);
  };

  const handleResetZoom = () => {
    transformComponentRef.current?.resetTransform();
  };

  useEffect(() => {
    const preventScroll = (e) => {
      if (displayRef.current && displayRef.current.contains(e.target)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', preventScroll, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventScroll);
    };
  }, []);

  return (
    <motion.div 
      className={`imgview-container ${isDark ? 'dark-mode' : 'light-mode'} ${lang === 'ar' ? 'rtl' : 'ltr'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div id='filler'></div>
      <div className="imgview-header">
        <h1>{text[lang].title}</h1>
        <p>{text[lang].subtitle}</p>
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
              {text[lang].uploadButton}
            </label>
            <input
              id="image-upload"
              type="file"
              onChange={handleImageChange}
              accept="image/jpeg, image/png, image/tiff"
              style={{ display: 'none' }}
            />
          </div>
        </motion.div>
      </div>

      <div className="imgview-main">
        <div className="imgview-border" ref={displayRef}>
          {!imageData && !isLoading && !error && (
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
              <p>{text[lang].uploadPrompt}</p>
              <p className="supported-formats">{text[lang].supportedFormats}</p>
            </motion.div>
          )}
          
          {isLoading && (
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
              <div className="upload-icon">⏳</div>
              <p>{text[lang].loading}</p>
            </motion.div>
          )}
          
          {error && (
            <motion.div 
              className="placeholder error"
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
              <div className="upload-icon">❌</div>
              <p>{error}</p>
            </motion.div>
          )}
          
          {imageData && !isLoading && !error && (
            <motion.div 
              className="image-display"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={3}
                ref={transformComponentRef}
                wheel={{ step: 0.1 }}
                pinch={{ step: 0.1 }}
                doubleClick={{ disabled: true }}
                centerOnInit
                centerZoomedOut
              >
                <TransformComponent>
                  <img
                    src={imageData}
                    alt="Converted Image"
                    className="viewer-image"
                  />
                </TransformComponent>
              </TransformWrapper>
              <div className="zoom-controls">
                <button onClick={handleZoomIn} className="zoom-button" title={text[lang].zoomIn}>
                  +
                </button>
                <button onClick={handleZoomOut} className="zoom-button" title={text[lang].zoomOut}>
                  -
                </button>
                <button onClick={handleResetZoom} className="zoom-button reset" title={text[lang].resetZoom}>
                  ↺
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ImgView;