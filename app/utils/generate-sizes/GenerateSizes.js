export const generateSizes = (range) => {
  // If the range is a single size like "One Size"
  if (range === "One Size") {
    return ["One Size"];
  }

  // Predefined size order
  const sizeOrder = [
    "XXXS", "XXS", "XS", "S", "M", "L", "XL",
    "2XL", "3XL", "4XL", "5XL", "6XL", "7XL",
    "8XL", "9XL", "10XL"
  ];

  // Handle letter size ranges like "XS-6XL" or "XXXS-10XL"
  if (/^[A-Z]+[X]*-\d*[A-Z]*$/.test(range)) {
    const [start, end] = range.split("-");
    const startIndex = sizeOrder.indexOf(start);
    const endIndex = sizeOrder.indexOf(end);

    if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
      return sizeOrder.slice(startIndex, endIndex + 1);
    }
  }

  // Handle numeric size ranges like "14-20"
  if (/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(range)) {
    const [start, end] = range.split("-").map(Number);
    const sizes = [];
    for (let i = Math.ceil(start); i <= Math.floor(end); i++) {
      sizes.push(i);
    }
    return sizes;
  }

  // Handle fractional ranges like "6/8-12/14"
  if (/^\d+\/\d+-\d+\/\d+$/.test(range)) {
    const [start, end] = range.split("-");
    const [startLow] = start.split("/").map(Number);
    const [endLow] = end.split("/").map(Number);

    const sizes = [];
    for (let i = startLow; i <= endLow; i += 2) {
      sizes.push(`${i}/${i + 2}`);
    }
    return sizes;
  }

  return [range]; // If input doesn't match any pattern, return it as-is
};