import React from 'react';
import '../../styles/WaveInput.css';

const WaveInput = ({ label, value, onChange, required = true }) => {
  return (
    <div className="wave-group">
      <input 
        required={required} 
        type="text" 
        className="input" 
        value={value}
        onChange={onChange}
        placeholder=" "
      />
      <span className="bar"></span>
      <label className="label">
        {/* On découpe le mot et on crée un span pour chaque lettre dynamiquement */}
        {label.split('').map((char, index) => (
          <span 
            key={index} 
            className="label-char" 
            style={{ '--index': index }}
          >
            {/* Gestion des espaces pour ne pas casser le mot */}
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </label>
    </div>
  );
};

export default WaveInput;
