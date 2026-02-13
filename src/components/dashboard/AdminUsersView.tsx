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
    const { users, recipes, toggleUserStatus, deleteUser } = useApp();
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
        <div className="admin-view">
            <div className="admin-header">
                <h2>Users Management</h2>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input"
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '300px' }}
                />
            </div>

            <div className="admin-content-layout" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                {/* Users List */}
                <div className="users-list" style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ marginBottom: '10px', color: '#6b7280' }}>Total Users: {filteredUsers.length}</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Username</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Status</th>
                                <th style={{ padding: '10px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '10px' }}>{user.username}</td>
                                    <td style={{ padding: '10px' }}>{user.email}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '999px',
                                            fontSize: '12px',
                                            background: user.status === 'active' ? '#d1fae5' : '#fee2e2',
                                            color: user.status === 'active' ? '#065f46' : '#991b1b'
                                        }}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => setSelectedUser(user)}
                                            style={{ marginRight: '8px', cursor: 'pointer', background: 'none', border: 'none', color: '#2563eb' }}
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Selected User Details */}
                {selectedUser && (
                    <div className="user-details" style={{ width: '350px', background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 'fit-content' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0 }}>User Details</h3>
                            <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>&times;</button>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <p><strong>Username:</strong> {selectedUser.username}</p>
                            <p><strong>Email:</strong> {selectedUser.email}</p>
                            <p><strong>Preference:</strong> {selectedUser.preference}</p>
                            <p><strong>Joined:</strong> {new Date(selectedUser.joinedAt || Date.now()).toLocaleDateString()}</p>
                            <p><strong>Recipes Posted:</strong> {getUserRecipes(selectedUser.id).length}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={() => toggleUserStatus(selectedUser.id)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    cursor: 'pointer',
                                    background: selectedUser.status === 'active' ? '#fef3c7' : '#d1fae5',
                                    color: selectedUser.status === 'active' ? '#92400e' : '#065f46'
                                }}
                            >
                                {selectedUser.status === 'active' ? 'Disable Account' : 'Enable Account'}
                            </button>

                            <button
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    background: '#ef4444',
                                    color: 'white'
                                }}
                            >
                                Delete User
                            </button>
                        </div>

                        {/* Mini Recipe List */}
                        <div style={{ marginTop: '20px' }}>
                            <h4>Recent Recipes</h4>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {getUserRecipes(selectedUser.id).map(r => (
                                    <div
                                        key={r.id}
                                        style={{
                                            padding: '8px',
                                            borderBottom: '1px solid #f3f4f6',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            color: '#2563eb'
                                        }}
                                        onClick={() => onNavigateToRecipe(r.id)}
                                        title="View in Recipes section"
                                    >
                                        {r.title} <span style={{ fontSize: '10px', color: 'gray' }}>({r.type})</span>
                                    </div>
                                ))}
                                {getUserRecipes(selectedUser.id).length === 0 && <p style={{ color: 'gray', fontSize: '14px' }}>No recipes posted.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
