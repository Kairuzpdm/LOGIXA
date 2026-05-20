import React from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import styles from '../../styles/Dashboard.module.css';

const CreateOrderModal = ({
  isOpen,
  onClose,
  loading,
  orderForm,
  setOrderForm,
  clientOptions,
  productOptions,
  onSubmit
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Pedido y Reservar Stock (ERP)"
    >
      <form onSubmit={onSubmit} className={styles.modalGrid}>
        <Input
          type="select"
          label="Cliente Destinatario (CRM)"
          value={orderForm.cliente_id}
          onChange={e => setOrderForm({ ...orderForm, cliente_id: e.target.value })}
          options={clientOptions}
          required
        />

        <Input
          type="select"
          label="Producto en Catálogo (ERP)"
          value={orderForm.producto_id}
          onChange={e => setOrderForm({ ...orderForm, producto_id: e.target.value })}
          options={productOptions}
          required
        />

        <Input
          type="number"
          label="Cantidad a Despachar"
          placeholder="Ej. 1"
          value={orderForm.cantidad}
          onChange={e => setOrderForm({ ...orderForm, cantidad: e.target.value })}
          required
        />

        <div className={styles.modalFooter}>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={loading}>Generar Envío</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrderModal;
