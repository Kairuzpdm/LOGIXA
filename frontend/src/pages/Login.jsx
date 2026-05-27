import React, { useState } from 'react';
import { Mail, Lock, LogIn, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useFetch from '../hooks/useFetch';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import Card from '../components/common/Card';
import styles from '../styles/Login.module.css';

const Login = () => {
  const { loginUser } = useApp();
  const { request, loading, error } = useFetch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [customError, setCustomError] = useState(null);

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#0b0f19',
    padding: '20px',
    background: 'radial-gradient(circle at top right, rgba(0, 242, 254, 0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(127, 0, 255, 0.08), transparent 40%)'
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setCustomError(null);
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: { email, password }
      });
      if (res.status === 'success') {
        loginUser(res.usuario, res.token);
      }
    } catch (err) {
      setCustomError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className={styles.container}>
      <Card 
        style={{ width: '100%', maxWidth: '420px' }} 
        className={`pulse-shadow ${styles.card}`.trim()}
      >
        <div className={styles.hero}>
          <div className={styles.logoBox}>
            <TrendingUp size={28} />
          </div>
          <h1 className={styles.title}>
            LOGIXA <span className="text-gradient">SYSTEM</span>
          </h1>
          <p className={styles.subtitle}>
            Plataforma de Logística Urbana y ERP/CRM
          </p>
        </div>

        {(error || customError) && (
          <Alert 
            type="error" 
            message={customError || error} 
            className={styles.alertMargin} 
            onClose={() => setCustomError(null)} 
          />
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          <Input
            type="email"
            label="Correo Electrónico"
            placeholder="ejemplo@logistica.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={Mail}
          />

          <Input
            type="password"
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={Lock}
          />

          <Button 
            type="submit" 
            disabled={loading} 
            variant="primary" 
            size="lg"
            className={styles.submitButton}
            icon={LogIn}
          >
            {loading ? 'Validando...' : 'Entrar al Sistema'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Login;
