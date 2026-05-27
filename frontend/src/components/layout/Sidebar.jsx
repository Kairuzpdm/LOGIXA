import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  LogOut, 
  TrendingUp 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import styles from '../../styles/layout/Sidebar.module.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logoutUser } = useApp();

  if (!user) return null;

  return (
    <aside className={styles.sidebar}>
      <div>
        <div className={styles.logoContainer}>
          <TrendingUp size={28} className={styles.logoIcon} />
          <div className={styles.logoText}>
            <h2 className={styles.logoTitle}>
              LOGIXA <span className={styles.logoTitleAccent}>ERP</span>
            </h2>
            <p className={styles.logoSubtitle}>Urban Logistics</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {user.rol === 'admin' && (
              <>
                <li>
                  <button 
                    className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <LayoutDashboard size={18} />
                    <span>Control de Logística</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`${styles.navItem} ${activeTab === 'crm_erp' ? styles.active : ''}`}
                    onClick={() => setActiveTab('crm_erp')}
                  >
                    <Package size={18} />
                    <span>CRM & ERP (Stock/Clientes)</span>
                  </button>
                </li>
              </>
            )}
            <li>
              <button 
                className={`${styles.navItem} ${activeTab === 'simulador' ? styles.active : ''}`}
                onClick={() => setActiveTab('simulador')}
              >
                <MapPin size={18} />
                <span>Simulador Repartidor</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div className={styles.footerSection}>
        <div className={styles.userCard}>
          <div className={styles.userInfoRow}>
            <div className={styles.userAvatar}>
              {user.nombre.charAt(0)}
            </div>
            <div>
              <h4 className={styles.userName}>{user.nombre}</h4>
              <p className={styles.userRole}>{user.rol}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={logoutUser}
          className={styles.logoutButton}
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
