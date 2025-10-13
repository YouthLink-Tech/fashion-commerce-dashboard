"use client";
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import { today, getLocalTimeZone } from "@internationalized/date";
import { DateRangePicker, Spinner } from '@nextui-org/react';
import { IoMdClose } from 'react-icons/io';
import Profitability from '../../components/dashboard/charts/Profitability';
import SalesPerformance from '../../components/dashboard/charts/SalesPerformance';
// import SummaryCards from './SummaryCards';

const DashboardPerformance = () => {

  const axiosSecure = useAxiosSecure();
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [range, setRange] = useState("weekly"); // default today
  const [salesData, setSalesData] = useState([]);
  const [salesData2, setSalesData2] = useState([]);
  // const [cardsData, setCardsData] = useState({
  //   totalOrders: 0,
  //   totalRevenue: 0,
  //   totalRefund: 0,
  // });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const [selectedBars, setSelectedBars] = useState(['Total Orders', 'Total Revenue', 'Total Refunds']);
  const [selectedBars2, setSelectedBars2] = useState(['Total Revenue', 'COGS', 'Expenses']);

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

  // Fetch dashboard performance data
  useEffect(() => {

    if (status !== "authenticated" || !session?.user?.accessToken) return;

    const fetchDashboardPerformance = async () => {
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

        const { data } = await axiosSecure.get("/api/dashboard/performance", { params });

        // Transform: backend returns { trendData: [{ period, revenue }] }
        setSalesData(
          data?.summaryData?.map((item) => ({
            date: item.period,
            totalOrders: item.totalOrders ?? undefined,
            totalRevenue: item.totalRevenue ?? undefined,
            totalRefund: item.totalRefund ?? undefined,
          }))
        );

        setSalesData2(
          data?.summaryData?.map((item) => ({
            date: item.period,
            totalRevenue: item.totalRevenue ?? undefined,
            totalExpenses: item.totalExpenses ?? undefined,
            totalCOGS: item.totalCOGS ?? undefined
          }))
        );

        // Set cards data
        // setCardsData({
        //   totalOrders: data.totalOrders,
        //   totalRevenue: data.totalRevenue,
        //   totalRefund: data.totalRefund,
        // });

      } catch (err) {
        console.error("Error fetching sales trend:", err);
        setError("Failed to load sales data.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardPerformance();
  }, [startDate, endDate, range, axiosSecure, session?.user?.accessToken, status,]);

  // Reset
  const handleReset = () => {
    setSelectedDateRange(null);
    setRange("weekly");
  };

  return (
    <div className="space-y-5 relative my-10">

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-start gap-3 mb-4">
        <div className="flex gap-2">
          {["today", "yesterday", "weekly", "monthly"].map((r) => (
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
              {r === "today"
                ? "Today"
                : r === "yesterday"
                  ? "Yesterday"
                  : r === "weekly"
                    ? "Last 7 Days"
                    : "Last Month"}
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

      {/* States */}
      {loading && <p className="text-gray-500 h-80 flex justify-center items-center"><Spinner color="default" label="Loading" labelColor="foreground" /></p>}
      {error && <p className="text-red-600 h-80 flex justify-center items-center">{error}</p>}

      {/* Chart */}
      {!loading && !error && salesData.length > 0 && (

        <div className="flex flex-col xl:flex-row gap-8 w-full">

          {/* Summary Section */}
          {/* <SummaryCards cardsData={cardsData} /> */}

          <SalesPerformance
            salesData={salesData}
            range={range}
            selectedBars={selectedBars}
            setSelectedBars={setSelectedBars}
            startDate={startDate}
            endDate={endDate}
          />

          <Profitability
            salesData2={salesData2}
            range={range}
            selectedBars2={selectedBars2}
            setSelectedBars2={setSelectedBars2}
            startDate={startDate}
            endDate={endDate}
          />

        </div>

      )}

      {!loading && !error && salesData.length === 0 && (
        <p className="text-gray-500 h-80 flex justify-center items-center">
          No data available for the selected range.
        </p>
      )}

    </div>
  );
};

export default DashboardPerformance;