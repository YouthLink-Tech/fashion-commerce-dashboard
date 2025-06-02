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
    <div className="flex-1 space-y-3">
      <h1 className="font-medium">Destination</h1>
      <select
        id="selectedDestination"
        {...register("selectedDestination", {
          required: "Please select a destination.",
        })}
        className="font-semibold text-lg"
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

      {errors.selectedDestination && (
        <p className="text-red-600 text-left">
          {errors.selectedDestination.message}
        </p>
      )}

      {selectedDestination && (
        <div>
          <p className="text-neutral-500 font-medium">
            {selectedDestination?.locationName}, {selectedDestination?.cityName},{" "}
            {selectedDestination?.postalCode}
          </p>
        </div>
      )}
    </div>
  );
};

export default DestinationSelect;