const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4500/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return '';
  }

  if (imagePath.startsWith('blob:') || imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  return `${API_ORIGIN}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};
