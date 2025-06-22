import React, { useState } from 'react';
import './DrawingLayerManager.css';

const DrawingLayerManager = ({ 
  drawingLayers, 
  activeLayerId, 
  onSetActiveLayer, 
  onShowLayerFeatures,
  onDeleteDrawingLayer,
  onSaveLayer,
  onAddDrawingLayerClick
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [layerToSave, setLayerToSave] = useState(null);

  const handleSaveLayer = (layer) => {
    setLayerToSave(layer);
    setShowSaveModal(true);
  };

  const handleConfirmSave = () => {
    if (layerToSave) {
      onSaveLayer(layerToSave);
      setShowSaveModal(false);
      setLayerToSave(null);
    }
  };

  const handleCancelSave = () => {
    setShowSaveModal(false);
    setLayerToSave(null);
  };

  if (drawingLayers.length === 0) {
    return null;
  }

  return (
    <div className="drawing-layer-manager">
      <h4>طبقات الرسم</h4>
      {drawingLayers.map((layer) => (
        <div key={layer.id} className="drawing-layer-item">
          <div className="layer-header">
            <label className="layer-radio">
              <input
                type="radio"
                name="activeDrawingLayer"
                checked={activeLayerId === layer.id}
                onChange={() => onSetActiveLayer(layer.id)}
              />
              <span className="layer-name">{layer.name}</span>
              <span className="layer-type">({layer.geometryType})</span>
            </label>
          </div>
          
          <div className="layer-actions">
            <button 
              className="btn-small btn-info"
              onClick={() => onShowLayerFeatures(layer)}
              title="عرض العناصر"
            >
              📋
            </button>
            
            <button 
              className="btn-small btn-success"
              onClick={() => handleSaveLayer(layer)}
              title="حفظ الطبقة"
            >
              💾
            </button>
            
            <button 
              className="btn-small btn-danger"
              onClick={() => onDeleteDrawingLayer(layer.id)}
              title="حذف الطبقة"
            >
              🗑️
            </button>
          </div>
        </div>
      ))}

      {showSaveModal && (
        <div className="save-modal-overlay">
          <div className="save-modal">
            <div className="save-modal-header">
              <h3>حفظ الطبقة</h3>
            </div>
            <div className="save-modal-content">
              <p>هل تريد حفظ طبقة "{layerToSave?.name}" كملفات شيب فايل؟</p>
              <p>سيتم إنشاء 4 ملفات: .shp, .shx, .dbf, .prj</p>
            </div>
            <div className="save-modal-footer">
              <button 
                className="btn btn-primary"
                onClick={handleConfirmSave}
              >
                حفظ
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleCancelSave}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingLayerManager;