import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  MapPin, 
  LogOut, 
  User, 
  TrendingUp 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logoutUser } = useApp();

  if (!user) return null;

  const sidebarStyle = {
    width: '260px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 16px',
    backgroundColor: '#0e1424',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    flexShrink: 0
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingLeft: '12px',
    marginBottom: '32px'
  };

  const navListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    listStyle: 'none'
  };

  const getNavItemStyle = (tabName) => {
    const isActive = activeTab === tabName;
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '10px',
      color: isActive ? '#0b0f19' : '#9ca3af',
      background: isActive ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' : 'transparent',
      fontWeight: '600',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      border: 'none',
      width: '100%',
      textAlign: 'left',
      boxShadow: isActive ? '0 4px 15px rgba(0, 242, 254, 0.25)' : 'none'
    };
  };

  const userCardStyle = {
    padding: '14px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px'
  };

  return (
    <aside style={sidebarStyle}>
      <div>
        <div style={logoContainerStyle}>
          <TrendingUp size={28} style={{ color: '#00f2fe' }} />
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.5px' }}>
              LOGIXA <span style={{ color: '#00f2fe' }}>ERP</span>
            </h2>
            <p style={{ fontSize: '10px', color: '#6b7280', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Urban Logistics
            </p>
          </div>
        </div>

        <nav>
          <ul style={navListStyle}>
            {user.rol === 'admin' && (
              <>
                <li>
                  <button 
                    style={getNavItemStyle('dashboard')} 
                    onClick={() => setActiveTab('dashboard')}
                  >
                    <LayoutDashboard size={18} />
                    <span>Control de Logística</span>
                  </button>
                </li>
                <li>
                  <button 
                    style={getNavItemStyle('crm_erp')} 
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
                style={getNavItemStyle('simulador')} 
                onClick={() => setActiveTab('simulador')}
              >
                <MapPin size={18} />
                <span>Simulador Repartidor</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      <div>
        <div style={userCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#00f2fe',
              color: '#0b0f19',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '14px'
            }}>
              {user.nombre.charAt(0)}
            </div>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: '600' }}>{user.nombre}</h4>
              <p style={{ fontSize: '11px', color: '#6b7280', textTransform: 'capitalize' }}>{user.rol}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={logoutUser}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '10px',
            color: '#ff007f',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 0, 127, 0.15)',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 0, 127, 0.08)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
