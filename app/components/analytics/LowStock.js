"use client";
import React from 'react';
import useAnalyticsLowStock from '@/app/hooks/useAnalyticsLowStock';
import AnalyticsTable from '../shared/Loading/AnalyticsTable';
import { TbAlertTriangle } from "react-icons/tb";
// import Image from 'next/image';

const LowStock = () => {

  const [analyticsLowStock, isAnalyticsLowStockPending] = useAnalyticsLowStock();

  if (isAnalyticsLowStockPending) return <AnalyticsTable />;

  return (
    <div className="p-8 bg-white rounded-lg drop-shadow overflow-x-auto">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold flex items-center gap-3"><TbAlertTriangle className='text-red-600' /> Stock Alerts</h2>
      <p className='pt-2 text-start font-semibold text-sm text-neutral-500 mb-4'>Products requiring immediate attention</p>
      <div className='h-[450px] overflow-y-auto'>
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-[1] bg-white">
            <tr>
              <th key="product" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b">Product</th>
              <th key="color" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b tex-center">Color</th>
              <th key="size" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b tex-center">Size</th>
              <th key="stock" className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-end">Stock</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {analyticsLowStock?.length === 0 ? (
              <tr>
                <td colSpan={analyticsLowStock.length} className="text-center p-4 text-gray-500 py-36 md:py-44 xl:py-52 2xl:py-[310px]">
                  No low stock products founded.
                </td>
              </tr>
            ) : (
              analyticsLowStock?.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <React.Fragment key={`${product?.productId || index}`}>
                    <td key="product" className={`text-xs p-3 text-neutral-800 flex items-center gap-2`}>
                      {/* <Image
                        className="h-8 w-8 md:h-12 md:w-12 object-contain bg-white rounded-lg border py-0.5"
                        src={product?.productThumbnail}
                        alt={product?.productTitle}
                        height={1200}
                        width={1200}
                      /> */}
                      <p className="text-xs font-bold text-blue-700 text-start">{product?.productTitle}</p>
                    </td>
                    <td key="color" className={`text-xs p-3 text-neutral-800 text-center `}>
                      <p className='flex items-center gap-1'>
                        {/* <span
                          style={{
                            display: 'inline-block',
                            width: '20px',
                            height: '20px',
                            backgroundColor: product?.color?.color || '#fff',
                            marginRight: '8px',
                            borderRadius: '4px'
                          }}
                        /> */}
                        <span>
                          {product?.color}
                        </span>
                      </p>
                    </td>
                    <td key="size" className={`text-xs p-3 text-neutral-800 text-center`}>
                      {product?.size}
                    </td>
                    <td key="stock" className={`text-xs p-3 text-neutral-800 text-end`}>
                      {product?.sku}
                    </td>
                  </React.Fragment>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LowStock;