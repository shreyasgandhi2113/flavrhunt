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
        <div style={{ padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 24px 0' }}>Reports</h2>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                            <th style={{ padding: '12px' }}>Type</th>
                            <th style={{ padding: '12px' }}>Target</th>
                            <th style={{ padding: '12px' }}>Reported By</th>
                            <th style={{ padding: '12px' }}>Reason</th>
                            <th style={{ padding: '12px' }}>Timestamp</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((rep: Report) => (
                            <tr key={rep.reportId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '12px', textTransform: 'capitalize' }}>{rep.reportType}</td>
                                <td style={{ padding: '12px' }}>{rep.targetName}</td>
                                <td style={{ padding: '12px' }}>@{rep.reportedByUser}</td>
                                <td style={{ padding: '12px', maxWidth: '200px', wordWrap: 'break-word' }}>{rep.reason}</td>
                                <td style={{ padding: '12px', color: '#6b7280' }}>
                                    {new Date(rep.timestamp).toLocaleDateString()} {new Date(rep.timestamp).toLocaleTimeString()}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold',
                                        background: rep.status === 'pending' ? '#fef3c7' : '#d1fae5',
                                        color: rep.status === 'pending' ? '#d97706' : '#059669'
                                    }}>
                                        {rep.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                                    <button onClick={() => handleViewTarget(rep)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                                        View
                                    </button>
                                    {(isSuper || (rep.reportType === 'user' && p?.deleteUsers) || (rep.reportType === 'recipe' && p?.deleteRecipes) || (rep.reportType === 'comment' && p?.deleteComments)) && (
                                        <button onClick={() => handleDeleteTarget(rep)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                                            Delete
                                        </button>
                                    )}
                                    {rep.status === 'pending' && (
                                        <button onClick={() => handleMarkResolved(rep)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                                            Resolve
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {reports.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
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
