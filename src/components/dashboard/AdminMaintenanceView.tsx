import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const AdminMaintenanceView: React.FC = () => {
    const { maintenanceStatus, setMaintenanceStatus, setMaintenanceStartTime } = useApp();
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Auth State
    const [admin1User, setAdmin1User] = useState('');
    const [admin1Pass, setAdmin1Pass] = useState('');
    const [admin2User, setAdmin2User] = useState('');
    const [admin2Pass, setAdmin2Pass] = useState('');
    const [error, setError] = useState('');

    const handleStartMaintenance = () => {
        setShowAuthModal(true);
        setError('');
        setAdmin1User(''); setAdmin1Pass('');
        setAdmin2User(''); setAdmin2Pass('');
    };

    const verifyAndEnable = () => {
        // Hardcoded checks against context logic (duplicated here for UI flow, or strictly checking specific strings)
        // Admin 1: shreyas gandhi / adminflavrhunt
        // Admin 2: raj vishwakarma / adminflavrhunt

        const valid1 = admin1User.trim().toLowerCase() === 'shreyas gandhi' && admin1Pass.trim() === 'adminflavrhunt';
        const valid2 = admin2User.trim().toLowerCase() === 'raj vishwakarma' && admin2Pass.trim() === 'adminflavrhunt';

        if (valid1 && valid2) {
            if (window.confirm("Are you sure? This will schedule maintenance for all users.")) {
                const start = Date.now();
                setMaintenanceStatus('pending');
                setMaintenanceStartTime(start);
                // also persist via localStorage to ensure other tabs get event immediately
                localStorage.setItem('flavrMaintenanceStatus', 'pending');
                localStorage.setItem('flavrMaintenanceStartTime', start.toString());
                setShowAuthModal(false);
            }
        } else {
            setError('Invalid credentials for one or both admins.');
        }
    };

    const handleGoLive = () => {
        if (window.confirm("Are you sure you want to go live? Users will be able to access the app.")) {
            setMaintenanceStatus('off');
            setMaintenanceStartTime(null);
            localStorage.setItem('flavrMaintenanceStatus', 'off');
            localStorage.removeItem('flavrMaintenanceStartTime');
        }
    };

    return (
        <div className="admin-view" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="admin-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2>System Maintenance</h2>
                <p style={{ color: '#6b7280' }}>Control system availability and maintenance modes.</p>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: maintenanceStatus === 'active' ? '#fee2e2' : '#d1fae5',
                    color: maintenanceStatus === 'active' ? '#ef4444' : '#059669',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px', margin: '0 auto 20px auto'
                }}>
                    {maintenanceStatus === 'active' ? '⚠️' : '✅'}
                </div>

                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>
                    Status: <span style={{ color: maintenanceStatus === 'active' ? '#ef4444' : '#059669' }}>{maintenanceStatus === 'active' ? 'Under Maintenance' : maintenanceStatus === 'pending' ? 'Pending' : 'Live'}</span>
                </h3>

                <p style={{ color: '#6b7280', marginBottom: '30px' }}>
                    {maintenanceStatus === 'active'
                        ? 'The application is currently inaccessible to users. Only admins can login.'
                        : maintenanceStatus === 'pending'
                            ? 'Maintenance is scheduled. Users will be logged out shortly.'
                            : 'The application is live and accessible to all users.'}
                </p>

                {maintenanceStatus !== 'active' ? (
                    <button
                        onClick={handleStartMaintenance}
                        style={{
                            padding: '12px 24px', background: '#ef4444', color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
                        }}
                    >
                        Start Maintenance Mode
                    </button>
                ) : (
                    <button
                        onClick={handleGoLive}
                        style={{
                            padding: '12px 24px', background: '#059669', color: 'white',
                            border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
                        }}
                    >
                        Go Live
                    </button>
                )}
            </div>

            {/* Double Auth Modal */}
            {showAuthModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '500px' }}>
                        <h3 style={{ marginTop: 0 }}>Two-Admin Authentication Required</h3>
                        <p style={{ color: 'red', fontSize: '14px', marginBottom: '20px' }}>Both admins must authenticate to enable maintenance mode.</p>

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                            <div style={{ flex: 1 }}>
                                <h4>Admin 1</h4>
                                <input
                                    type="text" placeholder="Username"
                                    value={admin1User} onChange={e => setAdmin1User(e.target.value)}
                                    style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
                                />
                                <input
                                    type="password" placeholder="Password"
                                    value={admin1Pass} onChange={e => setAdmin1Pass(e.target.value)}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4>Admin 2</h4>
                                <input
                                    type="text" placeholder="Username"
                                    value={admin2User} onChange={e => setAdmin2User(e.target.value)}
                                    style={{ width: '100%', padding: '8px', marginBottom: '8px', boxSizing: 'border-box' }}
                                />
                                <input
                                    type="password" placeholder="Password"
                                    value={admin2Pass} onChange={e => setAdmin2Pass(e.target.value)}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                        <div style={{ display: 'flex', justifyContent: 'end', gap: '10px' }}>
                            <button onClick={() => setShowAuthModal(false)} style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={verifyAndEnable} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirm & Enable</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
