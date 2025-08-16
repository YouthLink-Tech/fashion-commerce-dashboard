export const getProductTitleById = (productId, productList) => {
  const product = productList.find((p) => p.productId === productId);
  return product ? product.productTitle : "Unknown Product";
};