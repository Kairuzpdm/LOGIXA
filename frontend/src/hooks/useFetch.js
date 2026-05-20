import { useState, useCallback } from 'react';

// URL base del backend. Ajusta al puerto que usará Express
const BASE_URL = 'http://localhost:3000/api';

const useFetch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (urlPath, options = {}) => {
    setLoading(true);
    setError(null);

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Añadir Token JWT si existe en localStorage (Para seguridad)
    const token = localStorage.getItem('logistica_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${BASE_URL}${urlPath}`, config);
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Ocurrió un error en la solicitud');
      }

      setLoading(false);
      return resData;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Error de conexión con el servidor');
      throw err;
    }
  }, []);

  return { request, loading, error };
};

export default useFetch;
