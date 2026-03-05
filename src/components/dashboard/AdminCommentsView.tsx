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
        <div style={{ padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Comments Moderation</h2>
                <input
                    type="text"
                    placeholder="Search by username, thought, or recipe..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #d1d5db', width: '300px' }}
                />
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                            <th style={{ padding: '12px' }}>Comment</th>
                            <th style={{ padding: '12px' }}>User</th>
                            <th style={{ padding: '12px' }}>Recipe</th>
                            <th style={{ padding: '12px' }}>Timestamp</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredComments.map(c => (
                            <tr key={c.commentId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '12px', maxWidth: '300px', wordWrap: 'break-word' }}>"{c.text}"</td>
                                <td style={{ padding: '12px' }}>
                                    <button onClick={() => onNavigateToUser(c.userId)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }}>
                                        @{c.username}
                                    </button>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <button onClick={() => onNavigateToRecipe(c.recipeId)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }}>
                                        {recipes.find(r => r.id === c.recipeId)?.title || 'Unknown Recipe'}
                                    </button>
                                </td>
                                <td style={{ padding: '12px', color: '#6b7280' }}>
                                    {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString()}
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <button onClick={() => handleDeleteComment(c.commentId, c.text)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                                        Delete Comment
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredComments.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                                    No comments found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
