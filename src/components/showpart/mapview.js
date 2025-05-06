import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, ImageOverlay, useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddLayerButton from './AddLayerButton';
import LayerList from './LayerList';
import ToolBar from './toolbar';
import './MapView.css';
import { FaLayerGroup, FaTools, FaQuestionCircle } from 'react-icons/fa';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';

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

L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// دالة لتوليد لون عشوائي
const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

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

const HelpModal = ({ isOpen, onClose, tool }) => {
  if (!isOpen) return null;

  const helpContent = {
    clip: {
      title: "تقطيع (Clip)",
      description: "تُستخدم هذه الأداة لتقطيع طبقة متجهة باستخدام طبقة أخرى كقناع. الناتج هو جزء من الطبقة الأولى التي تقع داخل حدود الطبقة الثانية.",
      inputs: [
        "طبقة الإدخال: اختر الطبقة التي تريد تقطيعها (مثل ملف GeoJSON).",
        "طبقة التقطيع: اختر الطبقة التي ستُستخدم كقناع للتقطيع (مثل حدود منطقة معينة).",
      ],
      example: "إذا كنت تريد استخراج الأراضي الزراعية داخل حدود مدينة معينة، اختر الأراضي الزراعية كطبقة إدخال وبيانات حدود المدينة كطبقة تقطيع.",
    },
    intersect: {
      title: "تقاطع (Intersect)",
      description: "تُستخدم لإيجاد المناطق المشتركة بين طبقتين أو أكثر. الناتج هو الجزء الذي تتداخل فيه جميع الطبقات. الطبقات يجب أن تكون نقطية، خطية، أو مضلعية.",
      inputs: [
        "طبقات التقاطع: اختر طبقتين أو أكثر من القائمة المنسدلة. ستُضاف الطبقات تلقائيًا إلى القائمة أسفل.",
        "نوع الإخراج: اختر نوع التقاطع (نفس نوع الإدخال، خط، أو نقطة).",
      ],
      example: "لمعرفة المناطق التي تتداخل فيها الغابات ومناطق الأمطار الغزيرة، اختر طبقة الغابات وطبقة الأمطار من القائمة.",
    },
    buffer: {
      title: "منطقة تأثير (Buffer)",
      description: "تُنشئ منطقة تأثير حول الطبقة المختارة بمسافة محددة. تُستخدم لتحديد المناطق المحيطة بمعالم معينة.",
      inputs: [
        "طبقة الإدخال: اختر الطبقة التي تريد إنشاء منطقة تأثير حولها.",
        "المسافة: أدخل المسافة المطلوبة للمنطقة التأثير (رقم). ملاحظة: إذا كانت الطبقة بإحداثيات جغرافية (lat/lon)، قد تحتاج إلى تحويل الطبقة إلى CRS متري مثل EPSG:3857.",
        "الوحدة: اختر وحدة المسافة (أمتار، كيلومترات، أميال).",
      ],
      example: "لإنشاء منطقة تأثير بمسافة 500 متر حول الأنهار، اختر طبقة الأنهار، أدخل 500 كمسافة، واختر 'أمتار' كوحدة.",
    },
    near: {
      title: "أقرب معالم (Near)",
      description: "تحدد أقرب المعالم في طبقة ثانية لكل معلم في الطبقة الأولى، مع إمكانية تحديد أقصى مسافة وعدد الجيران. تضيف عمودين جديدين: NEAR_FID (معرف أقرب معلم) وNEAR_DIST (المسافة إليه).",
      inputs: [
        "طبقة الإدخال: اختر الطبقة الأساسية (مثل مواقع المنازل).",
        "طبقة الأقرب: اختر الطبقة التي تحتوي على المعالم المراد البحث عن أقربها (مثل المدارس).",
        "المسافة القصوى (اختياري): أدخل أقصى مسافة للبحث (بالأمتار). اتركها فارغة إذا كنت لا تريد تحديد مسافة.",
        "عدد الجيران: أدخل عدد المعالم القريبة المطلوبة لكل معلم (مثل 1 لأقرب معلم فقط).",
      ],
      example: "للعثور على أقرب مدرسة لكل منزل ضمن مسافة 1000 متر، اختر طبقة المنازل كإدخال، طبقة المدارس كطبقة الأقرب، وأدخل 1000 كمسافة قصوى، و1 كعدد الجيران.",
    },
  };

  const content = helpContent[tool] || { title: "", description: "", inputs: [], example: "" };

  return (
    <div className="modal-overlay">
      <div className="help-modal">
        <h3>{content.title}</h3>
        <p><strong>الوصف:</strong> {content.description}</p>
        <p><strong>المدخلات:</strong></p>
        <ul>
          {content.inputs.map((input, index) => (
            <li key={index}>{input}</li>
          ))}
        </ul>
        <p><strong>مثال:</strong> {content.example}</p>
        <button onClick={onClose} className="modal-close-button">إغلاق</button>
      </div>
    </div>
  );
};

