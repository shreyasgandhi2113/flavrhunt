import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { addAdminLog } from '../../utils/adminUtils';
import type { MaintenanceSettings, DisabledFeatures } from '../../types';

const DEFAULT_DISABLED: DisabledFeatures = {
    postRecipes: false, comments: false, ratings: false,
    registration: false, search: false, editing: false
};

type SchedulingMode = 'immediate' | 'scheduled' | 'countdown';
type MaintenanceType = 'full' | 'partial';

// Status Badge Component
const StatusBadge: React.FC<{ status: 'off' | 'pending' | 'active'; hasSchedule: boolean }> = ({ status, hasSchedule }) => {
    const getConfig = () => {
        if (status === 'active') return { label: 'Maintenance Active', color: '#dc2626', bg: '#fee2e2', dot: '#dc2626' };
        if (status === 'pending' || hasSchedule) return { label: 'Maintenance Scheduled', color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' };
        return { label: 'System Live', color: '#059669', bg: '#d1fae5', dot: '#10b981' };
    };
    const cfg = getConfig();
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', background: cfg.bg, fontSize: '13px', fontWeight: 600, color: cfg.color }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.dot, display: 'inline-block', animation: status === 'active' ? 'pulse 1.5s infinite' : 'none' }} />
            System Status: {cfg.label}
            <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </div>
    );
};

