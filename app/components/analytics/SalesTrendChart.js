"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { DateRangePicker, Spinner } from "@nextui-org/react";
import { IoMdClose } from "react-icons/io";
import { today, getLocalTimeZone } from "@internationalized/date";
import { useAxiosSecure } from "@/app/hooks/useAxiosSecure";

const SalesTrendChart = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [range, setRange] = useState("weekly"); // default weekly
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    const fetchSalesTrend = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (startDate && endDate) {
          params.startDate = startDate;
          params.endDate = endDate;
        } else {
          params.range = range;
        }

        const { data } = await axiosSecure.get("/analytics/sales-trend", { params });

        // Transform: backend returns { trendData: [{ period, revenue }] }
        setSalesData(
          data.trendData.map((item) => ({
            date: item.period,
            sales: item.revenue,
          }))
        );
      } catch (err) {
        console.error("Error fetching sales trend:", err);
        setError("Failed to load sales data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesTrend();
  }, [startDate, endDate, range, axiosSecure]);

  // Reset
  const handleReset = () => {
    setSelectedDateRange(null);
    setRange("weekly");
  };

  // Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-semibold text-neutral-500">{label}</p>
          <p className="text-neutral-600 font-semibold">
            Revenue: ৳ {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  // Group & flag local max points
  const processedData = useMemo(() => {
    if (!salesData.length) return [];

    let grouped = {};

    salesData.forEach((item) => {
      let groupKey;
      if (range === "daily") {
        // group by YYYY-MM-DD (hour detail stays in item.date)
        groupKey = item.date.split(" ")[0];
      } else {
        // weekly, monthly, custom → group by YYYY-MM-DD
        groupKey = item.date.split(" ")[0];
      }

      if (!grouped[groupKey]) grouped[groupKey] = [];
      grouped[groupKey].push(item);
    });

    // Mark highest per group
    Object.keys(grouped).forEach((key) => {
      if (!grouped[key].length) return; // ⛔ skip empty group
      const maxVal = Math.max(...grouped[key].map((d) => d.sales));
      grouped[key] = grouped[key].map((d) => ({
        ...d,
        isMax: d.sales === maxVal && maxVal > 0, // ⛔ only flag if > 0
      }));
    });

    return Object.values(grouped).flat();
  }, [salesData, range]);

  // Custom dot for local max
  const HighlightDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload?.isMax) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#000"
          stroke="#fff"
          strokeWidth={2}
        />
      );
    }
    return null; // ⛔ don't render anything
  };

  // Dynamic formatter: if daily → show hours, else show dates
  const formatXAxis = (value) => {
    if (range === "daily") {
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
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Sales Trend</h2>

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
              className={`px-4 py-2 text-sm rounded-full font-medium transition-colors ${range === r && !selectedDateRange
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

      {/* States */}
      {loading && <p className="text-gray-500 h-80 flex justify-center items-center"><Spinner color="default" label="Loading" labelColor="foreground" /></p>}
      {error && <p className="text-red-600 h-80 flex justify-center items-center">{error}</p>}

      {/* Chart */}
      {!loading && !error && salesData.length > 0 && (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={salesData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#6b7280" />
              <YAxis
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                stroke="#6b7280"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                name="Revenue"
                stroke="#000"
                strokeWidth={3}
                dot={<HighlightDot />}
                activeDot={{ r: 6 }}
                data={processedData}
              />
            </LineChart>
          </ResponsiveContainer>
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

export default SalesTrendChart;