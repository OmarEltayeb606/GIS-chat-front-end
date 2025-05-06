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
  const [width, setWidth] = useState(250);
  const [showMetadata, setShowMetadata] = useState(null);

  const handleResize = (event, { size }) => {
    setWidth(size.width);
  };

  const handleDownloadLayer = (layer) => {
    if (layer.type !== 'vector' || !layer.data) {
      alert('لا يمكن تنزيل هذه الطبقة. فقط الطبقات المتجهة (vector) مدعومة.');
      return;
    }
    try {
      const geojson = JSON.parse(layer.data);
      if (!geojson.type || !geojson.features) {
        throw new Error('البيانات ليست بتنسيق GeoJSON صالح.');
      }
      const cleanedGeojson = {
        type: geojson.type,
        features: geojson.features.map((feature) => ({
          type: feature.type,
          geometry: feature.geometry,
          properties: feature.properties || {},
        })),
      };
      const blob = new Blob([JSON.stringify(cleanedGeojson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${layer.name}.geojson`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(`فشل تنزيل الطبقة ${layer.name}: ${e.message}`);
      alert(`خطأ أثناء التنزيل: ${e.message}`);
    }
  };

  const handleShowMetadata = (layer) => {
    setShowMetadata(layer);
  };

  const handleCloseMetadata = () => {
    setShowMetadata(null);
  };

  const getTableData = (layer) => {
    if (layer.type !== 'vector' || !layer.data) {
      return { columns: [], data: [] };
    }
    try {
      const geojson = JSON.parse(layer.data);
      if (!geojson.features || geojson.features.length === 0) {
        return { columns: [], data: [] };
      }
      const firstFeature = geojson.features[0];
      const columns = Object.keys(firstFeature.properties || {});
      const data = geojson.features.map((feature) => feature.properties || {});
      return { columns, data };
    } catch (e) {
      console.error(`فشل تحليل GeoJSON للطبقة ${layer.name}: ${e.message}`);
      return { columns: [], data: [] };
    }
  };

  return (
    <ResizableBox
      width={width}
      height={Infinity}
      minConstraints={[250, Infinity]}
      maxConstraints={[500, Infinity]}
      resizeHandles={['e']}
      className="layer-list-container"
      onResize={handleResize}
    >
      <div className="layer-list" style={{ width: `${width}px` }}>
        <h3>الطبقات</h3>
        <div className="add-layer-button-container">{addLayerButton}</div>
        <div className="base-map-toggle">
          <label>
            <input type="checkbox" checked={showBaseMap} onChange={onToggleBaseMap} />
            إظهار الخريطة الأساسية
          </label>
        </div>
        <ul>
          {layers.map((layer) => (
            <li key={layer.id} className="layer-item">
              <div className="layer-controls">
                <input
                  type="checkbox"
                  checked={layer.visible}
                  onChange={() => onToggleVisibility(layer.id)}
                />
                <span>{layer.name}</span>
                <button onClick={() => onZoomToLayer(layer.id)}>التكبير</button>
                <button onClick={() => handleShowMetadata(layer)}>البيانات الوصفية</button>
                {layer.type === 'vector' && (
                  <button onClick={() => handleDownloadLayer(layer)}>تنزيل</button>
                )}
                <button onClick={() => onDeleteLayer(layer.id)}>حذف</button>
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
        {showMetadata && (
          <div className="modal-overlay">
            <div className="metadata-modal">
              <h3>البيانات الوصفية للطبقة: {showMetadata.name}</h3>
              {showMetadata.type === 'vector' && showMetadata.data ? (
                (() => {
                  const { columns, data } = getTableData(showMetadata);
                  if (columns.length === 0 || data.length === 0) {
                    return <p>لا توجد بيانات وصفية متاحة.</p>;
                  }
                  return (
                    <div className="table-container">
                      <table className="metadata-table">
                        <thead>
                          <tr>
                            <th className="row-header">الرقم</th>
                            {columns.map((col) => (
                              <th key={col}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td className="row-header">{rowIndex + 1}</td>
                              {columns.map((col) => (
                                <td key={col}>{row[col] || ''}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              ) : (
                <p>لا توجد بيانات وصفية متاحة.</p>
              )}
              <button onClick={handleCloseMetadata} className="modal-close-button">إغلاق</button>
            </div>
          </div>
        )}
      </div>
    </ResizableBox>
  );
};

export default LayerList;