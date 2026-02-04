const getAPIUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser environment
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    // Production - use relative path or the domain
    return window.location.origin;
  }
  // Fallback
  return '';
};

export const API_URL = getAPIUrl();
