import React, { useEffect, useState } from 'react';
import type { AdminLog } from '../../utils/adminUtils';

export const AdminActivityView: React.FC = () => {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const stored = localStorage.getItem('flavrAdminLogs');
        if (stored) {
            setLogs(JSON.parse(stored).sort((a: AdminLog, b: AdminLog) => b.timestamp - a.timestamp));
        }
    }, []);

    const filteredLogs = logs.filter(log =>
        log.actionType.toLowerCase().includes(search.toLowerCase()) ||
        log.targetName.toLowerCase().includes(search.toLowerCase()) ||
        log.adminName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111111' }}>Activity Logs</h2>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            height: '44px',
                            padding: '0 16px 0 44px',
                            borderRadius: '10px',
                            border: '1px solid #E5E7EB',
                            background: '#FFFFFF',
                            fontSize: '14px',
                            outline: 'none',
                            width: '320px',
                            transition: 'all 0.2s ease',
                            color: '#111111'
                        }}
                        onFocus={e => {
                            e.currentTarget.style.borderColor = '#FF7A18';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,122,24,0.15)';
                        }}
                        onBlur={e => {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    />
                </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <tr>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Admin</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Action</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Target Type</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Target</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr
                                key={log.logId}
                                style={{ borderBottom: '1px solid #E5E7EB', height: '64px', transition: 'background 0.2s ease' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '0 16px', fontWeight: 600, fontSize: '14px', color: '#111111' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF7A18, #FF9F43)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px' }}>
                                            {log.adminName.charAt(0).toUpperCase()}
                                        </div>
                                        {log.adminName}
                                    </div>
                                </td>
                                <td style={{ padding: '0 16px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        fontSize: '13px',
                                        fontWeight: 500,
                                        background: '#DBEAFE',
                                        color: '#1D4ED8'
                                    }}>
                                        {log.actionType}
                                    </span>
                                </td>
                                <td style={{ padding: '0 16px', textTransform: 'capitalize', fontSize: '14px', color: '#4B5563' }}>
                                    {log.targetType === 'user' ? '👤 ' : log.targetType === 'recipe' ? '🍳 ' : log.targetType === 'comment' ? '💬 ' : '⚙️ '}
                                    {log.targetType}
                                </td>
                                <td style={{ padding: '0 16px', fontSize: '14px', color: '#111111', fontWeight: 500 }}>{log.targetName}</td>
                                <td style={{ padding: '0 16px', color: '#6B7280', fontSize: '13px' }}>
                                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                            </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
                                    No activity logs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
