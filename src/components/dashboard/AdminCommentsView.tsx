import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { addAdminLog } from '../../utils/adminUtils';

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

interface AdminCommentsViewProps {
    onNavigateToRecipe: (recipeId: string) => void;
    onNavigateToUser: (userId: string) => void;
}

export const AdminCommentsView: React.FC<AdminCommentsViewProps> = ({ onNavigateToRecipe, onNavigateToUser }) => {
    const { currentUser, recipes } = useApp();
    const canDelete = currentUser?.isSuperAdmin || currentUser?.permissions?.deleteComments;
    const [comments, setComments] = useState<Comment[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadComments = () => {
            try {
                const stored = localStorage.getItem('flavrComments');
                if (stored) {
                    setComments(JSON.parse(stored));
                }
            } catch (e) { }
        };
        loadComments();
    }, []);

    const saveComments = (newCommentsList: Comment[]) => {
        try {
            localStorage.setItem('flavrComments', JSON.stringify(newCommentsList));
            setComments(newCommentsList);
        } catch (e) { }
    };

    const activeComments = comments.filter(c => c.status !== 'deleted');

    const filteredComments = activeComments.filter(c => {
        const query = search.toLowerCase();
        const recipeName = recipes.find(r => r.id === c.recipeId)?.title.toLowerCase() || '';
        return c.text.toLowerCase().includes(query) || c.username.toLowerCase().includes(query) || recipeName.includes(query);
    });

    const handleDeleteComment = (commentId: string, text: string) => {
        if (!currentUser) return;
        saveComments(comments.map(c => c.commentId === commentId ? { ...c, status: 'deleted' } : c));
        addAdminLog(currentUser.username, 'Deleted Comment', 'comment', text.substring(0, 20));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search comments..."
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
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Comment</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>User</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Recipe</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Timestamp</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredComments.map(c => (
                            <tr
                                key={c.commentId}
                                style={{ borderBottom: '1px solid #E5E7EB', height: '64px', transition: 'background 0.2s ease' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#FFF7F2'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '0 16px', maxWidth: '300px', wordWrap: 'break-word', fontSize: '14px', color: '#111111' }}>
                                    "{c.text}"
                                </td>
                                <td style={{ padding: '0 16px' }}>
                                    <button
                                        onClick={() => onNavigateToUser(c.userId)}
                                        style={{
                                            background: '#F3F4F6',
                                            border: 'none',
                                            color: '#374151',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            transition: 'background 0.2s ease'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}
                                    >
                                        @{c.username}
                                    </button>
                                </td>
                                <td style={{ padding: '0 16px' }}>
                                    <button
                                        onClick={() => onNavigateToRecipe(c.recipeId)}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#6B7280',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 500,
                                            transition: 'color 0.2s ease',
                                            textDecoration: 'underline'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#111111'}
                                        onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
                                    >
                                        {recipes.find(r => r.id === c.recipeId)?.title || 'Unknown Recipe'}
                                    </button>
                                </td>
                                <td style={{ padding: '0 16px', fontSize: '13px', color: '#6B7280' }}>
                                    {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td style={{ padding: '0 16px', textAlign: 'right' }}>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDeleteComment(c.commentId, c.text)}
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
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredComments.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>💬</div>
                                    No comments found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
