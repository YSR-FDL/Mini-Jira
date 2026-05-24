import React from 'react';
import '../../styles/ActionBtn.css';

const ActionBtn = ({ children, onClick, variant = 'primary', size = 'md', type = "button", ...props }) => {
  return (
    <button type={type} className={`action-btn ${variant} ${size}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

export default ActionBtn;
