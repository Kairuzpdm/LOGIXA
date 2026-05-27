import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import styles from '../../styles/common/LocationPicker.module.css';

// Icono personalizado para el marcador
const createMarkerIcon = (color = '#3b82f6') => {
  return L.icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color.replace('#', '%23')}"/>
      </svg>
    `)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28]
  });
};

// Componente para capturar clics en el mapa
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({
        latitud: lat.toFixed(8),
        longitud: lng.toFixed(8),
        nombre: `Ubicación: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
      });
    }
  });
  return null;
};

const LocationPicker = ({ 
  latitud, 
  longitud, 
  direccion,
  onLocationSelect 
}) => {
  const [mapCenter, setMapCenter] = useState([-21.53699, -64.74173]); // Punto de partida del almacén en Tarija
  const [markerPos, setMarkerPos] = useState(
    latitud && longitud ? [parseFloat(latitud), parseFloat(longitud)] : null
  );
  const [searchQuery, setSearchQuery] = useState(direccion || '');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (latitud && longitud) {
      setMarkerPos([parseFloat(latitud), parseFloat(longitud)]);
      setMapCenter([parseFloat(latitud), parseFloat(longitud)]);
    }
  }, [latitud, longitud]);

  const handleMapClick = (location) => {
    setMarkerPos([parseFloat(location.latitud), parseFloat(location.longitud)]);
    setMapCenter([parseFloat(location.latitud), parseFloat(location.longitud)]);
    onLocationSelect(location);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      // Usamos Nominatim (OpenStreetMap) para geocodificación
      // Limitamos la búsqueda al área de Tarija
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}, Tarija, Bolivia&format=json&limit=1&viewbox=-64.80,-21.60,-64.65,-21.50`
      );
      const results = await response.json();
      
      if (results && results.length > 0) {
        const { lat, lon, display_name } = results[0];
        handleMapClick({
          latitud: parseFloat(lat).toFixed(8),
          longitud: parseFloat(lon).toFixed(8),
          nombre: display_name
        });
      } else {
        alert('No se encontraron resultados para esa dirección en Tarija');
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      alert('Error al buscar la dirección');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRandomTarija = () => {
    // Genera coordenadas aleatorias dentro del rango operacional de Tarija
    const randomLat = (-21.55 + Math.random() * 0.03).toFixed(8);
    const randomLng = (-64.76 + Math.random() * 0.06).toFixed(8);
    handleMapClick({
      latitud: randomLat,
      longitud: randomLng,
      nombre: `Ubicación simulada: ${randomLat}, ${randomLng}`
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <MapPin size={18} />
          Seleccionar Ubicación en Mapa
        </h3>
        <p className={styles.subtitle}>
          Haz clic en el mapa o busca una dirección para establecer la ubicación de envío
        </p>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchRow}>
          <Input
            placeholder="Buscar dirección en Tarija..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className={styles.searchInput}
          />
          <Button 
            type="button"
            variant="primary" 
            size="sm"
            onClick={handleSearch}
            disabled={isSearching}
            icon={Search}
            className={styles.searchButton}
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRandomTarija}
          className={styles.randomButton}
        >
          📍 Ubicación Aleatoria en Tarija
        </Button>
      </div>

      <div className={styles.mapWrapper}>
        <MapContainer 
          center={mapCenter} 
          zoom={15} 
          className={styles.map}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onLocationSelect={handleMapClick} />
          
          {markerPos && (
            <Marker 
              position={markerPos}
              icon={createMarkerIcon('#3b82f6')}
            >
              <Popup>
                <div className={styles.popupContent}>
                  <strong>Ubicación Seleccionada</strong>
                  <p>Lat: {markerPos[0].toFixed(5)}</p>
                  <p>Lng: {markerPos[1].toFixed(5)}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {markerPos && (
        <div className={styles.coordsDisplay}>
          <div className={styles.coordItem}>
            <span className={styles.label}>Latitud:</span>
            <span className={styles.value}>{markerPos[0].toFixed(8)}</span>
          </div>
          <div className={styles.coordItem}>
            <span className={styles.label}>Longitud:</span>
            <span className={styles.value}>{markerPos[1].toFixed(8)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
