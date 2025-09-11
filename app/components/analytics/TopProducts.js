"use client";
import React from 'react';
import useTopProducts from '@/app/hooks/useTopProducts';
import { HiOutlineArrowTrendingUp } from "react-icons/hi2";
import AnalyticsTable from '../shared/Loading/AnalyticsTable';

const TopProducts = () => {

  const [topProducts, isTopProductsPending] = useTopProducts();

  if (isTopProductsPending) return <AnalyticsTable />;

  return (
    <div className="p-8 bg-white rounded-lg drop-shadow overflow-x-auto">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold flex items-center gap-3"><HiOutlineArrowTrendingUp className='text-green-600' /> Most Sold Products</h2>
      <p className='pt-2 text-start font-semibold text-sm text-neutral-500 mb-4'>Top performing products</p>
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-[1] bg-white">
          <tr>
            <th key="product" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b">Product</th>
            <th key="revenue" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">Revenue</th>
            <th key="profit" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">Profit</th>
            <th key="marginPercent" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-end">Margin</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {topProducts?.length === 0 ? (
            <tr>
              <td colSpan={topProducts.length} className="text-center p-4 text-gray-500 py-36 md:py-44 xl:py-52 2xl:py-[310px]">
                No top products founded.
              </td>
            </tr>
          ) : (
            topProducts?.map((product, index) => (
              <tr key={product?._id || index} className="hover:bg-gray-50 transition-colors">
                <React.Fragment key={`${product?.productId || index}`}>
                  <td key="product" className={`text-xs font-bold text-blue-700 text-start`}>
                    {product?.productName}
                  </td>
                  <td key="revenue" className={`text-xs p-3 text-neutral-800 text-center`}>
                    ৳ {product?.revenue}
                  </td>
                  <td key="profit" className={`text-xs p-3 text-neutral-800 text-center`}>
                    ৳ {product?.profit}
                  </td>
                  <td key="marginPercent" className={`text-xs p-3 text-neutral-800 text-end`}>
                    {product?.marginPercent} %
                  </td>
                </React.Fragment>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TopProducts;