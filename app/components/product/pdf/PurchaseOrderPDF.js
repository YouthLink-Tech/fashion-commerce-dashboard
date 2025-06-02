import React, { useMemo } from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 60,
    paddingVertical: 40
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: "center"
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  statusBadge: (status) => ({
    padding: 5,
    fontSize: 16,
    borderRadius: 10,
    // Dynamic colors (matching Tailwind classes)
    color:
      status === "pending"
        ? "#b58900" // text-yellow-600
        : status === "ordered"
          ? "#1d4ed8" // text-blue-600
          : status === "received"
            ? "#166534" // text-green-600
            : status === "canceled"
              ? "#b91c1c" // text-red-600
              : "#4b5563", // text-gray-600

    backgroundColor:
      status === "pending"
        ? "#fef3c7" // bg-yellow-100
        : status === "ordered"
          ? "#dbeafe" // bg-blue-100
          : status === "received"
            ? "#d1fae5" // bg-green-100
            : status === "canceled"
              ? "#fee2e2" // bg-red-100
              : "#f3f4f6", // bg-gray-100
  }),
  originDestination: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20
  },
  originDestinationDiv: {
    flexDirection: 'column',
    flex: 1
  },
  section: {
    marginBottom: 20
  },
  subHeading: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold'
  },
  tableSubHeading: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 12,
    color: '#333'
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    display: 'table-row',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
  },
  tableHeaderRow: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1, // Ensures even distribution of columns
    textAlign: 'center',
    padding: 5,
    fontSize: 10,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  imageContainer: {
    display: 'flex',
    flexDirection: 'row', // Adjusted for stacking elements vertically
    alignItems: 'center',
    gap: 10, // Similar to Tailwind's gap-x/y utilities
    padding: 5,
    textAlign: 'center',
  },
  imageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: 30
  },
  textBold: {
    fontWeight: 700, // Bold font
    color: '#1D4ED8', // Tailwind's text-blue-700
    fontSize: 10, // Adjust text size
    textAlign: 'left',
    marginBottom: 5
  },
  textMedium: {
    fontWeight: 500,
    fontSize: 10,
    textAlign: 'left',
    marginBottom: 5
  },
  textRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5, // Tailwind's gap-2
    fontSize: 10,
    marginBottom: 5
  },
  image: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
  footerDiv: {
    flexDirection: 'row',
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  shipmentDetails: {
    flex: 1
  },
  additionalDetails: {
    flex: 1
  },
  totalAcceptRejectDiv: {
    display: "flex",
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  costSummaryDiv: {
    display: "flex",
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5
  },
  costAdjustmentSubHeading: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 5,
    fontWeight: 'bold'
  },
  borderOfTotal: {
    borderTop: 2,
  }
});

