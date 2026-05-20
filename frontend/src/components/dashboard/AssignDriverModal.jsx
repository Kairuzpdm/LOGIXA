import React from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import styles from '../../styles/Dashboard.module.css';

const AssignDriverModal = ({
  isOpen,
  onClose,
  selectedOrder,
  assignForm,
  setAssignForm,
  driverOptions,
  onSubmit,
  loading
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignar y Despachar Pedido"
    >
      {selectedOrder && (
        <form onSubmit={onSubmit} className={styles.modalGrid}>
          <div className={styles.assignmentBox}>
            <strong>Pedido #{selectedOrder.id}</strong>
            <br />
            Destinatario: {selectedOrder.cliente_nombre}
            <br />
            Mercancía: {selectedOrder.cantidad}x {selectedOrder.producto_nombre}
          </div>

          <Input
            type="select"
            label="Seleccionar Repartidor Disponible"
            value={assignForm.repartidor_id}
            onChange={e => setAssignForm({ ...assignForm, repartidor_id: e.target.value })}
            options={driverOptions}
            required
          />

          <div className={styles.modalFooter}>
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="success" disabled={loading}>Confirmar Despacho</Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default AssignDriverModal;