// Toggle Switch Component
const Toggle: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({ label, checked, onChange, disabled }) => (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f3f4f6', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
        <span style={{ fontWeight: 500, fontSize: '14px' }}>{label}</span>
        <div style={{
            position: 'relative', width: '48px', height: '26px',
            backgroundColor: checked ? '#10b981' : '#d1d5db',
            borderRadius: '13px', transition: 'background-color 0.3s'
        }}>
            <div style={{
                position: 'absolute', top: '3px',
                left: checked ? '25px' : '3px',
                width: '20px', height: '20px',
                backgroundColor: 'white', borderRadius: '50%',
                transition: 'left 0.3s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
        </div>
        <input type="checkbox" checked={checked} onChange={e => !disabled && onChange(e.target.checked)} style={{ display: 'none' }} />
    </label>
);

export const AdminMaintenanceView: React.FC = () => {
    const {
        maintenanceStatus, setMaintenanceStatus, setMaintenanceStartTime,
        maintenanceSettings, setMaintenanceSettings, currentUser
    } = useApp();

    // Dual-admin auth state
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [admin1User, setAdmin1User] = useState('');
    const [admin1Pass, setAdmin1Pass] = useState('');
    const [admin2User, setAdmin2User] = useState('');
    const [admin2Pass, setAdmin2Pass] = useState('');
    const [authError, setAuthError] = useState('');

    // Local form state (mirrors maintenanceSettings for editing before applying)
    const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>(maintenanceSettings.maintenanceType);
    const [schedulingMode, setSchedulingMode] = useState<SchedulingMode>(maintenanceSettings.schedulingMode);
    const [startTime, setStartTime] = useState(maintenanceSettings.startTime || '');
    const [endTime, setEndTime] = useState(maintenanceSettings.endTime || '');
    const [countdownMinutes, setCountdownMinutes] = useState<number>(maintenanceSettings.countdownMinutes || 5);
    const [messageTitle, setMessageTitle] = useState(maintenanceSettings.messageTitle || '');
    const [messageDescription, setMessageDescription] = useState(maintenanceSettings.messageDescription || '');
    const [eta, setEta] = useState(maintenanceSettings.eta || '');
    const [disabledFeatures, setDisabledFeatures] = useState<DisabledFeatures>(maintenanceSettings.disabledFeatures || DEFAULT_DISABLED);

    // Countdown display
    const [countdownDisplay, setCountdownDisplay] = useState('');

    useEffect(() => {
        if (maintenanceSettings.schedulingMode !== 'countdown' || !maintenanceSettings.countdownStartedAt || !maintenanceSettings.countdownMinutes) {
            setCountdownDisplay('');
            return;
        }
        const interval = setInterval(() => {
            const elapsed = (Date.now() - maintenanceSettings.countdownStartedAt!) / 1000;
            const totalSec = maintenanceSettings.countdownMinutes! * 60;
            const remaining = Math.max(0, Math.ceil(totalSec - elapsed));
            const min = Math.floor(remaining / 60);
            const sec = remaining % 60;
            setCountdownDisplay(remaining > 0 ? `${min}m ${sec.toString().padStart(2, '0')}s` : 'Activating...');
        }, 1000);
        return () => clearInterval(interval);
    }, [maintenanceSettings.schedulingMode, maintenanceSettings.countdownStartedAt, maintenanceSettings.countdownMinutes]);

    // Scheduled time display
    const [scheduledRemaining, setScheduledRemaining] = useState('');
    useEffect(() => {
        if (maintenanceSettings.schedulingMode !== 'scheduled' || !maintenanceSettings.startTime) {
            setScheduledRemaining('');
            return;
        }
        const interval = setInterval(() => {
            const start = new Date(maintenanceSettings.startTime!).getTime();
            const now = Date.now();
            if (now < start) {
                const diff = Math.ceil((start - now) / 1000);
                const h = Math.floor(diff / 3600);
                const m = Math.floor((diff % 3600) / 60);
                const s = diff % 60;
                setScheduledRemaining(`${h}h ${m}m ${s}s`);
            } else {
                setScheduledRemaining('Active');
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [maintenanceSettings.schedulingMode, maintenanceSettings.startTime]);

    const hasSchedule = !!(maintenanceSettings.startTime || maintenanceSettings.countdownStartedAt);

    const handleStartMaintenance = () => {
        setShowAuthModal(true);
        setAuthError('');
        setAdmin1User(''); setAdmin1Pass('');
        setAdmin2User(''); setAdmin2Pass('');
    };

    const verifyAndEnable = () => {
        const valid1 = admin1User.trim().toLowerCase() === 'shreyas gandhi' && admin1Pass.trim() === 'adminflavrhunt';
        const valid2 = admin2User.trim().toLowerCase() === 'raj vishwakarma' && admin2Pass.trim() === 'adminflavrhunt';
        if (!(valid1 && valid2)) {
            setAuthError('Invalid credentials for one or both admins.');
            return;
        }

        const newSettings: MaintenanceSettings = {
            maintenanceActive: true,
            maintenanceType,
            schedulingMode,
            startTime: schedulingMode === 'scheduled' ? startTime : null,
            endTime: schedulingMode === 'scheduled' ? endTime : null,
            countdownMinutes: schedulingMode === 'countdown' ? countdownMinutes : null,
            countdownStartedAt: schedulingMode === 'countdown' ? Date.now() : null,
            messageTitle,
            messageDescription,
            eta,
            disabledFeatures: maintenanceType === 'partial' ? disabledFeatures : DEFAULT_DISABLED
        };

        if (schedulingMode === 'immediate') {
            if (maintenanceType === 'full') {
                const start = Date.now();
                setMaintenanceStatus('pending');
                setMaintenanceStartTime(start);
                localStorage.setItem('flavrMaintenanceStatus', 'pending');
                localStorage.setItem('flavrMaintenanceStartTime', start.toString());
            } else {
                // Partial maintenance — activate immediately, no full lockout
                setMaintenanceStatus('off');
            }
        } else if (schedulingMode === 'scheduled') {
            // Will auto-activate based on timer in AppContext
            setMaintenanceStatus('off');
        } else if (schedulingMode === 'countdown') {
            setMaintenanceStatus('pending');
            setMaintenanceStartTime(null);
        }

        setMaintenanceSettings(newSettings);
        setShowAuthModal(false);

        addAdminLog(currentUser?.username || 'Owner', `Started ${maintenanceType} maintenance (${schedulingMode})`, 'system', 'System');
    };

    const handleApplyPartialMaintenance = () => {
        const newSettings: MaintenanceSettings = {
            ...maintenanceSettings,
            maintenanceType: 'partial',
            disabledFeatures: disabledFeatures
        };
        setMaintenanceSettings(newSettings);
        addAdminLog(currentUser?.username || 'Owner', 'Updated partial maintenance features', 'system', 'System');
    };

    const handleSaveMessage = () => {
        setMaintenanceSettings({
            ...maintenanceSettings,
            messageTitle,
            messageDescription,
            eta
        });
        addAdminLog(currentUser?.username || 'Owner', 'Updated maintenance message', 'system', 'System');
    };

    const handleGoLive = () => {
        if (window.confirm('Are you sure you want to go live? All maintenance will be disabled.')) {
            setMaintenanceStatus('off');
            setMaintenanceStartTime(null);
            localStorage.setItem('flavrMaintenanceStatus', 'off');
            localStorage.removeItem('flavrMaintenanceStartTime');
            setMaintenanceSettings({
                maintenanceActive: false,
                maintenanceType: 'full',
                schedulingMode: 'immediate',
                startTime: null,
                endTime: null,
                countdownMinutes: null,
                countdownStartedAt: null,
                messageTitle: '',
                messageDescription: '',
                eta: '',
                disabledFeatures: DEFAULT_DISABLED
            });
            setDisabledFeatures(DEFAULT_DISABLED);
            setStartTime('');
            setEndTime('');
            setCountdownMinutes(5);
            setMessageTitle('');
            setMessageDescription('');
            setEta('');
            setMaintenanceType('full');
            setSchedulingMode('immediate');
            addAdminLog(currentUser?.username || 'Owner', 'Stopped maintenance mode', 'system', 'System');
        }
    };

    const sectionStyle: React.CSSProperties = {
        background: 'white', padding: '24px', borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', borderRadius: '8px',
        border: '1px solid #d1d5db', marginBottom: '12px', boxSizing: 'border-box',
        fontSize: '14px'
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Live Status Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Maintenance Management</h2>
                <StatusBadge status={maintenanceStatus} hasSchedule={hasSchedule} />
            </div>

            {/* Current Status Card */}
            <div style={sectionStyle}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: maintenanceStatus === 'active' ? '#fee2e2' : maintenanceStatus === 'pending' ? '#fef3c7' : '#d1fae5',
                        color: maintenanceStatus === 'active' ? '#ef4444' : maintenanceStatus === 'pending' ? '#d97706' : '#059669',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px', margin: '0 auto 16px auto'
                    }}>
                        {maintenanceStatus === 'active' ? '⚠️' : maintenanceStatus === 'pending' ? '⏳' : '✅'}
                    </div>
                    <h3 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>
                        Status: <span style={{ color: maintenanceStatus === 'active' ? '#ef4444' : maintenanceStatus === 'pending' ? '#d97706' : '#059669' }}>
                            {maintenanceStatus === 'active' ? 'Under Maintenance' : maintenanceStatus === 'pending' ? 'Pending' : 'Live'}
                        </span>
                    </h3>

                    {/* Active schedule info */}
                    {maintenanceSettings.schedulingMode === 'countdown' && countdownDisplay && maintenanceStatus !== 'active' && (
                        <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px', borderRadius: '8px', marginTop: '12px', fontWeight: 600 }}>
                            ⏱️ Countdown: {countdownDisplay}
                        </div>
                    )}
                    {maintenanceSettings.schedulingMode === 'scheduled' && scheduledRemaining && maintenanceStatus !== 'active' && (
                        <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px', borderRadius: '8px', marginTop: '12px', fontWeight: 600 }}>
                            📅 Starts in: {scheduledRemaining}
                        </div>
                    )}

                    {maintenanceSettings.maintenanceType === 'partial' && maintenanceSettings.maintenanceActive && (
                        <div style={{ background: '#dbeafe', color: '#1e40af', padding: '12px', borderRadius: '8px', marginTop: '12px', fontSize: '14px' }}>
                            Partial Maintenance — Some features are disabled.
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                        {(maintenanceStatus !== 'active' && !hasSchedule) && (
                            <button onClick={handleStartMaintenance} style={{
                                padding: '12px 28px', background: '#ef4444', color: 'white',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold'
                            }}>
                                Start Maintenance Mode
                            </button>
                        )}
                        {(maintenanceStatus === 'active' || maintenanceStatus === 'pending' || hasSchedule) && (
                            <button onClick={handleGoLive} style={{
                                padding: '12px 28px', background: '#059669', color: 'white',
                                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold'
                            }}>
                                Go Live
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Feature 2: Custom Maintenance Message */}
            <div style={sectionStyle}>
                <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✉️ Custom Maintenance Message
                </h3>
                <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
                    Customize the message shown to users when maintenance is active.
                </p>
                <label style={{ display: 'block', fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}>Title</label>
                <input
                    type="text"
                    placeholder="e.g. System Upgrade in Progress"
                    value={messageTitle}
                    onChange={e => setMessageTitle(e.target.value)}
                    style={inputStyle}
                />
                <label style={{ display: 'block', fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}>Description</label>
                <textarea
                    placeholder="e.g. We are improving recipe search performance..."
                    value={messageDescription}
                    onChange={e => setMessageDescription(e.target.value)}
                    rows={3}
                    style={{ ...inputStyle, resize: 'vertical' }}
                />
                <label style={{ display: 'block', fontWeight: 500, fontSize: '13px', marginBottom: '4px' }}>Estimated Return Time</label>
                <input
                    type="text"
                    placeholder="e.g. Back in approximately 30 minutes"
                    value={eta}
                    onChange={e => setEta(e.target.value)}
                    style={inputStyle}
                />
                <button onClick={handleSaveMessage} style={{
                    padding: '10px 20px', background: '#3b82f6', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px'
                }}>
                    Save Message
                </button>
            </div>

            {/* Feature 3: Partial Maintenance Mode */}
            <div style={sectionStyle}>
                <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🔧 Partial Maintenance Controls
                </h3>
                <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '16px' }}>
                    Instead of full shutdown, selectively disable features while keeping the platform accessible.
                </p>
                <Toggle label="Disable Recipe Posting" checked={disabledFeatures.postRecipes} onChange={v => setDisabledFeatures(prev => ({ ...prev, postRecipes: v }))} />
                <Toggle label="Disable Comments" checked={disabledFeatures.comments} onChange={v => setDisabledFeatures(prev => ({ ...prev, comments: v }))} />
                <Toggle label="Disable Recipe Ratings" checked={disabledFeatures.ratings} onChange={v => setDisabledFeatures(prev => ({ ...prev, ratings: v }))} />
                <Toggle label="Disable User Registration" checked={disabledFeatures.registration} onChange={v => setDisabledFeatures(prev => ({ ...prev, registration: v }))} />
                <Toggle label="Disable Search" checked={disabledFeatures.search} onChange={v => setDisabledFeatures(prev => ({ ...prev, search: v }))} />
                <Toggle label="Disable Recipe Editing" checked={disabledFeatures.editing} onChange={v => setDisabledFeatures(prev => ({ ...prev, editing: v }))} />
                <button onClick={handleApplyPartialMaintenance} style={{
                    padding: '10px 20px', background: '#f59e0b', color: 'white',
                    border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', marginTop: '16px'
                }}>
                    Apply Partial Maintenance
                </button>
            </div>

            {/* Dual-Admin Auth Modal */}
            {showAuthModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
                    <div style={{ background: 'white', padding: '28px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Two-Admin Authentication Required</h3>
                        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>Both admins must authenticate to enable maintenance mode.</p>

                        {/* Maintenance Type Selector */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Maintenance Type</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {(['full', 'partial'] as MaintenanceType[]).map(t => (
                                    <button key={t} onClick={() => setMaintenanceType(t)} style={{
                                        flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                                        background: maintenanceType === t ? (t === 'full' ? '#ef4444' : '#f59e0b') : '#f3f4f6',
                                        color: maintenanceType === t ? 'white' : '#374151',
                                        border: maintenanceType === t ? 'none' : '1px solid #d1d5db',
                                        textTransform: 'capitalize'
                                    }}>
                                        {t} Maintenance
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scheduling Mode */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Scheduling Mode</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {([
                                    { key: 'immediate' as const, label: '⚡ Immediate' },
                                    { key: 'scheduled' as const, label: '📅 Scheduled' },
                                    { key: 'countdown' as const, label: '⏱️ Countdown' }
                                ]).map(opt => (
                                    <button key={opt.key} onClick={() => setSchedulingMode(opt.key)} style={{
                                        flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 500,
                                        background: schedulingMode === opt.key ? '#1f2937' : '#f3f4f6',
                                        color: schedulingMode === opt.key ? 'white' : '#374151',
                                        border: 'none', fontSize: '13px'
                                    }}>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scheduled Time Inputs */}
                        {schedulingMode === 'scheduled' && (
                            <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Start Time</label>
                                        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} style={inputStyle} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>End Time</label>
                                        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} style={inputStyle} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Countdown Duration Picker */}
                        {schedulingMode === 'countdown' && (
                            <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>Countdown Duration</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[5, 10, 20, 30].map(min => (
                                        <button key={min} onClick={() => setCountdownMinutes(min)} style={{
                                            flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600,
                                            background: countdownMinutes === min ? '#3b82f6' : '#e5e7eb',
                                            color: countdownMinutes === min ? 'white' : '#374151',
                                            border: 'none'
                                        }}>
                                            {min} min
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Admin Credentials */}
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Admin 1</h4>
                                <input type="text" placeholder="Username" value={admin1User} onChange={e => setAdmin1User(e.target.value)} style={inputStyle} />
                                <input type="password" placeholder="Password" value={admin1Pass} onChange={e => setAdmin1Pass(e.target.value)} style={inputStyle} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Admin 2</h4>
                                <input type="text" placeholder="Username" value={admin2User} onChange={e => setAdmin2User(e.target.value)} style={inputStyle} />
                                <input type="password" placeholder="Password" value={admin2Pass} onChange={e => setAdmin2Pass(e.target.value)} style={inputStyle} />
                            </div>
                        </div>

                        {authError && <p style={{ color: '#dc2626', textAlign: 'center', fontWeight: 500 }}>{authError}</p>}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                            <button onClick={() => setShowAuthModal(false)} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                            <button onClick={verifyAndEnable} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Confirm & Enable</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
