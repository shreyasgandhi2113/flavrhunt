
import { useApp } from '../../context/AppContext';
import AuthPage from '../auth/AuthPage';

export default function MaintenancePage() {
    const { maintenanceSettings } = useApp();

    const title = maintenanceSettings.messageTitle || '🚧 FlavrHunt is under maintenance 🚧';
    const desc = maintenanceSettings.messageDescription || "We're performing scheduled maintenance. Please check back shortly.";
    const eta = maintenanceSettings.eta || '';

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px', maxWidth: '600px', padding: '0 24px' }}>
                <h1 style={{ marginBottom: 12, fontSize: '28px', color: '#1f2937' }}>{title}</h1>
                <p style={{ marginBottom: 16, color: '#4b5563', fontSize: '16px', lineHeight: 1.6 }}>{desc}</p>
                {eta && (
                    <div style={{
                        display: 'inline-block',
                        background: '#dbeafe', color: '#1e40af',
                        padding: '10px 20px', borderRadius: '8px',
                        fontWeight: 600, fontSize: '14px',
                        marginBottom: 20
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