const Toolbox = ({ onToolSelect, layers, onToolComplete }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedInputLayer, setSelectedInputLayer] = useState(null);
  const [selectedClipLayer, setSelectedClipLayer] = useState(null);
  const [bufferDistance, setBufferDistance] = useState(100);
  const [unit, setUnit] = useState("Meters");
  const [maxDistance, setMaxDistance] = useState(null);
  const [kNeighbors, setKNeighbors] = useState(1);
  const [intersectSelectedLayers, setIntersectSelectedLayers] = useState([]);
  const [intersectOutputType, setIntersectOutputType] = useState("INPUT");
  const [joinAttributes, setJoinAttributes] = useState("ALL");
  const [clusterTolerance, setClusterTolerance] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const handleIntersectLayerSelect = (e) => {
    const layerId = e.target.value;
    const selectedLayer = layers.find((l) => l.id === layerId);
    if (selectedLayer && !intersectSelectedLayers.some((l) => l.id === layerId)) {
      try {
        JSON.parse(selectedLayer.data); // Validate GeoJSON
        setIntersectSelectedLayers([...intersectSelectedLayers, selectedLayer]);
      } catch (e) {
        alert(`خطأ: طبقة ${selectedLayer.name} تحتوي على بيانات GeoJSON غير صالحة.`);
        console.error(`Invalid GeoJSON for layer ${selectedLayer.name}:`, e);
      }
    }
    e.target.value = '';
  };

  const handleRemoveIntersectLayer = (layerId) => {
    setIntersectSelectedLayers(intersectSelectedLayers.filter((l) => l.id !== layerId));
  };

  const handleToolExecute = async () => {
    if (!selectedInputLayer && selectedTool !== 'intersect') {
      alert('يرجى اختيار طبقة الإدخال.');
      return;
    }

    const formData = new FormData();
    try {
      switch (selectedTool) {
        case 'clip':
          if (!selectedClipLayer) {
            alert('يرجى اختيار طبقة التقطيع.');
            return;
          }
          formData.append('input_file', new Blob([selectedInputLayer.data], { type: 'application/json' }), 'input.geojson');
          formData.append('clip_file', new Blob([selectedClipLayer.data], { type: 'application/json' }), 'clip.geojson');
          const clipResponse = await axios.post('http://localhost:8000/clip', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (clipResponse.data.success) {
            const newLayer = {
              type: 'vector',
              data: JSON.stringify(clipResponse.data.geojson),
              name: `Clipped_${selectedInputLayer.name}_with_${selectedClipLayer.name}`,
              id: `clipped-${Date.now()}`,
              visible: true,
              bounds: null,
            };
            onToolComplete([newLayer]);
            alert('تمت عملية التقطيع بنجاح! يمكنك استخدام الطبقة الناتجة في عمليات أخرى.');
          } else {
            alert(`فشلت عملية التقطيع: ${clipResponse.data.error}`);
          }
          break;

        case 'intersect':
          if (intersectSelectedLayers.length < 2) {
            alert('يرجى اختيار ما لا يقل عن طبقتين للتقاطع.');
            return;
          }
          intersectSelectedLayers.forEach((file, index) => {
            try {
              const geojson = JSON.parse(file.data);
              if (!geojson.type || !geojson.features) {
                throw new Error('Invalid GeoJSON structure');
              }
              formData.append('in_features', new Blob([file.data], { type: 'application/json' }), `input${index}.geojson`);
            } catch (e) {
              alert(`خطأ: طبقة ${file.name} تحتوي على بيانات GeoJSON غير صالحة.`);
              console.error(`Invalid GeoJSON for layer ${file.name}:`, e);
              return;
            }
          });
          formData.append('join_attributes', joinAttributes);
          if (clusterTolerance) formData.append('cluster_tolerance', clusterTolerance);
          formData.append('output_type', intersectOutputType);
          for (let [key, value] of formData.entries()) {
            console.log(`FormData entry: ${key} =`, value);
          }
          const intersectResponse = await axios.post('http://localhost:8000/intersect', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (intersectResponse.data.success) {
            const newLayer = {
              type: 'vector',
              data: JSON.stringify(intersectResponse.data.geojson),
              name: 'Intersect_Result',
              id: `intersect-${Date.now()}`,
              visible: true,
              bounds: null,
            };
            onToolComplete([newLayer]);
            alert('تمت عملية التقاطع بنجاح!');
          } else {
            alert(`فشلت عملية التقاطع: ${intersectResponse.data.error}`);
          }
          break;

        case 'buffer':
          if (bufferDistance <= 0) {
            alert('يرجى إدخال مسافة أكبر من 0.');
            return;
          }
          if (bufferDistance > 10000 && unit === 'Meters') {
            alert('تحذير: المسافة كبيرة جدًا (أكثر من 10 كم). هل أنت متأكد؟');
          }
          formData.append('input_file', new Blob([selectedInputLayer.data], { type: 'application/json' }), 'input.geojson');
          formData.append('buffer_distance', bufferDistance);
          formData.append('unit', unit);
          const bufferResponse = await axios.post('http://localhost:8000/buffer', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (bufferResponse.data.success) {
            const newLayer = {
              type: 'vector',
              data: JSON.stringify(bufferResponse.data.geojson),
              name: `Buffered_${selectedInputLayer.name}_${bufferDistance}${unit}`,
              id: `buffer-${Date.now()}`,
              visible: true,
              bounds: null,
            };
            onToolComplete([newLayer]);
            alert('تمت عملية إنشاء المنطقة التأثير بنجاح!');
          } else {
            alert(`فشلت عملية المنطقة التأثير: ${bufferResponse.data.error}`);
          }
          break;

        case 'near':
          if (!selectedClipLayer) {
            alert('يرجى اختيار طبقة الأقرب.');
            return;
          }
          formData.append('input_file', new Blob([selectedInputLayer.data], { type: 'application/json' }), 'input.geojson');
          formData.append('near_file', new Blob([selectedClipLayer.data], { type: 'application/json' }), 'near.geojson');
          formData.append('max_distance', maxDistance || '');
          formData.append('k_neighbors', kNeighbors);
          const nearResponse = await axios.post('http://localhost:8000/near', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          if (nearResponse.data.success) {
            const newLayer = {
              type: 'vector',
              data: JSON.stringify(nearResponse.data.geojson),
              name: `Near_${selectedInputLayer.name}_to_${selectedClipLayer.name}`,
              id: `near-${Date.now()}`,
              visible: true,
              bounds: null,
            };
            onToolComplete([newLayer]);
            alert('تمت عملية إيجاد الأقرب بنجاح! تحقق من الأعمدة NEAR_FID وNEAR_DIST في الطبقة الناتجة.');
          } else {
            alert(`فشلت عملية إيجاد الأقرب: ${nearResponse.data.error}`);
          }
          break;

        default:
          alert('يرجى اختيار أداة.');
          return;
      }
    } catch (error) {
      console.error(`Error in ${selectedTool} operation:`, error);
      alert(`خطأ أثناء تنفيذ ${selectedTool}: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="toolbar">
      <h4>صندوق الأدوات</h4>
      <div>
        <label>
          اختر الأداة:
          <select onChange={(e) => setSelectedTool(e.target.value)} value={selectedTool || ''}>
            <option value="">اختر أداة</option>
            <option value="clip">تقطيع</option>
            <option value="intersect">تقاطع</option>
            <option value="buffer">منطقة تأثير</option>
            <option value="near">أقرب معالم</option>
          </select>
          {selectedTool && (
            <button
              onClick={() => setShowHelp(true)}
              className="help-button"
              title="مساعدة"
            >
              <FaQuestionCircle className="help-icon" />
            </button>
          )}
        </label>
        {selectedTool && (
          <>
            {selectedTool !== 'intersect' && (
              <label>
                طبقة الإدخال:
                <select onChange={(e) => setSelectedInputLayer(layers.find((l) => l.id === e.target.value))} value={selectedInputLayer?.id || ''}>
                  <option value="">اختر طبقة</option>
                  {layers.filter((l) => l.type === 'vector').map((layer) => (
                    <option key={layer.id} value={layer.id}>
                      {layer.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {selectedTool === 'clip' && (
              <label>
                طبقة التقطيع:
                <select onChange={(e) => setSelectedClipLayer(layers.find((l) => l.id === e.target.value))} value={selectedClipLayer?.id || ''}>
                  <option value="">اختر طبقة</option>
                  {layers.filter((l) => l.type === 'vector').map((layer) => (
                    <option key={layer.id} value={layer.id}>
                      {layer.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {selectedTool === 'intersect' && (
              <>
                <label>
                  طبقات التقاطع:
                  <select onChange={handleIntersectLayerSelect} value="">
                    <option value="" disabled>
                      اختر طبقة
                    </option>
                    {layers.filter((l) => l.type === 'vector').map((layer) => (
                      <option key={layer.id} value={layer.id}>
                        {layer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  نوع الإخراج:
                  <select value={intersectOutputType} onChange={(e) => setIntersectOutputType(e.target.value)}>
                    <option value="INPUT">نفس نوع الإدخال</option>
                    <option value="LINE">خط</option>
                    <option value="POINT">نقطة</option>
                  </select>
                </label>
                <label>
                  نقل السمات:
                  <select value={joinAttributes} onChange={(e) => setJoinAttributes(e.target.value)}>
                    <option value="ALL">جميع السمات</option>
                    <option value="NO_FID">جميع السمات باستثناء FID</option>
                    <option value="ONLY_FID">FID فقط</option>
                  </select>
                </label>
                <label>
                  تفاوت التجميع (اختياري):
                  <input
                    type="number"
                    value={clusterTolerance}
                    onChange={(e) => setClusterTolerance(e.target.value)}
                    placeholder="أدخل التفاوت (اختياري)"
                    step="any"
                  />
                </label>
                <div>
                  <h5>الطبقات المختارة:</h5>
                  {intersectSelectedLayers.length === 0 ? (
                    <p>لم يتم اختيار أي طبقات.</p>
                  ) : (
                    <ul>
                      {intersectSelectedLayers.map((layer) => (
                        <li key={layer.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <span>{layer.name}</span>
                          <button
                            onClick={() => handleRemoveIntersectLayer(layer.id)}
                            style={{
                              marginLeft: '10px',
                              background: 'red',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              padding: '2px 8px',
                            }}
                          >
                            X
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            {selectedTool === 'buffer' && (
              <>
                <label>
                  المسافة:
                  <input
                    type="number"
                    value={bufferDistance}
                    onChange={(e) => setBufferDistance(parseFloat(e.target.value))}
                    min="0"
                    step="1"
                  />
                  {bufferDistance > 10000 && unit === 'Meters' && (
                    <span style={{ color: 'red', fontSize: '12px' }}>
                      تحذير: المسافة كبيرة جدًا (أكثر من 10 كم)!
                    </span>
                  )}
                </label>
                <label>
                  الوحدة:
                  <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                    <option value="Meters">أمتار</option>
                    <option value="Kilometers">كيلومترات</option>
                    <option value="Miles">أميال</option>
                  </select>
                </label>
              </>
            )}
            {selectedTool === 'near' && (
              <>
                <label>
                  طبقة الأقرب:
                  <select onChange={(e) => setSelectedClipLayer(layers.find((l) => l.id === e.target.value))} value={selectedClipLayer?.id || ''}>
                    <option value="">اختر طبقة</option>
                    {layers.filter((l) => l.type === 'vector').map((layer) => (
                      <option key={layer.id} value={layer.id}>
                        {layer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  المسافة القصوى (اختياري):
                  <input
                    type="number"
                    value={maxDistance || ''}
                    onChange={(e) => setMaxDistance(parseFloat(e.target.value) || null)}
                    min="0"
                    step="1"
                  />
                </label>
                <label>
                  عدد الجيران:
                  <input
                    type="number"
                    value={kNeighbors}
                    onChange={(e) => setKNeighbors(parseInt(e.target.value))}
                    min="1"
                    step="1"
                  />
                </label>
              </>
            )}
            <button onClick={handleToolExecute}>تنفيذ</button>
          </>
        )}
      </div>
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} tool={selectedTool} />
    </div>
  );
};

const MapView = () => {
  const [layers, setLayers] = useState([]);
  const [processedLayers, setProcessedLayers] = useState([]);
  const [showBaseMap, setShowBaseMap] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [showLayerList, setShowLayerList] = useState(false);
  const [showToolbox, setShowToolbox] = useState(false);
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
          color: layer.color || generateRandomColor(), // استخدام اللون المختار من AddLayerButton أو لون عشوائي
          fillColor: layer.fillColor || layer.color || generateRandomColor(), // لون الملء يتبع اللون المختار
          fillOpacity: layer.fillOpacity || 0.7, // التأكد من أن الملء مرئي
          opacity: layer.opacity || 0.65,
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
          pointToLayer: (feature, latlng) =>
            L.circleMarker(latlng, {
              radius: 6,
              fillColor: layer.fillColor || layer.color || '#ff0000',
              color: layer.color || '#000',
              weight: 1,
              opacity: 1,
              fillOpacity: layer.fillOpacity || 0.7,
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
        layer.id === layerId ? { ...layer, color, fillColor: color } : layer // تحديث fillColor مع اللون الجديد
      )
    );
  }, []);

  const handleChangeLayerOpacity = useCallback((layerId, opacity) => {
    if (opacity < 0 || opacity > 1) return;
    const handler = setTimeout(() => {
      console.log(`Changing opacity for layer ${layerId} to ${opacity}`);
      setLayers((prev) =>
        prev.map((layer) =>
          layer.id === layerId ? { ...layer, opacity, fillOpacity: opacity } : layer // تحديث fillOpacity مع الشفافية
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

  const pointToLayer = useCallback(
    (feature, latlng, layer) => {
      return L.circleMarker(latlng, {
        radius: 6,
        fillColor: layer.fillColor || layer.color || '#ff0000', // لون الملء يتبع اللون المختار
        color: layer.color || '#000', // لون الإطار
        weight: 1,
        opacity: 1,
        fillOpacity: layer.fillOpacity || 0.7, // التأكد من أن الملء مرئي
      });
    },
    []
  );

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
                style={{
                  color: layer.color || generateRandomColor(), // لون الإطار
                  weight: 2,
                  opacity: layer.opacity || 0.65,
                  fillColor: layer.fillColor || layer.color || generateRandomColor(), // لون الملء
                  fillOpacity: layer.fillOpacity || 0.7, // التأكد من أن الملء مرئي
                }}
                pointToLayer={(feature, latlng) => pointToLayer(feature, latlng, layer)}
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
        {showToolbox && (
          <Toolbox
            onToolSelect={handleToolSelect}
            layers={processedLayers}
            onToolComplete={handleAddLayer}
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
            onClick={() => setShowToolbox((prev) => !prev)}
            title={showToolbox ? 'إخفاء الأدوات' : 'إظهار الأدوات'}
          >
            <FaTools />
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