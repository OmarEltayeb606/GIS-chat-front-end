import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import './LayerList.css';

const LayerList = ({ layers, onToggleVisibility, onZoomToLayer, onDeleteLayer, onChangeLayerColor, onChangeLayerOpacity, onReorderLayers, showBaseMap, onToggleBaseMap }) => {
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onReorderLayers(result.source.index, result.destination.index);
  };

  console.log('Layers in LayerList:', JSON.stringify(layers, null, 2));

  return (
    <div className="layer-list">
      <h3>الطبقات</h3>
      <div className="layer-item">
        <div className="layer-item-content">
          <input
            type="checkbox"
            checked={showBaseMap}
            onChange={onToggleBaseMap}
            className="layer-visibility-checkbox"
          />
          <span className="layer-name">خريطة OpenStreetMap</span>
        </div>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="layers">
          {(provided) => (
            <ul
              className="layer-items"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {layers.map((layer, index) => (
                <Draggable key={layer.id} draggableId={layer.id} index={index}>
                  {(provided) => (
                    <li
                      className="layer-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div className="layer-item-content">
                        <input
                          type="checkbox"
                          checked={layer.visible}
                          onChange={() => onToggleVisibility(layer.id)}
                          className="layer-visibility-checkbox"
                        />
                        <span className="layer-name">{layer.name}</span>
                        <input
                          type="color"
                          value={layer.color || '#ff7800'}
                          onChange={(e) => onChangeLayerColor(layer.id, e.target.value)}
                          className="layer-color-picker"
                          title="اختر لون الطبقة"
                        />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={layer.opacity || 0.65}
                          onChange={(e) => onChangeLayerOpacity(layer.id, parseFloat(e.target.value))}
                          className="layer-opacity-slider"
                          title="ضبط شفافية الطبقة"
                        />
                        <button
                          className="zoom-to-layer-button"
                          onClick={() => onZoomToLayer(layer.id)}
                          title="تكبير على الطبقة"
                        >
                          <i className="fas fa-search-plus"></i>
                        </button>
                        <button
                          className="delete-layer-button"
                          onClick={() => onDeleteLayer(layer.id)}
                          title="حذف الطبقة"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default LayerList;