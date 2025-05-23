import React, { useState, useRef } from 'react';
import axios from 'axios';
import './addlayerbutton.css';

const AddLayerButton = ({ onAddLayer }) => {
  const [showModal, setShowModal] = useState(false);
  const [layerName, setLayerName] = useState('');
  const [layerColor, setLayerColor] = useState('#ff0000');
  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB to match backend

  const toggleModal = () => {
    setShowModal(!showModal);
    setLayerName('');
    setLayerColor('#ff0000');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      console.error('No files selected');
      return;
    }

    // Validate file sizes and log file details
    for (const file of files) {
      console.log(`File: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}, LastModified: ${new Date(file.lastModified)}`);
      if (file.size > MAX_FILE_SIZE) {
        console.error(`File ${file.name} exceeds size limit: ${file.size} bytes`);
        return;
      }
      if (file.size === 0) {
        console.error(`File ${file.name} is empty`);
        return;
      }
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    // Log FormData entries
    console.log('FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value.name}, Size: ${value.size} bytes, Type: ${value.type}`);
    }

    try {
      console.log('Sending POST request to http://localhost:8000/upload');
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 600000, // 10 minutes timeout for large files
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });
      console.log('FastAPI Response:', JSON.stringify(response.data, null, 2));

      const results = response.data;
      if (!Array.isArray(results)) {
        throw new Error('استجابة الخادم غير متوقعة: يجب أن تكون مصفوفة.');
      }

      const newLayers = results
        .filter((data) => data.success)
        .map((data) => {
          if (data.type === 'raster') {
            if (!data.bounds) {
              console.error(`Raster layer ${data.name} is missing bounds.`);
              return null;
            }
            if (!data.data) {
              console.error(`Raster layer ${data.name} is missing data.`);
              return null;
            }
          } else if (data.type === 'vector') {
            if (!data.geojson) {
              console.error(`Vector layer ${data.name} is missing geojson data.`);
              return null;
            }
          } else {
            console.error(`Unknown layer type for ${data.name}: ${data.type}`);
            return null;
          }

          const newLayer = {
            id: `layer-${Date.now()}-${data.name}`,
            name: layerName || data.name,
            type: data.type,
            visible: true,
            data: data.type === 'vector' ? data.geojson : data.data,
            bounds: data.bounds,
            crs: data.crs,
            zIndex: 100,
            color: layerColor,
            fillColor: layerColor,
            fillOpacity: 0.7,
          };
          console.log('New Layer:', JSON.stringify(newLayer, null, 2));
          return newLayer;
        })
        .filter((layer) => layer !== null);

      const failedFiles = results.filter((data) => !data.success);
      if (failedFiles.length > 0) {
        const errorMessages = failedFiles.map((data) => `خطأ في ${data.name}: ${data.error}`).join('\n');
        console.warn('Some files failed to upload:', errorMessages);
      }

      if (newLayers.length > 0) {
        onAddLayer(newLayers);
      }

      toggleModal();
    } catch (error) {
      console.error('Upload Error:', error.response?.data || error.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fileInputRef.current.click();
  };

  return (
    <div className="add-layer-container">
      <button className="add-layer-button" onClick={toggleModal}>
        إضافة طبقة
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>إضافة طبقة جديدة</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="layer-name">اسم الطبقة:</label>
                <input
                  type="text"
                  id="layer-name"
                  value={layerName}
                  onChange={(e) => setLayerName(e.target.value)}
                  placeholder="أدخل اسم الطبقة (اختياري)"
                />
              </div>
              <div className="form-group">
                <label htmlFor="layer-color">لون الطبقة:</label>
                <input
                  type="color"
                  id="layer-color"
                  value={layerColor}
                  onChange={(e) => setLayerColor(e.target.value)}
                  title="اختر لون الطبقة"
                />
              </div>
              <div className="form-group">
                <p>اختر الملفات:</p>
                <input
                  type="file"
                  accept=".shp,.dbf,.shx,.prj,.tif,.tiff,.zip,.geojson,application/geo+json,.json"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button type="button" onClick={() => fileInputRef.current.click()} className="file-select-button">
                  اختر ملفات
                </button>
                <p className="file-formats">
                  الملفات المدعومة: SHP (مع الملفات المرتبطة: .shp, .dbf, .shx, .prj)، TIFF, ZIP, GeoJSON
                </p>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  إضافة
                </button>
                <button type="button" onClick={toggleModal} className="cancel-button">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddLayerButton;