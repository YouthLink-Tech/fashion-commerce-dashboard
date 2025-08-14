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
    <div className='flex-1 space-y-2'>
      <label htmlFor='selectedVendor' className="flex justify-start font-semibold text-neutral-500 text-sm">Supplier <span className="text-red-600 pl-1">*</span></label>
      <select
        id="selectedVendor"
        {...register('selectedVendor', { required: 'Please select a supplier.' })}
        className='font-semibold'
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

      {selectedVendor && (
        <div>
          <p className="text-neutral-500 font-medium text-sm">
            {selectedVendor?.value
              ? vendorList.find(ven => ven.value === selectedVendor.value)?.vendorAddress
              : vendorList.find(ven => ven.value === selectedVendor)?.vendorAddress}
          </p>
        </div>
      )}

      {errors.selectedVendor && (
        <p className="text-left text-red-500 font-semibold text-xs">{errors.selectedVendor.message}</p>
      )}

    </div>
  );
};

export default VendorSelect;