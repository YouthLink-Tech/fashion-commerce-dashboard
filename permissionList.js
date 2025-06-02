export const permissionsList = {
  Viewer: {
    "Dashboard": { "access": false },
    "Orders": {
      "access": false,
      "actions": [
        "New Orders",
        "Active Orders",
        "Completed Orders",
        "Returns & Refunds",
        "View Order Details",
      ]
    },
    "Product Hub": {
      "access": false,
      "actions": [
        "Manage Products",
        "Inventory",
        "Purchase Orders",
        "Transfers",
        "Product Settings",
      ]
    },
    "Customers": {
      "access": false,
      "actions": [
        "Customer Details",
        "Customer Order History"
      ]
    },
    "Finances": {
      "access": false,
      "actions": [
        "Completed Date range filtering",
        "Refunded Date range filtering",
        "Payment methods"
      ]
    },
    "Analytics": { "access": false },
    "Marketing": {
      "access": false,
      "actions": [
        "View Performance",
        "Reward Level",
        "Marketing Content",
        "Homepage Content",
        "Discounted Date range filtering"
      ]
    },
    "Supply Chain": {
      "access": false,
      "actions": [
        "Shipment",
        "Location",
      ]
    },
  },
  Editor: {
    "Dashboard": { "access": false },
    "Orders": {
      "access": false,
      "actions": [
        "New Orders",
        "Active Orders",
        "Completed Orders",
        "Returns & Refunds",
        "View Order Details",
        "Confirm Order",
        "Shipped Order",
        "On Hold Order",
        "Delivered Order",
        "Return Approve Order",
        "Return Decline Order",
        "Return Order",
        "Refund Order",
      ]
    },
    "Product Hub": {
      "access": false,
      "actions": [
        "Manage Products",
        "Inventory",
        "Purchase Orders",
        "Transfers",
        "Product Settings",
      ]
    },
    "Customers": {
      "access": false,
      "actions": [
        "Customer Details",
        "Customer Order History"
      ]
    },
    "Finances": {
      "access": false,
      "actions": [
        "Completed Date range filtering",
        "Refunded Date range filtering",
        "Payment methods"
      ]
    },
    "Analytics": { "access": false },
    "Marketing": {
      "access": false,
      "actions": [
        "Create Promo",
        "Edit Promo",
        "Promo Toggle",
        "Create Offer",
        "Edit Offer",
        "Offer Toggle",
        "Reward Level",
        "Marketing Content",
        "Homepage Content",
        "Discounted Date range filtering"
      ]
    },
    "Supply Chain": {
      "access": false,
      "actions": [
        "Shipment",
        "Location",
      ]
    },
  },
  Owner: {
    "Dashboard": { "access": false },
    "Orders": {
      "access": false,
      "actions": [
        "New Orders",
        "Active Orders",
        "Completed Orders",
        "Returns & Refunds",
        "View Order Details",
        "Confirm Order",
        "Shipped Order",
        "On Hold Order",
        "Delivered Order",
        "Return Approve Order",
        "Return Decline Order",
        "Return Order",
        "Refund Order",
        "Revert Order"
      ]
    },
    "Product Hub": {
      "access": false,
      "actions": [
        "Manage Products",
        "Inventory",
        "Purchase Orders",
        "Transfers",
        "Product Settings",
      ]
    },
    "Customers": {
      "access": false,
      "actions": [
        "Customer Details",
        "Customer Order History"
      ]
    },
    "Finances": {
      "access": false,
      "actions": [
        "Completed Date range filtering",
        "Refunded Date range filtering",
        "Payment methods"
      ]
    },
    "Analytics": { "access": false },
    "Marketing": {
      "access": false,
      "actions": [
        "Create Promo",
        "Edit Promo",
        "Delete Promo",
        "Promo Toggle",
        "Create Offer",
        "Edit Offer",
        "Delete Offer",
        "Offer Toggle",
        "Reward Level",
        "Marketing Content",
        "Homepage Content",
        "Discounted Date range filtering"
      ]
    },
    "Supply Chain": {
      "access": false,
      "actions": [
        "Shipment",
        "Location",
      ]
    },
    "Settings": { "access": false }
  },
};