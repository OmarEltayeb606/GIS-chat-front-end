import React, { useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './screen.css';

function Screen() {
  const [layerName, setLayerName] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [opacity, setOpacity] = useState(0.8); // الشفافية الافتراضية
  const [showGeoLayer, setShowGeoLayer] = useState(true); // إظهار طبقة GeoServer افتراضيًا
  const [showOSM, setShowOSM] = useState(true); // إظهار OSM افتراضيًا

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadStatus('جارٍ الرفع...');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        setLayerName(result.layerName);
        setUploadStatus(`تم الرفع بنجاح! الطبقة: ${result.layerName}`);
      } else {
        setUploadStatus('فشل رفع الملف: ' + result.message);
      }
    } catch (error) {
      setUploadStatus('خطأ أثناء الرفع: ' + error.message);
    }
  };

  const handleOpacityChange = (event) => {
    setOpacity(parseFloat(event.target.value));
  };

  const toggleGeoLayer = () => {
    setShowGeoLayer(!showGeoLayer);
  };

  const toggleOSM = () => {
    setShowOSM(!showOSM);
  };

  return (
    <div>
      <div style={{ margin: '10px' }}>
        <input type="file" accept=".tif,.tiff" onChange={handleFileUpload} />
        <p>{uploadStatus}</p>

        {/* التحكم في الشفافية */}
        {layerName && (
          <div style={{ margin: '10px 0' }}>
            <label>شفافية المرئية: </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={handleOpacityChange}
            />
            <span> {opacity}</span>
          </div>
        )}

        {/* أزرار الإظهار/الإخفاء */}
        {layerName && (
          <div style={{ margin: '10px 0' }}>
            <button onClick={toggleGeoLayer}>
              {showGeoLayer ? 'إخفاء المرئية' : 'إظهار المرئية'}
            </button>
            <button onClick={toggleOSM} style={{ marginLeft: '10px' }}>
              {showOSM ? 'إخفاء OSM' : 'إظهار OSM'}
            </button>
          </div>
        )}
      </div>

      <MapContainer
        center={[31.5, 24.5]}
        zoom={5}
        style={{ height: '500px', width: '100%' }}
      >
        {/* طبقة OpenStreetMap */}
        {showOSM && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}

        {/* طبقة GeoServer */}
        {layerName && showGeoLayer && (
          <WMSTileLayer
            url="http://localhost:8080/geoserver/my_raster_workspace/wms"
            layers={`my_raster_workspace:${layerName}`}
            format="image/png"
            transparent={true}
            opacity={opacity}
          />
        )}
      </MapContainer>
    </div>
  );
}

export default Screen;
// control+z