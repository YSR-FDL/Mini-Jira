import React from 'react';
import '../../styles/ActionBtn.css';

const ActionBtn = ({ children, onClick, variant = 'primary', size = 'md', type = "button" }) => {
  return (
    <button type={type} className={`action-btn ${variant} ${size}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default ActionBtn;
