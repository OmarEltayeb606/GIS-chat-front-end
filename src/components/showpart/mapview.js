import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import * as turf from '@turf/turf';
import { parseZip } from 'shpjs';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

const MapView = () => {
  const [geojson, setGeojson] = useState(null);
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  // تهيئة خريطة Leaflet
  useEffect(() => {
    if (!mapRef.current) return;

    const leafletMap = L.map(mapRef.current).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(leafletMap);

    setMap(leafletMap);

    return () => {
      leafletMap.remove();
    };
  }, []);

  // التعامل مع رفع ملف الشكل
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const geojsonData = await parseZip(arrayBuffer); // استخدام parseZip بدل parse
      setGeojson(geojsonData);

      if (map && geojsonData) {
        // إزالة الطبقة السابقة إذا وجدت
        if (layerRef.current) {
          map.removeLayer(layerRef.current);
        }

        // إضافة طبقة GeoJSON جديدة
        const layer = L.geoJSON(geojsonData, {
          style: {
            color: '#007bff',
            weight: 2,
            opacity: 0.8,
          },
        }).addTo(map);
        layerRef.current = layer;

        // التكبير إلى حدود الطبقة
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds);
        } else {
          // الرجوع إلى مركز الشكل باستخدام Turf.js
          const centroid = turf.centroid(geojsonData);
          const [lng, lat] = centroid.geometry.coordinates;
          map.setView([lat, lng], 8);
        }
      }
    } catch (error) {
      console.error('خطأ في تحليل ملف الشكل:', error);
      alert('فشل تحميل ملف الشكل. تأكد أنه ملف .zip صالح.');
    }
  };

  return (
    <motion.div
      className="mapview-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mapview-header">
        <h1>عارض الخرائط التفاعلي</h1>
        <p>ارفع واستعرض ملفات الشكل على خريطة تفاعلية</p>
      </div>

      <motion.div
        className="controls"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <label htmlFor="shapefile-upload" className="upload-button">
          <span className="icon">📂</span>
          رفع ملف شكل (.zip)
        </label>
        <input
          id="shapefile-upload"
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </motion.div>

      <div className="map-container">
        <div ref={mapRef} className="map" style={{ height: '500px', width: '100%' }} />
        {!geojson && (
          <motion.div
            className="placeholder"
            animate={{ opacity: [0.7, 0.8, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
          >
            <p>ارفع ملف شكل لبدء العرض</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MapView;