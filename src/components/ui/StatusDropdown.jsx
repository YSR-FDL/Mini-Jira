import React, { useState, useRef, useEffect } from 'react';
import '../../styles/StatusDropdown.css';

const StatusDropdown = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <button 
        className="dropdown-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>
            <span className={`status-dot ${selectedOption?.colorClass}`}></span>
            {selectedOption?.label}
        </span>
        <svg className={`dropdown-icon ${isOpen ? 'open' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <ul className="dropdown-list">
            {options.map((option) => (
              <li key={option.value}>
                <button
                  className={`dropdown-item ${value === option.value ? 'selected' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <span className={`status-dot ${option.colorClass}`}></span>
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StatusDropdown;
