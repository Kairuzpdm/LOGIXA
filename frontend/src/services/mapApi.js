const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`Error de red al consultar ${url}`);
  }

  return response.json();
};

export const geocodeAddress = async (query, { viewBox = '-64.80,-21.60,-64.65,-21.50' } = {}) => {
  const params = new URLSearchParams({
    q: `${query}, Tarija, Bolivia`,
    format: 'json',
    limit: '1',
    viewbox: viewBox
  });

  return fetchJson(`${NOMINATIM_BASE_URL}?${params.toString()}`);
};

export const fetchOsrmRoute = async (from, to) => {
  const coords = `${from[1]},${from[0]};${to[1]},${to[0]}`;
  const url = `${OSRM_BASE_URL}/${coords}?overview=full&geometries=geojson`;
  const data = await fetchJson(url);

  if (!data || data.code !== 'Ok' || !data.routes?.length) {
    return null;
  }

  return data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
};
