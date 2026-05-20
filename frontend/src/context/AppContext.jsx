import React, { createContext, useState, useEffect, useContext } from 'react';
import useFetch from '../hooks/useFetch';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [driverLocations, setDriverLocations] = useState([]);
  const { request } = useFetch();

  // Almacén Central (Coordenadas fijas en Tarija, Bolivia)
  const warehouseCoords = { lat: -21.53555, lng: -64.7290 };

  // Intentar cargar la sesión del usuario al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('logistica_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetchs reutilizables
  const fetchProducts = async () => {
    try {
      const res = await request('/productos');
      if (res.status === 'success') setProducts(res.data);
    } catch (err) {
      console.error('Error cargando productos:', err.message);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await request('/clientes');
      if (res.status === 'success') setClients(res.data);
    } catch (err) {
      console.error('Error cargando clientes:', err.message);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await request('/pedidos');
      if (res.status === 'success') setOrders(res.data);
    } catch (err) {
      console.error('Error cargando pedidos:', err.message);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await request('/auth/repartidores');
      if (res.status === 'success') setDrivers(res.data);
    } catch (err) {
      console.error('Error cargando repartidores:', err.message);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await request('/tracker/locations');
      if (res.status === 'success') setDriverLocations(res.data);
    } catch (err) {
      console.error('Error cargando coordenadas:', err.message);
    }
  };

  const loginUser = (userData, token) => {
    localStorage.setItem('logistica_token', token);
    localStorage.setItem('logistica_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('logistica_token');
    localStorage.removeItem('logistica_user');
    setUser(null);
  };

  // Cargar datos al iniciar si hay un usuario logueado
  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchClients();
      fetchOrders();
      fetchDrivers();
      fetchLocations();
      
      // Polling de posiciones cada 5 segundos para actualización en tiempo real en Dashboard de Admin
      const interval = setInterval(() => {
        fetchLocations();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <AppContext.Provider value={{
      user,
      products,
      clients,
      orders,
      drivers,
      driverLocations,
      warehouseCoords,
      loginUser,
      logoutUser,
      fetchProducts,
      fetchClients,
      fetchOrders,
      fetchDrivers,
      fetchLocations,
      setUser
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
