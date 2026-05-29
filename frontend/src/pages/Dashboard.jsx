import React, { useState } from 'react';
import { 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Layers 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import useFetch from '../hooks/useFetch';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import MapPanel from '../components/dashboard/MapPanel';
import KpiCard from '../components/dashboard/KpiCard';
import OrderCard from '../components/dashboard/OrderCard';
import CreateOrderModal from '../components/dashboard/CreateOrderModal';
import AssignDriverModal from '../components/dashboard/AssignDriverModal';
import { buildSelectOptions } from '../utils/selectOptions';
import { buildDriverLocationMap } from '../utils/locationUtils';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const { 
    orders, 
    products, 
    clients, 
    drivers, 
    driverLocations, 
    warehouseCoords, 
    fetchOrders, 
    fetchProducts,
    fetchLocations
  } = useApp();

  const { request, loading } = useFetch();
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRefreshingLocations, setIsRefreshingLocations] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ type: 'success', text: '' });

  // Formulario de Pedido
  const [orderForm, setOrderForm] = useState({ cliente_id: '', producto_id: '', cantidad: 1 });
  // Formulario de Asignación
  const [assignForm, setAssignForm] = useState({ repartidor_id: '' });

  // Mapear localizaciones de choferes activas para el mapa
  const activeDriverLocations = buildDriverLocationMap(driverLocations);

  // Calcular KPIs del Dashboard
  const kpis = {
    total: orders.length,
    pendientes: orders.filter(o => o.estado === 'pendiente').length,
    enRuta: orders.filter(o => o.estado === 'en_ruta').length,
    entregados: orders.filter(o => o.estado === 'entregado').length,
    incidencias: orders.filter(o => o.estado === 'incidencia').length,
    stockCritico: products.filter(p => p.stock <= 5).length
  };

  
  

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.cliente_id || !orderForm.producto_id) {
      setAlertMsg({ type: 'error', text: 'Por favor, selecciona un cliente y un producto.' });
      return;
    }
    try {
      const res = await request('/pedidos', {
        method: 'POST',
        body: orderForm
      });
      if (res.status === 'success') {
        setAlertMsg({ type: 'success', text: 'Pedido registrado con éxito. Stock de inventario reservado.' });
        setOrderForm({ cliente_id: '', producto_id: '', cantidad: 1 });
        setIsOrderModalOpen(false);
        fetchOrders();
        fetchProducts(); // Actualizar el stock crítico en Dashboard
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  const handleAssignDriver = async (e) => {
    e.preventDefault();
    if (!assignForm.repartidor_id) {
      setAlertMsg({ type: 'error', text: 'Por favor, selecciona un repartidor.' });
      return;
    }
    try {
      const res = await request(`/pedidos/${selectedOrder.id}/assign`, {
        method: 'PUT',
        body: assignForm
      });
      if (res.status === 'success') {
        setAlertMsg({ type: 'success', text: `Pedido #${selectedOrder.id} asignado e iniciado en ruta.` });
        setIsAssignModalOpen(false);
        setSelectedOrder(null);
        setAssignForm({ repartidor_id: '' });
        fetchOrders();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  const handleRefreshLocations = async () => {
    setIsRefreshingLocations(true);
    await fetchLocations();
    setIsRefreshingLocations(false);
  };

  // Preparar opciones de selectors
  const clientOptions = buildSelectOptions(clients, {
    placeholder: 'Seleccionar Cliente...',
    mapper: (c) => ({ value: c.id, label: `${c.nombre} (${c.direccion})` })
  });

  const productOptions = buildSelectOptions(products, {
    placeholder: 'Seleccionar Producto...',
    mapper: (p) => ({ value: p.id, label: `${p.nombre} (Stock: ${p.stock})` })
  });

  const driverOptions = buildSelectOptions(drivers, {
    placeholder: 'Seleccionar Repartidor...',
    mapper: (d) => ({ value: d.id, label: d.nombre })
  });

  return (
    <div className={styles.container}>
      {/* Encabezado */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>
            Panel de Control de Logística Urbana
          </h1>
          <p className={styles.headerSubtitle}>
            Distribución de pedidos, ruteo inteligente y geomonitoreo en vivo
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsOrderModalOpen(true)} icon={Plus}>
          Nuevo Pedido Logístico
        </Button>
      </div>

      {alertMsg.text && (
        <Alert 
          type={alertMsg.type} 
          message={alertMsg.text} 
          onClose={() => setAlertMsg({ text: '' })} 
        />
      )}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <KpiCard
          title="PEDIDOS HOY"
          value={kpis.total}
          Icon={Layers}
          iconClassName={styles.primaryIcon}
        />
        <KpiCard
          title="PENDIENTES"
          value={kpis.pendientes}
          Icon={AlertCircle}
          iconClassName={styles.warningIcon}
          valueClassName={styles.pendingValue}
        />
        <KpiCard
          title="EN RUTA ACTIVA"
          value={kpis.enRuta}
          Icon={Truck}
          iconClassName={styles.infoIcon}
          valueClassName={styles.routeValue}
        />
        <KpiCard
          title="ENTREGADOS"
          value={kpis.entregados}
          Icon={CheckCircle}
          iconClassName={styles.successIcon}
          valueClassName={styles.successValue}
        />
        <KpiCard
          title="STOCK CRÍTICO"
          value={kpis.stockCritico}
          Icon={AlertCircle}
          iconClassName={styles.dangerIcon}
          valueClassName={styles.dangerValue}
        />
      </div>

      {/* Main Grid: Mapa + Panel de Distribución */}
      <div className={styles.mainLayout}>
        {/* Mapa Leaflet */}
        <MapPanel
          orders={orders}
          drivers={driverLocations}
          activeDriverLocations={activeDriverLocations}
          warehouseCoords={warehouseCoords}
          onRefreshLocations={handleRefreshLocations}
          isRefreshingLocations={isRefreshingLocations}
        />

        {/* Panel de Ordenes y Despacho */}
        <Card 
          title="Consola de Despacho" 
          subtitle="Lista de distribución del día"
          className={styles.dispatchCard}
        >
          <div className={styles.orderList}>
            {orders.length === 0 ? (
              <div className={styles.orderEmpty}>
                No hay pedidos logísticos hoy.
              </div>
            ) : (
              orders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAssign={(orderToAssign) => {
                    setSelectedOrder(orderToAssign);
                    setIsAssignModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        </Card>
      </div>

      <CreateOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        loading={loading}
        orderForm={orderForm}
        setOrderForm={setOrderForm}
        clientOptions={clientOptions}
        productOptions={productOptions}
        onSubmit={handleCreateOrder}
      />

      <AssignDriverModal
        isOpen={isAssignModalOpen}
        onClose={() => { setIsAssignModalOpen(false); setSelectedOrder(null); }}
        selectedOrder={selectedOrder}
        assignForm={assignForm}
        setAssignForm={setAssignForm}
        driverOptions={driverOptions}
        onSubmit={handleAssignDriver}
        loading={loading}
      />
    </div>
  );
};

export default Dashboard;
