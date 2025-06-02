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
    color: status === 'pending' ? '#b58900' : status === 'received' ? '#005f00' : '#d0011a',
    backgroundColor: status === 'pending' ? '#fff3cd' : status === 'received' ? '#d4edda' : '#f8d7da',
  }),
  originDestination: {
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20
  },
  originDestinationDiv: {
    flexDirection: 'column',
  },
  section: { marginBottom: 20 },
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
  transferOrderValue: {
    marginBottom: 5,
  }
});

const TransferOrderPDF = ({ data }) => {

  const totalAcceptRejectValues = useMemo(() =>
    data?.transferOrderVariants?.reduce(
      ({ totalQuantity, totalAccept, totalReject }, { quantity = 0, accept = 0, reject = 0 }) => ({
        totalQuantity: totalQuantity + quantity,
        totalAccept: totalAccept + accept,
        totalReject: totalReject + reject,
      }),
      { totalQuantity: 0, totalAccept: 0, totalReject: 0 }
    ),
    [data?.transferOrderVariants]
  );

  // Calculate total transfer order value
  const totalTransferOrderValue = useMemo(() => {
    return data?.transferOrderVariants?.reduce((total, variant) => {
      const { accept = 0, cost = 0, tax = 0 } = variant; // Default to 0 for missing values
      // Calculate variant value: accept * (cost + (cost * tax / 100))
      const variantValue = accept * (cost + (cost * tax / 100));
      return total + variantValue;
    }, 0) || 0; // Default to 0 if no variants
  }, [data?.transferOrderVariants]);

  return (
    <Document>
      <Page size="A4" style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>#{data?.transferOrderNumber}</Text>
          <Text style={styles.statusBadge(data?.transferOrderStatus)}>{data?.transferOrderStatus === "pending" ? "Pending"
            : data?.transferOrderStatus === "received" ? "Received"
              : data?.transferOrderStatus === "canceled" ? "Canceled"
                : "Unknown"}</Text>
        </View>

        {/* Origin and Destination */}
        <View style={styles.originDestination}>
          <View style={styles.originDestinationDiv}>
            <Text style={styles.subHeading}>Origin</Text>
            <Text style={styles.text}>
              {data?.selectedOrigin?.locationName}
            </Text>
            <Text style={styles.text}>{data?.selectedOrigin?.locationAddress}, {data?.selectedOrigin?.cityName},{' '}
              {data?.selectedOrigin?.postalCode}</Text>
          </View>

          <View style={styles.originDestinationDiv}>
            <Text style={styles.subHeading}>Destination</Text>
            <Text style={styles.text}>
              {data?.selectedDestination?.locationName}
            </Text>
            <Text style={styles.text}>{data?.selectedDestination?.locationAddress}, {data?.selectedDestination?.cityName},{' '}
              {data?.selectedDestination?.postalCode}</Text>
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
              <Text style={[styles.tableCell, styles.tableHeader]}>Received</Text>
              <Text style={[styles.tableCell, styles.tableHeader]}>Rejected</Text>
            </View>
            {/* Table Rows */}
            {data?.selectedProducts?.map((product, index) => (
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
                  <Text>{data?.transferOrderVariants[index]?.quantity || 0}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>{data?.transferOrderVariants[index]?.accept || 0}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>{data?.transferOrderVariants[index]?.reject || 0}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.transferOrderValue}>
          <Text style={styles.subHeading}>Transfer order amount : {totalTransferOrderValue.toFixed(2)}</Text>
        </View>

        <View style={styles.footerDiv}>
          {/* Shipment Details */}
          <View style={styles.shipmentDetails}>
            <Text style={styles.subHeading}>Shipment Details</Text>
            <Text style={[styles.text, { marginTop: 5 }]}>Estimated Arrival</Text>
            <Text style={[styles.text, { marginBottom: 10 }]}>{data?.estimatedArrival ? data?.estimatedArrival : " "}</Text>
            <Text style={[styles.text]}>Shipping Carrier</Text>
            <Text style={[styles.text, { marginBottom: 10 }]}>{data?.shippingCarrier === "" ? " " : data?.shippingCarrier}</Text>
            <Text style={[styles.text]}>Tracking Number</Text>
            <Text style={[styles.text, { marginBottom: 10 }]}>{data?.trackingNumber === "" ? " " : data?.trackingNumber}</Text>
          </View>
          {/* Additional Details */}
          <View style={styles.additionalDetails}>
            <Text style={styles.subHeading}>Additional Details</Text>
            <Text style={[styles.text, { marginTop: 5 }]}>Reference Number</Text>
            <Text style={[styles.text, { marginBottom: 10 }]}>{data?.referenceNumber === "" ? " " : data?.referenceNumber}</Text>
            <Text style={[styles.text]}>Supplier Note</Text>
            <Text style={[styles.text, { marginBottom: 10 }]}>{data?.supplierNote === "" ? " " : data?.supplierNote}</Text>
          </View>
        </View>

      </Page>
    </Document>
  )
};

export default TransferOrderPDF;
