export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const month = (`0${date.getMonth() + 1}`).slice(-2); // Get month and pad with 0 if needed
  const day = (`0${date.getDate()}`).slice(-2);       // Get day and pad with 0 if needed
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};
