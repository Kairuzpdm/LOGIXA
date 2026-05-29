import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Pane, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchOsrmRoute } from '../../services/mapApi';
import styles from '../../styles/RouteMap.module.css';

// Hook auxiliar para recalcular el centro del mapa cuando cambia
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// ============================================================================
// DISEÑO SEGURO Y ROBUSTO DE ICONOS MEDIANTE SVG DATA URIS
// Esto evita cualquier error de importación o carga de assets en Vite/React
// ============================================================================

// 1. Almacén Central (Rojo/Naranja con logo de caja)
const warehouseIcon = L.icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="38" height="38">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="%23ff5b33"/>
      <rect x="10" y="7.5" width="4" height="3" fill="%23fff" rx="0.5"/>
    </svg>
  `),
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -34]
});

// 2. Cliente Destino (Cian brillante con logo de casa)
const clientIcon = L.icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm-2 10.5V10h4v2.5h-4z" fill="%2300f2fe"/>
      <polygon points="12,6 9,8.5 9,10 15,10 15,8.5" fill="%23fff"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -28]
});

// 3. Repartidor Activo (Amarillo Neón con silueta circular)
const driverIcon = L.icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
      <circle cx="12" cy="12" r="9" fill="%23f9d976" stroke="%230b0f19" stroke-width="2"/>
      <path d="M12 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-4 8c0-2 4-3 4-3s4 1 4 3H8z" fill="%230b0f19"/>
    </svg>
  `),
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

const normalizeNumber = (value) => typeof value === 'string' ? parseFloat(value) : value;

const buildTrafficSafeRoute = (start, end) => {
  const startLat = normalizeNumber(start[0]);
  const startLng = normalizeNumber(start[1]);
  const endLat = normalizeNumber(end[0]);
  const endLng = normalizeNumber(end[1]);

  if (startLat === endLat || startLng === endLng) {
    return [[startLat, startLng], [endLat, endLng]];
  }

  return [[startLat, startLng], [startLat, endLng], [endLat, endLng]];
};

const RouteMap = ({ orders = [], drivers = [], activeDriverLocations = {}, warehouseCoords }) => {
  const [routes, setRoutes] = useState({});
  const mapCenter = [warehouseCoords.lat, warehouseCoords.lng];

  useEffect(() => {
    let isCancelled = false;

    const loadRoutes = async () => {
      const activeOrders = orders.filter(order => order.estado === 'en_ruta' && order.repartidor_id);
      if (!activeOrders.length) {
        setRoutes({});
        return;
      }

      const nextRoutes = {};
      await Promise.all(activeOrders.map(async (order) => {
        const liveLoc = activeDriverLocations[order.repartidor_id];
        if (!liveLoc) return;

        const startPoint = [warehouseCoords.lat, warehouseCoords.lng];
        const driverPoint = [parseFloat(liveLoc.lat), parseFloat(liveLoc.lng)];
        const clientPoint = [parseFloat(order.cliente_latitud), parseFloat(order.cliente_longitud)];

        const [toDriverRoute, toClientRoute] = await Promise.all([
          fetchOsrmRoute(startPoint, driverPoint),
          fetchOsrmRoute(driverPoint, clientPoint)
        ]);

        nextRoutes[order.id] = {
          toDriver: toDriverRoute || buildTrafficSafeRoute(startPoint, driverPoint),
          toClient: toClientRoute || buildTrafficSafeRoute(driverPoint, clientPoint)
        };
      }));

      if (!isCancelled) {
        setRoutes(nextRoutes);
      }
    };

    loadRoutes();

    return () => {
      isCancelled = true;
    };
  }, [orders, activeDriverLocations, warehouseCoords]);

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={14} 
      className={`${styles.mapContainer} dark-tiles`}
    >
      <Pane name="routePane" style={{ zIndex: 450 }} />
      <ChangeView center={mapCenter} zoom={14} />

      {/* CartoDB Dark Matter tiles (Perfecto para la estética premium oscura del Dashboard) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* 1. Marcador Almacén Central */}
      <Marker position={mapCenter} icon={warehouseIcon}>
        <Popup>
          <div className={styles.popupContent}>
            <h4 className={styles.popupTitle}>Almacén Central LOGIXA</h4>
            <p className={styles.popupText}>Punto de partida y abastecimiento</p>
          </div>
        </Popup>
      </Marker>

      {/* 2. Marcadores para Clientes con pedidos activos */}
      {orders
        .filter(order => order.estado !== 'entregado')
        .map(order => (
          <Marker 
            key={order.id} 
            position={[parseFloat(order.cliente_latitud), parseFloat(order.cliente_longitud)]}
            icon={clientIcon}
          >
            <Popup>
              <div className={styles.clientPopup}>
                <h4 className={styles.clientTitle}>{order.cliente_nombre}</h4>
                <p className={styles.clientAddress}>{order.cliente_direccion}</p>
                <div className={styles.popupRow}>
                  <span
                    className={styles.statusBadge}
                    style={{
                      backgroundColor: order.estado === 'en_ruta' ? '#f9d976' : '#e5e7eb'
                    }}
                  >
                    Ped #{order.id}: {order.estado.toUpperCase()}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

      {/* 3. Marcadores de Repartidores en Vivo */}
      {drivers.map(loc => {
        const liveLoc = activeDriverLocations[loc.repartidor_id] || { lat: loc.latitud, lng: loc.longitud };
        return (
          <Marker 
            key={loc.repartidor_id} 
            position={[parseFloat(liveLoc.lat), parseFloat(liveLoc.lng)]}
            icon={driverIcon}
          >
            <Popup>
              <div className={styles.driverPopup}>
                <h4 className={styles.driverTitle}>🚚 {loc.repartidor_nombre}</h4>
                <p className={styles.popupText} style={{ marginTop: '2px' }}>En servicio activo</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* 4. Dibujar líneas de ruta (Polylines) para los pedidos en ruta activa */}
      {orders
        .filter(order => order.estado === 'en_ruta' && order.repartidor_id)
        .map(order => {
          const liveLoc = activeDriverLocations[order.repartidor_id];
          if (!liveLoc) return null;

          const startPoint = [warehouseCoords.lat, warehouseCoords.lng];
          const driverPoint = [parseFloat(liveLoc.lat), parseFloat(liveLoc.lng)];
          const clientPoint = [parseFloat(order.cliente_latitud), parseFloat(order.cliente_longitud)];
          const route = routes[order.id] || {};

          return (
            <React.Fragment key={order.id}>
              {/* Ruta completada por el chofer hasta su posición actual */}
              <Polyline 
                positions={route.toDriver || buildTrafficSafeRoute(startPoint, driverPoint)} 
                color="#4facfe" 
                dashArray="6, 10" 
                weight={3} 
                opacity={0.75}
                pane="routePane"
                lineCap="round"
                lineJoin="round"
              />
              {/* Ruta restante hasta llegar al cliente */}
              <Polyline 
                positions={route.toClient || buildTrafficSafeRoute(driverPoint, clientPoint)} 
                color="#00f2fe" 
                weight={4} 
                opacity={0.95}
                pane="routePane"
                lineCap="round"
                lineJoin="round"
              />
            </React.Fragment>
          );
        })}
    </MapContainer>
  );
};

export default RouteMap;
