import toast from "react-hot-toast";

export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    toast.error('Invalid type. Use JPG, PNG, WEBP, or JPG.');
    return false;
  }

  if (file.size > maxSizeInBytes) {
    toast.error('Image must be smaller than 10MB.');
    return false;
  }

  return true;
};