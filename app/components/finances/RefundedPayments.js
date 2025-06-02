import useOrders from '@/app/hooks/useOrders';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SmallHeightLoading from '../shared/Loading/SmallHeightLoading';
import { Checkbox, CheckboxGroup, DateRangePicker } from '@nextui-org/react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { IoMdClose } from 'react-icons/io';
import { format, startOfToday, endOfToday, startOfYesterday, endOfYesterday, subDays, subMonths, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { today, getLocalTimeZone } from "@internationalized/date";

const RefundedPayments = () => {
  const [orderList, isOrderPending] = useOrders();
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null });
  const [activeFilter, setActiveFilter] = useState('today');
  const [showDateRangePicker, setShowDateRangePicker] = useState(true); // New state
  const [selected, setSelected] = useState(['bKash', 'SSLCommerz']);

  useEffect(() => {
    // Set default date range to Today when the component mounts
    handleDateFilter('today');
  }, []);

  const parseDate = (dateString) => {
    const [datePart, timePart] = dateString.split('|').map(part => part.trim());
    const [day, month, year] = datePart.split('-').map(Number);
    const fullYear = year < 100 ? 2000 + year : year;
    const date = new Date(fullYear, month - 1, day);

    if (timePart) {
      const [hours, minutes] = timePart.split(':').map(Number);
      date.setHours(hours, minutes);
    }

    return date;
  };

  const { startDate, endDate } = useMemo(() => {
    const start = selectedDateRange.start
      ? new Date(selectedDateRange.start.year, selectedDateRange.start.month - 1, selectedDateRange.start.day)
      : null;
    const end = selectedDateRange.end
      ? new Date(selectedDateRange.end.year, selectedDateRange.end.month - 1, selectedDateRange.end.day)
      : null;

    const adjustedEndDate = end ? new Date(end.getTime() + 24 * 60 * 60 * 1000 - 1) : null;

    return { startDate: start, endDate: adjustedEndDate };
  }, [selectedDateRange]);

  const getDateRange = useCallback(() => {
    return {
      startDate: startDate && isValid(startDate) ? format(startDate, 'yyyy-MM-dd') : null,
      endDate: endDate && isValid(endDate) ? format(endDate, 'yyyy-MM-dd') : null,
    };
  }, [startDate, endDate]);

  const { startDate: filterStartDate, endDate: filterEndDate } = useMemo(() => {
    return getDateRange();
  }, [getDateRange]);

  const normalizeDateRange = (startRange, endRange) => {
    const startDate = startRange ? new Date(startRange) : null;
    const endDate = endRange ? new Date(endRange) : null;

    const normalizedStart = startDate ? {
      year: startDate.getFullYear(),
      month: startDate.getMonth() + 1,
      day: startDate.getDate(),
    } : null;

    const normalizedEnd = endDate ? {
      year: endDate.getFullYear(),
      month: endDate.getMonth() + 1,
      day: endDate.getDate(),
    } : null;

    setSelectedDateRange({
      start: normalizedStart,
      end: normalizedEnd,
    });

    // Set active filter to 'custom' if a custom date range is selected
    if (startRange && endRange) {
      setActiveFilter('custom');
      setShowDateRangePicker(false);
    }
  };

  const { bKashTransactions, sslCommerzTransactions, totalBKashRevenue, totalSSLCommerzRevenue } = useMemo(() => {
    let bKashTransactions = 0;
    let sslCommerzTransactions = 0;
    let totalBKashRevenue = 0; // Initialize total revenue for bKash
    let totalSSLCommerzRevenue = 0; // Initialize total revenue for SSLCommerz

    const calculateTotals = (orders) => {
      orders?.forEach((order) => {

        if (order?.orderStatus === "Refunded") { // Only consider Refunded orders
          const orderTotal = order.returnInfo.refundAmount || 0; // Use the total from the order

          if (order?.paymentInfo?.paymentMethod === "bKash") {
            bKashTransactions += 1;
            totalBKashRevenue += orderTotal;
          } else if (order?.paymentInfo?.paymentMethod === "SSL") {
            sslCommerzTransactions += 1;
            totalSSLCommerzRevenue += orderTotal;
          }
        }
      });
    };

    // Convert filter dates to Date objects
    const startDateObj = new Date(filterStartDate);
    const endDateObj = new Date(filterEndDate);

    // Normalize dates to start and end of the day
    const adjustedStartDate = new Date(startDateObj.setHours(0, 0, 0, 0));
    const adjustedEndDate = new Date(endDateObj.setHours(23, 59, 59, 999));

    // Filter orders within the date range
    const filteredOrders = orderList?.filter((order) => {
      const orderDate = parseDate(order?.dateTime);

      return (
        orderDate >= adjustedStartDate &&
        orderDate <= adjustedEndDate &&
        order?.orderStatus === "Refunded"
      );
    });

    calculateTotals(filteredOrders);

    return { bKashTransactions, sslCommerzTransactions, totalBKashRevenue, totalSSLCommerzRevenue };
  }, [orderList, filterStartDate, filterEndDate]);

  const paymentMethodData = useMemo(() => {
    const dailyData = {};

    const startDateObj = new Date(filterStartDate);
    const endDateObj = new Date(filterEndDate);
    const adjustedStartDate = new Date(startDateObj.setHours(0, 0, 0, 0));
    const adjustedEndDate = new Date(endDateObj.setHours(23, 59, 59, 999));

    orderList?.forEach((order) => {
      const orderDate = parseDate(order.dateTime);
      const orderDateFormatted = format(orderDate, 'yyyy-MM-dd');
      if (orderDate >= adjustedStartDate && orderDate <= adjustedEndDate && order?.orderStatus === "Refunded") {
        if (!dailyData[orderDateFormatted]) {
          dailyData[orderDateFormatted] = { bKashTransactions: 0, sslCommerzTransactions: 0 };
        }
        if (order.paymentInfo.paymentMethod === "bKash") {
          dailyData[orderDateFormatted].bKashTransactions += 1;
        } else if (order.paymentInfo.paymentMethod === "SSL") {
          dailyData[orderDateFormatted].sslCommerzTransactions += 1;
        }
      }
    });

    return Object?.keys(dailyData)?.map((date) => ({
      date,
      bKashTransactions: dailyData[date].bKashTransactions,
      sslCommerzTransactions: dailyData[date].sslCommerzTransactions,
    }));

  }, [orderList, filterStartDate, filterEndDate]);

  // Memoize filtered data to group by hour for today or yesterday
  const hourlyPaymentData = useMemo(() => {
    if (!filterStartDate || !filterEndDate || !["today", "yesterday"].includes(activeFilter)) return [];

    const startDateObj = new Date(filterStartDate);
    const endDateObj = new Date(filterEndDate);

    if (startDateObj > endDateObj) return [];  // Invalid date range

    const adjustedStartDate = new Date(startDateObj.setHours(0, 0, 0, 0)); // Start of the day
    const adjustedEndDate = new Date(endDateObj.setHours(23, 59, 59, 999)); // End of the day

    // Filter orders within the specified date range and paid status
    const filteredOrders = orderList?.filter((order) => {
      const orderDate = parseDate(order.dateTime);
      return orderDate >= adjustedStartDate &&
        orderDate <= adjustedEndDate &&
        order.orderStatus === "Refunded";
    });

    if (!filteredOrders?.length) return Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      bKashTransactions: 0,
      sslCommerzTransactions: 0,
    }));

    // Initialize hourly data
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      bKashTransactions: 0,
      sslCommerzTransactions: 0,
    }));

    // Group orders by the hour
    filteredOrders?.forEach((order) => {
      const orderDate = parseDate(order.dateTime);
      const hour = orderDate.getHours();
      if (order.paymentInfo?.paymentMethod === "bKash") {
        hourlyData[hour].bKashTransactions += 1;
      } else if (order.paymentInfo?.paymentMethod === "SSL") {
        hourlyData[hour].sslCommerzTransactions += 1;
      }
    });

    return hourlyData;
  }, [orderList, filterStartDate, filterEndDate, activeFilter]);

  const handleReset = () => {
    const today = new Date();
    setSelectedDateRange({
      start: {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
      },
      end: {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate(),
      },
    });

    setActiveFilter('today');
    setShowDateRangePicker(true);
  };

  const handleDateFilter = (filter) => {
    let start = null;
    let end = null;

    switch (filter) {
      case 'today':
        start = startOfToday();
        end = endOfToday();
        break;
      case 'yesterday':
        start = startOfYesterday();
        end = endOfYesterday();
        break;
      case 'last7days':
        start = subDays(new Date(), 6);
        end = endOfToday();
        break;
      case 'lastMonth':
        start = startOfMonth(subMonths(new Date(), 1));
        end = endOfMonth(subMonths(new Date(), 1));
        break;
      default:
        break;
    }

    setSelectedDateRange({
      start: start && { year: start.getFullYear(), month: start.getMonth() + 1, day: start.getDate() },
      end: end && { year: end.getFullYear(), month: end.getMonth() + 1, day: end.getDate() },
    });
    setActiveFilter(filter);
    setShowDateRangePicker(true);
  };

  const handleChange = (values) => {
    // Ensure at least one checkbox is always selected
    if (values.length === 0) return;
    setSelected(values);
  };

  const formatXAxis = (tickItem) => {
    // Convert date string to Date object
    const date = new Date(tickItem);
    // Format date to MM/dd
    return format(date, 'MM/dd');
  };

  const currentDate = today(getLocalTimeZone());

  const totalTransactions = bKashTransactions + sslCommerzTransactions;
  const totalRevenue = totalBKashRevenue + totalSSLCommerzRevenue;

  // Calculate the maximum value for the Y-axis
  const maxBKash = Math.max(...paymentMethodData.map(data => data.bKashTransactions), 0);
  const maxSSLCommerz = Math.max(...paymentMethodData.map(data => data.sslCommerzTransactions), 0);
  const maxHourlyBKash = Math.max(...hourlyPaymentData.map(data => data.bKashTransactions), 0);
  const maxHourlySSLCommerz = Math.max(...hourlyPaymentData.map(data => data.sslCommerzTransactions), 0);

  // Set the maximum value for the Y-axis (slightly above the highest transaction count, minimum of 20)
  const maxYValue = Math.max(Math.ceil(Math.max(maxBKash, maxSSLCommerz, maxHourlyBKash, maxHourlySSLCommerz) * 1.1)); // Ensure minimum of 20

  if (isOrderPending) {
    return <SmallHeightLoading />;
  }

  return (
    <div className="space-y-5 relative">

      <div className="flex flex-wrap mt-6 justify-center lg:justify-end items-center gap-3">

        <div className="flex items-center justify-center gap-2">

          <button
            onClick={() => handleDateFilter('today')}
            className={`px-2 py-1 text-xs md:text-sm md:py-2 md:px-4 ${activeFilter === 'today' ? 'text-[#D2016E] border rounded-full border-[#D2016E] font-semibold' : "text-neutral-500 font-semibold border border-gray-200 rounded-full"}`}
          >
            Today
          </button>
          <button
            onClick={() => handleDateFilter('yesterday')}
            className={`px-2 py-1 text-xs md:text-sm md:py-2 md:px-4 ${activeFilter === 'yesterday' ? 'text-[#D2016E] border rounded-full border-[#D2016E] font-semibold' : "text-neutral-500 font-semibold border border-gray-200 rounded-full"}`}
          >
            Yesterday
          </button>
          <button
            onClick={() => handleDateFilter('last7days')}
            className={`px-2 py-1 text-xs md:text-sm md:py-2 md:px-4 ${activeFilter === 'last7days' ? 'text-[#D2016E] border rounded-full border-[#D2016E] font-semibold' : "text-neutral-500 font-semibold border border-gray-200 rounded-full"}`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handleDateFilter('lastMonth')}
            className={`px-2 py-1 text-xs md:text-sm md:py-2 md:px-4 ${activeFilter === 'lastMonth' ? 'text-[#D2016E] border rounded-full border-[#D2016E] font-semibold' : "text-neutral-500 font-semibold border border-gray-200 rounded-full"}`}
          >
            Last Month
          </button>

        </div>

        <div className='flex items-center gap-2'>
          {showDateRangePicker && (
            <DateRangePicker
              label="Select Date Range"
              visibleMonths={2}
              maxValue={currentDate}
              onChange={(range) => {
                if (range && range.start && range.end) {
                  normalizeDateRange(range.start, range.end);
                }
              }}
              // Ensure the picker clears after reset and updates after new selection
              value={selectedDateRange.start && selectedDateRange.end
                ? [
                  new Date(selectedDateRange.start.year, selectedDateRange.start.month - 1, selectedDateRange.start.day),
                  new Date(selectedDateRange.end.year, selectedDateRange.end.month - 1, selectedDateRange.end.day)
                ]
                : null
              }
            />
          )}

          {selectedDateRange.start && selectedDateRange.end && activeFilter === 'custom' && (
            <button className="hover:text-red-500 font-bold text-white rounded-lg bg-red-600 hover:bg-white p-1" onClick={handleReset}>
              <IoMdClose className="text-lg" />
            </button>
          )}
        </div>

      </div>

      <div className='flex flex-col lg:flex-row items-center justify-center gap-6'>

        {/* Summary Section */}
        <div className='flex flex-col gap-6 items-center justify-center w-full lg:w-2/3 xl:w-3/4'>
          {/* Total Order Count and Total Amount Received */}
          <div className='flex flex-row lg:flex-col xl:flex-row items-center justify-center gap-6 w-full'>
            {/* Total Order Count */}
            <div className="w-full border rounded-lg p-4 md:p-6 lg:p-8 space-y-3">
              <p className="text-xs md:text-sm xl:text-base font-semibold">Total Refunds</p>
              <h3 className="font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl">{totalTransactions}</h3>
            </div>

            {/* Total Amount Received */}
            <div className="w-full border rounded-lg p-4 md:p-6 lg:p-8 space-y-3">
              <p className="text-xs md:text-sm xl:text-base font-semibold">Total refunded amount</p>
              <h3 className="font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl">
                ৳ {totalRevenue.toFixed(2)}
              </h3>
            </div>
          </div>

          {/* Number of bKash and SSLCommerz Payments */}
          <div className='flex flex-row lg:flex-col xl:flex-row items-center justify-center gap-6 w-full'>
            {/* bKash Payments */}
            <div className="w-full border rounded-lg p-4 md:p-6 lg:p-8 space-y-3">
              <p className="text-xs md:text-sm xl:text-base font-semibold">Total bKash Refunded Payments</p>
              <h3 className="font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl">
                {bKashTransactions} <span>|</span> ৳ {totalBKashRevenue.toFixed(2)}
              </h3>
            </div>

            {/* SSLCommerz Payments */}
            <div className="w-full border rounded-lg p-4 md:p-6 lg:p-8 space-y-3">
              <p className="text-xs md:text-sm xl:text-base font-semibold">Total SSLCommerz Refunded Payments</p>
              <h3 className="font-bold text-lg md:text-xl lg:text-2xl xl:text-3xl">
                {sslCommerzTransactions} <span>|</span> ৳ {totalSSLCommerzRevenue.toFixed(2)}
              </h3>
            </div>
          </div>
        </div>

        <div className="w-full h-[400px] flex items-center justify-center mt-2 lg:mt-6 xl:mt-2 2xl:mt-0">
          {paymentMethodData.length === 0 ? (
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium text-gray-500">No data available for the selected day.<br /> Please choose a different date or date range to see results.</p>
            </div>
          ) : (
            <div className='w-full'>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={activeFilter === 'today' || activeFilter === 'yesterday' ? hourlyPaymentData : paymentMethodData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={activeFilter === 'today' || activeFilter === 'yesterday' ? "hour" : "date"} tickFormatter={activeFilter === 'today' || activeFilter === 'yesterday' ? "" : formatXAxis} /> {/* X-axis labels based on date */}
                  <YAxis domain={[0, maxYValue]} />
                  <Tooltip />

                  {/* Bar for bKash transactions */}
                  {selected.includes('bKash') && (
                    <Bar dataKey="bKashTransactions" name="bKash Transactions" fill="#D2016E" radius={[8, 8, 0, 0]} />
                  )}

                  {/* Bar for SSLCommerz transactions */}
                  {selected.includes('SSLCommerz') && (
                    <Bar dataKey="sslCommerzTransactions" name="SSLCommerz Transactions" fill="#3480A3" radius={[8, 8, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
              <div className="flex md:gap-4 justify-center">
                <CheckboxGroup
                  value={selected}
                  onChange={handleChange}
                  orientation="horizontal"
                >
                  <Checkbox color="danger" value="bKash">
                    <span className='text-sm xl:text-base text-[#F53B7B]'>bKash Transactions</span>
                  </Checkbox>
                  <Checkbox color="primary" value="SSLCommerz">
                    <span className='text-sm xl:text-base text-[#3480A3]'>SSLCommerz Transactions</span>
                  </Checkbox>
                </CheckboxGroup>
              </div>
            </div>
          )}
        </div>

      </div>

    </div >
  );
};

export default RefundedPayments;