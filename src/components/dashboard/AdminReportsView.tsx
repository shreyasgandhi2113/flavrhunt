import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { addAdminLog } from '../../utils/adminUtils';
import type { Report } from '../../utils/adminUtils';

interface AdminReportsViewProps {
    onNavigateToUser: (userId: string) => void;
    onNavigateToRecipe: (recipeId: string) => void;
    onNavigateToComment: (commentId: string) => void; // Added for comment navigation
}

interface Reply {
    replyId: string;
    userId: string;
    username: string;
    text: string;
    createdAt: number;
}
interface Comment {
    commentId: string;
    recipeId: string;
    userId: string;
    username: string;
    text: string;
    createdAt: number;
    replies: Reply[];
    status?: 'active' | 'deleted';
}

export const AdminReportsView: React.FC<AdminReportsViewProps> = ({ onNavigateToUser, onNavigateToRecipe, onNavigateToComment }) => {
    const { currentUser, deleteUser, deleteRecipe } = useApp();
    const isSuper = currentUser?.isSuperAdmin;
    const p = currentUser?.permissions;
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        const loadReports = () => {
            try {
                const stored = localStorage.getItem('flavrReports');
                if (stored) {
                    setReports(JSON.parse(stored).sort((a: Report, b: Report) => b.timestamp - a.timestamp));
                }
            } catch (e) { }
        };
        loadReports();
    }, []);

    const saveReports = (newReports: Report[]) => {
        try {
            localStorage.setItem('flavrReports', JSON.stringify(newReports));
            setReports(newReports);
        } catch (e) { }
    };

    const handleViewTarget = (rep: Report) => {
        if (rep.reportType === 'user') onNavigateToUser(rep.targetId);
        else if (rep.reportType === 'recipe') onNavigateToRecipe(rep.targetId);
        else if (rep.reportType === 'comment') onNavigateToComment(rep.targetId);
    };

    const handleDeleteTarget = (rep: Report) => {
        if (!currentUser) return;
        if (rep.reportType === 'user') {
            deleteUser(rep.targetId, false);
            addAdminLog(currentUser.username, 'Deleted Reported User', 'user', rep.targetName);
        } else if (rep.reportType === 'recipe') {
            deleteRecipe(rep.targetId);
            addAdminLog(currentUser.username, 'Deleted Reported Recipe', 'recipe', rep.targetName);
        } else if (rep.reportType === 'comment') {
            try {
                const stored = localStorage.getItem('flavrComments');
                if (stored) {
                    const comments: Comment[] = JSON.parse(stored);
                    const updated = comments.map((c: Comment) => c.commentId === rep.targetId ? { ...c, status: 'deleted' as const } : c);
                    localStorage.setItem('flavrComments', JSON.stringify(updated));
                }
            } catch (e) { }
            addAdminLog(currentUser.username, 'Deleted Reported Comment', 'comment', rep.targetName);
        }
    };

    const handleMarkResolved = (rep: Report) => {
        if (!currentUser) return;
        const updated = reports.map(r => r.reportId === rep.reportId ? { ...r, status: 'resolved' as const } : r);
        saveReports(updated);
        addAdminLog(currentUser.username, 'Resolved Report', 'system', rep.targetName);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111111' }}>Reports Management</h2>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <tr>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Type</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Target</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Reported By</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Reason</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Timestamp</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((rep: Report) => (
                            <tr
                                key={rep.reportId}
                                style={{ borderBottom: '1px solid #E5E7EB', height: '64px', transition: 'background 0.2s ease' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '0 16px', textTransform: 'capitalize', fontSize: '14px', fontWeight: 500, color: '#111111' }}>
                                    {rep.reportType === 'user' ? '👤 ' : rep.reportType === 'recipe' ? '🍳 ' : '💬 '}
                                    {rep.reportType}
                                </td>
                                <td style={{ padding: '0 16px', fontSize: '14px', color: '#4B5563', fontWeight: 500 }}>
                                    {rep.targetName}
                                </td>
                                <td style={{ padding: '0 16px' }}>
                                    <div style={{
                                        display: 'inline-block',
                                        background: '#F3F4F6',
                                        color: '#374151',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: 500
                                    }}>
                                        @{rep.reportedByUser}
                                    </div>
                                </td>
                                <td style={{ padding: '0 16px', maxWidth: '200px', wordWrap: 'break-word', fontSize: '14px', color: '#111111' }}>
                                    "{rep.reason}"
                                </td>
                                <td style={{ padding: '0 16px', color: '#6B7280', fontSize: '13px' }}>
                                    {new Date(rep.timestamp).toLocaleDateString()} {new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td style={{ padding: '0 16px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        background: rep.status === 'pending' ? '#FEF3C7' : '#DCFCE7',
                                        color: rep.status === 'pending' ? '#92400E' : '#166534'
                                    }}>
                                        {rep.status === 'pending' ? 'Pending' : 'Resolved'}
                                    </span>
                                </td>
                                <td style={{ padding: '0 16px', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => handleViewTarget(rep)}
                                            style={{
                                                background: 'transparent',
                                                color: '#111111',
                                                border: '1px solid #E5E7EB',
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.borderColor = '#FF7A18';
                                                e.currentTarget.style.color = '#FF7A18';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.borderColor = '#E5E7EB';
                                                e.currentTarget.style.color = '#111111';
                                            }}
                                        >
                                            View
                                        </button>

                                        {rep.status === 'pending' && (
                                            <button
                                                onClick={() => handleMarkResolved(rep)}
                                                style={{
                                                    background: '#DCFCE7',
                                                    color: '#166534',
                                                    border: '1px solid #BBF7D0',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#BBF7D0'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#DCFCE7'}
                                            >
                                                Resolve
                                            </button>
                                        )}

                                        {(isSuper || (rep.reportType === 'user' && p?.deleteUsers) || (rep.reportType === 'recipe' && p?.deleteRecipes) || (rep.reportType === 'comment' && p?.deleteComments)) && (
                                            <button
                                                onClick={() => handleDeleteTarget(rep)}
                                                style={{
                                                    background: '#FEF2F2',
                                                    color: '#EF4444',
                                                    border: '1px solid #FEE2E2',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                                            >
                                                Delete Target
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {reports.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🚩</div>
                                    No reports found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
