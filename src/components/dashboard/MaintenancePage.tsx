
import { useApp } from '../../context/AppContext';
import AuthPage from '../auth/AuthPage';

export default function MaintenancePage() {
    const { maintenanceSettings } = useApp();

    const title = maintenanceSettings.messageTitle || '🚧 FlavrHunt is under maintenance 🚧';
    const desc = maintenanceSettings.messageDescription || "We're performing scheduled maintenance. Please check back shortly.";
    const eta = maintenanceSettings.eta || '';

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F7F7F8',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}>
            <div style={{
                textAlign: 'center',
                marginBottom: '32px',
                maxWidth: '560px',
                padding: '0 24px'
            }}>
                <h1 style={{
                    marginBottom: 12,
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#111111',
                    letterSpacing: '-0.5px'
                }}>
                    {title}
                </h1>
                <p style={{
                    marginBottom: 16,
                    color: '#6B7280',
                    fontSize: '16px',
                    lineHeight: 1.6,
                    fontWeight: 400
                }}>
                    {desc}
                </p>
                {eta && (
                    <div style={{
                        display: 'inline-block',
                        background: 'rgba(255, 122, 24, 0.08)',
                        color: '#FF7A18',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: 600,
                        fontSize: '14px',
                        marginBottom: 20,
                        border: '1px solid rgba(255, 122, 24, 0.15)'
                    }}>
                        🕐 {eta}
                    </div>
                )}
            </div>

            {/* Allow admin login - AuthPage will enforce only admin login during maintenance */}
            <AuthPage />
        </div>
    );
}
