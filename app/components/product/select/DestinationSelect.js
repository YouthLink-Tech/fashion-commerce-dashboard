"use client";
import useLocations from "@/app/hooks/useLocations";
import React, { useMemo } from "react";
import Loading from "../../shared/Loading/Loading";

const DestinationSelect = ({
  selectedDestination,
  setSelectedDestination,
  selectedOrigin,
  register,
  errors,
}) => {
  const [locationList, isLocationPending] = useLocations();

  const activeLocation = useMemo(() => {
    return locationList?.filter((location) => location?.status === true);
  }, [locationList]);

  const handleSelectChangeLocation = (e) => {
    const locationValue = e.target.value;
    const location = activeLocation?.find(
      (l) => l.locationName === locationValue
    );
    setSelectedDestination(location);
  };

  if (isLocationPending) {
    return <Loading />;
  }

  return (
    <div className="flex-1 space-y-2">

      <label htmlFor='selectedDestination' className="flex justify-start font-semibold text-neutral-500 text-sm">Destination <span className="text-red-600 pl-1">*</span></label>

      <select
        id="selectedDestination"
        {...register("selectedDestination", {
          required: "Please select a destination.",
        })}
        className="font-semibold"
        value={selectedDestination?.locationName || ""}
        onChange={handleSelectChangeLocation}
        style={{
          zIndex: 10,
          pointerEvents: "auto",
          position: "relative",
          outline: "none",
        }}
      >
        <option disabled value="">
          Select a destination
        </option>
        {activeLocation?.map((location) => (
          <option
            key={location._id}
            value={location.locationName}
            disabled={selectedOrigin?.locationName === location.locationName} // Disable if it's selected as the origin
          >
            {location.locationName}
          </option>
        ))}
      </select>

      {selectedDestination && (
        <div>
          <p className="text-neutral-500 font-medium text-sm">
            {selectedDestination?.locationName}, {selectedDestination?.cityName},{" "}
            {selectedDestination?.postalCode}
          </p>
        </div>
      )}

      {errors.selectedDestination && (
        <p className="text-left text-red-500 font-semibold text-xs">
          {errors.selectedDestination.message}
        </p>
      )}

    </div>
  );
};

export default DestinationSelect;