const PurchaseOrderPDF = ({ data }) => {

  // Assuming purchaseOrderVariants is your array of variants
  const calculateTotals = () => {
    return data?.purchaseOrderVariants.reduce(
      (acc, variant) => {
        const quantity = parseFloat(variant.quantity) || 0; // Default to 0 if undefined or NaN
        const cost = parseFloat(variant.cost) || 0; // Default to 0 if undefined or NaN
        const taxPercentage = parseFloat(variant.tax) || 0; // Default to 0 if undefined or NaN

        // Calculate subtotal for this variant
        const subtotal = quantity * cost; // Subtotal: cost based on quantity
        const taxAmount = (subtotal * taxPercentage) / 100; // Calculate tax based on percentage

        // Update totals
        acc.totalQuantity += quantity; // Sum of quantities
        acc.totalSubtotal += subtotal; // Total subtotal of all variants
        acc.totalTax += taxAmount; // Sum of tax amounts

        return acc; // Return the accumulator for the next iteration
      },
      {
        totalQuantity: 0, // Initialize total quantity
        totalSubtotal: 0, // Initialize total subtotal (costs before tax)
        totalTax: 0, // Initialize total tax
      }
    );
  };
  const totals = calculateTotals();
  // Access totals
  const { totalQuantity, totalSubtotal, totalTax } = totals;

  // Calculate total price including tax
  const totalPrice = totalSubtotal + totalTax;
  const total = totalPrice + data?.shipping - data?.discount;

  const totalAcceptRejectValues = useMemo(() =>
    data?.purchaseOrderVariants?.reduce(
      ({ totalQuantity, totalAccept, totalReject }, { quantity = 0, accept = 0, reject = 0 }) => ({
        totalQuantity: totalQuantity + quantity,
        totalAccept: totalAccept + accept,
        totalReject: totalReject + reject,
      }),
      { totalQuantity: 0, totalAccept: 0, totalReject: 0 }
    ),
    [data?.purchaseOrderVariants]
  );

  return (
    <Document>
      <Page size="A4" style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>#{data?.purchaseOrderNumber}</Text>
          <Text style={styles.statusBadge(data?.purchaseOrderStatus)}>{data?.purchaseOrderStatus === "pending" ? "Pending"
            : data?.purchaseOrderStatus === "received" ? "Received"
              : data?.purchaseOrderStatus === "canceled" ? "Canceled"
                : data?.purchaseOrderStatus === "ordered" ? "Ordered"
                  : "Unknown"}</Text>
        </View>

        {/* Supplier and Destination */}
        <View style={styles.originDestination}>
          <View style={styles.originDestinationDiv}>
            <Text style={styles.subHeading}>Supplier</Text>
            <Text style={styles.text}>
              {data?.selectedVendor?.value}
            </Text>
            <Text style={styles.text}>{data?.selectedVendor?.vendorAddress}</Text>
          </View>

          <View style={styles.originDestinationDiv}>
            <Text style={styles.subHeading}>Destination</Text>
            <Text style={styles.text}>
              {data?.selectedLocation?.locationName}
            </Text>
            <Text style={styles.text}>
              {data?.selectedLocation?.locationAddress}, {data?.selectedLocation?.cityName}, {data?.selectedLocation?.postalCode}
            </Text>
          </View>
        </View>

        <View style={styles.originDestination}>
          <View style={styles.originDestinationDiv}>
            <Text style={styles.subHeading}>Payment Terms</Text>
            <Text style={styles.text}>
              {data?.paymentTerms}
            </Text>
          </View>

          <View style={styles.originDestinationDiv}>
            <Text style={styles.subHeading}>Estimated Arrival</Text>
            <Text style={styles.text}>
              {data?.estimatedArrival}
            </Text>
          </View>
        </View>

        {/* Products Table */}
        <View style={styles.section}>
          <View style={styles.totalAcceptRejectDiv}>
            <Text style={styles.tableSubHeading}>Ordered Products</Text>
            <Text style={styles.text}>Total accepted : {totalAcceptRejectValues.totalAccept} of {totalAcceptRejectValues.totalQuantity}</Text>
            <Text style={styles.text}>Total rejected : {totalAcceptRejectValues.totalReject} of {totalAcceptRejectValues.totalQuantity}</Text>
          </View>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeaderRow]}>
              <Text style={[styles.tableCell, styles.tableHeader]}>Products</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Quantity</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Cost</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Tax</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Total</Text>
            </View>
            {/* Table Rows */}
            {data?.selectedProducts?.map((product, index) => {

              const quantity = parseFloat(data?.purchaseOrderVariants[index]?.quantity) || 0; // Default to 0 if undefined or NaN
              const cost = parseFloat(data?.purchaseOrderVariants[index]?.cost) || 0; // Default to 0 if undefined or NaN
              const taxPercentage = parseFloat(data?.purchaseOrderVariants[index]?.tax) || 0; // Default to 0 if undefined or NaN

              // Calculate total
              const totalCost = quantity * cost; // Calculate cost based on quantity and cost per item
              const taxAmount = (totalCost * taxPercentage) / 100; // Calculate tax based on percentage
              const total = totalCost + taxAmount;

              return (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.imageContainer]}>
                    <View style={styles.imageWrapper}>
                      <Image alt="Product Image" src={product?.imageUrl} style={styles.image} />
                    </View>
                    <View>
                      <Text style={styles.textBold}>{product?.productTitle}</Text>
                      <Text style={styles.textMedium}>{product?.size}</Text>
                      <View style={styles.textRow}>
                        <Text>{product?.name}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{data?.purchaseOrderVariants[index]?.quantity || 0}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{data?.purchaseOrderVariants[index]?.cost || 0}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{data?.purchaseOrderVariants[index]?.tax || 0}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{total.toFixed(2)}</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        <View style={styles.footerDiv}>
          {/* Additional Details */}
          <View style={styles.shipmentDetails}>
            <Text style={styles.subHeading}>Additional Details</Text>
            <Text style={styles.text}>Reference Number</Text>
            <Text>{data?.referenceNumber === "" ? " " : data?.referenceNumber}</Text>
            <Text style={styles.text}>Supplier Note</Text>
            <Text>{data?.supplierNote === "" ? " " : data?.supplierNote}</Text>
          </View>

          {/* Cost summary */}
          <View style={styles.additionalDetails}>
            <Text style={styles.subHeading}>Cost summary</Text>
            <View style={styles.costSummaryDiv}>
              <Text style={[styles.text]}>Taxes <Text style={[styles.text, { color: '#9CA3AF' }]}>(included)</Text></Text>
              <Text style={styles.text}>{totalTax.toFixed(2)}</Text>
            </View>
            <View style={styles.costSummaryDiv}>
              <Text style={styles.text}>Subtotal <Text style={[styles.text, { color: '#9CA3AF' }]}>({totalQuantity} items)</Text></Text>
              <Text style={styles.text}>{totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.costSummaryDiv}>
              <Text style={styles.text}>+Shipping</Text>
              <Text style={styles.text}>{data?.shipping}</Text>
            </View>
            <View style={styles.costSummaryDiv}>
              <Text style={styles.text}>-Discount</Text>
              <Text style={styles.text}>{data?.discount}</Text>
            </View>
            <View style={[styles.costSummaryDiv, styles.borderOfTotal]}>
              <Text style={[styles.text, { marginTop: 5 }]}>Total</Text>
              <Text style={styles.text}>{total}</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document >
  )
};

export default PurchaseOrderPDF;
