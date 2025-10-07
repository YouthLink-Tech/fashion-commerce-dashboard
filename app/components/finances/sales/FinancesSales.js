"use client";
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import { today, getLocalTimeZone } from "@internationalized/date";
import { Checkbox, CheckboxGroup, DateRangePicker, Spinner } from '@nextui-org/react';
import { IoMdClose } from 'react-icons/io';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import SummaryCards from './SummaryCards';
import FinanceBarChart from './FinanceBarChart';

const FinancesSales = () => {

  const axiosSecure = useAxiosSecure();
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [range, setRange] = useState("today"); // default today
  const [salesData, setSalesData] = useState([]);
  const [cardsData, setCardsData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalRefund: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const [selectedBars, setSelectedBars] = useState(['Total Orders', 'Total Revenue', 'Total Refunds']);

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

    const fetchFinancesSales = async () => {
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

        const { data } = await axiosSecure.get("/finances/sales", { params });

        // Transform: backend returns { trendData: [{ period, revenue }] }
        setSalesData(
          data?.summaryData?.map((item) => ({
            date: item.period,
            totalOrders: item.totalOrders ?? undefined,
            totalRevenue: item.totalRevenue ?? undefined,
            totalRefund: item.totalRefund ?? undefined,
          }))
        );

        // Set cards data
        setCardsData({
          totalOrders: data.totalOrders,
          totalRevenue: data.totalRevenue,
          totalRefund: data.totalRefund,
        });

      } catch (err) {
        console.error("Error fetching sales trend:", err);
        setError("Failed to load sales data.");
      } finally {
        setLoading(false);
      }
    };
    fetchFinancesSales();
  }, [startDate, endDate, range, axiosSecure, session?.user?.accessToken, status,]);

  // Reset
  const handleReset = () => {
    setSelectedDateRange(null);
    setRange("today");
  };

  // Compute dynamic Y-axis domains
  const yAxisDomains = useMemo(() => {
    if (!salesData || salesData.length === 0) return { left: [0, 'auto'], right: [0, 'auto'] };

    let leftValues = [], rightValues = [];

    salesData.forEach(item => {
      if (selectedBars.includes('Total Orders')) leftValues.push(item.totalOrders);
      if (selectedBars.includes('Total Revenue')) rightValues.push(item.totalRevenue);
      if (selectedBars.includes('Total Refunds')) rightValues.push(item.totalRefund);
    });

    const computeDomain = (values) => {
      if (!values.length) return [0, 1]; // default
      const min = Math.min(...values);
      const max = Math.max(...values);
      const padding = (max - min) * 0.2 || max * 0.2; // 50% padding or half max if min=max
      return [Math.max(0, min - padding), max + padding];
    };

    return {
      left: computeDomain(leftValues),
      right: computeDomain(rightValues),
    };
  }, [salesData, selectedBars]);

  // Dynamic formatter: if daily → show hours, else show dates
  const formatXAxis = (value) => {
    if ((range === "today" || range === "yesterday") && !startDate && !endDate) {
      // value like "2025-09-09 13:00"
      return value.split(" ")[1]; // HH:00
    }
    // value like "2025-09-09"
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-5 relative mb-10">

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mb-4">
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
          <SummaryCards cardsData={cardsData} />

          <FinanceBarChart
            salesData={salesData}
            formatXAxis={formatXAxis}
            yAxisDomains={yAxisDomains}
            selectedBars={selectedBars}
            setSelectedBars={setSelectedBars}
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

export default FinancesSales;