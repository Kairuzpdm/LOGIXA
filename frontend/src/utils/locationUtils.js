export const buildDriverLocationMap = (driverLocations = []) => {
  return driverLocations.reduce((acc, loc) => {
    acc[loc.repartidor_id] = { lat: loc.latitud, lng: loc.longitud };
    return acc;
  }, {});
};
