const generateOrderNumber = (sequence) => {
  const year = new Date().getFullYear();

  return `EW-${year}-${String(sequence).padStart(6, "0")}`;
};

export default generateOrderNumber;