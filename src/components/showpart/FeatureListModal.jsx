import React, { useState } from 'react';
import './FeatureListModal.css';
import axios from 'axios';

const FeatureListModal = ({ 
  isOpen, 
  onClose, 
  layer, 
  onDeleteFeature 
}) => {
  const [selectedFeatures, setSelectedFeatures] = useState(new Set());
  const [deleteMode, setDeleteMode] = useState(false);

  if (!isOpen || !layer) return null;

  const handleSelectFeature = (featureId) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(featureId)) {
      newSelected.delete(featureId);
    } else {
      newSelected.add(featureId);
    }
    setSelectedFeatures(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedFeatures.size === 0) {
      alert('يرجى تحديد عناصر للحذف');
      return;
    }
    
    if (window.confirm(`هل تريد حذف ${selectedFeatures.size} عنصر؟`)) {
      selectedFeatures.forEach(featureId => {
        onDeleteFeature(layer.id, featureId);
      });
      setSelectedFeatures(new Set());
      setDeleteMode(false);
    }
  };

  const handleDownloadLayer = async () => {
    if (!layer.features || layer.features.length === 0) {
      alert('لا توجد عناصر لتنزيلها.');
      return;
    }
  
    try {
      const geojson = {
        type: "FeatureCollection",
        features: layer.features
      };
  
      const response = await axios.post('http://localhost:8000/export-to-shapefile', 
        { geojson },
        { responseType: 'blob' }
      );
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'layer.zip';
      if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch.length === 2)
              filename = filenameMatch[1];
      }
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
  
    } catch (error) {
      console.error('Error downloading shapefile:', error);
      alert('حدث خطأ أثناء تنزيل الملف.');
    }
  };

  const handleDeleteClick = (featureId) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا العنصر؟')) {
      onDeleteFeature(layer.id, featureId);
    }
  };

  const getFeatureDescription = (feature, index) => {
    const geomType = feature.geometry.type;
    switch (geomType) {
      case 'Point':
        const coords = feature.geometry.coordinates;
        return `نقطة (${coords[1].toFixed(4)}, ${coords[0].toFixed(4)})`;
      case 'LineString':
        return `خط (${feature.geometry.coordinates.length} نقطة)`;
      case 'Polygon':
        return `مضلع (${feature.geometry.coordinates[0].length} رؤوس)`;
      default:
        return `عنصر ${index + 1}`;
    }
  };

  return (
    <div className="feature-modal-overlay">
      <div className="feature-modal">
        <div className="feature-modal-header">
          <h3>عناصر طبقة: {layer.name}</h3>
          <button 
            className="close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="feature-modal-content">
          <div className="feature-controls">
            <button 
              className={`btn ${deleteMode ? 'btn-danger' : 'btn-warning'}`}
              onClick={() => setDeleteMode(!deleteMode)}
            >
              {deleteMode ? 'إلغاء الحذف' : 'تفعيل الحذف'}
            </button>
            
            {deleteMode && (
              <button 
                className="btn btn-danger"
                onClick={handleDeleteSelected}
                disabled={selectedFeatures.size === 0}
              >
                حذف المحدد ({selectedFeatures.size})
              </button>
            )}
          </div>

          <div className="feature-list">
            {layer.features.length === 0 ? (
              <div className="no-features">
                <p>لا توجد عناصر في هذه الطبقة</p>
              </div>
            ) : (
              layer.features.map((feature, index) => (
                <div 
                  key={feature.id || index} 
                  className={`feature-item ${selectedFeatures.has(feature.id || index) ? 'selected' : ''}`}
                >
                  <div className="feature-info">
                    <span className="feature-index">{index + 1}</span>
                    <span className="feature-description">
                      {getFeatureDescription(feature, index)}
                    </span>
                  </div>
                  
                  {deleteMode && (
                    <input
                      type="checkbox"
                      checked={selectedFeatures.has(feature.id || index)}
                      onChange={() => handleSelectFeature(feature.id || index)}
                      className="feature-checkbox"
                    />
                  )}
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteClick(feature.id || index)}
                  >
                    حذف
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="feature-modal-footer">
          <div className="feature-stats">
            إجمالي العناصر: {layer.features.length}
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleDownloadLayer}
            disabled={!layer.features || layer.features.length === 0}
          >
            تنزيل الطبقة (Shapefile)
          </button>
          <button 
            className="btn btn-secondary"
            onClick={onClose}
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureListModal;