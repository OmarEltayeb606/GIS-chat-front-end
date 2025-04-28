import React, { useState, useRef } from 'react';
import axios from 'axios';
import L from 'leaflet'; // استيراد مكتبة Leaflet
import './addlayerbutton.css';

const AddLayerButton = ({ onAddLayer }) => {
  const [showModal, setShowModal] = useState(false);
  const [layerName, setLayerName] = useState('');
  const fileInputRef = useRef(null);

  const toggleModal = () => {
    setShowModal(!showModal);
    setLayerName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      alert('لم يتم اختيار أي ملفات.');
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('FastAPI Response:', JSON.stringify(response.data, null, 2));

      const results = response.data;
      if (!Array.isArray(results)) {
        throw new Error('استجابة الخادم غير متوقعة: يجب أن تكون مصفوفة.');
      }

      const newLayers = results
        .filter((data) => data.success)
        .map((data) => {
          const newLayer = {
            id: `layer-${Date.now()}-${data.name}`,
            name: layerName || data.name,
            type: data.type,
            visible: true,
            data: data.type === 'vector' ? data.geojson : data.data,
            bounds: data.type === 'raster' ? data.bounds : L.geoJSON(data.geojson).getBounds(), // حساب الحدود للطبقات من نوع vector
            zIndex: 100,
          };
          console.log('New Layer:', JSON.stringify(newLayer, null, 2));
          return newLayer;
        });

      if (newLayers.length === 0) {
        alert('لم يتم رفع أي طبقات بنجاح. تحقق من الملفات وأعد المحاولة.');
        return;
      }

      onAddLayer(newLayers);

      const failedFiles = results.filter((data) => !data.success);
      if (failedFiles.length > 0) {
        const errorMessages = failedFiles.map((data) => `خطأ في ${data.name}: ${data.error}`).join('\n');
        alert(`تم رفع بعض الطبقات بنجاح، لكن حدثت أخطاء في:\n${errorMessages}`);
      }

      toggleModal();
    } catch (error) {
      console.error('Error handling file upload:', error.message);
      alert(`خطأ أثناء رفع الملفات: ${error.message}`);
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
                <p>اختر الملفات:</p>
                <input
                  type="file"
                  accept=".shp,.dbf,.shx,.prj,.tif,.tiff"
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button type="button" onClick={() => fileInputRef.current.click()} className="file-select-button">
                  اختر ملفات
                </button>
                <p className="file-formats">
                  الملفات المدعومة: SHP (مع الملفات المرتبطة)، TIFF
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