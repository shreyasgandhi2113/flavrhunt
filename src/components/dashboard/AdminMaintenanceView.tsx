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
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #E5E7EB', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
        <span style={{ fontWeight: 500, fontSize: '14px', color: '#111111' }}>{label}</span>
        <div style={{
            position: 'relative', width: '44px', height: '24px',
            backgroundColor: checked ? '#10B981' : '#E5E7EB',
            borderRadius: '12px', transition: 'background-color 0.2s ease', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
        }}>
            <div style={{
                position: 'absolute', top: '2px',
                left: checked ? '22px' : '2px',
                width: '20px', height: '20px',
                backgroundColor: '#FFFFFF', borderRadius: '50%',
                transition: 'left 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
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
        background: '#FFFFFF', padding: '32px', borderRadius: '16px',
        border: '1px solid #E5E7EB', marginBottom: '24px'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '12px 16px', borderRadius: '12px',
        border: '1px solid #E5E7EB', marginBottom: '16px', boxSizing: 'border-box',
        fontSize: '14px', background: '#F9FAFB', outline: 'none',
        transition: 'all 0.2s ease', color: '#111111'
    };


    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            {/* Live Status Indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111111' }}>Maintenance Management</h2>
                <StatusBadge status={maintenanceStatus} hasSchedule={hasSchedule} />
            </div>

            {/* Current Status Card */}
            <div style={sectionStyle}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: maintenanceStatus === 'active' ? '#FEF2F2' : maintenanceStatus === 'pending' ? '#FEF3C7' : '#DCFCE7',
                        color: maintenanceStatus === 'active' ? '#EF4444' : maintenanceStatus === 'pending' ? '#D97706' : '#10B981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '36px', margin: '0 auto 20px auto'
                    }}>
                        {maintenanceStatus === 'active' ? '⚠️' : maintenanceStatus === 'pending' ? '⏳' : '✅'}
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 12px 0', color: '#111111' }}>
                        System Status: <span style={{ color: maintenanceStatus === 'active' ? '#EF4444' : maintenanceStatus === 'pending' ? '#D97706' : '#10B981' }}>
                            {maintenanceStatus === 'active' ? 'Under Maintenance' : maintenanceStatus === 'pending' ? 'Pending Action' : 'Live and Operational'}
                        </span>
                    </h3>

                    {/* Active schedule info */}
                    {maintenanceSettings.schedulingMode === 'countdown' && countdownDisplay && maintenanceStatus !== 'active' && (
                        <div style={{ background: '#FEF3C7', color: '#92400E', padding: '14px 24px', borderRadius: '12px', marginTop: '16px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>⏱️</span> Countdown to Maintenance: {countdownDisplay}
                        </div>
                    )}
                    {maintenanceSettings.schedulingMode === 'scheduled' && scheduledRemaining && maintenanceStatus !== 'active' && (
                        <div style={{ background: '#FEF3C7', color: '#92400E', padding: '14px 24px', borderRadius: '12px', marginTop: '16px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>📅</span> Scheduled Maintenance Starts in: {scheduledRemaining}
                        </div>
                    )}

                    {maintenanceSettings.maintenanceType === 'partial' && maintenanceSettings.maintenanceActive && (
                        <div style={{ background: '#DBEAFE', color: '#1E40AF', padding: '14px 24px', borderRadius: '12px', marginTop: '16px', fontSize: '14px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '18px' }}>🔧</span> Partial Maintenance Active — Some features are currently disabled.
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
                        {(maintenanceStatus !== 'active' && !hasSchedule) && (
                            <button onClick={handleStartMaintenance} style={{
                                padding: '14px 32px', background: '#EF4444', color: '#FFFFFF',
                                border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
                                transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(239,68,68,0.2)'
                            }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                Start Maintenance Mode
                            </button>
                        )}
                        {(maintenanceStatus === 'active' || maintenanceStatus === 'pending' || hasSchedule) && (
                            <button onClick={handleGoLive} style={{
                                padding: '14px 32px', background: '#10B981', color: '#FFFFFF',
                                border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
                                transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(16,185,129,0.2)'
                            }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                                Restore System & Go Live
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Feature 2: Custom Maintenance Message */}
            <div style={sectionStyle}>
                <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', fontWeight: 600, color: '#111111' }}>
                    <span style={{ fontSize: '20px' }}>✉️</span> Custom Maintenance Message
                </h3>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 24px 0' }}>
                    Customize the message shown to users when maintenance is active.
                </p>
                <label style={{ display: 'block', fontWeight: 500, fontSize: '13px', marginBottom: '8px', color: '#4B5563' }}>Title</label>
                <input
                    type="text"
                    placeholder="e.g. System Upgrade in Progress"
                    value={messageTitle}
                    onChange={e => setMessageTitle(e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#FF7A18'; e.currentTarget.style.background = '#FFFFFF'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}
                />
                <label style={{ display: 'block', fontWeight: 500, fontSize: '13px', marginBottom: '8px', color: '#4B5563' }}>Description</label>
                <textarea
                    placeholder="e.g. We are improving recipe search performance..."
                    value={messageDescription}
                    onChange={e => setMessageDescription(e.target.value)}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#FF7A18'; e.currentTarget.style.background = '#FFFFFF'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}
                />
                <label style={{ display: 'block', fontWeight: 500, fontSize: '13px', marginBottom: '8px', color: '#4B5563' }}>Estimated Return Time</label>
                <input
                    type="text"
                    placeholder="e.g. Back in approximately 30 minutes"
                    value={eta}
                    onChange={e => setEta(e.target.value)}
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#FF7A18'; e.currentTarget.style.background = '#FFFFFF'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button onClick={handleSaveMessage} style={{
                        padding: '12px 24px', background: '#111111', color: '#FFFFFF',
                        border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                        transition: 'all 0.2s ease'
                    }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                        Save Public Message
                    </button>
                </div>
            </div>

            {/* Feature 3: Partial Maintenance Mode */}
            <div style={sectionStyle}>
                <h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '18px', fontWeight: 600, color: '#111111' }}>
                    <span style={{ fontSize: '20px' }}>🔧</span> Partial Maintenance Controls
                </h3>
                <p style={{ color: '#6B7280', fontSize: '14px', margin: '0 0 24px 0' }}>
                    Instead of full shutdown, selectively disable features while keeping the platform accessible.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <Toggle label="Disable Recipe Posting" checked={disabledFeatures.postRecipes} onChange={v => setDisabledFeatures(prev => ({ ...prev, postRecipes: v }))} />
                    <Toggle label="Disable Comments" checked={disabledFeatures.comments} onChange={v => setDisabledFeatures(prev => ({ ...prev, comments: v }))} />
                    <Toggle label="Disable Recipe Ratings" checked={disabledFeatures.ratings} onChange={v => setDisabledFeatures(prev => ({ ...prev, ratings: v }))} />
                    <Toggle label="Disable User Registration" checked={disabledFeatures.registration} onChange={v => setDisabledFeatures(prev => ({ ...prev, registration: v }))} />
                    <Toggle label="Disable Search" checked={disabledFeatures.search} onChange={v => setDisabledFeatures(prev => ({ ...prev, search: v }))} />
                    <Toggle label="Disable Recipe Editing" checked={disabledFeatures.editing} onChange={v => setDisabledFeatures(prev => ({ ...prev, editing: v }))} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <button onClick={handleApplyPartialMaintenance} style={{
                        padding: '12px 24px', background: '#FFFFFF', color: '#111111',
                        border: '1px solid #111111', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                        transition: 'all 0.2s ease'
                    }} onMouseEnter={e => { e.currentTarget.style.background = '#111111'; e.currentTarget.style.color = '#FFFFFF'; }} onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#111111'; }}>
                        Apply Partial Maintenance
                    </button>
                </div>
            </div>

            {/* Dual-Admin Auth Modal */}
            {showAuthModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '24px' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', zIndex: 10 }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 600, color: '#111111' }}>Two-Admin Authentication Required</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Both owners must authenticate to control maintenance mode.</p>
                            </div>
                            <button onClick={() => setShowAuthModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}>&times;</button>
                        </div>

                        <div style={{ padding: '32px', overflowY: 'auto' }}>
                            {/* Maintenance Type Selector */}
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '12px', color: '#111111' }}>Select Maintenance Type</label>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    {(['full', 'partial'] as MaintenanceType[]).map(t => (
                                        <button key={t} onClick={() => setMaintenanceType(t)} style={{
                                            flex: 1, padding: '16px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px',
                                            background: maintenanceType === t ? (t === 'full' ? '#FEF2F2' : '#FFFBEB') : '#F9FAFB',
                                            color: maintenanceType === t ? (t === 'full' ? '#EF4444' : '#D97706') : '#4B5563',
                                            border: `2px solid ${maintenanceType === t ? (t === 'full' ? '#FCA5A5' : '#FCD34D') : 'transparent'}`,
                                            transition: 'all 0.2s ease',
                                            textTransform: 'capitalize',
                                            position: 'relative'
                                        }}>
                                            {t} Maintenance
                                            {maintenanceType === t && (
                                                <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '24px', height: '24px', background: t === 'full' ? '#EF4444' : '#D97706', color: '#FFFFFF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scheduling Mode */}
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '12px', color: '#111111' }}>Activation Schedule</label>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {([
                                        { key: 'immediate' as const, label: 'Immediate', icon: '⚡' },
                                        { key: 'scheduled' as const, label: 'Scheduled', icon: '📅' },
                                        { key: 'countdown' as const, label: 'Countdown', icon: '⏱️' }
                                    ]).map(opt => (
                                        <button key={opt.key} onClick={() => setSchedulingMode(opt.key)} style={{
                                            flex: 1, padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                                            background: schedulingMode === opt.key ? '#F3F4F6' : '#FFFFFF',
                                            color: schedulingMode === opt.key ? '#111111' : '#6B7280',
                                            border: `1px solid ${schedulingMode === opt.key ? '#111111' : '#E5E7EB'}`,
                                            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                        }}>
                                            <span style={{ fontSize: '16px' }}>{opt.icon}</span> {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scheduled Time Inputs */}
                            {schedulingMode === 'scheduled' && (
                                <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #E5E7EB' }}>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#4B5563' }}>Start Time</label>
                                            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '8px', color: '#4B5563' }}>End Time (Optional)</label>
                                            <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Countdown Duration Picker */}
                            {schedulingMode === 'countdown' && (
                                <div style={{ background: '#F9FAFB', padding: '24px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #E5E7EB' }}>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '12px', color: '#4B5563' }}>Countdown Duration before Activation</label>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        {[5, 10, 20, 30].map(min => (
                                            <button key={min} onClick={() => setCountdownMinutes(min)} style={{
                                                flex: 1, padding: '12px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                                                background: countdownMinutes === min ? '#111111' : '#FFFFFF',
                                                color: countdownMinutes === min ? '#FFFFFF' : '#4B5563',
                                                border: `1px solid ${countdownMinutes === min ? '#111111' : '#D1D5DB'}`,
                                                transition: 'all 0.2s ease'
                                            }}>
                                                {min} min
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Admin Credentials */}
                            <div>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600, color: '#111111', paddingBottom: '12px', borderBottom: '1px solid #E5E7EB' }}>Owner Authorization Required</h4>
                                <div style={{ display: 'flex', gap: '24px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>1</div>
                                            <h4 style={{ margin: 0, fontSize: '14px', color: '#4B5563' }}>Owner 1 Credentials</h4>
                                        </div>
                                        <input type="text" placeholder="Username" value={admin1User} onChange={e => setAdmin1User(e.target.value)} style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = '#FF7A18'; e.currentTarget.style.background = '#FFFFFF'; }} onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }} />
                                        <input type="password" placeholder="Password" value={admin1Pass} onChange={e => setAdmin1Pass(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} onFocus={e => { e.currentTarget.style.borderColor = '#FF7A18'; e.currentTarget.style.background = '#FFFFFF'; }} onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#DBEAFE', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>2</div>
                                            <h4 style={{ margin: 0, fontSize: '14px', color: '#4B5563' }}>Owner 2 Credentials</h4>
                                        </div>
                                        <input type="text" placeholder="Username" value={admin2User} onChange={e => setAdmin2User(e.target.value)} style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = '#FF7A18'; e.currentTarget.style.background = '#FFFFFF'; }} onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }} />
                                        <input type="password" placeholder="Password" value={admin2Pass} onChange={e => setAdmin2Pass(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }} onFocus={e => { e.currentTarget.style.borderColor = '#FF7A18'; e.currentTarget.style.background = '#FFFFFF'; }} onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }} />
                                    </div>
                                </div>
                            </div>

                            {authError && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '12px 16px', borderRadius: '12px', marginTop: '24px', fontSize: '14px', fontWeight: 500, border: '1px solid #FEE2E2', textAlign: 'center' }}>{authError}</div>}
                        </div>

                        <div style={{ padding: '24px 32px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', gap: '12px', justifyContent: 'flex-end', zIndex: 10 }}>
                            <button onClick={() => setShowAuthModal(false)} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#4B5563', transition: 'all 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'} onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}>Cancel</button>
                            <button onClick={verifyAndEnable} style={{ background: '#EF4444', color: '#FFFFFF', border: 'none', padding: '12px 32px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'transform 0.2s ease', boxShadow: '0 4px 12px rgba(239,68,68,0.2)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>Confirm & Enable Maintenance</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
