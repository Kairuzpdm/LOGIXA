import React, { useState } from 'react';
import { Package, Users, Plus, Trash2, Tag, Smartphone, MapPin, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useFetch from '../hooks/useFetch';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import styles from '../styles/CRM_ERP.module.css';

const CRM_ERP = () => {
  const { products, clients, fetchProducts, fetchClients } = useApp();
  const { request, loading, error } = useFetch();
  
  const [activeSubTab, setActiveSubTab] = useState('products'); // 'products' o 'clients'
  const [alertMsg, setAlertMsg] = useState({ type: 'success', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de los Formularios
  const [prodForm, setProdForm] = useState({ nombre: '', descripcion: '', precio: '', stock: '', sku: '' });
  const [clientForm, setClientForm] = useState({ nombre: '', email: '', telefono: '', direccion: '', latitud: '', longitud: '' });

  
  

  // Autocompletar coordenadas de Tarija aleatorias dentro de los límites operacionales
  const fillTarijaCoordinates = () => {
    // Rango operacional: Latitud -21.55 a -21.52, Longitud -64.76 a -64.70
    const randomLat = (-21.55 + Math.random() * 0.03).toFixed(8);
    const randomLng = (-64.76 + Math.random() * 0.06).toFixed(8);
    setClientForm(prev => ({
      ...prev,
      latitud: randomLat,
      longitud: randomLng
    }));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await request('/productos', {
        method: 'POST',
        body: prodForm
      });
      if (res.status === 'success') {
        setAlertMsg({ type: 'success', text: 'Producto registrado exitosamente en el ERP.' });
        setProdForm({ nombre: '', descripcion: '', precio: '', stock: '', sku: '' });
        setIsModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await request('/clientes', {
        method: 'POST',
        body: clientForm
      });
      if (res.status === 'success') {
        setAlertMsg({ type: 'success', text: 'Cliente registrado exitosamente en el CRM.' });
        setClientForm({ nombre: '', email: '', telefono: '', direccion: '', latitud: '', longitud: '' });
        setIsModalOpen(false);
        fetchClients();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto del inventario?')) return;
    try {
      const res = await request(`/productos/${id}`, { method: 'DELETE' });
      if (res.status === 'success') {
        setAlertMsg({ type: 'success', text: 'Producto eliminado correctamente.' });
        fetchProducts();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteClient = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este cliente de la base de datos?')) return;
    try {
      const res = await request(`/clientes/${id}`, { method: 'DELETE' });
      if (res.status === 'success') {
        setAlertMsg({ type: 'success', text: 'Cliente eliminado de forma permanente.' });
        fetchClients();
      }
    } catch (err) {
      setAlertMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className={styles.grid}>
      <div className={styles.tabs}>
        <button
          onClick={() => { setActiveSubTab('products'); setAlertMsg({ text: '' }); }}
          className={`${styles.tabButton} ${activeSubTab === 'products' ? styles.active : ''}`}
        >
          <Package size={18} />
          Inventario ERP (Productos)
        </button>
        <button
          onClick={() => { setActiveSubTab('clients'); setAlertMsg({ text: '' }); }}
          className={`${styles.tabButton} ${activeSubTab === 'clients' ? styles.active : ''}`}
        >
          <Users size={18} />
          Clientes CRM (Base de Datos)
        </button>
      </div>

      {alertMsg.text && (
        <Alert 
          type={alertMsg.type} 
          message={alertMsg.text} 
          onClose={() => setAlertMsg({ text: '' })} 
        />
      )}

      {/* 1. SECCIÓN DE INVENTARIO ERP */}
      {activeSubTab === 'products' && (
        <Card
          title="Gestión de Stock e Inventario"
          subtitle="Lista general de mercancías cargadas en almacén"
          actions={
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} icon={Plus}>
              Nuevo Producto
            </Button>
          }
        >
          <div className={styles.sectionBody}>
            <div className={activeSubTab === 'products' ? styles.tableHeaderProducts : styles.tableHeaderClients}>
              <span>SKU / CÓDIGO</span>
              <span>NOMBRE DEL PRODUCTO</span>
              <span>PRECIO UNIT.</span>
              <span>STOCK</span>
              <span className={styles.alignRight}>ACCIONES</span>
            </div>

            {products.length === 0 ? (
              <div className={styles.emptyMessage}>
                No hay productos en inventario. Comienza agregando uno nuevo.
              </div>
            ) : (
              products.map(prod => (
                <div key={prod.id} className={styles.tableRowProducts}>
                  <span className={styles.skuLabel}>{prod.sku}</span>
                  <span className={styles.productName}>{prod.nombre}</span>
                  <span className={styles.productPrice}>€{parseFloat(prod.precio).toFixed(2)}</span>
                  <span className={`${styles.stockValue} ${prod.stock <= 5 ? styles.stockCritical : ''}`.trim()}>
                    {prod.stock} {prod.stock <= 5 && <span className={styles.lowBadge}>(BAJO)</span>}
                  </span>
                  <div className={styles.actionsRight}>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(prod.id)}>
                      <Trash2 size={14} className={styles.dangerIcon} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* 2. SECCIÓN DE CLIENTES CRM */}
      {activeSubTab === 'clients' && (
        <Card
          title="Directorio de Clientes CRM"
          subtitle="Base de datos geolocalizada para entregas urbanas"
          actions={
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} icon={Plus}>
              Registrar Cliente
            </Button>
          }
        >
          <div className={styles.sectionBody}>
            <div className={activeSubTab === 'products' ? styles.tableHeaderProducts : styles.tableHeaderClients}>
              <span>NOMBRE COMPLETO</span>
              <span>DIRECCIÓN</span>
              <span>TELÉFONO</span>
              <span>COORDENADAS GPS</span>
              <span className={styles.alignRight}>ACCIONES</span>
            </div>

            {clients.length === 0 ? (
              <div className={styles.emptyMessage}>
                No hay clientes registrados en la plataforma.
              </div>
            ) : (
              clients.map(cli => (
                <div key={cli.id} className={styles.tableRowClients}>
                  <span className={styles.clientName}>{cli.nombre}</span>
                  <span className={styles.clientAddress}>{cli.direccion}</span>
                  <span>{cli.telefono || 'N/A'}</span>
                  <span className={styles.clientCoords}>
                    {parseFloat(cli.latitud).toFixed(5)}, {parseFloat(cli.longitud).toFixed(5)}
                  </span>
                  <div className={styles.actionsRight}>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteClient(cli.id)}>
                      <Trash2 size={14} className={styles.dangerIcon} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* MODAL DE CREACIÓN DINÁMICO */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={activeSubTab === 'products' ? 'Añadir Producto al ERP' : 'Registrar Cliente en CRM'}
        size="md"
      >
        {activeSubTab === 'products' ? (
          <form onSubmit={handleProductSubmit} className={styles.modalForm}>
            <Input
              label="Nombre del Producto"
              placeholder="Ej. Silla Ergonómica Premium"
              value={prodForm.nombre}
              onChange={e => setProdForm({...prodForm, nombre: e.target.value})}
              required
            />
            <div className={styles.modalRow}>
              <Input
                label="Código SKU"
                placeholder="Ej. SKU-OFF-CHAIR"
                value={prodForm.sku}
                onChange={e => setProdForm({...prodForm, sku: e.target.value})}
                required
                className={styles.flexGrow}
              />
              <Input
                type="number"
                label="Precio unitario (€)"
                placeholder="Ej. 149.99"
                value={prodForm.precio}
                onChange={e => setProdForm({...prodForm, precio: e.target.value})}
                required
                className={styles.flexGrow}
              />
            </div>
            <Input
              type="number"
              label="Stock Inicial"
              placeholder="Ej. 10"
              value={prodForm.stock}
              onChange={e => setProdForm({...prodForm, stock: e.target.value})}
              required
            />
            <Input
              type="textarea"
              label="Descripción del Producto"
              placeholder="Escribe detalles del artículo..."
              value={prodForm.descripcion}
              onChange={e => setProdForm({...prodForm, descripcion: e.target.value})}
            />
            <div className={styles.formFooter}>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={loading}>Guardar Producto</Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleClientSubmit} className={styles.modalForm}>
            <Input
              label="Nombre Completo"
              placeholder="Ej. Sofía Martínez"
              value={clientForm.nombre}
              onChange={e => setClientForm({...clientForm, nombre: e.target.value})}
              required
            />
            <div className={styles.modalRow}>
              <Input
                type="email"
                label="Correo Electrónico"
                placeholder="sofia@gmail.com"
                value={clientForm.email}
                onChange={e => setClientForm({...clientForm, email: e.target.value})}
                className={styles.flexGrow}
              />
              <Input
                label="Teléfono Móvil"
                placeholder="+34600000000"
                value={clientForm.telefono}
                onChange={e => setClientForm({...clientForm, telefono: e.target.value})}
                className={styles.flexGrow}
              />
            </div>
            <Input
              label="Dirección de Envío"
              placeholder="Ej. Avenida La Plata, 123, Tarija"
              value={clientForm.direccion}
              onChange={e => setClientForm({...clientForm, direccion: e.target.value})}
              required
            />

            <div className={styles.coordsBox}>
              <div className={styles.coordsHeader}>
                <span className={styles.coordsLabel}>Coordenadas GPS (Para el Mapa)</span>
                <Button variant="outline" size="sm" onClick={fillTarijaCoordinates}>
                  📍 Simular GPS Tarija
                </Button>
              </div>
              <div className={styles.coordsRow}>
                <Input
                  type="number"
                  label="Latitud"
                  placeholder="Ej. -21.53555"
                  value={clientForm.latitud}
                  onChange={e => setClientForm({...clientForm, latitud: e.target.value})}
                  required
                  className={styles.flexGrow}
                />
                <Input
                  type="number"
                  label="Longitud"
                  placeholder="Ej. -64.72900"
                  value={clientForm.longitud}
                  onChange={e => setClientForm({...clientForm, longitud: e.target.value})}
                  required
                  className={styles.flexGrow}
                />
              </div>
            </div>

            <div className={styles.formFooter}>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" variant="primary" disabled={loading}>Registrar Cliente</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default CRM_ERP;
