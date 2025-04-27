import React from 'react';
import './toolbar.css';

const ToolBar = ({ onToolSelect }) => {
  return (
    <div className="toolbar">
      <button onClick={() => onToolSelect('measure')} title="قياس المسافات أو المساحات">
        قياس
      </button>
    </div>
  );
};

export default ToolBar;