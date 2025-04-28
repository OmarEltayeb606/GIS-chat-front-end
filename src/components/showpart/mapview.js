import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, ImageOverlay, useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-measure/dist/leaflet-measure.css';
import 'leaflet-measure';
import AddLayerButton from './AddLayerButton';
import LayerList from './LayerList';
import ToolBar from './toolbar';
import './MapView.css';
import { debounce } from 'lodash';
import { FaLayerGroup, FaRulerCombined } from 'react-icons/fa';

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
  const [measurements, setMeasurements] = useState([]);
  const [showLayerList, setShowLayerList] = useState(false);
  const [showToolBar, setShowToolBar] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);
  const mapRef = useRef(null);
  const measureControlRef = useRef(null);
  const measurementIdRef = useRef(0);
  const markersRef = useRef([]);

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
      if (!isMeasuring) {
        window.scrollTo(0, 0);
      }
    };

    const onFocus = () => {
      if (isMeasuring) {
        const center = map.getCenter();
        const zoom = map.getZoom();
        map.setView(center, zoom);
        console.log('Map focused, center restored:', center);
      }
    };

    map.on('click', onClick);
    map.on('focus', onFocus);

    return () => {
      map.off('click', onClick);
      map.off('focus', onFocus);
    };
  }, [isMeasuring]); // إزالة mapRef.current من التبعيات

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

  const handleDeleteMeasurement = useCallback((measurementId) => {
    console.log(`Deleting measurement: ${measurementId}`);
    setMeasurements((prev) => prev.filter((m) => m.id !== measurementId));
    if (measureControlRef.current && measureControlRef.current._layers) {
      const layer = measureControlRef.current._layers[measurementId];
      if (layer) {
        mapRef.current.removeLayer(layer);
      }
    }
    markersRef.current.forEach((marker) => {
      if (marker.measurementId === measurementId) {
        mapRef.current.removeLayer(marker);
      }
    });
    markersRef.current = markersRef.current.filter((marker) => marker.measurementId !== measurementId);
  }, []);

  const handleRemoveLastPoint = useCallback(() => {
    console.log('Attempting to remove last point...');
    if (!isMeasuring || measurements.length === 0) {
      console.log('Cannot remove last point: Not measuring or no measurements available.');
      return;
    }

    const lastMeasurement = measurements[measurements.length - 1];
    if (!lastMeasurement || !lastMeasurement.layer) {
      console.log('Cannot remove last point: Last measurement or its layer is undefined.');
      return;
    }

    const latlngs = lastMeasurement.layer.getLatLngs();
    if (latlngs.length === 0) {
      console.log('Cannot remove last point: No points in the last measurement.');
      return;
    }

    // إزالة آخر نقطة من القياس
    latlngs.pop();
    lastMeasurement.layer.setLatLngs(latlngs);
    console.log('Last point removed from latlngs:', latlngs);

    // تحديث حالة measurements
    setMeasurements((prev) =>
      prev.map((m) =>
        m.id === lastMeasurement.id
          ? { ...m, points: latlngs.map((p) => ({ lat: p.lat, lng: p.lng })) }
          : m
      )
    );

    // إزالة الماركر المرتبط بآخر نقطة
    const lastMarker = markersRef.current[markersRef.current.length - 1];
    if (lastMarker) {
      mapRef.current.removeLayer(lastMarker);
      markersRef.current.pop();
      console.log('Last marker removed from map.');
    } else {
      console.log('No marker found to remove.');
    }

    console.log('Last point removed from measurement:', lastMeasurement.id);
  }, [isMeasuring, measurements]);

  const handleUpdateUnits = useCallback((unitOptions) => {
    if (measureControlRef.current) {
      console.log('Updating units:', unitOptions);
      measureControlRef.current.options.primaryLengthUnit = unitOptions.primaryLengthUnit || 'meters';
      measureControlRef.current.options.secondaryLengthUnit = unitOptions.secondaryLengthUnit || 'kilometers';
      measureControlRef.current.options.primaryAreaUnit = unitOptions.primaryAreaUnit || 'sqmeters';
      measureControlRef.current.options.secondaryAreaUnit = unitOptions.secondaryAreaUnit || 'hectares';
      measureControlRef.current._updateMeasureResults();
    }
  }, []);

  const toggleDragging = useCallback(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    setIsDraggingEnabled((prev) => {
      const newState = !prev;
      if (newState) {
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        console.log('Dragging and zooming enabled');
      } else {
        map.dragging.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        console.log('Dragging and zooming disabled');
      }
      return newState;
    });
  }, [isDraggingEnabled]); // إضافة isDraggingEnabled كتبعية

  const handleToolSelect = useCallback((tool) => {
    if (!isMapReady || !mapRef.current) {
      console.error('Map not initialized');
      console.log('خطأ: الخريطة لم تُهيأ بعد. انتظر قليلاً ثم حاول مرة أخرى.');
      return;
    }
    const map = mapRef.current;

    console.log(`Tool selected: ${tool}`);

    if (tool === 'measure') {
      if (!measureControlRef.current) {
        try {
          setIsMeasuring(true);
          setIsDraggingEnabled(false);
          map.dragging.disable();
          map.doubleClickZoom.disable();
          map.scrollWheelZoom.disable();
          map.boxZoom.disable();
          map.keyboard.disable();

          // إضافة رسالة توضيحية مع تعليمات استخدام Ctrl + Z
          alert('استخدم زر الفأرة الوسطى (بكرة الفأرة) لتحريك الخريطة أثناء القياس، أو استخدم زر "تفعيل السحب" في النافذة المنبثقة. اضغط Ctrl + Z للتراجع عن آخر نقطة.');

          measureControlRef.current = L.control.measure({
            position: 'topright',
            primaryLengthUnit: 'meters',
            secondaryLengthUnit: 'kilometers',
            primaryAreaUnit: 'sqmeters',
            secondaryAreaUnit: 'hectares',
            activeColor: '#ff7800',
            completedColor: '#00ff00',
            captureZIndex: 10000,
            fitBounds: false,
            showRemovePointButton: true,
            measureMode: 'both',
            units: {
              meters: { factor: 1, display: 'أمتار', decimals: 2 },
              kilometers: { factor: 0.001, display: 'كيلومترات', decimals: 2 },
              feet: { factor: 3.28084, display: 'أقدام', decimals: 2 },
              miles: { factor: 0.000621371, display: 'أميال', decimals: 2 },
              sqmeters: { factor: 1, display: 'متر مربع', decimals: 2 },
              hectares: { factor: 0.0001, display: 'هكتارات', decimals: 2 },
              acres: { factor: 0.000247105, display: 'أفدنة', decimals: 2 },
            },
            showUnitControl: false,
            onMiddleClick: () => {
              console.log('Middle click detected, toggling dragging...');
              toggleDragging();
            },
            popupContent: function (layer) {
              const distance = layer.getMeasure ? layer.getMeasure() : null;
              const area = layer.getArea ? layer.getArea() : null;
              const perimeter = layer.getPerimeter ? layer.getPerimeter() : null;
              const points = layer.getLatLngs ? layer.getLatLngs() : [];
              const measurementId = `measure-${measurementIdRef.current++}`;

              setMeasurements((prev) => [
                ...prev,
                {
                  id: measurementId,
                  distance,
                  area,
                  perimeter,
                  points: points.map((p) => ({ lat: p.lat, lng: p.lng })),
                  layer,
                },
              ]);

              // إضافة ماركرز مرئية لكل نقطة
              points.forEach((point, index) => {
                const marker = L.marker(point, { draggable: true }).addTo(map);
                marker.measurementId = measurementId;
                marker.pointIndex = index;
                markersRef.current.push(marker);

                marker.on('dragend', (event) => {
                  const newLatLng = event.target.getLatLng();
                  const latlngs = layer.getLatLngs();
                  latlngs[index] = newLatLng;
                  layer.setLatLngs(latlngs);
                  setMeasurements((prev) =>
                    prev.map((m) =>
                      m.id === measurementId
                        ? { ...m, points: latlngs.map((p) => ({ lat: p.lat, lng: p.lng })) }
                        : m
                    )
                  );
                  console.log(`Point ${index} moved to:`, newLatLng);
                });
              });

              let html = `
                <div style="max-height: 200px; overflow-y: auto; font-size: 14px;">
                  <h4>نتائج القياس</h4>
              `;
              if (distance) {
                html += `<p>الطول: ${distance.toFixed(2)} ${this.options.primaryLengthUnit}</p>`;
              }
              if (area) {
                html += `<p>المساحة: ${area.toFixed(2)} ${this.options.primaryAreaUnit}</p>`;
              }
              if (perimeter) {
                html += `<p>المحيط: ${perimeter.toFixed(2)} ${this.options.primaryLengthUnit}</p>`;
              }
              html += `
                  <h4>النقاط</h4>
                  <ul style="padding: 0; list-style: none;">
              `;
              points.forEach((point, index) => {
                html += `
                  <li style="margin-bottom: 5px;">
                    نقطة ${index + 1}: (${point.lng.toFixed(6)}, ${point.lat.toFixed(6)})
                    <button onclick="window.dispatchEvent(new CustomEvent('removePoint', { detail: { measurementId: '${measurementId}', pointIndex: ${index} } }))" style="margin-left: 10px; color: red;">حذف</button>
                  </li>
                `;
              });
              html += `
                  </ul>
                  <button onclick="window.dispatchEvent(new CustomEvent('deleteMeasurement', { detail: '${measurementId}' }))" style="margin-top: 10px; color: red;">حذف القياس</button>
                  <button onclick="window.dispatchEvent(new CustomEvent('toggleDragging', {}))" style="margin-top: 10px; color: blue;">${isDraggingEnabled ? 'تعطيل السحب' : 'تفعيل السحب'}</button>
                </div>
              `;
              console.log('Measurement added:', { id: measurementId, distance, area, perimeter, points });
              return html;
            },
          }).addTo(map);

          map.on('measureclick', (e) => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            console.log('Measure click:', e.latlng);
            map.setView(center, zoom);
          });

          const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'z') {
              console.log('Ctrl + Z pressed, calling handleRemoveLastPoint...');
              handleRemoveLastPoint();
            }
          };
          window.addEventListener('keydown', handleKeyDown);

          window.addEventListener('removePoint', (e) => {
            console.log('removePoint event triggered:', e.detail);
            const { measurementId, pointIndex } = e.detail;
            const measurement = measurements.find((m) => m.id === measurementId);
            if (measurement && measurement.layer) {
              const latlngs = measurement.layer.getLatLngs();
              if (latlngs[pointIndex]) {
                latlngs.splice(pointIndex, 1);
                measurement.layer.setLatLngs(latlngs);
                setMeasurements((prev) =>
                  prev.map((m) =>
                    m.id === measurementId
                      ? { ...m, points: latlngs.map((p) => ({ lat: p.lat, lng: p.lng })) }
                      : m
                  )
                );
                const marker = markersRef.current.find(
                  (m) => m.measurementId === measurementId && m.pointIndex === pointIndex
                );
                if (marker) {
                  map.removeLayer(marker);
                  markersRef.current = markersRef.current.filter(
                    (m) => !(m.measurementId === measurementId && m.pointIndex === pointIndex)
                  );
                }
                console.log(`Point ${pointIndex} removed from measurement ${measurementId}`);
              }
            }
          });

          window.addEventListener('toggleDragging', () => {
            toggleDragging();
          });

          window.addEventListener('deleteMeasurement', (e) => {
            console.log('deleteMeasurement event triggered:', e.detail);
            const measurementId = e.detail;
            handleDeleteMeasurement(measurementId);
          });

          console.log('Measure control added');
        } catch (e) {
          console.error(`Error adding measure control: ${e.message}`);
          console.log(`خطأ في تفعيل أداة القياس: ${e.message}`);
        }
      } else {
        setIsMeasuring(false);
        setIsDraggingEnabled(true);
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.scrollWheelZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();

        markersRef.current.forEach((marker) => map.removeLayer(marker));
        markersRef.current = [];

        measureControlRef.current.remove();
        measureControlRef.current = null;
        map.off('measureclick');
        window.removeEventListener('removePoint', () => {});
        window.removeEventListener('toggleDragging', () => {});
        window.removeEventListener('deleteMeasurement', () => {});
        window.removeEventListener('keydown', () => {});
        console.log('Measure control removed');
      }
    }
  }, [isMapReady, measurements, handleDeleteMeasurement, handleRemoveLastPoint, toggleDragging]);

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
          onUpdateUnits={handleUpdateUnits}
          measurements={measurements}
          onDeleteMeasurement={handleDeleteMeasurement}
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
      <div className="toggle-buttons toggle-buttons-right">
        <button
          className="toggle-button"
          onClick={() => setShowToolBar((prev) => !prev)}
          title={showToolBar ? 'إخفاء القياسات' : 'إظهار القياسات'}
        >
          <FaRulerCombined />
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