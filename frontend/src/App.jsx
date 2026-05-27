import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CRM_ERP from './pages/CRM_ERP';
import Repartidores from './pages/Repartidores';
import styles from './styles/App.module.css';

const App = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Redirigir si el usuario cambia (ej. Repartidor no tiene acceso a Dashboard de Admin)
  useEffect(() => {
    if (user) {
      if (user.rol === 'repartidor') {
        setActiveTab('simulador');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  return (
    <div className={styles.appLayoutContainer}>
      {/* Barra de Navegación Lateral */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Área del Contenido Principal */}
      <main className={styles.contentArea}>
        {activeTab === 'dashboard' && user.rol === 'admin' && <Dashboard />}
        {activeTab === 'crm_erp' && user.rol === 'admin' && <CRM_ERP />}
        {activeTab === 'simulador' && <Repartidores />}
      </main>
    </div>
  );
};

export default App;
