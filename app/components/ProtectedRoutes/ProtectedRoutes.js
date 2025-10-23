// Define permission-based routes
export const protectedRoutes = {
  "/dashboard": "Dashboard",
  "/orders": "Orders",
  "/product-hub": "Product Hub",
  "/supply-chain": "Supply Chain",
  "/customers": "Customers",
  "/finances": "Finances",
  "/analytics": "Analytics",
  "/marketing": "Marketing",
  "/settings": "Settings",
};

// 🔹 Object for "Add" Pages
export const protectedAddRoutes = {
  "/product-hub/products/add-product": "Product Hub Add",
  "/product-hub/products/add-product-2": "Product Hub Add",
  "/product-hub/products/add-product-3": "Product Hub Add",
  "/product-hub/purchase-orders/create-purchase-order": "Purchase Order Add",
  "/product-hub/transfers/create-transfer": "Transfer Add",
  "/product-hub/categories/add-category": "Category Add",
  "/product-hub/seasons/add-season": "Season Add",
  "/product-hub/colors/add-color": "Color Add",
  "/product-hub/vendors/add-vendor": "Vendor Add",
  "/product-hub/tags/add-tag": "Tag Add",
  "/finances/payment-methods/add-payment-method": "Payment Method Add",
  "/marketing/promo/add-promo": "Promo Add",
  "/marketing/offer/add-offer": "Offer Add",
  "/supply-chain/zone/add-shipping-zone": "Shipment Add",
  "/supply-chain/zone/add-shipment-handler": "Shipment Handler Add",
  "/supply-chain/locations/add-location": "Location Add",
};

// Function to check if a path matches any edit routes (handles dynamic IDs)
export const isEditRoute = (pathname) => {
  const editPatterns = [
    /^\/product-hub\/products\/[a-zA-Z0-9]+$/,
    /^\/product-hub\/purchase-orders\/receive-inventory\/[a-zA-Z0-9]+$/,
    /^\/product-hub\/transfers\/receive-transfer\/[a-zA-Z0-9]+$/,
    /^\/product-hub\/categories\/[a-zA-Z0-9]+$/,
    /^\/product-hub\/seasons\/[a-zA-Z0-9]+$/,
    /^\/product-hub\/vendors\/[a-zA-Z0-9]+$/,
    /^\/finances\/payment-methods\/[a-zA-Z0-9]+$/,
    /^\/marketing\/promo\/[a-zA-Z0-9]+$/,
    /^\/marketing\/offer\/[a-zA-Z0-9]+$/,
    /^\/supply-chain\/zone\/[a-zA-Z0-9]+$/,
    /^\/supply-chain\/zone\/add-shipment-handler\/[a-zA-Z0-9]+$/,
    /^\/supply-chain\/locations\/[a-zA-Z0-9]+$/,
  ];

  return editPatterns.some((pattern) => pattern.test(pathname));
};

export function getModuleNameFromPath(path) {
  const sorted = Object.keys(protectedRoutes).sort((a, b) => b.length - a.length);
  const match = sorted.find((route) => path.startsWith(route));
  return protectedRoutes[match] || "Unknown";
}
