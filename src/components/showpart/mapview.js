import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, ImageOverlay, useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure';
import AddLayerButton from './AddLayerButton';
import LayerList from './LayerList';
import ToolBar from './toolbar';
import './MapView.css';

// مكون لضبط حدود الخريطة تلقائيًا
const FitBounds = ({ layers }) => {
  const map = useMap();
  useEffect(() => {
    const validBounds = layers
      .filter((layer) => layer.visible && layer.bounds)
      .map((layer) => layer.bounds);
    if (validBounds.length > 0) {
      console.log('Fitting bounds:', JSON.stringify(validBounds, null, 2));
      map.fitBounds(validBounds);
    }
  }, [layers, map]);
  return null;
};

const MapView = () => {
  const [layers, setLayers] = useState(() => {
    const savedLayers = sessionStorage.getItem('mapLayers');
    return savedLayers ? JSON.parse(savedLayers) : [];
  });
  const [showBaseMap, setShowBaseMap] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef(null);
  const measureControlRef = useRef(null);

  // حفظ الطبقات في sessionStorage
  useEffect(() => {
    sessionStorage.setItem('mapLayers', JSON.stringify(layers));
  }, [layers]);

  // التحقق من تهيئة الخريطة
  useEffect(() => {
    if (mapRef.current) {
      console.log('Map fully initialized');
      setIsMapReady(true);
    }
  }, [mapRef.current]);

  const handleAddLayer = useCallback((newLayer) => {
    console.log('Adding Layer:', JSON.stringify(newLayer, null, 2));
    setLayers((prev) => {
      const updatedLayers = [...prev, { ...newLayer, color: '#ff7800', opacity: 0.65 }];
      console.log('Updated Layers:', JSON.stringify(updatedLayers, null, 2));
      return updatedLayers;
    });
  }, []);

  const handleToggleVisibility = useCallback((layerId) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    );
  }, []);

  const handleZoomToLayer = useCallback((layerId) => {
    console.log(`Attempting to zoom to layer: ${layerId}`);
    console.log('Current layers:', JSON.stringify(layers, null, 2));
    if (!isMapReady || !mapRef.current) {
      console.error('Map not initialized');
      alert('خطأ: الخريطة لم تُهيأ بعد. انتظر قليلاً ثم حاول مرة أخرى.');
      return;
    }
    const layer = layers.find((l) => l.id === layerId);
    if (!layer) {
      console.error(`Layer ${layerId} not found`);
      alert('خطأ: الطبقة غير موجودة.');
      return;
    }

    const map = mapRef.current;
    try {
      if (layer.type === 'raster' && layer.bounds) {
        console.log(`Zooming to raster bounds: ${JSON.stringify(layer.bounds)}`);
        map.fitBounds(layer.bounds);
      } else if (layer.type === 'vector' && layer.data) {
        const geoJsonLayer = L.geoJSON(layer.data, {
          pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
            radius: 6,
            fillColor: layer.color || '#ff7800',
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: layer.opacity || 0.8,
          }),
        });
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          console.log(`Zooming to vector bounds: ${JSON.stringify(bounds)}`);
          map.fitBounds(bounds);
        } else {
          console.error(`Invalid bounds for vector layer ${layerId}`);
          alert('خطأ: حدود الطبقة غير صالحة.');
        }
      } else {
        console.error(`No valid bounds or data for layer ${layerId}`);
        alert('خطأ: لا توجد بيانات أو حدود صالحة للطبقة.');
      }
    } catch (e) {
      console.error(`Error zooming to layer ${layerId}: ${e.message}`);
      alert(`خطأ أثناء التكبير على الطبقة: ${e.message}`);
    }
  }, [layers, isMapReady]);

  const handleDeleteLayer = useCallback((layerId) => {
    console.log(`Deleting layer: ${layerId}`);
    setLayers((prev) => prev.filter((layer) => layer.id !== layerId));
  }, []);

  const handleChangeLayerColor = useCallback((layerId, color) => {
    console.log(`Changing color for layer ${layerId} to ${color}`);
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, color } : layer
      )
    );
  }, []);

  const handleChangeLayerOpacity = useCallback((layerId, opacity) => {
    console.log(`Changing opacity for layer ${layerId} to ${opacity}`);
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, opacity } : layer
      )
    );
  }, []);

  const handleReorderLayers = useCallback((sourceIndex, destinationIndex) => {
    setLayers((prev) => {
      const newLayers = [...prev];
      const [reorderedLayer] = newLayers.splice(sourceIndex, 1);
      newLayers.splice(destinationIndex, 0, reorderedLayer);
      return newLayers;
    });
  }, []);

  const handleToolSelect = useCallback((tool) => {
    if (!isMapReady || !mapRef.current) {
      console.error('Map not initialized');
      alert('خطأ: الخريطة لم تُهيأ بعد. انتظر قليلاً ثم حاول مرة أخرى.');
      return;
    }
    const map = mapRef.current;

    console.log(`Tool selected: ${tool}`);

    if (tool === 'measure') {
      if (!measureControlRef.current) {
        try {
          measureControlRef.current = L.control.measure({
            position: 'topright',
            primaryLengthUnit: 'meters',
            secondaryLengthUnit: 'kilometers',
            primaryAreaUnit: 'sqmeters',
            secondaryAreaUnit: 'hectares',
            activeColor: '#ff7800',
            completedColor: '#00ff00',
            captureZIndex: 10000,
            popupContent: function (layer) {
              const distance = layer.getMeasure ? layer.getMeasure() : null;
              const area = layer.getArea ? layer.getArea() : null;
              let html = '<div>';
              if (distance) {
                html += `<p>المسافة: ${distance.toFixed(2)} ${this.options.primaryLengthUnit}</p>`;
              }
              if (area) {
                html += `<p>المساحة: ${area.toFixed(2)} ${this.options.primaryAreaUnit}</p>`;
                html += `<p>المحيط: ${layer.getPerimeter ? layer.getPerimeter().toFixed(2) : 'غير متوفر'} ${this.options.primaryLengthUnit}</p>`;
              }
              html += '</div>';
              return html;
            },
          }).addTo(map);
          console.log('Measure control added');
          alert('أداة القياس مفعلة. انقر لتحديد نقاط لقياس المسافة أو ارسم مضلعًا لقياس المساحة.');
        } catch (e) {
          console.error(`Error adding measure control: ${e.message}`);
          alert(`خطأ في تفعيل أداة القياس: ${e.message}`);
        }
      } else {
        measureControlRef.current.remove();
        measureControlRef.current = null;
        console.log('Measure control removed');
        alert('أداة القياس مُعطلة.');
      }
    }
  }, [isMapReady]);

  const handleToggleBaseMap = useCallback(() => {
    setShowBaseMap((prev) => !prev);
  }, []);

  const pointToLayer = (feature, latlng) => {
    const layer = layers.find((l) => l.data === feature || l.id === feature.id);
    return L.circleMarker(latlng, {
      radius: 6,
      fillColor: layer?.color || '#ff7800',
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: layer?.opacity || 0.8,
    });
  };

  return (
    <div className="map-view">
      <AddLayerButton onAddLayer={handleAddLayer} />
      <LayerList
        layers={layers}
        onToggleVisibility={handleToggleVisibility}
        onZoomToLayer={handleZoomToLayer}
        onDeleteLayer={handleDeleteLayer}
        onChangeLayerColor={handleChangeLayerColor}
        onChangeLayerOpacity={handleChangeLayerOpacity}
        onReorderLayers={handleReorderLayers}
        showBaseMap={showBaseMap}
        onToggleBaseMap={handleToggleBaseMap}
      />
      <ToolBar onToolSelect={handleToolSelect} />
      <MapContainer
        center={[24.7136, 46.6753]}
        zoom={10}
        style={{ height: '100vh', width: '100%' }}
        whenReady={(map) => {
          console.log('MapContainer fully ready');
          mapRef.current = map.target;
          setIsMapReady(true);
        }}
      >
        {showBaseMap && (
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
        )}
        {layers.map((layer) => (
          layer.visible && (
            <FeatureGroup key={layer.id}>
              {layer.type === 'vector' ? (
                <GeoJSON
                  data={layer.data}
                  style={{ color: layer.color || '#ff7800', weight: 2, opacity: layer.opacity || 0.65 }}
                  pointToLayer={pointToLayer}
                />
              ) : (
                <ImageOverlay
                  url={`data:image/png;base64,${layer.data}`}
                  bounds={layer.bounds}
                  opacity={layer.opacity || 0.6}
                />
              )}
            </FeatureGroup>
          )
        ))}
        <FitBounds layers={layers} />
      </MapContainer>
    </div>
  );
};

export default MapView;