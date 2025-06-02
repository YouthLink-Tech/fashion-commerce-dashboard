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