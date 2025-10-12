"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useAxiosSecure } from '@/app/hooks/useAxiosSecure';
import { useSession } from 'next-auth/react';
import { IoMdClose } from 'react-icons/io';
import { DateRangePicker } from '@nextui-org/react';
import { today, getLocalTimeZone } from "@internationalized/date";
import DashboardCard from './DashboardCard';
import { CiDollar, CiPercent, CiReceipt } from "react-icons/ci";
import { BsGraphUpArrow } from "react-icons/bs";
import { GoCheckCircle } from "react-icons/go";
import { IoCartOutline } from "react-icons/io5";
import { FaBangladeshiTakaSign } from 'react-icons/fa6';
import { FcUndo } from "react-icons/fc";

const Header = () => {

  const axiosSecure = useAxiosSecure();
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [range, setRange] = useState("weekly"); // default weekly
  const [headerData, setHeaderData] = useState([]);
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

    const fetchHeaderData = async () => {
      setLoading(true);
      setError(null);
      try {
        let params = {};

        if (startDate && endDate) {
          // Custom range
          params = { startDate, endDate };
        } else if (range) {
          // Predefined range: today / yesterday / weekly / monthly
          params = { range };
        }

        const { data } = await axiosSecure.get("/analytics/profitability", { params });

        // Transform: backend returns { trendData: [{ period, revenue }] }
        setHeaderData(
          data
        );
      } catch (err) {
        console.error("Error fetching sales trend:", err);
        setError("Failed to load sales data.");
      } finally {
        setLoading(false);
      }
    };
    fetchHeaderData();
  }, [startDate, endDate, range, axiosSecure, session?.user?.accessToken, status,]);

  // Reset
  const handleReset = () => {
    setSelectedDateRange(null);
    setRange("weekly");
  };

  const cards = [
    {
      title: "Revenue",
      value: headerData?.totalRevenue || 0,
      icon: CiDollar,
      unit: "taka",
      formula: "Total Revenue = SUM(Sales Amount - Shipping Charge)",
      loading,
      error,
    },
    {
      title: "Total Orders",
      value: headerData?.totalOrders || 0,
      icon: CiReceipt,
      unit: "",
      formula: "Total Orders = Count(Unique Order IDs)",
      loading,
      error,
    },
    {
      title: "Total Refunded",
      value: headerData?.totalRefunded || 0,
      icon: FcUndo,
      unit: "taka",
      formula: `Total Refunded = SUM(FinalUnitPrice × Quantity) 
for Accepted Products in Refunded Orders`,
      loading,
      error,
    },
    {
      title: "Gross Profit",
      value: headerData?.grossProfit || 0,
      icon: BsGraphUpArrow,
      unit: "taka",
      formula: `Gross Profit = Revenue – COGS
COGS = SUM(Unit Cost × Units Sold)`,
      loading,
      error,
    },
    {
      title: "Gross Margin",
      value: headerData?.grossMarginPercent || 0,
      icon: CiPercent,
      unit: "percent",
      formula: "Gross Margin = (Gross Profit / Revenue) × 100",
      loading,
      error,
    },
    {
      title: "Net Profit",
      value: headerData?.netProfit || 0,
      icon: FaBangladeshiTakaSign,
      unit: "taka",
      formula: "Net Profit = Revenue – (COGS + Expenses)",
      loading,
      error,
    },
    {
      title: "ROAS",
      value: headerData?.adSpend || 0,
      icon: GoCheckCircle,
      unit: "",
      formula: "Return On Advertising Spend = Ad Revenue / Ad Spend",
      loading,
      error,
    },
    {
      title: "AOV",
      value: headerData?.averageOrderValue || 0,
      icon: IoCartOutline,
      unit: "taka",
      formula: "Average Order Value = Total Revenue / Orders",
      loading,
      error,
    },
  ];

  return (
    <>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start md:items-center justify-start gap-3 mb-4">
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
              {r === "today" ? "Today" : r === "yesterday" ? "Yesterday" : r === "weekly" ? "Last 7 Days" : "Last Month"}
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

      <div className='overflow-x-auto custom-scrollbar'>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 sm:px-0">
          {cards.map((card, i) => (
            <DashboardCard
              key={i}
              title={card.title}
              value={card.value}
              icon={card.icon}
              unit={card.unit}
              formula={card.formula}
              loading={card.loading}
              error={card.error}
            />
          ))}
        </div>
      </div>

    </>
  );
};

export default Header;