import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import RouteMap from '../logistics/RouteMap';
import styles from '../../styles/Dashboard.module.css';

const MapPanel = ({ orders, drivers, activeDriverLocations, warehouseCoords, onRefreshLocations, isRefreshingLocations }) => {
  return (
    <Card
      title="Monitoreo Geográfico de Entregas (Tarija, Bolivia)"
      subtitle="Posiciones satelitales actualizadas manualmente"
      actions={(
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshLocations}
          disabled={isRefreshingLocations}
        >
          {isRefreshingLocations ? 'Actualizando...' : 'Refrescar posiciones'}
        </Button>
      )}
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
