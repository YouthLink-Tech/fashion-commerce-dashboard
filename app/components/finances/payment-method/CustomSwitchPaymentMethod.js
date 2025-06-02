import React from 'react';

const CustomSwitchPaymentMethod = ({ checked, onChange }) => {
  return (
    <label className="custom-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="custom-switch-input"
      />
      <span
        className={`custom-switch-slider`}
      />
    </label>
  );
};

export default CustomSwitchPaymentMethod;