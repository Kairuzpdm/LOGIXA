import React from 'react';
import { UserCheck } from 'lucide-react';
import Button from '../common/Button';
import styles from '../../styles/Dashboard.module.css';

const OrderCard = ({ order, onAssign }) => {
  return (
    <div className={styles.orderCard}>
      <div className={styles.orderMeta}>
        <span className={styles.orderId}>Pedido #{order.id}</span>
        <span className={`${styles.orderStatus} ${styles[order.estado] || ''}`.trim()}>
          {order.estado}
        </span>
      </div>

      <div className={styles.orderInfo}>
        <strong>Cliente:</strong> {order.cliente_nombre}
        <br />
        <span className={styles.orderAddress}>📍 {order.cliente_direccion}</span>
      </div>

      <div className={styles.orderFooter}>
         {order.cantidad}x {order.producto_nombre}
      </div>

      {order.estado === 'pendiente' && (
        <Button
          variant="secondary"
          size="sm"
          className={styles.fullWidthButton}
          onClick={() => onAssign(order)}
          icon={UserCheck}
        >
          Asignar Repartidor
        </Button>
      )}

      {order.estado === 'en_ruta' && (
        <div className={styles.orderStatusNote}>
          Asignado a: {order.repartidor_nombre}
        </div>
      )}

      {order.estado === 'entregado' && (
        <div className={`${styles.orderStatusNote} ${styles.successNote}`.trim()}>
          ✓ Entregado el: {new Date(order.fecha_entrega).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
