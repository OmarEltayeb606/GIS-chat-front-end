import React, { useEffect, useRef, useMemo } from 'react';
import { FeatureGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { EditControl } from 'react-leaflet-draw';

const DrawControl = ({ onCreated, onEdited, onDeleted, drawingLayer }) => {
  const ref = useRef();
  const map = useMap();

  const shapeOptions = useMemo(() => ({
    color: 'red',
    weight: 3,
    fillColor: 'red',
    fillOpacity: 0.5,
  }), []);

  useEffect(() => {
    const featureGroup = ref.current;
    if (!featureGroup) return;

    featureGroup.clearLayers();

    if (drawingLayer && drawingLayer.features && drawingLayer.features.length > 0) {
      const geoJsonLayerGroup = L.geoJSON(drawingLayer.features, {
        style: () => shapeOptions,
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, { ...shapeOptions, radius: 5 });
        },
        onEachFeature: (feature, layer) => {
          layer.feature = feature;
        }
      });

      geoJsonLayerGroup.eachLayer(layer => {
        featureGroup.addLayer(layer);
      });
    }
  }, [drawingLayer, shapeOptions]);

  const handleCreate = (e) => {
    const { layer } = e;
    const geojson = layer.toGeoJSON();
    onCreated(geojson);
  };

  const handleEdit = (e) => {
    const features = [];
    e.layers.eachLayer(layer => {
      const geojson = layer.toGeoJSON();
      if (layer.feature && layer.feature.properties && layer.feature.properties.id) {
        geojson.id = layer.feature.properties.id;
      }
      features.push(geojson);
    });
    onEdited(features);
  };
  
  const handleDelete = (e) => {
    const features = [];
    e.layers.eachLayer(layer => {
      const geojson = layer.toGeoJSON();
      if (layer.feature && layer.feature.properties && layer.feature.properties.id) {
        geojson.id = layer.feature.properties.id;
      }
      features.push(geojson);
    });
    onDeleted(features);
  };

  return (
    <FeatureGroup ref={ref}>
      <EditControl
        position="topleft"
        onCreated={handleCreate}
        onEdited={handleEdit}
        onDeleted={handleDelete}
        draw={{
          marker: { shapeOptions },
          polyline: { shapeOptions },
          polygon: { shapeOptions },
          circle: false,
          rectangle: false,
          circlemarker: false,
        }}
        edit={{
          edit: true,
          remove: true,
        }}
      />
    </FeatureGroup>
  );
};

export default DrawControl; 