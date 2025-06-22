import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, ImageOverlay, useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import AddLayerButton from './AddLayerButton';
import LayerList from './LayerList';
import DrawControl from './DrawControl';
import FeatureListModal from './FeatureListModal';
import './MapView.css';
import { FaLayerGroup, FaDownload, FaCog } from 'react-icons/fa';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import axios from 'axios';

// Suppress Leaflet deprecation warnings
if (L.LineUtil && !L.LineUtil._flat) {
  L.LineUtil._flat = L.LineUtil.isFlat;
}

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

const Toolbox = ({ onToolSelect, layers, onToolComplete }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedInputLayer, setSelectedInputLayer] = useState(null);
  const [selectedClipEraseLayer, setSelectedClipEraseLayer] = useState(null);
  const [selectedUnionLayers, setSelectedUnionLayers] = useState([]);
  const [bufferDistance, setBufferDistance] = useState(100);
  const [bufferUnit, setBufferUnit] = useState('Meters');
  const [ringDistances, setRingDistances] = useState('100,200,300');
  const [selectedUpdateLayer, setSelectedUpdateLayer] = useState(null);

  const handleToolSelect = (tool) => {
    setSelectedTool(tool);
    setSelectedInputLayer(null);
    setSelectedClipEraseLayer(null);
    setSelectedUnionLayers([]);
    setSelectedUpdateLayer(null);
    onToolSelect(tool);
  };

  const handleUnionLayerSelect = (e) => {
    const layerId = e.target.value;
    const layer = layers.find((l) => l.id === layerId);
    if (layer && !selectedUnionLayers.includes(layer)) {
      setSelectedUnionLayers([...selectedUnionLayers, layer]);
    }
  };

  const removeUnionLayer = (layerId) => {
    setSelectedUnionLayers(selectedUnionLayers.filter((layer) => layer.id !== layerId));
  };

  const handleToolExecute = async () => {
    if (!selectedInputLayer && selectedTool !== 'union' && selectedTool !== 'intersect' && selectedTool !== 'symmetric_difference' && selectedTool !== 'multi_ring_buffer' && selectedTool !== 'update') {
      alert('يرجى اختيار طبقة الإدخال.');
      return;
    }

    if (selectedTool === 'clip' || selectedTool === 'erase') {
      if (!selectedClipEraseLayer) {
        alert(`يرجى اختيار طبقة ${selectedTool === 'clip' ? 'التقطيع' : 'المسح'}.`);
        return;
      }

      if (!selectedInputLayer.data || !selectedClipEraseLayer.data) {
        alert('بيانات الطبقة غير صالحة. يرجى التأكد من اختيار طبقات تحتوي على بيانات.');
        return;
      }

      const formData = new FormData();
      try {
        formData.append('input_file', new Blob([selectedInputLayer.data], { type: 'application/json' }), 'input.geojson');
        formData.append(
          selectedTool === 'clip' ? 'clip_file' : 'erase_file',
          new Blob([selectedClipEraseLayer.data], { type: 'application/json' }),
          selectedTool === 'clip' ? 'clip.geojson' : 'erase.geojson'
        );

        const endpoint = selectedTool === 'clip' ? '/clip' : '/erase';
        const response = await axios.post(`http://localhost:8000${endpoint}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          const newLayer = {
            type: 'vector',
            data: JSON.stringify(response.data.geojson),
            name: `${selectedTool === 'clip' ? 'Clipped' : 'Erased'}_${selectedInputLayer.name}_with_${selectedClipEraseLayer.name}`,
            id: `${selectedTool}-${Date.now()}`,
            visible: true,
            bounds: null,
          };
          onToolComplete([newLayer]);
          alert(`تمت عملية ${selectedTool === 'clip' ? 'التقطيع' : 'المسح'} بنجاح! يمكنك استخدام الطبقة الناتجة في عمليات أخرى.`);
        } else {
          alert(`فشلت عملية ${selectedTool === 'clip' ? 'التقطيع' : 'المسح'}: ${response.data.error}`);
        }
      } catch (error) {
        console.error(`Error in ${selectedTool} operation:`, error);
        alert(`خطأ أثناء تنفيذ ${selectedTool === 'clip' ? 'التقطيع' : 'المسح'}: ${error.response?.data?.detail || error.message}`);
      }
    } else if (selectedTool === 'buffer_pro') {
      if (!selectedInputLayer.data) {
        alert('بيانات الطبقة غير صالحة. يرجى التأكد من اختيار طبقة تحتوي على بيانات.');
        return;
      }

      if (isNaN(bufferDistance) || bufferDistance <= 0) {
        alert('يرجى إدخال مسافة تأثير صالحة (رقم موجب).');
        return;
      }

      const formData = new FormData();
      try {
        formData.append('input_file', new Blob([selectedInputLayer.data], { type: 'application/json' }), 'input.geojson');
        formData.append('buffer_distance', bufferDistance);
        formData.append('unit', bufferUnit);

        const response = await axios.post(`http://localhost:8000/buffer_pro`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          const newLayer = {
            type: 'vector',
            data: JSON.stringify(response.data.geojson),
            name: `Buffered_${selectedInputLayer.name}_${bufferDistance}${bufferUnit}`,
            id: `buffer_pro-${Date.now()}`,
            visible: true,
            bounds: null,
          };
          onToolComplete([newLayer]);
          alert('تمت عملية التأثير بنجاح! يمكنك استخدام الطبقة الناتجة في عمليات أخرى.');
        } else {
          alert(`فشلت عملية التأثير: ${response.data.error}`);
        }
      } catch (error) {
        console.error('Error in buffer_pro operation:', error);
        alert(`خطأ أثناء تنفيذ التأثير: ${error.response?.data?.detail || error.message}`);
      }
    } else if (selectedTool === 'intersect') {
      if (selectedUnionLayers.length < 2) {
        alert('يرجى اختيار طبقتين على الأقل للتقاطع.');
        return;
      }

      const formData = new FormData();
      try {
        selectedUnionLayers.forEach((layer, index) => {
          if (!layer.data) {
            throw new Error(`بيانات الطبقة ${layer.name} غير صالحة.`);
          }
          formData.append('files', new Blob([layer.data], { type: 'application/json' }), `layer_${index}.geojson`);
        });

        const response = await axios.post(`http://localhost:8000/intersect`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          const newLayer = {
            type: 'vector',
            data: JSON.stringify(response.data.geojson),
            name: `Intersected_${selectedUnionLayers.map(l => l.name).join('_')}`,
            id: `intersect-${Date.now()}`,
            visible: true,
            bounds: null,
          };
          onToolComplete([newLayer]);
          alert('تمت عملية التقاطع بنجاح! يمكنك استخدام الطبقة الناتجة في عمليات أخرى.');
        } else {
          alert(`فشلت عملية التقاطع: ${response.data.error}`);
        }
      } catch (error) {
        console.error('Error in intersect operation:', error);
        alert(`خطأ أثناء تنفيذ التقاطع: ${error.response?.data?.detail || error.message}`);
      }
    } else if (selectedTool === 'union') {
      if (selectedUnionLayers.length !== 2) {
        alert('يرجى اختيار طبقةين للاتحاد.');
        return;
      }

      const formData = new FormData();
      try {
        [selectedUnionLayers[0], selectedUnionLayers[1]].forEach((layer, index) => {
          if (!layer.data) {
            throw new Error(`بيانات الطبقة ${layer.name} غير صالحة.`);
          }
          formData.append(`input_file_${index + 1}`, new Blob([layer.data], { type: 'application/json' }), `input_${index + 1}.geojson`);
        });

        const response = await axios.post(`http://localhost:8000/union`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          const newLayer = {
            type: 'vector',
            data: JSON.stringify(response.data.geojson),
            name: `Union_${selectedUnionLayers.map(l => l.name).join('_')}`,
            id: `union-${Date.now()}`,
            visible: true,
            bounds: null,
          };
          onToolComplete([newLayer]);
          alert('تمت عملية الاتحاد بنجاح! يمكنك استخدام الطبقة الناتجة في عمليات أخرى.');
        } else {
          alert(`فشلت عملية الاتحاد: ${response.data.error}`);
        }
      } catch (error) {
        console.error('Error in union operation:', error);
        alert(`خطأ أثناء تنفيذ الاتحاد: ${error.response?.data?.detail || error.message}`);
      }
    } else if (selectedTool === 'symmetric_difference') {
      if (selectedUnionLayers.length !== 2) {
        alert('يرجى اختيار طبقتين للفرق التماثلي.');
        return;
      }

      const formData = new FormData();
      try {
        [selectedUnionLayers[0], selectedUnionLayers[1]].forEach((layer, index) => {
          if (!layer.data) {
            throw new Error(`بيانات الطبقة ${layer.name} غير صالحة.`);
          }
          formData.append(`input_file_${index + 1}`, new Blob([layer.data], { type: 'application/json' }), `input_${index + 1}.geojson`);
        });

        const response = await axios.post(`http://localhost:8000/symmetric_difference`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          const newLayer = {
            type: 'vector',
            data: JSON.stringify(response.data.geojson),
            name: `SymmetricDiff_${selectedUnionLayers.map(l => l.name).join('_')}`,
            id: `symmetric_difference-${Date.now()}`,
            visible: true,
            bounds: null,
          };
          onToolComplete([newLayer]);
          alert('تمت عملية الفرق التماثلي بنجاح! يمكنك استخدام الطبقة الناتجة في عمليات أخرى.');
        } else {
          alert(`فشلت عملية الفرق التماثلي: ${response.data.error}`);
        }
      } catch (error) {
        console.error('Error in symmetric difference operation:', error);
        alert(`خطأ أثناء تنفيذ الفرق التماثلي: ${error.response?.data?.detail || error.message}`);
      }
    } else if (selectedTool === 'multi_ring_buffer') {
      if (!selectedInputLayer.data) {
        alert('بيانات الطبقة غير صالحة. يرجى التأكد من اختيار طبقة تحتوي على بيانات.');
        return;
      }

      const distanceArray = ringDistances.split(',').map(d => parseFloat(d.trim()));
      if (distanceArray.some(isNaN) || distanceArray.length === 0) {
        alert('يرجى إدخال مسافات صالحة (أرقام مفصولة بفواصل).');
        return;
      }

      const formData = new FormData();
      try {
        formData.append('input_file', new Blob([selectedInputLayer.data], { type: 'application/json' }), 'input.geojson');
        formData.append('distances', ringDistances);
        formData.append('unit', bufferUnit);

        const response = await axios.post(`http://localhost:8000/multi_ring_buffer`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          const newLayer = {
            type: 'vector',
            data: JSON.stringify(response.data.geojson),
            name: `MultiRing_${selectedInputLayer.name}_${ringDistances.replace(',', '_')}${bufferUnit}`,
            id: `multi_ring_buffer-${Date.now()}`,
            visible: true,
            bounds: null,
          };
          onToolComplete([newLayer]);
          alert('تمت عملية الحلقات العازلة المتعددة بنجاح! يمكنك استخدام الطبقة الناتجة في عمليات أخرى.');
        } else {
          alert(`فشلت عملية الحلقات العازلة المتعددة: ${response.data.error}`);
        }
      } catch (error) {
        console.error('Error in multi_ring_buffer operation:', error);
        alert(`خطأ أثناء تنفيذ الحلقات العازلة المتعددة: ${error.response?.data?.detail || error.message}`);
      }
    } else if (selectedTool === 'update') {
      if (!selectedUpdateLayer) {
        alert('يرجى اختيار طبقة التحديث.');
        return;
      }

      if (!selectedInputLayer.data || !selectedUpdateLayer.data) {
        alert('بيانات الطبقة غير صالحة. يرجى التأكد من اختيار طبقتين تحتويان على بيانات.');
        return;
      }

      const formData = new FormData();
      try {
        formData.append('input_file', new Blob([selectedInputLayer.data], { type: 'application/json' }), 'input.geojson');
        formData.append('update_file', new Blob([selectedUpdateLayer.data], { type: 'application/json' }), 'update.geojson');

        const response = await axios.post(`http://localhost:8000/update`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (response.data.success) {
          const newLayer = {
            type: 'vector',
            data: JSON.stringify(response.data.geojson),
            name: `Updated_${selectedInputLayer.name}_with_${selectedUpdateLayer.name}`,
            id: `update-${Date.now()}`,
            visible: true,
            bounds: null,
          };
          onToolComplete([newLayer]);
          alert('تمت عملية التحديث بنجاح! يمكنك استخدام الطبقة الناتجة في عمليات أخرى.');
        } else {
          alert(`فشلت عملية التحديث: ${response.data.error || 'خطأ غير معروف'}`);
        }
      } catch (error) {
        console.error('Error in update operation:', error);
        alert(`خطأ أثناء تنفيذ التحديث: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  return (
    <div className="toolbar">
      <h4>صندوق الأدوات</h4>
      <div>
        <label>
          اختر الأداة:
          <select onChange={(e) => handleToolSelect(e.target.value)} value={selectedTool || ''}>
            <option value="">اختر أداة</option>
            <option value="clip">تقطيع</option>
            <option value="erase">مسح</option>
            <option value="buffer_pro">تأثير (محسن)</option>
            <option value="intersect">تقاطع</option>
            <option value="union">اتحاد</option>
            <option value="symmetric_difference">فرق تماثلي</option>
            <option value="multi_ring_buffer">حلقات عازلة متعددة</option>
            <option value="update">تحديث</option>
          </select>
        </label>
        {selectedTool && (
          <>
            {selectedTool !== 'union' && selectedTool !== 'intersect' && selectedTool !== 'symmetric_difference' && selectedTool !== 'multi_ring_buffer' && selectedTool !== 'update' && (
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
            {(selectedTool === 'clip' || selectedTool === 'erase') && (
              <label>
                طبقة {selectedTool === 'clip' ? 'التقطيع' : 'المسح'}:
                <select onChange={(e) => setSelectedClipEraseLayer(layers.find((l) => l.id === e.target.value))} value={selectedClipEraseLayer?.id || ''}>
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
                  اختر الطبقات للتقاطع:
                  <select onChange={handleUnionLayerSelect} value="">
                    <option value="">اختر طبقة</option>
                    {layers.filter((l) => l.type === 'vector').map((layer) => (
                      <option key={layer.id} value={layer.id}>
                        {layer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <h5>الطبقات المختارة:</h5>
                  {selectedUnionLayers.length === 0 ? (
                    <p>لم يتم اختيار أي طبقات بعد.</p>
                  ) : (
                    <ul>
                      {selectedUnionLayers.map((layer) => (
                        <li key={layer.id}>
                          {layer.name}{' '}
                          <button onClick={() => removeUnionLayer(layer.id)}>إزالة</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            {selectedTool === 'union' && (
              <>
                <label>
                  اختر الطبقات للاتحاد:
                  <select onChange={handleUnionLayerSelect} value="">
                    <option value="">اختر طبقة</option>
                    {layers.filter((l) => l.type === 'vector').map((layer) => (
                      <option key={layer.id} value={layer.id}>
                        {layer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <h5>الطبقات المختارة:</h5>
                  {selectedUnionLayers.length === 0 ? (
                    <p>لم يتم اختيار أي طبقات بعد.</p>
                  ) : (
                    <ul>
                      {selectedUnionLayers.map((layer) => (
                        <li key={layer.id}>
                          {layer.name}{' '}
                          <button onClick={() => removeUnionLayer(layer.id)}>إزالة</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            {selectedTool === 'symmetric_difference' && (
              <>
                <label>
                  اختر الطبقات للفرق التماثلي:
                  <select onChange={handleUnionLayerSelect} value="">
                    <option value="">اختر طبقة</option>
                    {layers.filter((l) => l.type === 'vector').map((layer) => (
                      <option key={layer.id} value={layer.id}>
                        {layer.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div>
                  <h5>الطبقات المختارة:</h5>
                  {selectedUnionLayers.length === 0 ? (
                    <p>لم يتم اختيار أي طبقات بعد.</p>
                  ) : (
                    <ul>
                      {selectedUnionLayers.map((layer) => (
                        <li key={layer.id}>
                          {layer.name}{' '}
                          <button onClick={() => removeUnionLayer(layer.id)}>إزالة</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            {selectedTool === 'buffer_pro' && (
              <>
                <label>
                  مسافة التأثير:
                  <input
                    type="number"
                    value={bufferDistance}
                    onChange={(e) => setBufferDistance(parseFloat(e.target.value))}
                    min="0"
                    step="1"
                  />
                </label>
                <label>
                  الوحدة:
                  <select onChange={(e) => setBufferUnit(e.target.value)} value={bufferUnit}>
                    <option value="Meters">أمتار</option>
                    <option value="Kilometers">كيلومترات</option>
                    <option value="Miles">أميال</option>
                  </select>
                </label>
              </>
            )}
            {selectedTool === 'multi_ring_buffer' && (
              <>
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
                <label>
                  المسافات (مفصولة بفواصل):
                  <input
                    type="text"
                    value={ringDistances}
                    onChange={(e) => setRingDistances(e.target.value)}
                    placeholder="مثال: 100,200,300"
                  />
                </label>
                <label>
                  الوحدة:
                  <select onChange={(e) => setBufferUnit(e.target.value)} value={bufferUnit}>
                    <option value="Meters">أمتار</option>
                    <option value="Kilometers">كيلومترات</option>
                    <option value="Miles">أميال</option>
                  </select>
                </label>
              </>
            )}
            {selectedTool === 'update' && (
              <>
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
                <label>
                  طبقة التحديث:
                  <select onChange={(e) => setSelectedUpdateLayer(layers.find((l) => l.id === e.target.value))} value={selectedUpdateLayer?.id || ''}>
                    <option value="">اختر طبقة</option>
                    {layers.filter((l) => l.type === 'vector').map((layer) => (
                      <option key={layer.id} value={layer.id}>
                        {layer.name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <button onClick={handleToolExecute}>تنفيذ</button>
          </>
        )}
      </div>
    </div>
  );
};

const MapView = () => {
  const [layers, setLayers] = useState([]);
  const [showBaseMap, setShowBaseMap] = useState(true);
  const [showLayerList, setShowLayerList] = useState(false);
  const [showToolbox, setShowToolbox] = useState(false);
  const [featureListModalOpen, setFeatureListModalOpen] = useState(false);
  const [layerForModal, setLayerForModal] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const mapRef = useRef();

  // Get user's export preference
  const getExportPreference = () => {
    try {
      return localStorage.getItem('exportPreference') || 'ask';
    } catch (error) {
      return 'ask';
    }
  };

  // Save user's export preference
  const saveExportPreference = (preference) => {
    try {
      localStorage.setItem('exportPreference', preference);
    } catch (error) {
      console.warn('Could not save export preference:', error);
    }
  };

  useEffect(() => {
    // Initialize with a default drawing layer
    const initialDrawingLayer = {
      id: 'default-drawing-layer',
      name: 'Drawing Layer',
      type: 'vector', // This is a drawing layer, not a standard vector layer
      features: [], // GeoJSON features will go here
      visible: true,
      color: '#ff0000', // Default color for drawings
      fillColor: '#ff0000',
      opacity: 0.8,
      fillOpacity: 0.5,
    };
    setLayers([initialDrawingLayer]);
  }, []);

  const processedLayers = useMemo(() => {
    return layers.map((layer) => {
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
  }, [layers]);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (!map) return;
    map.keyboard.enable();
  }, []);

  const handleAddLayer = useCallback((newLayers) => {
    setLayers((prev) => {
      const layersToAdd = Array.isArray(newLayers) ? newLayers : [newLayers];
      const updatedLayers = [
        ...prev,
        ...layersToAdd.map((layer) => ({
          ...layer,
          color: layer.color || generateRandomColor(),
          fillColor: layer.fillColor || layer.color || generateRandomColor(),
          fillOpacity: layer.fillOpacity || 0.7,
          opacity: layer.opacity || 0.65,
        })),
      ];
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
    if (!mapRef.current) {
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
        map.fitBounds(layer.bounds);
      } else if (layer.type === 'vector' && (layer.data || (layer.features && layer.features.length > 0))) {
        const geojson = layer.data ? JSON.parse(layer.data) : { type: 'FeatureCollection', features: layer.features };
        const geoJsonLayer = L.geoJSON(geojson);
        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
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
  }, [layers]);

  const handleDeleteLayer = useCallback((layerId) => {
    if (layerId === 'default-drawing-layer') {
      alert("لا يمكن حذف طبقة الرسم الافتراضية.");
      return;
    }
    setLayers((prev) => prev.filter((layer) => layer.id !== layerId));
  }, []);

  const handleChangeLayerColor = useCallback((layerId, color) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, color, fillColor: color } : layer
      )
    );
  }, []);

  const handleChangeLayerOpacity = useCallback((layerId, opacity) => {
    if (opacity < 0 || opacity > 1) return;
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, opacity, fillOpacity: opacity } : layer
      )
    );
  }, []);

  const handleToggleBaseMap = useCallback(() => {
    setShowBaseMap((prev) => !prev);
  }, []);

  const handleShapeCreated = (geojson) => {
    const featureId = `feature-${Date.now()}-${Math.random()}`;
    const newFeature = {
      ...geojson,
      id: featureId,
      properties: {
        ...(geojson.properties || {}),
        id: featureId, // Store ID in properties for robustness
      },
    };
    setLayers(prevLayers =>
      prevLayers.map(layer => {
        if (layer.id !== 'default-drawing-layer') {
          return layer;
        }
        return {
          ...layer,
          features: [...layer.features, newFeature],
        };
      })
    );
  };

  const handleShowLayerFeatures = (layer) => {
    setLayerForModal(layer);
    setFeatureListModalOpen(true);
  };

  const handleFeaturesEdited = (editedFeatures) => {
    const editedFeaturesMap = new Map(editedFeatures.map(f => [f.id, f]));
    setLayers(prevLayers =>
      prevLayers.map(layer => {
        if (layer.id !== 'default-drawing-layer') {
          return layer;
        }
        const updatedFeatures = layer.features.map(
          originalFeature => editedFeaturesMap.get(originalFeature.id) || originalFeature
        );
        return { ...layer, features: updatedFeatures };
      })
    );
  };

  const handleFeaturesDeleted = (deletedFeatures) => {
    const deletedIds = new Set(deletedFeatures.map(f => f.id));
    setLayers(prevLayers =>
      prevLayers.map(layer => {
        if (layer.id !== 'default-drawing-layer') {
          return layer;
        }
        return {
          ...layer,
          features: layer.features.filter(f => !deletedIds.has(f.id)),
        };
      })
    );
  };

  const handleDeleteFeature = (layerId, featureId) => {
    setLayers(prevLayers =>
      prevLayers.map(layer => {
        if (layer.id !== layerId) {
          return layer;
        }
        const updatedFeatures = layer.features.filter(feature => feature.id !== featureId);
        // Also update modal state if it's the same layer
        if (layerForModal && layerForModal.id === layerId) {
          setLayerForModal(prevModalLayer => ({
            ...prevModalLayer,
            features: updatedFeatures
          }));
        }
        return { ...layer, features: updatedFeatures };
      })
    );
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = Object.entries(feature.properties)
        .map(([key, value]) => `<b>${key}:</b> ${value}`)
        .join('<br>');
      layer.bindPopup(popupContent);
    }
  };

  // Find the drawing layer from the single state source
  const drawingLayer = layers.find(l => l.id === 'default-drawing-layer');

  const handleExportDrawnShapes = async () => {
    const drawingLayer = layers.find(l => l.id === 'default-drawing-layer');
    if (!drawingLayer || !drawingLayer.features || drawingLayer.features.length === 0) {
      alert('لا توجد أشكال مرسومة للتصدير');
      return;
    }

    setIsExporting(true);

    try {
      // Show initial progress
      console.log('Starting export process...');
      
      // Group features by type
      const featuresByType = {
        Point: drawingLayer.features.filter(f => f.geometry?.type === 'Point').length,
        LineString: drawingLayer.features.filter(f => f.geometry?.type === 'LineString').length,
        Polygon: drawingLayer.features.filter(f => f.geometry?.type === 'Polygon').length
      };

      const availableTypes = Object.keys(featuresByType).filter(type => featuresByType[type] > 0);
      
      if (availableTypes.length === 0) {
        alert('لا توجد أشكال صالحة للتصدير');
        return;
      }

      // Create export options message
      let exportMessage = 'اختر نوع الأشكال للتصدير:\n\n';
      availableTypes.forEach(type => {
        const count = featuresByType[type];
        const arabicType = type === 'Point' ? 'نقاط' : type === 'LineString' ? 'خطوط' : 'مضلعات';
        exportMessage += `${arabicType}: ${count} شكل\n`;
      });
      exportMessage += '\nاضغط "موافق" لتصدير جميع الأنواع\nاضغط "إلغاء" لتصدير النوع الأول فقط';

      const exportAll = window.confirm(exportMessage);
      
      let featuresToExport = [];
      let exportType = 'all';
      
      if (exportAll) {
        // Export all features
        featuresToExport = drawingLayer.features;
        exportType = 'all_types';
      } else {
        // Export only the first available type
        const firstType = availableTypes[0];
        featuresToExport = drawingLayer.features.filter(f => f.geometry?.type === firstType);
        exportType = firstType.toLowerCase();
      }

      if (featuresToExport.length === 0) {
        alert('لا توجد أشكال للتصدير');
        return;
      }

      // Ask user if they want to remember this preference
      const currentPreference = getExportPreference();
      if (currentPreference === 'ask') {
        const rememberChoice = window.confirm(
          'هل تريد تذكر هذا الاختيار للمرة القادمة؟\n\n' +
          'اضغط "موافق" لتذكر الاختيار\n' +
          'اضغط "إلغاء" للاستمرار في السؤال في كل مرة'
        );
        if (rememberChoice) {
          saveExportPreference(exportAll ? 'all' : 'first');
        }
      } else if (currentPreference === 'all') {
        featuresToExport = drawingLayer.features;
        exportType = 'all_types';
      } else if (currentPreference === 'first') {
        const firstType = availableTypes[0];
        featuresToExport = drawingLayer.features.filter(f => f.geometry?.type === firstType);
        exportType = firstType.toLowerCase();
      }

      // Final confirmation with details
      const arabicTypeDisplay = exportType === 'all_types' ? 'جميع الأنواع' : 
                              exportType === 'point' ? 'نقاط' :
                              exportType === 'linestring' ? 'خطوط' : 'مضلعات';
      const finalConfirm = window.confirm(
        `تأكيد التصدير:\n\n` +
        `سيتم تصدير ${featuresToExport.length} شكل من نوع ${arabicTypeDisplay}\n` +
        `سيتم تحميل ملف ZIP يحتوي على ملفات Shapefile:\n` +
        `• .shp - ملف الشكل الرئيسي\n` +
        `• .shx - ملف فهرس الشكل\n` +
        `• .dbf - ملف قاعدة البيانات\n` +
        `• .prj - ملف الإسقاط (EPSG:4326)\n\n` +
        `هل تريد المتابعة؟`
      );

      if (!finalConfirm) {
        return;
      }

      console.log('User confirmed export, preparing data...');

      const geojsonData = {
        type: 'FeatureCollection',
        features: featuresToExport
      };

      console.log('Sending data to server for conversion...');

      const response = await fetch('http://localhost:8000/export-to-shapefile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          geojson: geojsonData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Server response received, processing file...');

      // Get the blob from the response
      const blob = await response.blob();
      
      console.log('File processed, preparing download...');
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      const arabicTypeName = exportType === 'all_types' ? 'جميع_الأنواع' : 
                           exportType === 'point' ? 'نقاط' :
                           exportType === 'linestring' ? 'خطوط' : 'مضلعات';
      a.download = `drawn_shapes_${arabicTypeName}_${timestamp}.zip`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      console.log('Download initiated successfully');
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      const fileSize = (blob.size / 1024).toFixed(2); // Convert to KB
      alert(`تم تصدير ${featuresToExport.length} شكل من نوع ${arabicTypeDisplay} بنجاح!\n\n` +
            `اسم الملف: ${a.download}\n` +
            `حجم الملف: ${fileSize} KB\n` +
            `يحتوي على: ملفات Shapefile (.shp, .shx, .dbf, .prj)`);
      
      // Log export statistics
      console.log('Export Statistics:', {
        totalFeatures: featuresToExport.length,
        exportType: exportType,
        fileSize: `${fileSize} KB`,
        fileName: a.download,
        timestamp: new Date().toISOString(),
        userPreference: getExportPreference()
      });
      
      console.log('Export completed successfully!');
    } catch (error) {
      console.error('Error exporting shapes:', error);
      console.error('Export failed. Details:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      alert(`خطأ في تصدير الأشكال: ${error.message}`);
    } finally {
      setIsExporting(false);
      console.log('Export process finished');
    }
  };

  return (
    <ErrorBoundary>
      <div className={`map-view`}>
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
            <FaCog />
          </button>
        </div>
        <div className="export-button-container">
          <button
            className={`toggle-button export-button ${(!drawingLayer || !drawingLayer.features || drawingLayer.features.length === 0 || isExporting) ? 'disabled' : ''} ${isExporting ? 'loading' : ''}`}
            onClick={handleExportDrawnShapes}
            title={(() => {
                if (isExporting) {
                    return 'جاري التصدير...';
                }
                if (!drawingLayer || !drawingLayer.features || drawingLayer.features.length === 0) {
                    return 'لا توجد أشكال مرسومة للتصدير';
                }
                const featuresByType = {
                    Point: drawingLayer.features.filter(f => f.geometry?.type === 'Point').length,
                    LineString: drawingLayer.features.filter(f => f.geometry?.type === 'LineString').length,
                    Polygon: drawingLayer.features.filter(f => f.geometry?.type === 'Polygon').length
                };
                const details = [];
                if (featuresByType.Point > 0) details.push(`${featuresByType.Point} نقطة`);
                if (featuresByType.LineString > 0) details.push(`${featuresByType.LineString} خط`);
                if (featuresByType.Polygon > 0) details.push(`${featuresByType.Polygon} مضلع`);
                
                const preference = getExportPreference();
                const preferenceText = preference === 'all' ? ' (تفضيل: جميع الأنواع)' : 
                                     preference === 'first' ? ' (تفضيل: النوع الأول)' : 
                                     ' (تفضيل: السؤال دائماً)';
                
                return `تصدير الأشكال المرسومة كملف Shapefile\n${details.join('، ')}${preferenceText}`;
            })()}
            disabled={!drawingLayer || !drawingLayer.features || drawingLayer.features.length === 0 || isExporting}
          >
            {isExporting ? '...' : <FaDownload />}
          </button>
        </div>
        {showLayerList && (
          <LayerList
            layers={processedLayers.filter(l => l.id !== 'default-drawing-layer')}
            onToggleVisibility={handleToggleVisibility}
            onZoomToLayer={handleZoomToLayer}
            onDeleteLayer={handleDeleteLayer}
            onChangeLayerColor={handleChangeLayerColor}
            onChangeLayerOpacity={handleChangeLayerOpacity}
            showBaseMap={showBaseMap}
            onToggleBaseMap={handleToggleBaseMap}
            addLayerButton={<AddLayerButton onAddLayer={handleAddLayer} />}
            onShowLayerFeatures={handleShowLayerFeatures}
          />
        )}
        {showToolbox && (
          <Toolbox
            onToolSelect={() => {}}
            layers={processedLayers.filter(l => l.id !== 'default-drawing-layer')}
            onToolComplete={handleAddLayer}
          />
        )}
        <MapContainer
          center={[31.70457386017354, 33.04699]}
          zoom={8}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          {showBaseMap && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
          )}
          {layers.map(layer => {
            if (layer.id === 'default-drawing-layer' || !layer.visible) {
              return null;
            }
            if (layer.type === 'vector' && layer.data) {
              return (
                <GeoJSON
                  key={layer.id}
                  data={JSON.parse(layer.data)}
                  style={{ color: layer.color || 'blue' }}
                  onEachFeature={onEachFeature}
                />
              );
            }
            if (layer.type === 'raster' && layer.data && layer.bounds) {
              return (
                <ImageOverlay
                  key={layer.id}
                  url={layer.data}
                  bounds={layer.bounds}
                  opacity={layer.opacity}
                />
              );
            }
            return null;
          })}

          <DrawControl
            onCreated={handleShapeCreated}
            onEdited={handleFeaturesEdited}
            onDeleted={handleFeaturesDeleted}
            drawingLayer={drawingLayer}
          />
        </MapContainer>
        <FeatureListModal
          isOpen={featureListModalOpen}
          onClose={() => setFeatureListModalOpen(false)}
          layer={layerForModal}
          onDeleteFeature={handleDeleteFeature}
        />
      </div>
    </ErrorBoundary>
  );
};

export default MapView;