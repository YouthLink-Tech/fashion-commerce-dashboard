import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heading: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: (status) => ({
    padding: 4,
    fontSize: 12,
    borderRadius: 8,
    color:
      status === 'pending' ? '#b58900' :
        status === 'ordered' ? '#1d4ed8' :
          status === 'received' ? '#166534' :
            status === 'canceled' ? '#b91c1c' : '#4b5563',
    backgroundColor:
      status === 'pending' ? '#fef3c7' :
        status === 'ordered' ? '#dbeafe' :
          status === 'received' ? '#d1fae5' :
            status === 'canceled' ? '#fee2e2' : '#f3f4f6',
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
    fontSize: 8,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  textBold: {
    fontWeight: 700,
    color: '#1D4ED8',
    fontSize: 8,
    textAlign: 'left',
  },
  textMedium: {
    fontWeight: 500,
    fontSize: 8,
    textAlign: 'left',
  },
  footerDiv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  shipmentDetails: {
    flex: 1,
  },
  supplierNote: {
    marginTop: 10,
    fontSize: 10,
    color: '#333',
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
  costSummaryDiv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  borderOfTotal: {
    borderTop: 1,
  },
});

const PurchaseOrderPDF = ({ data }) => {
  // Calculate totals
  const calculateTotals = () => {
    return (
      data?.purchaseOrderVariants?.reduce(
        (acc, variant) => {
          const quantity = parseFloat(variant.quantity) || 0;
          const cost = parseFloat(variant.cost) || 0;
          const taxPercentage = parseFloat(variant.tax) || 0;
          const subtotal = quantity * cost;
          const taxAmount = (subtotal * taxPercentage) / 100;
          acc.totalQuantity += quantity;
          acc.totalSubtotal += subtotal;
          acc.totalTax += taxAmount;
          return acc;
        },
        {
          totalQuantity: 0,
          totalSubtotal: 0,
          totalTax: 0,
        }
      ) || { totalQuantity: 0, totalSubtotal: 0, totalTax: 0 }
    );
  };

  const totals = calculateTotals();
  const { totalQuantity, totalSubtotal, totalTax } = totals;
  const totalPrice = totalSubtotal + totalTax;
  const total = totalPrice + (data?.shipping || 0) - (data?.discount || 0);

  // Calculate accept/reject totals
  const totalAcceptRejectValues = data?.purchaseOrderVariants?.reduce(
    ({ totalQuantity, totalAccept, totalReject }, { quantity = 0, accept = 0, reject = 0 }) => ({
      totalQuantity: totalQuantity + quantity,
      totalAccept: totalAccept + accept,
      totalReject: totalReject + reject,
    }),
    { totalQuantity: 0, totalAccept: 0, totalReject: 0 }
  ) || { totalQuantity: 0, totalAccept: 0, totalReject: 0 };

  // Precompute table rows
  const precomputedRows = data?.selectedProducts?.map((product, index) => {
    const variant = data?.purchaseOrderVariants[index] || {};
    const quantity = parseFloat(variant.quantity) || 0;
    const cost = parseFloat(variant.cost) || 0;
    const taxPercentage = parseFloat(variant.tax) || 0;
    const totalCost = quantity * cost;
    const taxAmount = (totalCost * taxPercentage) / 100;
    const total = totalCost + taxAmount;
    return { product: product || {}, quantity, cost, taxPercentage, total };
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
          {/* Header (only on first page) */}
          {pageIndex === 0 && (
            <>
              <View style={styles.header}>
                <Text style={styles.heading}>#{data?.purchaseOrderNumber || 'N/A'}</Text>
                <Text style={styles.statusBadge(data?.purchaseOrderStatus)}>
                  {data?.purchaseOrderStatus === 'pending'
                    ? 'Pending'
                    : data?.purchaseOrderStatus === 'received'
                      ? 'Received'
                      : data?.purchaseOrderStatus === 'canceled'
                        ? 'Canceled'
                        : data?.purchaseOrderStatus === 'ordered'
                          ? 'Ordered'
                          : 'Unknown'}
                </Text>
              </View>
              <View style={styles.originDestination}>
                <View style={styles.originDestinationDiv}>
                  <Text style={styles.subHeading}>Supplier</Text>
                  <Text style={styles.text}>{data?.selectedVendor?.value || 'N/A'}</Text>
                  <Text style={styles.text}>{data?.selectedVendor?.vendorAddress || 'N/A'}</Text>
                </View>
                <View style={styles.originDestinationDiv}>
                  <Text style={styles.subHeading}>Destination</Text>
                  <Text style={styles.text}>{data?.selectedLocation?.locationName || 'N/A'}</Text>
                  <Text style={styles.text}>{data?.selectedLocation?.locationAddress || 'N/A'}</Text>
                  <Text style={styles.text}>
                    {data?.selectedLocation?.cityName || 'N/A'}, {data?.selectedLocation?.postalCode || 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.originDestination}>
                <View style={styles.originDestinationDiv}>
                  <Text style={styles.subHeading}>Payment Terms</Text>
                  <Text style={styles.text}>{data?.paymentTerms || 'N/A'}</Text>
                </View>
                <View style={styles.originDestinationDiv}>
                  <Text style={styles.subHeading}>Estimated Arrival</Text>
                  <Text style={styles.text}>{data?.estimatedArrival || 'N/A'}</Text>
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
                <Text style={[styles.tableCell, styles.tableHeader]}>Cost</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Tax</Text>
                <Text style={[styles.tableCell, styles.tableHeader]}>Total</Text>
              </View>
              {chunk.map((row, index) => (
                <View key={index} style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.imageContainer]}>
                    <View>
                      <Text style={styles.textBold}>{row.product?.productTitle || 'N/A'}</Text>
                      <Text style={styles.textMedium}>{row.product?.size || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{row.quantity}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{row.cost}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{row.taxPercentage}</Text>
                  </View>
                  <View style={styles.tableCell}>
                    <Text>{row.total.toFixed(2)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Footer (only on the last page) */}
          {pageIndex === pages.length - 1 && (
            <View style={styles.footerDiv}>
              <View style={styles.shipmentDetails}>
                <Text style={styles.subHeading}>Additional Details</Text>
                <Text style={styles.text}>Reference Number</Text>
                <Text style={styles.text}>{data?.referenceNumber || '--'}</Text>
                <Text style={styles.supplierNote}>Supplier Note</Text>
                <Text style={styles.text}>{data?.supplierNote || '--'}</Text>
              </View>
              <View style={styles.additionalDetails}>
                <Text style={styles.subHeading}>Cost Summary</Text>
                <View style={styles.costSummaryDiv}>
                  <Text style={styles.text}>Taxes (included)</Text>
                  <Text style={styles.text}>{totalTax.toFixed(2)}</Text>
                </View>
                <View style={styles.costSummaryDiv}>
                  <Text style={styles.text}>Subtotal ({totalQuantity} items)</Text>
                  <Text style={styles.text}>{totalPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.costSummaryDiv}>
                  <Text style={styles.text}>+Shipping</Text>
                  <Text style={styles.text}>{data?.shipping || 0}</Text>
                </View>
                <View style={styles.costSummaryDiv}>
                  <Text style={styles.text}>-Discount</Text>
                  <Text style={styles.text}>{data?.discount || 0}</Text>
                </View>
                <View style={[styles.costSummaryDiv, styles.borderOfTotal]}>
                  <Text style={[styles.text, { marginTop: 4 }]}>Total</Text>
                  <Text style={styles.text}>{total.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
        </Page>
      ))}
    </Document>
  );
};

export default PurchaseOrderPDF;
