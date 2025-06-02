import React from 'react';

const ColorOption = ({ data, innerRef, innerProps }) => {
  const style = {
    display: 'flex',
    alignItems: 'center'
  };

  const colorStyle = {
    width: 20,
    height: 20,
    marginRight: 10,
    backgroundColor: data.color
  };

  // If the color is a gradient, use backgroundImage instead of backgroundColor
  if (data?.color?.includes('linear-gradient')) {
    colorStyle.backgroundImage = data.color;
    delete colorStyle.backgroundColor;
  }

  return (
    <div ref={innerRef} {...innerProps} style={style}>
      <div style={colorStyle}></div>
      <div>{data.label}</div>
    </div>
  );
};

export default ColorOption;