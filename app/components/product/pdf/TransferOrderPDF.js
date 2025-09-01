import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  heading: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: (status) => ({
    padding: 4,
    fontSize: 10,
    borderRadius: 8,
    color:
      status === 'pending' ? '#b58900' :
        status === 'ordered' ? '#1d4ed8' :
          status === 'received' ? '#005f00' :
            status === 'canceled' ? '#d0011a' : '#4b5563',
    backgroundColor:
      status === 'pending' ? '#fff3cd' :
        status === 'ordered' ? '#dbeafe' :
          status === 'received' ? '#d4edda' :
            status === 'canceled' ? '#f8d7da' : '#f3f4f6',
  }),
  originDestination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  originDestinationDiv: {
    flexDirection: 'column',
    flex: 1,
  },
  section: {
    marginBottom: 10,
  },
  subHeading: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  tableSubHeading: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  text: {
    fontSize: 10,
    color: '#333',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableHeaderRow: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    padding: 4,
    fontSize: 10,
  },
  tableHeader: {
    fontWeight: 'bold',
    fontSize: 10,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  textBold: {
    fontWeight: 700,
    color: '#1d4ed8',
    fontSize: 10,
    textAlign: 'left',
    marginBottom: 4,
  },
  textMedium: {
    fontWeight: 500,
    fontSize: 10,
    textAlign: 'left',
    marginBottom: 4,
  },
  footerDiv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  shipmentDetails: {
    flex: 1,
  },
  additionalDetails: {
    flex: 1,
  },
  totalAcceptRejectDiv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 10,
  },
  transferOrderValue: {
    marginBottom: 8,
  },
});

const TransferOrderPDF = ({ data }) => {

  const totalAcceptRejectValues = data?.transferOrderVariants?.reduce(
    ({ totalQuantity, totalAccept, totalReject }, { quantity = 0, accept = 0, reject = 0 }) => ({
      totalQuantity: totalQuantity + quantity,
      totalAccept: totalAccept + accept,
      totalReject: totalReject + reject,
    }),
    { totalQuantity: 0, totalAccept: 0, totalReject: 0 }
  );

  // Calculate total transfer order value
  const totalTransferOrderValue = data?.transferOrderVariants?.reduce((total, variant) => {
    const { accept = 0, cost = 0, tax = 0 } = variant; // Default to 0 for missing values
    // Calculate variant value: accept * (cost + (cost * tax / 100))
    const variantValue = accept * (cost + (cost * tax / 100));
    return total + variantValue;
  }, 0) || 0;

  // Precompute table rows
  const precomputedRows = data?.selectedProducts?.map((product, index) => {
    const variant = data?.transferOrderVariants[index] || {};
    return {
      product: product || {},
      quantity: parseFloat(variant.quantity) || 0,
      accept: parseFloat(variant.accept) || 0,
      reject: parseFloat(variant.reject) || 0,
    };
  }) || [];

  // Paginate rows (20 per page)
  const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };
  const pages = chunkArray(precomputedRows, 20);

  return (
    <Document>
      {pages.map((chunk, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.container}>
          {/* Header (first page only) */}
          {pageIndex === 0 && (
            <>
              <View style={styles.header}>
                <Text style={styles.heading}>#{data?.transferOrderNumber || 'N/A'}</Text>
                <Text style={styles.statusBadge(data?.transferOrderStatus)}>
                  {data?.transferOrderStatus === 'pending' ? 'Pending' :
                    data?.transferOrderStatus === 'ordered' ? 'Ordered' :
                      data?.transferOrderStatus === 'received' ? 'Received' :
                        data?.transferOrderStatus === 'canceled' ? 'Canceled' : 'Unknown'}
                </Text>
              </View>
              <View style={styles.originDestination}>
                <View style={styles.originDestinationDiv}>
                  <Text style={styles.subHeading}>Origin</Text>
                  <Text style={styles.text}>{data?.selectedOrigin?.locationName || 'N/A'}</Text>
                  <Text style={styles.text}>{data?.selectedOrigin?.locationAddress || 'N/A'}</Text>
                  <Text style={styles.text}>
                    {data?.selectedOrigin?.cityName || 'N/A'}, {data?.selectedOrigin?.postalCode || 'N/A'}
                  </Text>
                </View>
                <View style={styles.originDestinationDiv}>
                  <Text style={styles.subHeading}>Destination</Text>
                  <Text style={styles.text}>{data?.selectedDestination?.locationName || 'N/A'}</Text>
                  <Text style={styles.text}>{data?.selectedDestination?.locationAddress || 'N/A'}</Text>
                  <Text style={styles.text}>
                    {data?.selectedDestination?.cityName || 'N/A'}, {data?.selectedDestination?.postalCode || 'N/A'}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Products Table */}
          <View style={styles.section}>
            <View style={styles.totalAcceptRejectDiv}>
              <Text style={styles.tableSubHeading}>Ordered Products</Text>
              <Text style={styles.text}>
                Total accepted: {totalAcceptRejectValues.totalAccept} of {totalAcceptRejectValues.totalQuantity}
              </Text>
              <Text style={styles.text}>
                Total rejected: {totalAcceptRejectValues.totalReject} of {totalAcceptRejectValues.totalQuantity}
              </Text>
            </View>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={[styles.tableCell, styles.tableHeader]}>Products</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Quantity</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Received</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Rejected</Text>
              </View>
              {chunk.map((row, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.imageContainer]}>
                    <View>
                      <Text style={styles.textBold}>{row.product?.productTitle || 'N/A'}</Text>
                      <Text style={styles.textMedium}>{row.product?.size || 'N/A'}</Text>
                      <Text style={styles.text}>{row.product?.name || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{row.quantity}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{row.accept}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{row.reject}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Footer (last page only) */}
          {pageIndex === pages.length - 1 && (
            <>
              <View style={styles.transferOrderValue}>
                <Text style={styles.subHeading}>Transfer Order Amount: {totalTransferOrderValue.toFixed(2)}</Text>
              </View>
              <View style={styles.footerDiv}>
                <View style={styles.shipmentDetails}>
                  <Text style={styles.subHeading}>Shipment Details</Text>
                  <Text style={[styles.text, { marginTop: 4 }]}>Estimated Arrival</Text>
                  <Text style={[styles.text, { marginBottom: 8 }]}>{data?.estimatedArrival || '--'}</Text>
                  <Text style={styles.text}>Shipping Carrier</Text>
                  <Text style={[styles.text, { marginBottom: 8 }]}>{data?.shippingCarrier || '--'}</Text>
                  <Text style={styles.text}>Tracking Number</Text>
                  <Text style={[styles.text, { marginBottom: 8 }]}>{data?.trackingNumber || '--'}</Text>
                </View>
                <View style={styles.additionalDetails}>
                  <Text style={styles.subHeading}>Additional Details</Text>
                  <Text style={[styles.text, { marginTop: 4 }]}>Reference Number</Text>
                  <Text style={[styles.text, { marginBottom: 8 }]}>{data?.referenceNumber || '--'}</Text>
                  <Text style={styles.text}>Supplier Note</Text>
                  <Text style={[styles.text, { marginBottom: 8 }]}>{data?.supplierNote || '--'}</Text>
                </View>
              </View>
            </>
          )}
        </Page>
      ))}
    </Document>
  )
};

export default TransferOrderPDF;
