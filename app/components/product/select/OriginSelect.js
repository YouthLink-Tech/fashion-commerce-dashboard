"use client";
import useLocations from "@/app/hooks/useLocations";
import React, { useMemo } from "react";
import Loading from "../../shared/Loading/Loading";

const OriginSelect = ({
  selectedOrigin,
  setSelectedOrigin,
  selectedDestination,
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
    setSelectedOrigin(location);
  };

  if (isLocationPending) {
    return <Loading />;
  }

  return (
    <div className="flex-1 space-y-2">
      <label htmlFor='selectedOrigin' className="flex justify-start font-semibold text-neutral-500 text-sm">Origin <span className="text-red-600 pl-1">*</span></label>
      <select
        id="selectedOrigin"
        {...register("selectedOrigin", {
          required: "Please select an origin.",
        })}
        className="font-semibold"
        value={selectedOrigin?.locationName || ""}
        onChange={handleSelectChangeLocation}
        style={{
          zIndex: 10,
          pointerEvents: "auto",
          position: "relative",
          outline: "none",
        }}
      >
        <option disabled value="">
          Select an origin
        </option>
        {activeLocation?.map((location) => (
          <option
            key={location._id}
            value={location.locationName}
            disabled={
              selectedDestination?.locationName === location.locationName
            } // Disable if it's selected as the destination
          >
            {location.locationName}
          </option>
        ))}
      </select>

      {selectedOrigin && (
        <div>
          <p className="text-neutral-500 font-medium text-sm">
            {selectedOrigin?.locationName}, {selectedOrigin?.cityName},{" "}
            {selectedOrigin?.postalCode}
          </p>
        </div>
      )}

      {errors.selectedOrigin && (
        <p className="text-left text-red-500 font-semibold text-xs">
          {errors.selectedOrigin.message}
        </p>
      )}

    </div>
  );
};

export default OriginSelect;