const generateOrderNumber = (orderId) => {
  const year = new Date().getFullYear();

  const uniquePart = orderId
    .replace(/-/g, "")
    .substring(0, 6)
    .toUpperCase();

  return `EW-${year}-${uniquePart}`;
};

export default generateOrderNumber;