import React, { useState } from 'react';
import { ResizableBox } from 'react-resizable';
import './LayerList.css';

const LayerList = ({
  layers,
  onToggleVisibility,
  onZoomToLayer,
  onDeleteLayer,
  onChangeLayerColor,
  onChangeLayerOpacity,
  onReorderLayers,
  showBaseMap,
  onToggleBaseMap,
  addLayerButton,
}) => {
  const [width, setWidth] = useState(250); // العرض الافتراضي للقائمة

  const handleResize = (event, { size }) => {
    setWidth(size.width);
  };

  return (
    <ResizableBox
      width={width}
      height={Infinity}
      minConstraints={[250, Infinity]}
      maxConstraints={[500, Infinity]}
      resizeHandles={['e']} // المقبض على الجانب الأيمن
      className="layer-list-container"
      onResize={handleResize}
    >
      <div className="layer-list" style={{ width: `${width}px` }}>
        <h3>الطبقات</h3>
        {/* زر إضافة الملفات */}
        <div className="add-layer-button-container">
          {addLayerButton}
        </div>

        {/* إعدادات الخريطة الأساسية */}
        <div className="base-map-toggle">
          <label>
            <input
              type="checkbox"
              checked={showBaseMap}
              onChange={onToggleBaseMap}
            />
            إظهار الخريطة الأساسية
          </label>
        </div>

        {/* قائمة الطبقات */}
        <ul>
          {layers.map((layer, index) => (
            <li key={layer.id} className="layer-item">
              <div className="layer-controls">
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => onToggleVisibility(layer.id)}
                />
                <span>{layer.name}</span>
                <button onClick={() => onZoomToLayer(layer.id)}>
                  التكبير
                </button>
                <button onClick={() => onDeleteLayer(layer.id)}>
                  حذف
                </button>
              </div>
              <div className="layer-settings">
                <label>
                  اللون:
                  <input
                    type="color"
                    value={layer.color || '#ff7800'}
                    onChange={(e) => onChangeLayerColor(layer.id, e.target.value)}
                  />
                </label>
                <label>
                  الشفافية:
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={layer.opacity || 0.65}
                    onChange={(e) => onChangeLayerOpacity(layer.id, parseFloat(e.target.value))}
                  />
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </ResizableBox>
  );
};

export default LayerList;