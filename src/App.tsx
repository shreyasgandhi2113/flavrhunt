import { useEffect, useState } from 'react';
import { useApp } from './context/AppContext';
import AuthPage from './components/auth/AuthPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import MaintenancePage from './components/dashboard/MaintenancePage';
import './index.css';

function App() {
  const { currentUser, maintenanceStatus, maintenanceStartTime, setMaintenanceStatus } = useApp();
  const [remaining, setRemaining] = useState<number | null>(null);
  const [acknowledged, setAcknowledged] = useState<boolean>(() => sessionStorage.getItem('flavrMaintenanceAcknowledged') === 'true');
  const DURATION = 30;

  useEffect(() => {
    let timer: number | undefined;

    const computeRemaining = () => {
      if (maintenanceStatus === 'pending' && maintenanceStartTime) {
        const elapsed = Math.floor((Date.now() - maintenanceStartTime) / 1000);
        const rem = DURATION - elapsed;
        setRemaining(rem > 0 ? rem : 0);
        if (rem <= 0) {
          // Activate maintenance
          localStorage.setItem('flavrMaintenanceStatus', 'active');
          setMaintenanceStatus('active');
        }
      } else {
        setRemaining(null);
      }
    };

    if (maintenanceStatus === 'pending') {
      computeRemaining();
      timer = window.setInterval(computeRemaining, 1000);
    }

    return () => { if (timer) window.clearInterval(timer); };
  }, [maintenanceStatus, maintenanceStartTime, setMaintenanceStatus]);

  // Clear per-tab acknowledgement when not pending anymore
  useEffect(() => {
    if (maintenanceStatus !== 'pending') {
      sessionStorage.removeItem('flavrMaintenanceAcknowledged');
      setAcknowledged(false);
    }
  }, [maintenanceStatus]);

  // Admin always sees admin dashboard
  if (currentUser?.role === 'admin') {
    return (
      <div style={{ position: 'relative' }}>
        <AdminDashboard />
        {maintenanceStatus === 'pending' && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, pointerEvents: 'auto' }}>
            <div style={{ background: 'rgba(0,0,0,0.6)', position: 'absolute', inset: 0 }} />
            <div style={{ position: 'relative', background: '#111827', color: 'white', padding: '28px', borderRadius: '12px', minWidth: '320px', textAlign: 'center' }}>
              <h2 style={{ margin: 0 }}>Maintenance Mode Starting Soon</h2>
              <p style={{ marginTop: 8 }}>The app will temporarily go offline in {DURATION} seconds.</p>
              <div style={{ marginTop: 12, fontSize: 36, fontWeight: 700 }}>{remaining ?? DURATION}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (maintenanceStatus === 'active') {
    return <MaintenancePage />;
  }

  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      {!currentUser ? <AuthPage /> : <Dashboard />}

      {/* Pending notification for regular users (non-blocking) */}
      {maintenanceStatus === 'pending' && (
        <>
          {!acknowledged ? (
            <div style={{ position: 'fixed', right: '50%', transform: 'translateX(50%)', top: 80, zIndex: 9999 }}>
              <div style={{ background: '#fef3c7', color: '#92400e', padding: '14px 18px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', minWidth: 320 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Maintenance Mode will start in {DURATION} seconds</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 20, fontWeight: 600 }}>{remaining ?? DURATION}s</div>
                  <button onClick={() => { sessionStorage.setItem('flavrMaintenanceAcknowledged', 'true'); setAcknowledged(true); }} style={{ marginLeft: 12, padding: '8px 12px', background: '#111827', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}>OK</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9999 }}>
              <div style={{ background: '#111827', color: 'white', padding: '10px 14px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.12)', minWidth: 160 }}>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>Maintenance starts in</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{remaining ?? DURATION}s</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
