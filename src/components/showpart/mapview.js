import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, ImageOverlay, useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddLayerButton from './AddLayerButton';
import LayerList from './LayerList';
import ToolBar from './toolbar';
import './MapView.css';
import { FaLayerGroup } from 'react-icons/fa';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>حدث خطأ. يرجى المحاولة مرة أخرى.</h1>;
    }
    return this.props.children;
  }
}

// إصلاح مشكلة أيقونات Leaflet
L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const FitBounds = ({ layers }) => {
  const map = useMap();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    const validBounds = layers
      .filter((layer) => layer.visible && layer.bounds)
      .map((layer) => layer.bounds);
    if (validBounds.length > 0) {
      console.log('Initial fitting bounds:', JSON.stringify(validBounds, null, 2));
      map.fitBounds(validBounds);
      hasRun.current = true;
    }
  }, [map, layers]);

  return null;
};

const MapView = () => {
  const [layers, setLayers] = useState([]);
  const [processedLayers, setProcessedLayers] = useState([]);
  const [showBaseMap, setShowBaseMap] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showLayerList, setShowLayerList] = useState(false);
  const [showToolBar] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => {
    const transformLayers = () => {
      const transformedLayers = layers.map((layer) => {
        console.log(`Processing layer ${layer.name} with data:`, JSON.stringify(layer, null, 2));
        if (layer.type === 'vector' && layer.data) {
          try {
            const geojson = JSON.parse(layer.data);
            if (!geojson.type || !geojson.features) {
              console.error(`Invalid GeoJSON structure for ${layer.name}`);
              return { ...layer, data: null };
            }
            return layer;
          } catch (e) {
            console.error(`Error parsing GeoJSON for ${layer.name}: ${e.message}`);
            return { ...layer, data: null };
          }
        }
        return layer;
      });
      setProcessedLayers(transformedLayers);
    };
    transformLayers();
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
    return () => map.off('click', onClick);
  }, []);

  const handleAddLayer = useCallback((newLayers) => {
    console.log('Adding Layers:', JSON.stringify(newLayers, null, 2));
    setLayers((prev) => {
      const layersToAdd = Array.isArray(newLayers) ? newLayers : [newLayers];
      const updatedLayers = [
        ...prev,
        ...layersToAdd.map((layer) => ({
          ...layer,
          color: '#ff7800',
          opacity: 0.65,
        })),
      ];
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
    const layer = processedLayers.find((l) => l.id === layerId);
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
        const geoJsonLayer = L.geoJSON(JSON.parse(layer.data), {
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
  }, [processedLayers, isMapReady]);

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
    if (opacity < 0 || opacity > 1) return;
    const handler = setTimeout(() => {
      console.log(`Changing opacity for layer ${layerId} to ${opacity}`);
      setLayers((prev) =>
        prev.map((layer) =>
          layer.id === layerId ? { ...layer, opacity } : layer
        )
      );
    }, 300);
    return () => clearTimeout(handler);
  }, []);

  const handleToolSelect = useCallback((tool) => {
    if (!isMapReady || !mapRef.current) {
      console.error('Map not initialized');
      alert('خطأ: الخريطة لم تُهيأ بعد. انتظر قليلاً ثم حاول مرة أخرى.');
      return;
    }
    console.log(`Tool selected: ${tool}`);
  }, [isMapReady]);

  const handleToggleBaseMap = useCallback(() => {
    setShowBaseMap((prev) => !prev);
  }, []);

  const pointToLayer = useCallback((feature, latlng) => {
    const layer = processedLayers.find((l) => l.data === feature || l.id === feature.id);
    return L.circleMarker(latlng, {
      radius: 6,
      fillColor: layer?.color || '#ff7800',
      color: '#000',
      weight: 1,
      opacity: 1,
      fillOpacity: layer?.opacity || 0.8,
    });
  }, [processedLayers]);

  const memoizedLayers = useMemo(() => {
    return processedLayers.map((layer) => {
      if (!layer.visible) return null;
      if (layer.type === 'vector') {
        if (!layer.data) {
          console.error(`Vector layer ${layer.name} is missing data.`);
          return null;
        }
        try {
          const geojson = JSON.parse(layer.data);
          return (
            <FeatureGroup key={layer.id}>
              <GeoJSON
                data={geojson}
                style={{ color: layer.color || '#ff7800', weight: 2, opacity: layer.opacity || 0.65 }}
                pointToLayer={pointToLayer}
              />
            </FeatureGroup>
          );
        } catch (e) {
          console.error(`Failed to render vector layer ${layer.name} due to invalid GeoJSON: ${e.message}`);
          return null;
        }
      }
      if (layer.type === 'raster') {
        if (!layer.data || !layer.bounds) {
          console.error(`Raster layer ${layer.name} is missing data or bounds.`, {
            data: layer.data,
            bounds: layer.bounds,
          });
          return null;
        }
        console.log(`Rendering raster layer: ${layer.name}`, {
          url: `data:image/png;base64,${layer.data.substring(0, 50)}...`,
          bounds: layer.bounds,
        });
        return (
          <FeatureGroup key={layer.id}>
            <ImageOverlay
              url={`data:image/png;base64,${layer.data}`}
              bounds={layer.bounds}
              opacity={layer.opacity || 0.6}
              eventHandlers={{
                error: () => console.error(`Failed to load raster layer: ${layer.name}`),
                load: () => console.log(`Successfully loaded raster layer: ${layer.name}`),
              }}
            />
          </FeatureGroup>
        );
      }
      console.error(`Unknown layer type for layer ${layer.name}: ${layer.type}`);
      return null;
    });
  }, [processedLayers, pointToLayer]);

  return (
    <ErrorBoundary>
      <div className="map-view">
        {showLayerList && (
          <LayerList
            layers={processedLayers}
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
            measurements={[]}
            onDeleteMeasurement={() => {}}
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
          center={[31.70457386017354, 33.04699]}
          zoom={8}
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
          <FitBounds layers={processedLayers} />
        </MapContainer>
      </div>
    </ErrorBoundary>
  );
};

export default MapView;