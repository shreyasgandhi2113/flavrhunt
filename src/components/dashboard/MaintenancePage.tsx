
import AuthPage from '../auth/AuthPage';

export default function MaintenancePage() {

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            <h1 style={{ marginBottom: 8 }}>🚧 FlavrHunt is under maintenance 🚧</h1>
            <p style={{ marginBottom: 20 }}>We're performing scheduled maintenance. Please check back shortly.</p>

            {/* Allow admin login - AuthPage will enforce only admin login during maintenance */}
            <AuthPage />
        </div>
    );
}
