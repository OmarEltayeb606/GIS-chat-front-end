import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, ImageOverlay, useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddLayerButton from './AddLayerButton';
import LayerList from './LayerList';
import ToolBar from './toolbar';
import './MapView.css';
import { debounce } from 'lodash';
import { FaLayerGroup } from 'react-icons/fa';

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
  const [showLayerList, setShowLayerList] = useState(false);
  const [showToolBar, setShowToolBar] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('mapLayers', JSON.stringify(layers));
  }, [layers]);

  useEffect(() => {
    if (!mapRef.current) return;

    console.log('Map fully initialized');
    setIsMapReady(true);
    const map = mapRef.current;

    const onClick = (e) => {
      console.log('Map clicked:', e.latlng);
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
      window.scrollTo(0, 0);
    };

    map.on('click', onClick);

    return () => {
      map.off('click', onClick);
    };
  }, []); // إزالة mapRef.current من التبعيات وأي تبعيات أخرى غير ضرورية

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
    if (!isMapReady || !mapRef.current) {
      alert('الخريطة لم تُهيأ بعد. انتظر قليلاً ثم حاول مرة أخرى.');
      return;
    }

    const layer = layers.find((l) => l.id === layerId);
    if (!layer) {
      alert('الطبقة غير موجودة. تأكد من إضافة الطبقة أولاً.');
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
          alert('حدود الطبقة غير صالحة. تحقق من بيانات الطبقة.');
        }
      } else {
        alert('لا توجد بيانات أو حدود صالحة للطبقة.');
      }
    } catch (e) {
      alert(`خطأ أثناء التكبير على الطبقة: ${e.message}`);
    }
  }, [layers, isMapReady]); // إضافة التبعيات المفقودة

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

  const debouncedChangeOpacity = useCallback(
    debounce((layerId, opacity) => {
      console.log(`Changing opacity for layer ${layerId} to ${opacity}`);
      if (opacity < 0 || opacity > 1) return;
      setLayers((prev) =>
        prev.map((layer) =>
          layer.id === layerId ? { ...layer, opacity } : layer
        )
      );
    }, 300),
    []
  );

  const handleChangeLayerOpacity = useCallback((layerId, opacity) => {
    debouncedChangeOpacity(layerId, opacity);
  }, [debouncedChangeOpacity]);

  const handleToolSelect = useCallback((tool) => {
    if (!isMapReady || !mapRef.current) {
      console.error('Map not initialized');
      console.log('خطأ: الخريطة لم تُهيأ بعد. انتظر قليلاً ثم حاول مرة أخرى.');
      return;
    }
    console.log(`Tool selected: ${tool}`);
    // لم يعد هناك أداة قياس، يمكن إضافة أدوات أخرى لاحقًا إذا لزم الأمر
  }, [isMapReady]);

  const handleToggleBaseMap = useCallback(() => {
    setShowBaseMap((prev) => !prev);
  }, []);

  const pointToLayer = useCallback((feature, latlng) => {
    const layer = layers.find((l) => l.data === feature || l.id === feature.id);
    return L.circleMarker(latlng, {
      radius: 6,
      fillColor: layer?.color || '#ff7800',
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: layer?.opacity || 0.8,
    });
  }, [layers]);

  const memoizedLayers = useMemo(() => {
    return layers.map((layer) => (
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
    ));
  }, [layers, pointToLayer]);

  return (
    <div className="map-view">
      {showLayerList && (
        <LayerList
          layers={layers}
          onToggleVisibility={handleToggleVisibility}
          onZoomToLayer={handleZoomToLayer}
          onDeleteLayer={handleDeleteLayer}
          onChangeLayerColor={handleChangeLayerColor}
          onChangeLayerOpacity={handleChangeLayerOpacity}
          showBaseMap={showBaseMap}
          onToggleBaseMap={handleToggleBaseMap}
          addLayerButton={<AddLayerButton onAddLayer={handleAddLayer} />}
        />
      )}
      {showToolBar && (
        <ToolBar
          onToolSelect={handleToolSelect}
          measurements={[]} // لم يعد هناك قياسات
          onDeleteMeasurement={() => {}} // دالة فارغة للحفاظ على التوافق
        />
      )}
      <div className="toggle-buttons toggle-buttons-left">
        <button
          className="toggle-button"
          onClick={() => setShowLayerList((prev) => !prev)}
          title={showLayerList ? 'إخفاء الطبقات' : 'إظهار الطبقات'}
        >
          <FaLayerGroup />
        </button>
      </div>
      <MapContainer
        center={[24.7136, 46.6753]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
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
        {memoizedLayers}
        <FitBounds layers={layers} />
      </MapContainer>
    </div>
  );
};

export default MapView;