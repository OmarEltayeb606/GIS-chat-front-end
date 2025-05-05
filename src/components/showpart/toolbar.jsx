import React, { useState } from 'react';
import './toolbar.css';

const ToolBar = ({ onToolSelect, onUpdateUnits, measurements, onDeleteMeasurement }) => {
  const [unitOptions, setUnitOptions] = useState({
    primaryLengthUnit: 'meters',
    secondaryLengthUnit: 'kilometers',
    primaryAreaUnit: 'sqmeters',
    secondaryAreaUnit: 'hectares',
  });

  const handleUnitChange = (e) => {
    const { name, value } = e.target;
    setUnitOptions((prev) => ({ ...prev, [name]: value }));
    onUpdateUnits({ ...unitOptions, [name]: value });
  };

  return (
    <div className="toolbar">
      <button onClick={() => onToolSelect('measure')} title="قياس المسافات أو المساحات">
        قياس
      </button>
      <div className="unit-selector">
        <label>
          وحدة الطول:
          <select
            name="primaryLengthUnit"
            value={unitOptions.primaryLengthUnit}
            onChange={handleUnitChange}
          >
            <option value="meters">أمتار</option>
            <option value="kilometers">كيلومترات</option>
            <option value="feet">أقدام</option>
            <option value="miles">أميال</option>
          </select>
        </label>
        <label>
          وحدة المساحة:
          <select
            name="primaryAreaUnit"
            value={unitOptions.primaryAreaUnit}
            onChange={handleUnitChange}
          >
            <option value="sqmeters">متر مربع</option>
            <option value="hectares">هكتارات</option>
            <option value="acres">أفدنة</option>
          </select>
        </label>
      </div>
      {measurements.length > 0 && (
        <div className="measurements-list">
          <h4>القياسات</h4>
          <ul>
            {measurements.map((m) => (
              <li key={m.id}>
                <span>
                  {m.area
                    ? `مساحة: ${m.area.toFixed(2)} ${unitOptions.primaryAreaUnit}`
                    : `طول: ${m.distance.toFixed(2)} ${unitOptions.primaryLengthUnit}`}
                </span>
                <button
                  onClick={() => onDeleteMeasurement(m.id)}
                  title="حذف القياس"
                  style={{ color: 'red', marginLeft: '10px' }}
                >
                  حذف
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ToolBar;