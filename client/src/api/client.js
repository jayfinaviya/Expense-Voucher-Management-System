// Centralized Fetch Client with JWT injection and resilient fallback
const getApiBaseUrl = () => {
  if (import.meta.env && import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.port === '3000') {
    return '/api';
  }
  return 'http://localhost:5000/api';
};

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('evms_token');
  
  const headers = {
    ...options.headers,
  };

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const primaryBase = getApiBaseUrl();
  const url = `${primaryBase}${endpoint}`;
  
  try {
    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers
      });
    } catch (networkErr) {
      // If relative proxy failed, attempt direct backend connection on port 5000
      if (primaryBase === '/api') {
        const fallbackUrl = `http://localhost:5000/api${endpoint}`;
        response = await fetch(fallbackUrl, {
          ...options,
          headers
        });
      } else {
        throw networkErr;
      }
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
};
