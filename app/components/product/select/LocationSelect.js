"use client";
import useLocations from '@/app/hooks/useLocations';
import React, { useMemo } from 'react';
import Loading from '../../shared/Loading/Loading';

const LocationSelect = ({ selectedLocation, setSelectedLocation, register, errors }) => {
  const [locationList, isLocationPending] = useLocations();

  const activeLocation = useMemo(() => {
    return locationList?.filter(location => location?.status === true);
  }, [locationList]);

  const handleSelectChangeLocation = (e) => {
    const locationValue = e.target.value;
    const location = activeLocation?.find(l => l.locationName === locationValue);
    setSelectedLocation(location);
  };

  if (isLocationPending) {
    return <Loading />;
  }

  return (
    <div className='flex-1 space-y-2'>
      <label htmlFor='selectedLocation' className="flex justify-start font-semibold text-neutral-500 text-sm">Destination <span className="text-red-600 pl-1">*</span></label>
      <select
        id="selectedLocation"
        {...register('selectedLocation', { required: 'Please select a destination.' })}
        className='font-semibold'
        value={selectedLocation?.locationName || "" || selectedLocation} // Set selected value here
        onChange={handleSelectChangeLocation}
        style={{ zIndex: 10, pointerEvents: 'auto', position: 'relative', outline: 'none' }}
      >
        <option disabled value="">Select a location</option>
        {activeLocation?.map(location => (
          <option key={location._id} value={location.locationName}>
            {location.locationName}
          </option>
        ))}
      </select>

      {selectedLocation && (
        <div>
          <p className='text-neutral-500 font-medium text-sm'>{selectedLocation?.locationName}, {selectedLocation?.cityName}, {selectedLocation?.postalCode}</p>
        </div>
      )}

      {errors.selectedLocation && (
        <p className="text-left text-red-500 font-semibold text-xs">{errors.selectedLocation.message}</p>
      )}

    </div>
  );
};

export default LocationSelect;