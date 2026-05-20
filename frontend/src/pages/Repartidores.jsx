import React, { useState, useEffect } from 'react';
import { Truck, Check, Play, Navigation, AlertCircle, Smartphone, User, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useFetch from '../hooks/useFetch';
import useMapSim from '../hooks/useMapSim';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import styles from '../styles/Repartidores.module.css';

const Repartidores = () => {
  const { user, drivers, warehouseCoords, fetchOrders, fetchDrivers } = useApp();
  const { request } = useFetch();
  const { simulateRoute } = useMapSim();

  // Si es admin, puede "suplantar" a un repartidor para simular su jornada móvil
  const [activeDriverId, setActiveDriverId] = useState('');
  const [driverOrders, setDriverOrders] = useState([]);
  const [alertMsg, setAlertMsg] = useState({ type: 'success', text: '' });
  const [simulatingOrderId, setSimulatingOrderId] = useState(null);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [newDriverForm, setNewDriverForm] = useState({ nombre: '', email: '', password: '' });
  
  // Coordenadas simuladas actuales para visualización del móvil
  const [currentCoords, setCurrentCoords] = useState(null);

  // Cargar órdenes asignadas al repartidor
  const fetchAssignedOrders = async (id) => {
    if (!id) return;
    try {
      const res = await request(`/pedidos/driver/${id}`);
      if (res.status === 'success') {
        setDriverOrders(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Si el usuario logueado es repartidor, fijar su propio ID
    if (user && user.rol === 'repartidor') {
      setActiveDriverId(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (activeDriverId) {
      fetchAssignedOrders(activeDriverId);
      // Reset coordenadas iniciales al almacén
      setCurrentCoords(warehouseCoords);
    }
  }, [activeDriverId]);

  const handleSelectDriver = (e) => {
    setActiveDriverId(e.target.value);
    setAlertMsg({ text: '' });
  };

  const handleOpenDriverModal = () => {
    setNewDriverForm({ nombre: '', email: '', password: '' });
    setIsDriverModalOpen(true);
  };

  const handleCloseDriverModal = () => {
    setIsDriverModalOpen(false);
  };

  const handleRegisterDriver = async (e) => {
    e.preventDefault();
    const { nombre, email, password } = newDriverForm;
    if (!nombre || !email || !password) {
      setAlertMsg({ type: 'error', text: 'Completa todos los campos para registrar un repartidor.' });
      return;
    }

    try {
      const res = await request('/auth/repartidores', {
        method: 'POST',
        body: { nombre, email, password }
      });

      if (res.status === 'success') {
        setAlertMsg({ type: 'success', text: `Repartidor ${nombre} registrado correctamente.` });
        setIsDriverModalOpen(false);
        fetchDrivers();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  // Iniciar la simulación física de movimiento
  const handleStartDeliveryRoute = (order) => {
    setSimulatingOrderId(order.id);
    setAlertMsg({ type: 'info', text: `Iniciando ruta satelital hacia la dirección del cliente...` });

    const startPos = warehouseCoords;
    const endPos = { lat: parseFloat(order.cliente_latitud), lng: parseFloat(order.cliente_longitud) };

    simulateRoute(
      activeDriverId,
      startPos,
      endPos,
      async (lat, lng) => {
        // 1. Actualizar el estado local para ver las coordenadas moverse en el móvil
        setCurrentCoords({ lat, lng });

        // 2. Reportar al backend las coordenadas en tiempo real (para persistencia en MySQL)
        try {
          await request('/tracker/update', {
            method: 'POST',
            body: {
              repartidor_id: activeDriverId,
              latitud: lat,
              longitud: lng
            }
          });
        } catch (err) {
          console.error('Error enviando GPS tracker:', err.message);
        }
      },
      () => {
        // Al finalizar la ruta
        setSimulatingOrderId(null);
        setAlertMsg({ 
          type: 'success', 
          text: `🚨 ¡Has llegado al destino! Ya puedes registrar la entrega física con el cliente ${order.cliente_nombre}.` 
        });
      },
      7000 // 7 segundos de viaje de demostración
    );
  };

  // Confirmar entrega en el backend
  const handleCompleteDelivery = async (orderId) => {
    try {
      const res = await request(`/pedidos/${orderId}/status`, {
        method: 'PUT',
        body: { estado: 'entregado' }
      });
      if (res.status === 'success') {
        setAlertMsg({ type: 'success', text: `¡Felicidades! Pedido #${orderId} entregado exitosamente.` });
        fetchAssignedOrders(activeDriverId);
        fetchOrders(); // Actualiza el Dashboard del Admin al instante
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  

  const driverOptions = [
    { value: '', label: 'Seleccionar Repartidor Simulado...' },
    ...drivers.map(d => ({ value: d.id, label: `Simular: ${d.nombre}` }))
  ];

  return (
    <div className={styles.layout}>
      <div className={styles.column}>
        
        {/* Selector de chofer para Administrador */}
        {user?.rol === 'admin' && (
          <Card 
            title="Consola de Simulación Móvil" 
            subtitle="Permite a los administradores suplantar un móvil de repartidor para testear la sincronización"
            style={{ width: '375px', padding: '16px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input
                type="select"
                value={activeDriverId}
                onChange={handleSelectDriver}
                options={driverOptions}
              />
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleOpenDriverModal}
                icon={Plus}
              >
                Registrar nuevo repartidor
              </Button>
            </div>
          </Card>
        )}

        {/* Simulador Físico de Pantalla Móvil */}
        {activeDriverId ? (
          <div className={styles.mobileContainer}>
            {/* Altavoz simulado superior */}
            <div className={styles.mobileSpeaker} />

            {/* Encabezado del Móvil */}
            <div className={styles.mobileHeader}>
              <Smartphone size={20} style={{ color: '#00f2fe', marginBottom: '4px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#f3f4f6' }}>LOGIXA DELIVERY MOBILE</h3>
              <p style={{ fontSize: '11px', color: '#6b7280', fontWeight: '500', marginTop: '2px' }}>
                Conectado como Repartidor
              </p>
            </div>

            {/* Cuerpo del Móvil */}
            <div className={styles.mobileBody}>
              {alertMsg.text && (
                <Alert 
                  type={alertMsg.type} 
                  message={alertMsg.text} 
                  onClose={() => setAlertMsg({ text: '' })} 
                  style={{ fontSize: '11px', padding: '8px 12px' }}
                />
              )}

              {/* Widget de coordenadas simuladas */}
              {currentCoords && (
                <div className={styles.coordsWidget}>
                  <span>📍 Coordenadas GPS:</span>
                  <span>{currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}</span>
                </div>
              )}

              <h4 className={styles.ordersHeader}>
                Pedidos Asignados
              </h4>

              {driverOrders.length === 0 ? (
                <div className={styles.emptyOrders}>
                  No tienes pedidos pendientes asignados hoy. ¡Buen trabajo!
                </div>
              ) : (
                driverOrders.map(order => {
                  const isSimulating = simulatingOrderId === order.id;
                  const isArrived = currentCoords && 
                    Math.abs(currentCoords.lat - parseFloat(order.cliente_latitud)) < 0.0001 &&
                    Math.abs(currentCoords.lng - parseFloat(order.cliente_longitud)) < 0.0001;

                  return (
                    <div key={order.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: '#f3f4f6' }}>Envío #{order.id}</span>
                        <span className={styles.orderStatus}>EN RUTA</span>
                      </div>

                      <div className={styles.orderInfo}>
                        <strong style={{ color: '#f3f4f6' }}>{order.cliente_nombre}</strong><br/>
                        🏠 {order.cliente_direccion}<br/>
                        📞 {order.cliente_telefono || 'Sin teléfono'}
                      </div>

                      <div className={styles.orderFooter}>
                        📦 Llevar: {order.cantidad}x {order.producto_nombre}
                      </div>

                      {!isArrived && !isSimulating && (
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className={`${styles.simulateButton} w-full mt-2`}
                          onClick={() => handleStartDeliveryRoute(order)}
                          icon={Play}
                        >
                          Iniciar Navegación GPS
                        </Button>
                      )}

                      {isSimulating && (
                        <div className={styles.simulatingBox}>
                          <Truck size={14} /> Viajando en Ruta Activa...
                        </div>
                      )}

                      {isArrived && (
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={() => handleCompleteDelivery(order.id)}
                          icon={Check}
                        >
                          Registrar Entrega
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className={styles.emptyOrders}>
            Selecciona un repartidor para iniciar la simulación del portal móvil.
          </div>
        )}
      </div>

      <Modal
        isOpen={isDriverModalOpen}
        onClose={handleCloseDriverModal}
        title="Registrar nuevo repartidor"
        footer={(
          <>
            <Button variant="secondary" onClick={handleCloseDriverModal}>Cancelar</Button>
            <Button variant="primary" onClick={handleRegisterDriver}>Guardar repartidor</Button>
          </>
        )}
        size="sm"
      >
        <form onSubmit={handleRegisterDriver} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Nombre completo"
            value={newDriverForm.nombre}
            onChange={e => setNewDriverForm({ ...newDriverForm, nombre: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={newDriverForm.email}
            onChange={e => setNewDriverForm({ ...newDriverForm, email: e.target.value })}
            required
          />
          <Input
            label="Contraseña"
            type="password"
            value={newDriverForm.password}
            onChange={e => setNewDriverForm({ ...newDriverForm, password: e.target.value })}
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default Repartidores;
