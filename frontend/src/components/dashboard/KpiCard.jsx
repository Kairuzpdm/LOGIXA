import React from 'react';
import Card from '../common/Card';
import styles from '../../styles/Dashboard.module.css';

const KpiCard = ({ title, value, Icon, iconClassName, valueClassName = '' }) => {
  return (
    <Card className={styles.kpiCard}>
      <div className={styles.cardHeader}>
        <span className={styles.cardHeaderLabel}>{title}</span>
        <Icon size={18} className={iconClassName} />
      </div>
      <h2 className={`${styles.kpiValue} ${valueClassName}`.trim()}>{value}</h2>
    </Card>
  );
};

export default KpiCard;
