const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4500/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

export const getImageUrl = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return '';
  }

  const normalizedPath = imagePath.trim();
  if (!normalizedPath) {
    return '';
  }

  const lowerPath = normalizedPath.toLowerCase();
  if (['undefined', 'null', 'nan'].includes(lowerPath)) {
    return '';
  }

  if (normalizedPath.startsWith('blob:') || normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://') || normalizedPath.startsWith('data:')) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith('gridfs://')) {
    const fileId = normalizedPath.replace('gridfs://', '');
    return fileId ? `${API_ORIGIN}/api/user/profile-pic/${fileId}` : '';
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(normalizedPath) || /\s/.test(normalizedPath)) {
    return '';
  }

  return `${API_ORIGIN}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
};
