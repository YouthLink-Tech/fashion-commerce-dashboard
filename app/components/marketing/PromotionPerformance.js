import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import useOrders from '@/app/hooks/useOrders';
import SmallHeightLoading from '../shared/Loading/SmallHeightLoading';
import { format, startOfToday, endOfToday, startOfYesterday, endOfYesterday, subDays, subMonths, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { Checkbox, CheckboxGroup, DateRangePicker } from '@nextui-org/react';
import { IoMdClose } from 'react-icons/io';
import { today, getLocalTimeZone } from "@internationalized/date";

const PromotionPerformanceChart = () => {
  const [orderList, isOrderPending] = useOrders();
  const [selectedDateRange, setSelectedDateRange] = useState({ start: null, end: null });
  const [activeFilter, setActiveFilter] = useState('today');
  const [showDateRangePicker, setShowDateRangePicker] = useState(true); // New state
  const [selected, setSelected] = useState(['totalDiscountedAmount', 'totalDiscountedOrders']);

  const handleChange = (values) => {
    // Ensure at least one checkbox is always selected
    if (values.length === 0) return;
    setSelected(values);
  };

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

  const { totalPromoAndOfferApplied, totalDiscount } = useMemo(() => {
    let totalPromoAndOfferApplied = 0;
    let totalDiscount = 0;

    // Filter orders based on payment status and date range if applicable
    const filteredOrders = orderList?.filter((order) => {
      if (!filterStartDate || !filterEndDate) {
        return false; // No filter applied
      }

      const startDateObj = new Date(filterStartDate);
      const endDateObj = new Date(filterEndDate);
      const adjustedStartDate = new Date(startDateObj.setHours(0, 0, 0, 0)); // Start of day
      const adjustedEndDate = new Date(endDateObj.setHours(23, 59, 59, 999)); // End of day
      const orderDate = parseDate(order.dateTime);

      return (
        orderDate >= adjustedStartDate &&
        orderDate <= adjustedEndDate &&
        order.paymentInfo.paymentStatus === "Paid"
      );
    });

    filteredOrders?.forEach((order) => {
      const { promoInfo, totalSpecialOfferDiscount } = order;

      // Check if promoInfo exists or totalSpecialOfferDiscount > 0
      if (promoInfo || totalSpecialOfferDiscount > 0) {
        totalPromoAndOfferApplied += 1; // Count this order as having promo/offer applied
      }

      // Calculate total discount from promoInfo and special offer discount
      const promoDiscount = promoInfo?.appliedPromoDiscount
        ? parseFloat(promoInfo.appliedPromoDiscount)
        : 0;
      const offerDiscount = totalSpecialOfferDiscount || 0;

      totalDiscount += promoDiscount + offerDiscount;
    });

    return { totalPromoAndOfferApplied, totalDiscount };
  }, [orderList, filterStartDate, filterEndDate]);

  const hourlyPromotionData = useMemo(() => {
    if (!filterStartDate || !filterEndDate) return [];

    const isTodayOrYesterday = activeFilter === "today" || activeFilter === "yesterday";
    if (!isTodayOrYesterday) return [];

    // Normalize the start and end date to include the full day range
    const startDateObj = new Date(filterStartDate);
    const endDateObj = new Date(filterEndDate);
    const adjustedStartDate = new Date(startDateObj.setHours(0, 0, 0, 0));
    const adjustedEndDate = new Date(endDateObj.setHours(23, 59, 59, 999));

    // Initialize an array to hold hourly data
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      discountedAmount: 0,
      discountedOrders: 0,
    }));

    // Filter and process each order
    orderList?.forEach((order) => {
      if (order?.paymentInfo?.paymentStatus !== "Paid") return;

      const orderDate = parseDate(order?.dateTime);

      // Check if the order is within the specified date range
      if (orderDate >= adjustedStartDate && orderDate <= adjustedEndDate) {
        const hour = orderDate.getHours();

        // Calculate total discounts
        const promoDiscount = order.promoInfo?.appliedPromoDiscount
          ? parseFloat(order.promoInfo.appliedPromoDiscount)
          : 0;
        const offerDiscount = order.totalSpecialOfferDiscount || 0;

        const totalOrderDiscount = promoDiscount + offerDiscount;

        // Check if any discount was applied
        const hasPromoApplied = !!order.promoInfo;
        const hasOfferApplied = offerDiscount > 0;

        // Update the hourly data
        hourlyData[hour].discountedAmount += totalOrderDiscount;

        // Increment discountedOrders for each type of discount applied
        if (hasPromoApplied || hasOfferApplied) {
          hourlyData[hour].discountedOrders += 1;
        }
      }
    });

    return hourlyData;
  }, [orderList, filterStartDate, filterEndDate, activeFilter]);

  const dailyData = useMemo(() => {
    // Initialize an object to hold daily data
    const dailyData = {};

    // Determine whether to filter by date based on activeFilter
    let filteredOrders;
    // Apply date filtering if activeFilter is not "all"
    if (!filterStartDate || !filterEndDate) return []; // Return empty if filters are not set

    const startDateObj = new Date(filterStartDate);
    const endDateObj = new Date(filterEndDate);

    startDateObj.setHours(0, 0, 0, 0);
    endDateObj.setHours(23, 59, 59, 999); // Set to end of the day

    filteredOrders = orderList?.filter((order) => {
      const orderDate = parseDate(order.dateTime);
      return (
        orderDate >= startDateObj &&
        orderDate <= endDateObj &&
        order.paymentInfo.paymentStatus === "Paid"
      );
    });

    // Process each filtered order
    filteredOrders?.forEach((order) => {
      const orderDate = parseDate(order.dateTime);
      const orderDateFormatted = format(orderDate, "yyyy-MM-dd");

      // Extract discounts from order data
      const promoDiscount = order.promoInfo?.appliedPromoDiscount
        ? parseFloat(order.promoInfo.appliedPromoDiscount)
        : 0;
      const offerDiscount = order.totalSpecialOfferDiscount || 0;

      const totalDiscount = promoDiscount + offerDiscount;

      const hasPromoApplied = !!order.promoInfo;
      const hasOfferApplied = offerDiscount > 0;

      // Initialize dailyData for the specific date if it doesn't exist
      if (!dailyData[orderDateFormatted]) {
        dailyData[orderDateFormatted] = {
          discountedAmount: 0,
          discountedOrders: 0,
          offerCount: 0,
          promoCount: 0,
        };
      }

      // Update the daily data with the calculated discounts
      dailyData[orderDateFormatted].discountedAmount += totalDiscount;

      // Increment discountedOrders for each type of discount applied
      if (hasOfferApplied) {
        dailyData[orderDateFormatted].discountedOrders += 1; // Count this order as discounted
        dailyData[orderDateFormatted].offerCount += 1; // Count individual offer application
      }
      if (hasPromoApplied) {
        dailyData[orderDateFormatted].discountedOrders += 1; // Count this order as discounted
        dailyData[orderDateFormatted].promoCount += 1; // Count individual promo application
      }
    });

    // Create a final array for bar chart
    return Object.keys(dailyData).map((date) => ({
      date,
      discountedAmount: dailyData[date].discountedAmount.toFixed(2),
      discountedOrders: dailyData[date].discountedOrders,
      totalPromoAndOfferApplied: dailyData[date].offerCount + dailyData[date].promoCount, // Total applied count
    }));
  }, [orderList, filterStartDate, filterEndDate]);

  const handleReset = () => {
    // Set date range to today
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

    // Set active filter to 'today'
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
        const previousMonthStart = new Date(startOfMonth(subMonths(new Date(), 1)));
        previousMonthStart.setHours(0, 0, 0, 0); // Set time to 00:00:00
        const previousMonthEnd = new Date(endOfMonth(subMonths(new Date(), 1)));
        previousMonthEnd.setHours(23, 59, 59, 999); // Set time to 23:59:59
        start = new Date(startOfMonth(subMonths(new Date(), 1)));
        end = new Date(endOfMonth(subMonths(new Date(), 1)));
        break;
      default:
        break;
    }

    setSelectedDateRange({
      start: start && { year: start.getFullYear(), month: start.getMonth() + 1, day: start.getDate() },
      end: end && { year: end.getFullYear(), month: end.getMonth() + 1, day: end.getDate() },
    });
    setActiveFilter(filter); // Set active filter
    setShowDateRangePicker(true);
  };

  const formatXAxis = (tickItem) => {
    // Convert date string to Date object
    const date = new Date(tickItem);
    // Format date to MM/dd
    return format(date, 'MM/dd');
  };

  const currentDate = today(getLocalTimeZone());

  const maxDiscountedAmount = useMemo(() => {
    return Math.floor(Math.max(...hourlyPromotionData?.map(data => data?.discountedAmount), 0));
  }, [hourlyPromotionData]);

  const maxDiscountedAmountDay = useMemo(() => {
    return Math.floor(Math.max(...dailyData?.map(data => data?.discountedAmount), 0));
  }, [dailyData]);

  const maxDiscountedOrder = useMemo(() => {
    return Math.floor(Math.max(...hourlyPromotionData?.map(data => data?.discountedOrders), 0));
  }, [hourlyPromotionData])

  const maxDiscountedOrderDay = useMemo(() => {
    return Math.floor(Math.max(...dailyData?.map(data => data?.discountedOrders), 0));
  }, [dailyData])

  const yAxisDomain = [0, maxDiscountedAmount * 1.2];
  const yAxisDomainDay = [0, maxDiscountedAmountDay * 1.2];
  const yAxisDomainOrder = [0, maxDiscountedOrder * 10];
  const yAxisDomainOrderDay = [0, maxDiscountedOrderDay * 10];

  // if (isOrderPending || isUserLoading) {
  //   return <SmallHeightLoading />;
  // };

  if (isOrderPending) {
    return <SmallHeightLoading />;
  };

  return (
    <div className="space-y-5">

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

      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">

        {/* Summary Section */}
        <div className='flex lg:flex-col xl:flex-row items-center justify-center gap-6 w-1/3 xl:w-3/4 lg:min-h-[150px] lg:max-h-[150px]'>
          <div className="border rounded-lg p-4 md:p-8 space-y-3">
            <p className="text-[10px] md:text-sm xl:text-base font-semibold">Discounted orders</p>
            <h3 className="font-bold md:text-xl lg:text-2xl xl:text-3xl">{totalPromoAndOfferApplied}</h3>
          </div>
          <div className="border rounded-lg p-4 md:p-8 space-y-3">
            <p className="text-[10px] md:text-sm xl:text-base font-semibold">Discounted amount</p>
            <h3 className="font-bold md:text-xl lg:text-2xl xl:text-3xl flex items-center gap-0 md:gap-1">
              <span>৳</span> {totalDiscount.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="w-full h-[400px] flex items-center justify-center mt-2 lg:mt-6 xl:mt-2 2xl:mt-0">

          {dailyData.length === 0 ? (

            <div className="text-center text-gray-500">
              <p className="text-lg font-medium text-gray-500">No data available for the selected day.<br /> Please choose a different date or date range to see results.</p>
            </div>

          ) : (

            <div className='w-full'>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={activeFilter === 'today' || activeFilter === 'yesterday' ? hourlyPromotionData : dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={activeFilter === 'today' || activeFilter === 'yesterday' ? "hour" : "date"} tickFormatter={activeFilter === 'today' || activeFilter === 'yesterday' ? "" : formatXAxis} />

                  <YAxis
                    yAxisId="left"
                    domain={activeFilter === 'today' || activeFilter === 'yesterday' ? yAxisDomain : yAxisDomainDay}
                    tickFormatter={(value) => `${value}`} // Formatting for readability
                  />

                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={activeFilter === 'today' || activeFilter === 'yesterday' ? yAxisDomainOrder : yAxisDomainOrderDay}
                    tickFormatter={(value) => `${value}`}
                  />

                  <Tooltip />
                  {selected.includes('totalDiscountedAmount') && (
                    <Bar dataKey="discountedAmount" yAxisId="left" radius={[8, 8, 0, 0]} fill="#D2016E" name="Total Discounted Amount (৳)" />
                  )}
                  {selected.includes('totalDiscountedOrders') && (
                    <Bar yAxisId="right" dataKey="discountedOrders" radius={[8, 8, 0, 0]} fill="#3480A3" name="Total Discounted Orders" />
                  )}
                </BarChart>
              </ResponsiveContainer>
              <div className="flex md:gap-4 justify-center">
                <CheckboxGroup
                  value={selected}
                  onChange={handleChange}
                  orientation="horizontal"
                >
                  <Checkbox color="danger" value="totalDiscountedAmount"><span className='text-sm xl:text-base text-[#F53B7B]'>Total Discounted Amount (৳)</span></Checkbox>
                  <Checkbox color="primary" value="totalDiscountedOrders"><span className='text-sm xl:text-base text-[#3480A3]'>Total Discounted Orders</span></Checkbox>
                </CheckboxGroup>
              </div>
            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default PromotionPerformanceChart;