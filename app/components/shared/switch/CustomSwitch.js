import React from 'react';

const CustomSwitch = ({ checked, onChange, disabled }) => {
  return (
    <label className="custom-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="custom-switch-input"
        disabled={disabled}
      />
      <span
        className={`custom-switch-slider ${disabled ? 'expired' : ''}`}
      />
    </label>
  );
};

export default CustomSwitch;