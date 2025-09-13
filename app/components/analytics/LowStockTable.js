import React, { useState } from 'react';
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';
import { PiArrowBendDownRightBold } from "react-icons/pi";

const LowStockTable = ({ analyticsLowStock }) => {

  const [expanded, setExpanded] = useState({});

  const toggleExpand = (productId) => {
    setExpanded((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  return (
    <div className="overflow-y-auto">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-[1] bg-white">
          <tr>
            <th className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b">
              Product
            </th>
            <th className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">
              Color
            </th>
            <th className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-center">
              Size
            </th>
            <th className="text-[10px] md:text-xs p-2 xl:p-3 text-gray-700 border-b text-end">
              Stock
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {analyticsLowStock?.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="text-center p-4 text-gray-500 py-36 md:py-44 xl:py-52 2xl:py-[310px]"
              >
                No low stock products found.
              </td>
            </tr>
          ) : (
            analyticsLowStock?.map((product, index) => {

              const colors = [
                ...new Set(product.lowVariants.map((v) => v.color)),
              ];
              const sizes = [
                ...new Set(product.lowVariants.map((v) => v.size)),
              ];
              const totalSku = product.lowVariants.reduce(
                (acc, v) => acc + v.sku,
                0
              );

              return (
                <React.Fragment key={product?.productId || index}>
                  {/* Parent row */}
                  <tr
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(product.productId)}
                  >
                    <td className="text-xs p-3 text-neutral-800 flex items-center gap-2">
                      <p className="text-xs font-bold text-blue-700 text-start">
                        {product?.productTitle}
                      </p>
                      {expanded[product.productId] ? (
                        <BiChevronUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <BiChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </td>
                    <td className="text-xs p-3 text-neutral-800 text-center">
                      {colors.length}
                    </td>
                    <td className="text-xs p-3 text-neutral-800 text-center">
                      {sizes.length}
                    </td>
                    <td className="text-xs p-3 text-neutral-800 text-end">
                      {totalSku}
                    </td>
                  </tr>

                  {/* Variant rows directly under parent */}
                  {expanded[product.productId] &&
                    product.lowVariants.map((variant, i) => (
                      <tr key={i} className="bg-gray-50">
                        <td className="p-3 text-gray-500">
                          <PiArrowBendDownRightBold size={20} />
                        </td>
                        <td className="p-3 text-xs text-center">
                          {variant.color}
                        </td>
                        <td className="p-3 text-xs text-center">
                          {variant.size}
                        </td>
                        <td className="p-3 text-xs text-end">{variant.sku}</td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LowStockTable;