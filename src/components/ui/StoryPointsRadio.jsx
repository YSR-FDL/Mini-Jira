import React from 'react';
import '../../styles/Ui/StoryPointsRadio.css';

const StoryPointsRadio = ({ name, options, selectedValue, onChange }) => {
  return (
    <div className="radio-inputs">
      {options.map((option) => (
        <label className="radio" key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={selectedValue === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="name">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default StoryPointsRadio;
