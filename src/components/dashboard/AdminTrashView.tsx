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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111111' }}>Trash Bin</h2>
            </div>

            <div style={{ display: 'inline-flex', background: '#F3F4F6', padding: '4px', borderRadius: '12px', width: 'fit-content' }}>
                {(['recipes', 'users', 'comments'] as const).map(v => (
                    <button
                        key={v}
                        onClick={() => setViewData(v)}
                        style={{
                            padding: '8px 20px',
                            background: viewData === v ? '#FFFFFF' : 'transparent',
                            color: viewData === v ? '#111111' : '#6B7280',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontSize: '14px',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            boxShadow: viewData === v ? '0 2px 4px rgba(0,0,0,0.04)' : 'none'
                        }}
                    >
                        Deleted {v}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {viewData === 'recipes' && deletedRecipes.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#F9FAFB', borderRadius: '16px', border: '1px dashed #E5E7EB' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>🍳</div>
                        <p style={{ color: '#6B7280', margin: 0, fontSize: '15px' }}>No recipes in trash.</p>
                    </div>
                )}
                {viewData === 'recipes' && deletedRecipes.map(r => (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s ease' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#111111' }}>{r.title}</h3>
                            <span style={{ fontSize: '14px', color: '#6B7280' }}>By: @{r.hostName}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => handleRestoreRecipe(r.id, r.title)}
                                style={{ padding: '8px 16px', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s ease' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#BBF7D0'}
                                onMouseLeave={e => e.currentTarget.style.background = '#DCFCE7'}
                            >
                                Restore
                            </button>
                            <button
                                onClick={() => handlePermDeleteRecipe(r.id, r.title)}
                                style={{ padding: '8px 16px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s ease' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                ))}

                {viewData === 'users' && deletedUsers.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#F9FAFB', borderRadius: '16px', border: '1px dashed #E5E7EB' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>👥</div>
                        <p style={{ color: '#6B7280', margin: 0, fontSize: '15px' }}>No users in trash.</p>
                    </div>
                )}
                {viewData === 'users' && deletedUsers.map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s ease' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#111111' }}>@{u.username}</h3>
                            <span style={{ fontSize: '14px', color: '#6B7280' }}>{u.email}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => handleRestoreUser(u.id, u.username)}
                                style={{ padding: '8px 16px', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s ease' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#BBF7D0'}
                                onMouseLeave={e => e.currentTarget.style.background = '#DCFCE7'}
                            >
                                Restore
                            </button>
                            <button
                                onClick={() => handlePermDeleteUser(u.id, u.username)}
                                style={{ padding: '8px 16px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s ease' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                ))}

                {viewData === 'comments' && deletedComments.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#F9FAFB', borderRadius: '16px', border: '1px dashed #E5E7EB' }}>
                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
                        <p style={{ color: '#6B7280', margin: 0, fontSize: '15px' }}>No comments in trash.</p>
                    </div>
                )}
                {viewData === 'comments' && deletedComments.map(c => (
                    <div key={c.commentId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '20px', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'transform 0.2s ease' }}>
                        <div>
                            <p style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 500, color: '#111111' }}>"{c.text}"</p>
                            <span style={{ fontSize: '14px', color: '#6B7280' }}>By: @{c.username}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => handleRestoreComment(c.commentId, c.text)}
                                style={{ padding: '8px 16px', background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s ease' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#BBF7D0'}
                                onMouseLeave={e => e.currentTarget.style.background = '#DCFCE7'}
                            >
                                Restore
                            </button>
                            <button
                                onClick={() => handlePermDeleteComment(c.commentId, c.text)}
                                style={{ padding: '8px 16px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, transition: 'all 0.2s ease' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                            >
                                Delete Permanently
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
