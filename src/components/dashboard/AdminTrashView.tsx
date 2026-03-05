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

export const AdminTrashView: React.FC = () => {
    const { users, recipes, currentUser, updateUser, updateRecipe, permanentDeleteUser, permanentDeleteRecipe } = useApp();
    const [viewData, setViewData] = useState<'users' | 'recipes' | 'comments'>('recipes');
    const [comments, setComments] = useState<Comment[]>([]);

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

    const deletedUsers = users.filter(u => u.status === 'deleted');
    const deletedRecipes = recipes.filter(r => r.status === 'deleted');
    const deletedComments = comments.filter(c => c.status === 'deleted');

    const handleRestoreUser = (userId: string, username: string) => {
        if (!currentUser) return;
        const u = users.find((x) => x.id === userId);
        if (u) {
            updateUser({ ...u, status: 'active' });
            addAdminLog(currentUser.username, 'Restored User', 'user', username);
        }
    };

    const handlePermDeleteUser = (userId: string, _username: string) => {
        if (!currentUser) return;
        permanentDeleteUser(userId, true);
    };

    const handleRestoreRecipe = (recipeId: string, title: string) => {
        if (!currentUser) return;
        updateRecipe(recipeId, { status: 'active' });
        addAdminLog(currentUser.username, 'Restored Recipe', 'recipe', title);
    };

    const handlePermDeleteRecipe = (recipeId: string, _title: string) => {
        if (!currentUser) return;
        permanentDeleteRecipe(recipeId);
    };

    const handleRestoreComment = (commentId: string, text: string) => {
        if (!currentUser) return;
        saveComments(comments.map(c => c.commentId === commentId ? { ...c, status: 'active' } : c));
        addAdminLog(currentUser.username, 'Restored Comment', 'comment', text.substring(0, 20));
    };

    const handlePermDeleteComment = (commentId: string, text: string) => {
        if (!currentUser) return;
        saveComments(comments.filter(c => c.commentId !== commentId));
        addAdminLog(currentUser.username, 'Permanently Deleted Comment', 'comment', text.substring(0, 20));
    };

    return (
        <div style={{ padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 24px 0' }}>Trash Bin</h2>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                {(['recipes', 'users', 'comments'] as const).map(v => (
                    <button
                        key={v}
                        onClick={() => setViewData(v)}
                        style={{
                            padding: '8px 16px',
                            background: viewData === v ? '#3b82f6' : '#e5e7eb',
                            color: viewData === v ? 'white' : 'black',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        Deleted {v}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {viewData === 'recipes' && deletedRecipes.length === 0 && <p style={{ color: '#6b7280' }}>No recipes in trash.</p>}
                {viewData === 'recipes' && deletedRecipes.map(r => (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0' }}>{r.title}</h3>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>By: @{r.hostName}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleRestoreRecipe(r.id, r.title)} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Restore</button>
                            <button onClick={() => handlePermDeleteRecipe(r.id, r.title)} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete Permanently</button>
                        </div>
                    </div>
                ))}

                {viewData === 'users' && deletedUsers.length === 0 && <p style={{ color: '#6b7280' }}>No users in trash.</p>}
                {viewData === 'users' && deletedUsers.map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0' }}>@{u.username}</h3>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>{u.email}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleRestoreUser(u.id, u.username)} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Restore</button>
                            <button onClick={() => handlePermDeleteUser(u.id, u.username)} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete Permanently</button>
                        </div>
                    </div>
                ))}

                {viewData === 'comments' && deletedComments.length === 0 && <p style={{ color: '#6b7280' }}>No comments in trash.</p>}
                {viewData === 'comments' && deletedComments.map(c => (
                    <div key={c.commentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div>
                            <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>"{c.text}"</p>
                            <span style={{ fontSize: '14px', color: '#6b7280' }}>By: @{c.username}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleRestoreComment(c.commentId, c.text)} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Restore</button>
                            <button onClick={() => handlePermDeleteComment(c.commentId, c.text)} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Delete Permanently</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
