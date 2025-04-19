import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import L from 'leaflet';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import geoRaster from 'georaster';

function MapView() {
  const [layers, setLayers] = useState([]); // طبقات Vector (Shapefile)
  const [wmsLayers, setWmsLayers] = useState([]); // طبقات WMS
  const [rasterLayers, setRasterLayers] = useState([]); // طبقات Raster المحلية
  const [wmsOpacities, setWmsOpacities] = useState([]); // شفافية WMS
  const [rasterOpacities, setRasterOpacities] = useState([]); // شفافية Raster
  const [wmsVisibility, setWmsVisibility] = useState([]); // إظهار/إخفاء WMS
  const [rasterVisibility, setRasterVisibility] = useState([]); // إظهار/إخفاء Raster
  const [shapefileVisibility, setShapefileVisibility] = useState([]); // إظهار/إخفاء Vector
  const [error, setError] = useState(null);
  const [showOSM, setShowOSM] = useState(true); // إظهار OSM افتراضيًا
  const mapRef = useRef(null);
  const wmsLayersRef = useRef([]);
  const rasterLayersRef = useRef([]);
  const vectorLayersRef = useRef([]);

  const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // رفع الملفات
  const uploadFile = async (event) => {
    setError(null);
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError('لم يتم اختيار أي ملفات للرفع');
      return;
    }
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }
    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const result = await response.json();
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.type === 'shapefile') {
        if (result.geojson && result.geojson.features && result.geojson.features.length > 0) {
          const isValid = result.geojson.features.every(f =>
            f.geometry && f.geometry.coordinates && Array.isArray(f.geometry.coordinates)
          );
          if (isValid) {
            setLayers((prev) => [...prev, result.geojson]);
            setShapefileVisibility((prev) => [...prev, true]);
          } else {
            setError('GeoJSON يحتوي على إحداثيات غير صالحة');
          }
        } else {
          setError('GeoJSON غير صالح أو فارغ');
        }
      } else if (result.type === 'geotiff') {
        if (result.wmsUrl) {
          result.layerName.forEach((name) => {
            setWmsLayers((prev) => [...prev, { url: result.wmsUrl, layerName: name }]);
            setWmsOpacities((prev) => [...prev, 0.8]);
            setWmsVisibility((prev) => [...prev, true]);
          });
        } else {
          const arrayBuffer = await fetch(`http://localhost:5000${result.filePath}`).then(res => res.arrayBuffer());
          const raster = await geoRaster(arrayBuffer);
          setRasterLayers((prev) => [...prev, { data: raster, filePath: result.filePath }]);
          setRasterOpacities((prev) => [...prev, 0.8]);
          setRasterVisibility((prev) => [...prev, true]);
        }
      }
    } catch (error) {
      console.error('خطأ في الاتصال:', error);
      setError('فشل في الاتصال بالخادم: ' + error.message);
    }
  };

  // إزالة طبقة Shapefile
  const clearShapefile = (index) => {
    setLayers((prev) => prev.filter((_, i) => i !== index));
    setShapefileVisibility((prev) => prev.filter((_, i) => i !== index));
    if (vectorLayersRef.current[index]) {
      vectorLayersRef.current[index].remove();
      vectorLayersRef.current[index] = null;
    }
    setError(null);
  };

  // إزالة طبقة WMS
  const clearWmsLayer = (index) => {
    setWmsLayers((prev) => prev.filter((_, i) => i !== index));
    setWmsOpacities((prev) => prev.filter((_, i) => i !== index));
    setWmsVisibility((prev) => prev.filter((_, i) => i !== index));
    if (wmsLayersRef.current[index]) {
      wmsLayersRef.current[index].remove();
      wmsLayersRef.current[index] = null;
    }
  };

  // إزالة طبقة Raster
  const clearRasterLayer = (index) => {
    setRasterLayers((prev) => prev.filter((_, i) => i !== index));
    setRasterOpacities((prev) => prev.filter((_, i) => i !== index));
    setRasterVisibility((prev) => prev.filter((_, i) => i !== index));
    if (rasterLayersRef.current[index]) {
      rasterLayersRef.current[index].remove();
      rasterLayersRef.current[index] = null;
    }
  };

  // تحديث شفافية WMS
  const updateWmsOpacity = (index, opacity) => {
    setWmsOpacities((prev) => {
      const newOpacities = [...prev];
      newOpacities[index] = opacity;
      return newOpacities;
    });
    if (wmsLayersRef.current[index]) wmsLayersRef.current[index].setOpacity(opacity);
  };

  // تحديث شفافية Raster
  const updateRasterOpacity = (index, opacity) => {
    setRasterOpacities((prev) => {
      const newOpacities = [...prev];
      newOpacities[index] = opacity;
      return newOpacities;
    });
    if (rasterLayersRef.current[index]) rasterLayersRef.current[index].setOpacity(opacity);
  };

  // تبديل إظهار/إخفاء WMS
  const toggleWmsVisibility = (index) => {
    setWmsVisibility((prev) => {
      const newVisibility = [...prev];
      newVisibility[index] = !newVisibility[index];
      return newVisibility;
    });
  };

  // تبديل إظهار/إخفاء Raster
  const toggleRasterVisibility = (index) => {
    setRasterVisibility((prev) => {
      const newVisibility = [...prev];
      newVisibility[index] = !newVisibility[index];
      return newVisibility;
    });
  };

  // تبديل إظهار/إخفاء Shapefile
  const toggleShapefileVisibility = (index) => {
    setShapefileVisibility((prev) => {
      const newVisibility = [...prev];
      newVisibility[index] = !newVisibility[index];
      return newVisibility;
    });
  };

  // تبديل إظهار OSM
  const toggleOSM = () => setShowOSM(!showOSM);

  const pointToLayer = (feature, latlng) => {
    if (feature.geometry.type === 'Point') {
      return L.marker(latlng, { icon: customIcon });
    }
    return null;
  };

  // إدارة الطبقات عند التغيير
  useEffect(() => {
    if (mapRef.current) {
      // إنشاء panes
      if (!mapRef.current.getPane('wmsPane')) {
        mapRef.current.createPane('wmsPane').style.zIndex = 300;
      }
      if (!mapRef.current.getPane('rasterPane')) {
        mapRef.current.createPane('rasterPane').style.zIndex = 400;
      }
      if (!mapRef.current.getPane('vectorPane')) {
        mapRef.current.createPane('vectorPane').style.zIndex = 500;
      }

      // إضافة طبقات WMS
      wmsLayers.forEach((layer, index) => {
        if (wmsVisibility[index] && !wmsLayersRef.current[index]) {
          const wmsLayer = L.tileLayer.wms(layer.url, {
            layers: layer.layerName,
            format: 'image/png',
            transparent: true,
            opacity: wmsOpacities[index] || 0.8,
            pane: 'wmsPane',
          });
          wmsLayer.addTo(mapRef.current);
          wmsLayersRef.current[index] = wmsLayer;
        } else if (!wmsVisibility[index] && wmsLayersRef.current[index]) {
          wmsLayersRef.current[index].remove();
          wmsLayersRef.current[index] = null;
        }
      });

      // إضافة طبقات Raster
      rasterLayers.forEach((layer, index) => {
        if (rasterVisibility[index] && !rasterLayersRef.current[index]) {
          const rasterLayer = new GeoRasterLayer({
            georaster: layer.data,
            opacity: rasterOpacities[index] || 0.8,
            pane: 'rasterPane',
            resolution: 128,
          });
          rasterLayer.addTo(mapRef.current);
          rasterLayersRef.current[index] = rasterLayer;
        } else if (!rasterVisibility[index] && rasterLayersRef.current[index]) {
          rasterLayersRef.current[index].remove();
          rasterLayersRef.current[index] = null;
        }
      });

      // إضافة طبقات Vector
      layers.forEach((layer, index) => {
        if (shapefileVisibility[index] && !vectorLayersRef.current[index]) {
          const vectorLayer = L.geoJSON(layer, {
            pointToLayer: pointToLayer,
            pane: 'vectorPane',
            style: { color: 'black', weight: 1, fillOpacity: 0.2 },
          });
          vectorLayer.addTo(mapRef.current);
          vectorLayersRef.current[index] = vectorLayer;
        } else if (!shapefileVisibility[index] && vectorLayersRef.current[index]) {
          vectorLayersRef.current[index].remove();
          vectorLayersRef.current[index] = null;
        }
      });
    }
  }, [layers, shapefileVisibility, wmsLayers, wmsOpacities, wmsVisibility, rasterLayers, rasterOpacities, rasterVisibility]);

  return (
    <div className="map-container">
      <div className="controls">
        <label htmlFor="file-upload" className="upload-button">رفع ملفات</label>
        <input
          id="file-upload"
          type="file"
          multiple
          accept=".shp,.dbf,.shx,.prj,.tif,.tiff"
          onChange={uploadFile}
          style={{ display: 'none' }}
        />
        <label>
          <input type="checkbox" checked={showOSM} onChange={toggleOSM} />
          إظهار OSM
        </label>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      <div className="layers-list">
        {layers.map((_, index) => (
          <div key={`shp-${index}`} className="layer-item">
            <label>
              <input
                type="checkbox"
                checked={shapefileVisibility[index]}
                onChange={() => toggleShapefileVisibility(index)}
              />
              إظهار
            </label>
            <span style={{ cursor: 'default' }}>
              طبقة Shapefile {index + 1}
            </span>
            <button className="clear-button" onClick={() => clearShapefile(index)}>X</button>
          </div>
        ))}
        {wmsLayers.map((_, index) => (
          <div key={`wms-${index}`} className="layer-item">
            <label>
              <input
                type="checkbox"
                checked={wmsVisibility[index]}
                onChange={() => toggleWmsVisibility(index)}
              />
              إظهار
            </label>
            <span style={{ cursor: 'default' }}>
              طبقة Raster (WMS) {index + 1}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={wmsOpacities[index] || 0.8}
              onChange={(e) => updateWmsOpacity(index, parseFloat(e.target.value))}
              style={{ width: '100px', marginLeft: '10px' }}
            />
            <button className="clear-button" onClick={() => clearWmsLayer(index)}>X</button>
          </div>
        ))}
        {rasterLayers.map((_, index) => (
          <div key={`raster-${index}`} className="layer-item">
            <label>
              <input
                type="checkbox"
                checked={rasterVisibility[index]}
                onChange={() => toggleRasterVisibility(index)}
              />
              إظهار
            </label>
            <span style={{ cursor: 'default' }}>
              طبقة Raster (محلي) {index + 1}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={rasterOpacities[index] || 0.8}
              onChange={(e) => updateRasterOpacity(index, parseFloat(e.target.value))}
              style={{ width: '100px', marginLeft: '10px' }}
            />
            <button className="clear-button" onClick={() => clearRasterLayer(index)}>X</button>
          </div>
        ))}
      </div>
      <MapContainer
        ref={mapRef}
        center={[31.0, 32.0]}
        zoom={6}
        style={{ height: '500px', width: '100%' }}
        maxZoom={19}
        minZoom={0}
        maxBounds={[[-90, -180], [90, 180]]}
      >
        {showOSM && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap={true}
            minZoom={0}
            maxZoom={19}
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        )}
      </MapContainer>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <h1>Map View أساسي</h1>
      <MapView />
    </div>
  );
}