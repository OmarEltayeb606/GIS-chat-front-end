import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, ImageOverlay, useMap, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddLayerButton from './AddLayerButton';
import LayerList from './LayerList';
import './MapView.css';
import { FaLayerGroup } from 'react-icons/fa';
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
          color: layer.color || generateRandomColor(),
          fillColor: layer.fillColor || layer.color || generateRandomColor(),
          fillOpacity: layer.fillOpacity || 0.7,
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
        layer.id === layerId ? { ...layer, color, fillColor: color } : layer
      )
    );
  }, []);

  const handleChangeLayerOpacity = useCallback((layerId, opacity) => {
    if (opacity < 0 || opacity > 1) return;
    const handler = setTimeout(() => {
      console.log(`Changing opacity for layer ${layerId} to ${opacity}`);
      setLayers((prev) =>
        prev.map((layer) =>
          layer.id === layerId ? { ...layer, opacity, fillOpacity: opacity } : layer
        )
      );
    }, 300);
    return () => clearTimeout(handler);
  }, []);

  const handleToggleBaseMap = useCallback(() => {
    setShowBaseMap((prev) => !prev);
  }, []);

  const pointToLayer = useCallback(
    (feature, latlng, layer) => {
      return L.circleMarker(latlng, {
        radius: 6,
        fillColor: layer.fillColor || layer.color || '#ff0000',
        color: layer.color || '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: layer.fillOpacity || 0.7,
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
                  color: layer.color || generateRandomColor(),
                  weight: 2,
                  opacity: layer.opacity || 0.65,
                  fillColor: layer.fillColor || layer.color || generateRandomColor(),
                  fillOpacity: layer.fillOpacity || 0.7,
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
            onToolSelect={() => {}}
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