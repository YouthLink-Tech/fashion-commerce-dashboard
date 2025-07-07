export const getTimeAgo = (dateTimeStr) => {
  // Convert "May 5, 2025 | 5:50 PM" -> "May 5, 2025 5:50 PM"
  const cleanedDateStr = dateTimeStr.replace('|', '').trim();
  const past = new Date(cleanedDateStr);
  const now = new Date();

  const diffMs = now - past;
  if (isNaN(past)) return 'Invalid date';

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
};

export const formatMessageDate = (isoString) => {
  const messageDate = new Date(isoString);
  const now = new Date();

  // Compare local date parts (your browser already knows it's BD if running in BD)
  const isToday =
    messageDate.getDate() === now.getDate() &&
    messageDate.getMonth() === now.getMonth() &&
    messageDate.getFullYear() === now.getFullYear();

  if (isToday) {
    // Format time (like 7:02 PM)
    const hours = messageDate.getHours();
    const minutes = messageDate.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${minutes} ${ampm}`;
  } else {
    // Format date (like Jul 5)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${monthNames[messageDate.getMonth()]} ${messageDate.getDate()}`;
  }
};