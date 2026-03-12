import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { User } from '../../types';

interface AdminUsersViewProps {
    selectedUserId: string | null;
    onClearSelectedUser: () => void;
    onNavigateToRecipe: (recipeId: string) => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
    selectedUserId,
    onClearSelectedUser,
    onNavigateToRecipe
}) => {
    const { users, recipes, toggleUserStatus, deleteUser, currentUser } = useApp();
    const canDelete = currentUser?.isSuperAdmin || currentUser?.permissions?.deleteUsers;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Auto-select user when navigating from another view
    useEffect(() => {
        if (selectedUserId) {
            const user = users.find(u => u.id === selectedUserId);
            if (user) {
                setSelectedUser(user);
                onClearSelectedUser();
            }
        }
    }, [selectedUserId, users, onClearSelectedUser]);

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            user.role !== 'admin' && (
                user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [users, searchTerm]);

    const getUserRecipes = (userId: string) => {
        return recipes.filter(r => r.hostId === userId);
    };

    const handleDeleteUser = (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            const deleteRecipes = window.confirm("Delete all recipes posted by this user as well?");
            deleteUser(userId, deleteRecipes);
            setSelectedUser(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                {/* Users List */}
                <div style={{ flex: 1, background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                            <tr>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Avatar</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Username</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Email</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Joined Date</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Status</th>
                                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr
                                    key={user.id}
                                    style={{ borderBottom: '1px solid #E5E7EB', height: '56px', transition: 'background 0.2s ease', background: selectedUser?.id === user.id ? '#FFF7F2' : 'transparent' }}
                                    onMouseEnter={e => {
                                        if (selectedUser?.id !== user.id) e.currentTarget.style.background = '#F9FAFB';
                                    }}
                                    onMouseLeave={e => {
                                        if (selectedUser?.id !== user.id) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <td style={{ padding: '0 16px' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF7A18, #FF9F43)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '12px'
                                        }}>
                                            {user.username.charAt(0).toUpperCase()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0 16px', fontSize: '14px', fontWeight: 500, color: '#111111' }}>{user.username}</td>
                                    <td style={{ padding: '0 16px', fontSize: '14px', color: '#6B7280' }}>{user.email}</td>
                                    <td style={{ padding: '0 16px', fontSize: '14px', color: '#6B7280' }}>
                                        {new Date(user.joinedAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '0 16px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            background: user.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                                            color: user.status === 'active' ? '#166534' : '#991B1B'
                                        }}>
                                            {user.status === 'active' ? 'Active' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0 16px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #E5E7EB',
                                                    background: 'transparent',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    color: '#111111',
                                                    cursor: 'pointer',
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
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Selected User Details Panel */}
                {selectedUser && (
                    <div style={{
                        width: '320px',
                        background: '#FFFFFF',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                        border: '1px solid #E5E7EB',
                        position: 'sticky',
                        top: '0'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF7A18, #FF9F43)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: '18px'
                                }}>
                                    {selectedUser.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111111' }}>{selectedUser.username}</h3>
                                    <span style={{ fontSize: '13px', color: '#6B7280' }}>{selectedUser.email}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#6B7280' }}
                            >
                                &times;
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', fontSize: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6B7280' }}>Status</span>
                                <span style={{ color: '#111111', fontWeight: 500 }}>{selectedUser.status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6B7280' }}>Preference</span>
                                <span style={{ color: '#111111', fontWeight: 500 }}>{selectedUser.preference}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6B7280' }}>Joined</span>
                                <span style={{ color: '#111111', fontWeight: 500 }}>{new Date(selectedUser.joinedAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#6B7280' }}>Recipes</span>
                                <span style={{ color: '#111111', fontWeight: 500 }}>{getUserRecipes(selectedUser.id).length}</span>
                            </div>
                        </div>

                        {canDelete && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                <button
                                    onClick={() => toggleUserStatus(selectedUser.id)}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: '1px solid #E5E7EB',
                                        cursor: 'pointer',
                                        background: selectedUser.status === 'active' ? 'transparent' : '#DCFCE7',
                                        color: selectedUser.status === 'active' ? '#111111' : '#166534',
                                        fontWeight: 500,
                                        fontSize: '14px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#FF7A18'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                                >
                                    {selectedUser.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                                </button>

                                <button
                                    onClick={() => handleDeleteUser(selectedUser.id)}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        background: '#FEE2E2',
                                        color: '#991B1B',
                                        fontWeight: 500,
                                        fontSize: '14px',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#FECACA'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#FEE2E2'}
                                >
                                    Delete User
                                </button>
                            </div>
                        )}

                        {/* Mini Recipe List */}
                        <div>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase' }}>Recent Recipes</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {getUserRecipes(selectedUser.id).slice(0, 5).map(r => (
                                    <div
                                        key={r.id}
                                        style={{
                                            padding: '10px 12px',
                                            background: '#F9FAFB',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            color: '#111111',
                                            transition: 'background 0.2s ease',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#F9FAFB'}
                                        onClick={() => onNavigateToRecipe(r.id)}
                                    >
                                        <span style={{ fontWeight: 500, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '180px' }}>{r.title}</span>
                                        <span style={{ fontSize: '18px' }}>
                                            {r.type === 'Vegan' ? '🥗' : r.type === 'Veg' ? '🥦' : '🥩'}
                                        </span>
                                    </div>
                                ))}
                                {getUserRecipes(selectedUser.id).length === 0 && <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>No recipes posted yet.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
