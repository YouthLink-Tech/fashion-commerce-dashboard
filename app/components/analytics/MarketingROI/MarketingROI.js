"use client";
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { DateRangePicker } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { today, getLocalTimeZone } from "@internationalized/date";
import ConversionRate from './ConversionRate';
import ROAS from './ROAS';
import CostToGetCustomer from './CostToGetCustomer';

const MarketingROI = () => {

  const axiosSecure = useAxiosSecure();
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [range, setRange] = useState("weekly"); // default weekly
  const [marketingData, setMarketingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();

  // Format for API
  const formatDate = (dateObj) => {
    if (!dateObj) return null;
    return `${dateObj.year}-${String(dateObj.month).padStart(2, "0")}-${String(
      dateObj.day
    ).padStart(2, "0")}`;
  };

  // Compute start/end
  const { startDate, endDate } = useMemo(() => {
    if (!selectedDateRange?.start || !selectedDateRange?.end) {
      return { startDate: null, endDate: null };
    }
    return {
      startDate: formatDate(selectedDateRange.start),
      endDate: formatDate(selectedDateRange.end),
    };
  }, [selectedDateRange]);

  // Fetch sales trend
  useEffect(() => {

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchMarketingData = async () => {
      setLoading(true);
      setError(null);
      try {
        let params = {};

        if (startDate && endDate) {
          // Custom range
          params = { startDate, endDate };
        } else if (range) {
          // Predefined range: daily / weekly / monthly
          params = { range };
        }

        const { data } = await axiosSecure.get("/analytics/marketing", { params });

        // Transform: backend returns { trendData: [{ period, revenue }] }
        setMarketingData(
          data
        );
      } catch (err) {
        console.error("Error fetching sales trend:", err);
        setError("Failed to load sales data.");
      } finally {
        setLoading(false);
      }
    };
    fetchMarketingData();
  }, [startDate, endDate, range, axiosSecure, session?.user?.accessToken, status,]);

  // Reset
  const handleReset = () => {
    setSelectedDateRange(null);
    setRange("weekly");
  };

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
        <div className="flex gap-2">
          {["daily", "weekly", "monthly"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRange(r);
                setSelectedDateRange(null);
              }}
              className={`px-3 py-1.5 2xl:px-4 2xl:py-2 text-xs 2xl:text-sm rounded-full font-medium transition-colors ${range === r && !selectedDateRange
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {r === "daily" ? "Today" : r === "weekly" ? "Last 7 Days" : "Last Month"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <DateRangePicker
            label="Select Date Range"
            value={selectedDateRange}
            onChange={setSelectedDateRange}
            maxValue={today(getLocalTimeZone())}
            className="w-full max-w-xs"
          />
          {selectedDateRange && (
            <button className="hover:text-red-500 font-bold text-white rounded-lg bg-red-600 hover:bg-white p-1" onClick={handleReset}>
              <IoMdClose size={20} />
            </button>
          )}
        </div>
      </div>

      <div className='flex flex-col md:flex-row justify-start items-center'>
        <ROAS
        // conversionRate={marketingData?.conversionRate}
        // loading={loading}
        // error={error}
        />
        <ConversionRate
          conversionRate={marketingData?.conversionRate}
          loading={loading}
          error={error}
        />
        <CostToGetCustomer
        // conversionRate={marketingData?.conversionRate}
        // loading={loading}
        // error={error}
        />
      </div>

    </>
  );
};

export default MarketingROI;