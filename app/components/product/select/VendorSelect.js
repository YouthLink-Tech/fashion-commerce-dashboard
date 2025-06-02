"use client";
import useVendors from '@/app/hooks/useVendors';
import React from 'react';
import Loading from '../../shared/Loading/Loading';

const VendorSelect = ({ selectedVendor, setSelectedVendor, register, errors }) => {
  const [vendorList, isVendorPending] = useVendors();

  const handleSelectChange = (e) => {
    const vendorValue = e.target.value;
    const vendor = vendorList?.find(v => v.value === vendorValue);
    setSelectedVendor(vendor);
  };

  if (isVendorPending) {
    return <Loading />;
  }

  return (
    <div className='flex-1 space-y-3'>
      <h1 className='font-medium'>Supplier</h1>
      <select
        id="selectedVendor"
        {...register('selectedVendor', { required: 'Please select a supplier.' })}
        className='font-semibold text-lg'
        value={selectedVendor?.value || "" || selectedVendor}
        onChange={handleSelectChange}
        style={{ zIndex: 10, pointerEvents: 'auto', position: 'relative', outline: 'none' }}
      >
        <option disabled value="">Select a vendor</option>
        {vendorList?.map(vendor => (
          <option key={vendor._id} value={vendor.value}>
            {vendor.label}
          </option>
        ))}
      </select>

      {errors.selectedVendor && (
        <p className="text-red-600 text-left">{errors.selectedVendor.message}</p>
      )}

      {selectedVendor && (
        <div>
          <p className="text-neutral-500 font-medium">
            {selectedVendor?.value
              ? vendorList.find(ven => ven.value === selectedVendor.value)?.vendorAddress
              : vendorList.find(ven => ven.value === selectedVendor)?.vendorAddress}
          </p>
        </div>
      )}
    </div>
  );
};

export default VendorSelect;