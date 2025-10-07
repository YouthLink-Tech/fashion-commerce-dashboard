import React from 'react';
import { motion } from "framer-motion";

const SummaryCards = ({ cardsData }) => {

  const summaryCards = [
    {
      label: "Total Orders",
      value: cardsData?.totalOrders,
      color: "from-green-400 to-emerald-600",
      textColor: "text-green-600",
      icon: "📦",
    },
    {
      label: "Total Revenue",
      value: `৳${cardsData?.totalRevenue?.toLocaleString()}`,
      color: "from-blue-400 to-sky-600",
      textColor: "text-sky-600",
      icon: "💰",
    },
    {
      label: "Total Refunded",
      value: `৳${cardsData?.totalRefund?.toLocaleString()}`,
      color: "from-pink-400 to-fuchsia-600",
      textColor: "text-pink-600",
      icon: "↩️",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-6 w-full xl:w-[320px] h-fit">
      {summaryCards.map((card, idx) => (
        <motion.div
          key={idx}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-full bg-white border border-gray-200 drop-shadow-sm rounded-2xl p-6 cursor-pointer transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-semibold">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{card.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${card.color} flex items-center justify-center text-xl`}>
              {card.icon}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SummaryCards;