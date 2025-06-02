import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const Barcode = ({ selectedOrder }) => {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && selectedOrder?.orderNumber) {
      JsBarcode(barcodeRef.current, selectedOrder?.orderNumber, {
        format: 'CODE128',
        lineColor: '#000',
        width: 2,
        height: 50,
        displayValue: true,
      });
    }
  }, [selectedOrder?.orderNumber]);

  return (
    <svg ref={barcodeRef}></svg>
  );
};

export default Barcode;