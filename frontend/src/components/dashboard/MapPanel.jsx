import React from 'react';
import Card from '../common/Card';
import RouteMap from '../logistics/RouteMap';
import styles from '../../styles/Dashboard.module.css';

const MapPanel = ({ orders, drivers, activeDriverLocations, warehouseCoords }) => {
  return (
    <Card
      title="Monitoreo Geográfico de Entregas (Tarija, Bolivia)"
      subtitle="Posiciones satelitales actualizadas cada 5 segundos"
      className={styles.mapCard}
    >
      <div className={styles.mapWrapper}>
        <RouteMap
          orders={orders}
          drivers={drivers}
          activeDriverLocations={activeDriverLocations}
          warehouseCoords={warehouseCoords}
        />
      </div>
    </Card>
  );
};

export default MapPanel;
