import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, ImageOverlay, useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import proj4 from 'proj4';
import epsg from 'epsg-index';
import 'leaflet/dist/leaflet.css';
import AddLayerButton from './AddLayerButton';
import LayerList from './LayerList';
import ToolBar from './toolbar';
import './MapView.css';
import { FaLayerGroup } from 'react-icons/fa';

proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

const fetchEpsgDefinition = async (epsgCode) => {
  try {
    const codeNumber = epsgCode.split(':')[1];
    const response = await fetch(`https://epsg.io/${codeNumber}.proj4`);
    if (!response.ok) {
      throw new Error(`Failed to fetch EPSG definition for ${epsgCode}`);
    }
    const proj4String = await response.text();
    return proj4String.trim();
  } catch (error) {
    console.error(`Error fetching EPSG definition for ${epsgCode}: ${error.message}`);
    return null;
  }
};

// دالة محسّنة لتخمين UTM Zone بناءً على الإحداثيات
const guessUTMZoneFromBounds = (bounds) => {
  const [bottomLeft, topRight] = bounds;
  const avgEasting = (bottomLeft[1] + topRight[1]) / 2; // متوسط easting
  const avgNorthing = (bottomLeft[0] + topRight[0]) / 2; // متوسط northing

  // تقدير خط الطول (Longitude) بناءً على easting
  // UTM Zone تغطي 6 درجات من خط الطول، والـ false easting في UTM هو 500000 متر
  const approxLongitude = ((avgEasting - 500000) / 111320); // 111320 متر لكل درجة تقريبًا عند خط الاستواء

  // حساب الـ UTM Zone
  const utmZone = Math.floor((approxLongitude + 180) / 6) + 1;
  // تحديد نصف الكرة الأرضية بناءً على northing (تقدير تقريبي)
  const hemisphere = avgNorthing >= 0 ? 'N' : 'S';
  const utmZoneCRS = hemisphere === 'N' ? `EPSG:326${utmZone < 10 ? '0' + utmZone : utmZone}` : `EPSG:327${utmZone < 10 ? '0' + utmZone : utmZone}`;
  console.log(`Guessed UTM Zone for bounds ${JSON.stringify(bounds)}: ${utmZone}${hemisphere}, CRS: ${utmZoneCRS}`);
  return utmZoneCRS;
};

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
    const transformLayers = async () => {
      const transformedLayers = await Promise.all(
        layers.map(async (layer) => {
          console.log(`Processing layer ${layer.name} with data:`, JSON.stringify(layer, null, 2)); // سجل للتأكد من البيانات
          if (layer.type === 'raster' && layer.bounds) {
            let sourceCRS = layer.crs?.toUpperCase();
            console.log(`Processing layer: ${layer.name}, CRS from layer: ${sourceCRS}`);

            if (!sourceCRS || !sourceCRS.startsWith('EPSG:')) {
              console.warn(`No valid CRS found for ${layer.name}. Attempting to determine CRS...`);
              if (layer.name.includes('LC09_L1TP_181038')) {
                sourceCRS = 'EPSG:32635';
                console.log(`Assigned CRS EPSG:32635 for ${layer.name} (Sallum region)`);
              } else if (layer.name.includes('LC08_L2SP_176039')) {
                sourceCRS = 'EPSG:32636';
                console.log(`Assigned CRS EPSG:32636 for ${layer.name} (East Cairo region)`);
              } else {
                console.log(`Cannot determine CRS for ${layer.name} based on name. Guessing UTM Zone from bounds...`);
                sourceCRS = guessUTMZoneFromBounds(layer.bounds);
              }
            }

            console.log(`Using CRS for ${layer.name}: ${sourceCRS}`);

            const [bottomLeft, topRight] = layer.bounds;
            if (
              sourceCRS === 'EPSG:4326' ||
              (-90 <= bottomLeft[0] && bottomLeft[0] <= 90 && -180 <= bottomLeft[1] && bottomLeft[1] <= 180 &&
               -90 <= topRight[0] && topRight[0] <= 90 && -180 <= topRight[1] && topRight[1] <= 180)
            ) {
              console.log(`Bounds for ${layer.name} are already in Lat/Lng (CRS: ${sourceCRS}). No transformation needed.`);
              return layer;
            }

            if (sourceCRS.startsWith('EPSG:')) {
              const epsgCode = sourceCRS;
              if (!proj4.defs(epsgCode)) {
                const epsgEntry = epsg[epsgCode.toLowerCase()];
                let proj4String = null;
                if (epsgEntry && epsgEntry.proj4) {
                  proj4String = epsgEntry.proj4;
                  console.log(`Loaded proj4 definition from epsg-index for ${epsgCode}: ${proj4String}`);
                } else {
                  console.log(`CRS ${epsgCode} not found in epsg-index. Fetching from epsg.io...`);
                  proj4String = await fetchEpsgDefinition(epsgCode);
                }

                if (proj4String) {
                  proj4.defs(epsgCode, proj4String);
                } else {
                  console.error(`Unsupported CRS: ${epsgCode}. Using fallback definition.`);
                  const zoneNumber = parseInt(epsgCode.slice(-2), 10);
                  proj4.defs(epsgCode, `+proj=utm +zone=${zoneNumber} +datum=WGS84 +units=m +no_defs`);
                }
              }

              try {
                const [bottomLeftLon, bottomLeftLat] = proj4(sourceCRS, 'EPSG:4326', [bottomLeft[1], bottomLeft[0]]);
                const [topRightLon, topRightLat] = proj4(sourceCRS, 'EPSG:4326', [topRight[1], topRight[0]]);
                const transformedBounds = [[bottomLeftLat, bottomLeftLon], [topRightLat, topRightLon]];
                console.log(`Transformed bounds for ${layer.name} (CRS: ${sourceCRS}):`, transformedBounds);
                return { ...layer, bounds: transformedBounds };
              } catch (e) {
                console.error(`Error transforming bounds for ${layer.name}: ${e.message}`);
                return layer;
              }
            } else {
              console.error(`Invalid CRS format for ${layer.name}: ${layer.crs}. Assuming bounds are in Lat/Lng.`);
              return layer;
            }
          }
          return layer;
        })
      );
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

    return () => {
      map.off('click', onClick);
    };
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
      console.log('خطأ: الخريطة لم تُهيأ بعد. انتظر قليلاً ثم حاول مرة أخرى.');
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
        return (
          <FeatureGroup key={layer.id}>
            <GeoJSON
              data={layer.data}
              style={{ color: layer.color || '#ff7800', weight: 2, opacity: layer.opacity || 0.65 }}
              pointToLayer={pointToLayer}
            />
          </FeatureGroup>
        );
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