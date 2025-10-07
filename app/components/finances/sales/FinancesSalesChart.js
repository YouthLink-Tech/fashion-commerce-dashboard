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

const FinancesSalesChart = () => {

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

    const fetchFinancesSalesChart = async () => {
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
    fetchFinancesSalesChart();
  }, [startDate, endDate, range, axiosSecure, session?.user?.accessToken, status,]);

  // Reset
  const handleReset = () => {
    setSelectedDateRange(null);
    setRange("today");
  };

  const handleBarChange = (values) => {
    // Ensure at least one checkbox is always selected
    if (values.length === 0) return;
    setSelectedBars(values);
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
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
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

        <div className="flex flex-col lg:flex-row items-center justify-center gap-6">

          {/* Summary Section */}
          <div className="flex flex-row lg:flex-col items-center justify-center gap-6 w-full lg:w-[300px]">

            {/* Total Orders */}
            <div className="w-full border rounded-lg p-4 md:p-6 lg:p-8 space-y-3">
              <p className="text-xs md:text-sm xl:text-base font-semibold">Total Orders</p>
              <h3 className="font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl">{cardsData?.totalOrders}</h3>
            </div>

            {/* Total Revenue */}
            <div className="w-full border rounded-lg p-4 md:p-6 lg:p-8 space-y-3">
              <p className="text-xs md:text-sm xl:text-base font-semibold">Total Revenue</p>
              <h3 className="font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl"> ৳ {cardsData?.totalRevenue}</h3>
            </div>

            {/* Total Refunds */}
            <div className="w-full border rounded-lg p-4 md:p-6 lg:p-8 space-y-3">
              <p className="text-xs md:text-sm xl:text-base font-semibold">Total Refunded</p>
              <h3 className="font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl">৳ {cardsData?.totalRefund}</h3>
            </div>

          </div>

          <div className='w-full h-[400px] mt-2 lg:mt-6 xl:mt-2 2xl:mt-0'>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={salesData}
                margin={{ top: 30, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatXAxis} stroke="#6b7280" />

                {/* Left Y-axis for Orders */}
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  tickFormatter={(v) => v.toLocaleString()}
                  domain={yAxisDomains.left}
                />

                {/* Right Y-axis for Revenue & Refunds */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => `৳${v.toLocaleString()}`}
                  domain={yAxisDomains.right}
                />

                {/* <Tooltip content={<CustomTooltip />} /> */}

                <Tooltip
                  formatter={(value, name) => {
                    if (name === "Total Revenue" || name === "Total Refunds") {
                      return [`৳${value.toLocaleString()}`, name];
                    }
                    return [value.toLocaleString(), name];
                  }}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{ backgroundColor: "white", borderRadius: "6px" }}
                />


                {/* Bars */}
                {selectedBars.includes('Total Orders') && (
                  <Bar
                    yAxisId="left"
                    dataKey="totalOrders"
                    name="Total Orders"
                    fill="#1CA86E"
                    radius={[8, 8, 0, 0]}
                  />
                )}

                {selectedBars.includes('Total Revenue') && (
                  <Bar
                    yAxisId="right"
                    dataKey="totalRevenue"
                    name="Total Revenue"
                    fill="#3480A3"
                    radius={[8, 8, 0, 0]}
                  />
                )}

                {selectedBars.includes('Total Refunds') && (
                  <Bar
                    yAxisId="right"
                    dataKey="totalRefund"
                    name="Total Refunds"
                    fill="#D2016E"
                    radius={[8, 8, 0, 0]}
                  />
                )}

              </BarChart>
            </ResponsiveContainer>

            {/* Checkbox group */}
            <div className="flex md:gap-4 justify-center">
              <CheckboxGroup value={selectedBars} onChange={handleBarChange} orientation="horizontal">
                <Checkbox color="success" value="Total Orders"><span className='text-sm xl:text-base text-green-600'>Total Orders</span></Checkbox>
                <Checkbox color="primary" value="Total Revenue"><span className='text-sm xl:text-base text-[#3480A3]'>Total Revenue</span></Checkbox>
                <Checkbox color="danger" value="Total Refunds"><span className='text-sm xl:text-base text-[#D2016E]'>Total Refunds</span></Checkbox>
              </CheckboxGroup>
            </div>

          </div>

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

export default FinancesSalesChart;