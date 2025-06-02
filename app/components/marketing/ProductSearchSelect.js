import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HiCheckCircle } from "react-icons/hi2";

const ProductSearchSelect = ({
  productList,
  onSelectionChange,
  selectedProductIds
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Filter products based on search input and remove already selected products
  const filteredProducts = productList?.filter((product) => product?.status === "active" &&
    (product?.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.productTitle.toLowerCase().includes(searchTerm.toLowerCase())))
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)); // Sorting latest → oldest;

  // Handle adding/removing product selection
  const toggleProductSelection = (productId) => {
    let updatedSelectedProducts;
    if (selectedProductIds.includes(productId)) {
      // Remove product from selection
      updatedSelectedProducts = selectedProductIds.filter(
        (id) => id !== productId,
      );
    } else {
      // Add product to selection
      updatedSelectedProducts = [...selectedProductIds, productId];
    }

    onSelectionChange(updatedSelectedProducts); // Pass selected products to parent component
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="mx-auto w-full" ref={dropdownRef}>
      {/* Search Box */}
      <input
        type="text"
        value={isDropdownOpen ? searchTerm : selectedProductIds.join(", ")} // Show selected IDs when closed
        onChange={(e) => setSearchTerm(e.target.value)}
        onClick={() => setIsDropdownOpen(true)} // Toggle dropdown on input click
        placeholder="Search & Select by Product ID's"
        className="mb-2 w-full rounded-md border border-gray-300 p-2 outline-none transition-colors duration-1000 focus:border-[#9F5216] overflow-hidden text-ellipsis whitespace-nowrap"
      />

      {/* Dropdown list for search results */}
      {isDropdownOpen && (
        <div className="max-h-64 flex flex-col gap-1.5 overflow-y-auto rounded-lg border p-2">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product._id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border p-1 transition-[border-color,background-color] duration-300 ease-in-out hover:border-[#d7ecd2] hover:bg-[#fafff9] ${selectedProductIds.includes(product.productId)
                  ? "border-[#d7ecd2] bg-[#fafff9]"
                  : "border-neutral-100"
                  }`}
                onClick={() => toggleProductSelection(product.productId)}
              >
                <div className="flex items-center justify-between w-full gap-1">
                  <div className="flex items-center">
                    <Image
                      width={4000}
                      height={4000}
                      src={product?.thumbnailImageUrl}
                      alt={product?.productId}
                      className="h-12 w-12 rounded object-contain"
                    />
                    <div className="flex flex-col">
                      <span className="ml-2 font-bold">{product?.productId}</span>
                      <span className="ml-2 text-sm">
                        {product?.productTitle}
                      </span>
                    </div>
                  </div>
                  <div>
                    <HiCheckCircle
                      className={`pointer-events-none size-7 text-[#60d251] transition-opacity duration-300 ease-in-out ${selectedProductIds.includes(product.productId) ? "opacity-100" : "opacity-0"}`}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No products found</p>
          )}
        </div>
      )}

    </div>
  );
};

export default ProductSearchSelect;
