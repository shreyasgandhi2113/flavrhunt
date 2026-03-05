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
        <div style={{ padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Admin Activity Logs</h2>
                <input
                    type="text"
                    placeholder="Search logs..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', width: '300px' }}
                />
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                            <th style={{ padding: '12px' }}>Admin</th>
                            <th style={{ padding: '12px' }}>Action</th>
                            <th style={{ padding: '12px' }}>Target Type</th>
                            <th style={{ padding: '12px' }}>Target</th>
                            <th style={{ padding: '12px' }}>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.logId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '12px', fontWeight: 'bold' }}>{log.adminName}</td>
                                <td style={{ padding: '12px', color: '#3b82f6' }}>{log.actionType}</td>
                                <td style={{ padding: '12px', textTransform: 'capitalize' }}>{log.targetType}</td>
                                <td style={{ padding: '12px' }}>{log.targetName}</td>
                                <td style={{ padding: '12px', color: '#6b7280' }}>
                                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                                </td>
                            </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
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
