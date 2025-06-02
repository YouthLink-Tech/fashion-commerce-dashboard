import useLocations from '@/app/hooks/useLocations';
import { useState, useEffect } from 'react';
import { Select, SelectItem } from '@nextui-org/react';
import Loading from '../../shared/Loading/Loading';

const LocationDropdown = ({ onLocationSelect }) => {
  const [locationList, isLocationPending] = useLocations();
  const [selectedLocation, setSelectedLocation] = useState(new Set());

  // Set the primary location as default when the location list loads
  useEffect(() => {
    if (locationList?.length && selectedLocation.size === 0) {
      const primaryLocation = locationList.find(loc => loc.isPrimaryLocation);
      const defaultLocation = primaryLocation?.locationName || locationList[0].locationName;
      setSelectedLocation(new Set([defaultLocation]));
      onLocationSelect(defaultLocation);
    }
  }, [locationList, onLocationSelect, selectedLocation.size]); // Runs only when locationList changes

  const isSelected = selectedLocation.size > 0 && Array.from(selectedLocation)[0] !== undefined;

  if (isLocationPending) {
    return <Loading />;
  }


  return (
    <Select
      className="w-fit"
      label={
        <>
          {isSelected ? (
            <span className='font-semibold text-neutral-700'>
              Selected Location :
            </span>
          ) : (
            <span className='text-neutral-700 font-semibold'>Select Location</span>
          )}
          {!!selectedLocation.size && (
            <span className="ml-2 font-bold text-neutral-950">
              {Array.from(selectedLocation)[0]}
            </span>
          )}
        </>
      }
      selectionMode="single"
      size="sm"
      selectedKeys={selectedLocation}
      onSelectionChange={(newSelectedKeys) => {
        const selectedValue = Array.from(newSelectedKeys)[0];
        setSelectedLocation(new Set([selectedValue])); // Update selected location
        onLocationSelect(selectedValue); // Pass to parent
      }}
      classNames={{
        mainWrapper: [
          `z-[1] text-neutral-700 [&>button]:px-4 [&>button]:duration-300 hover:[&>button]:bg-[#F4D3BA] ${isSelected ? "[&>button]:bg-[#F4D3BA]" : "[&>button]:bg-[#FBEDE2]"
          }`,
        ],
        label: [
          "text-neutral-700 static mr-4 group-data-[filled=true]:scale-100 group-data-[filled=true]:-translate-y-0",
        ],
        innerWrapper: ["hidden"],
        popoverContent: ["min-w-60 w-fit"],
      }}
    >
      {locationList?.map((location) => (
        <SelectItem key={location.locationName} value={location.locationName}>
          {location.locationName}
        </SelectItem>
      ))}
    </Select>
  );
};

export default LocationDropdown;