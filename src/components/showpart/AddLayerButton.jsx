import React, { useState, useRef } from 'react';
import axios from 'axios';
import './addlayerbutton.css';

const AddLayerButton = ({ onAddLayer }) => {
  const [showModal, setShowModal] = useState(false);
  const [layerName, setLayerName] = useState('');
  const [layerColor, setLayerColor] = useState('#ff0000'); // اللون الافتراضي (أحمر)
  const fileInputRef = useRef(null);

  const toggleModal = () => {
    setShowModal(!showModal);
    setLayerName('');
    setLayerColor('#ff0000'); // إعادة تعيين اللون إلى قيمة افتراضية واضحة
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
          if (data.type === 'raster') {
            if (!data.bounds) {
              console.error(`Raster layer ${data.name} is missing bounds.`);
              alert(`خطأ: طبقة ${data.name} من نوع raster تفتقد الحدود (bounds).`);
              return null;
            }
            if (!data.data) {
              console.error(`Raster layer ${data.name} is missing data.`);
              alert(`خطأ: طبقة ${data.name} من نوع raster تفتقد البيانات (data).`);
              return null;
            }
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
            color: layerColor, // لون الإطار
            fillColor: layerColor, // لون الملء (مركز الدائرة)
            fillOpacity: 0.7, // التأكد من أن الملء مرئي
          };
          console.log('New Layer being sent to MapView:', JSON.stringify(newLayer, null, 2));
          return newLayer;
        })
        .filter((layer) => layer !== null);

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
                  الملفات المدعومة: SHP (مع الملفات المرتبطة)، TIFF، ZIP، GeoJSON
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