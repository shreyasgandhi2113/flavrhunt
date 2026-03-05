import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { addAdminLog } from '../../utils/adminUtils';
import type { SubAdmin, SubAdminPermissions } from '../../types';

export const AdminManagementView: React.FC = () => {
    const { currentUser } = useApp();
    const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);

    // Modals
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Auth Form
    const [authUsername, setAuthUsername] = useState('');
    const [authPassword, setAuthPassword] = useState('');
    const [authError, setAuthError] = useState('');

    // Create/Edit Form
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formUsername, setFormUsername] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [permissions, setPermissions] = useState<SubAdminPermissions>({
        viewUsers: true,
        deleteUsers: false,
        viewRecipes: true,
        deleteRecipes: false,
        viewComments: true,
        deleteComments: false,
        moderateReports: false,
        maintenanceControl: false,
        viewLogs: false,
        trashControl: false
    });

    useEffect(() => {
        loadSubAdmins();
    }, []);

    const loadSubAdmins = () => {
        try {
            const stored = localStorage.getItem('flavrSubAdmins');
            if (stored) {
                setSubAdmins(JSON.parse(stored));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const saveSubAdmins = (admins: SubAdmin[]) => {
        localStorage.setItem('flavrSubAdmins', JSON.stringify(admins));
        setSubAdmins(admins);
    };

    const handleAuthSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError('');

        const admins = [
            { username: 'shreyas gandhi', password: 'adminflavrhunt' },
            { username: 'raj vishwakarma', password: 'adminflavrhunt' }
        ];

        const match = admins.find(a => a.username === authUsername.trim().toLowerCase() && a.password === authPassword.trim());
        if (match) {
            setShowAuthModal(false);
            setAuthUsername('');
            setAuthPassword('');
            setShowCreateModal(true);
        } else {
            setAuthError('Invalid owner credentials');
        }
    };

    const initiateCreate = () => {
        setEditingId(null);
        setFormUsername('');
        setFormPassword('');
        setPermissions({
            viewUsers: true,
            deleteUsers: false,
            viewRecipes: true,
            deleteRecipes: false,
            viewComments: true,
            deleteComments: false,
            moderateReports: false,
            maintenanceControl: false,
            viewLogs: false,
            trashControl: false
        });
        setShowAuthModal(true);
    };

    const initiateEdit = (subAdmin: SubAdmin) => {
        setEditingId(subAdmin.subAdminId);
        setFormUsername(subAdmin.username);
        setFormPassword(subAdmin.password || '');
        setPermissions(subAdmin.permissions);
        setShowCreateModal(true); // Edit bypasses auth. Only owners can see this view anyway.
    };

    const handleSaveSubAdmin = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            const updated = subAdmins.map(sa => sa.subAdminId === editingId ? {
                ...sa,
                username: formUsername,
                password: formPassword || sa.password,
                permissions: permissions
            } : sa);
            saveSubAdmins(updated);
            addAdminLog(currentUser?.username || 'Owner', 'updated permissions for', 'system', formUsername);
        } else {
            const newSubAdmin: SubAdmin = {
                subAdminId: `subadmin-${Date.now()}`,
                username: formUsername,
                password: formPassword,
                permissions,
                createdBy: currentUser?.username || 'Owner',
                createdAt: Date.now(),
                status: 'active'
            };
            saveSubAdmins([...subAdmins, newSubAdmin]);
            addAdminLog(currentUser?.username || 'Owner', 'created sub admin', 'system', formUsername);
        }
        setShowCreateModal(false);
    };

    const toggleStatus = (subAdmin: SubAdmin) => {
        const newStatus = subAdmin.status === 'active' ? 'disabled' : 'active';
        const updated = subAdmins.map(sa => sa.subAdminId === subAdmin.subAdminId ? { ...sa, status: newStatus as 'active' | 'disabled' } : sa);
        saveSubAdmins(updated);
        addAdminLog(currentUser?.username || 'Owner', newStatus === 'active' ? 'enabled sub admin' : 'disabled sub admin', 'system', subAdmin.username);
    };

    const deleteSubAdmin = (subAdmin: SubAdmin) => {
        if (window.confirm(`Are you sure you want to permanently delete sub admin ${subAdmin.username}?`)) {
            const updated = subAdmins.filter(sa => sa.subAdminId !== subAdmin.subAdminId);
            saveSubAdmins(updated);
            addAdminLog(currentUser?.username || 'Owner', 'deleted sub admin', 'system', subAdmin.username);
        }
    };

    const ToggleSwitch = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (checked: boolean) => void }) => (
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}>
            <span style={{ fontWeight: 500 }}>{label}</span>
            <div style={{
                position: 'relative', width: '44px', height: '24px', backgroundColor: checked ? '#10b981' : '#d1d5db',
                borderRadius: '12px', transition: 'background-color 0.2s'
            }}>
                <div style={{
                    position: 'absolute', top: '2px', left: checked ? '22px' : '2px', width: '20px', height: '20px',
                    backgroundColor: 'white', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
            </div>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
        </label>
    );

    return (
        <div style={{ padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: 0 }}>Sub Admin Management</h2>
                <button
                    onClick={initiateCreate}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Create Sub Admin
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#6b7280' }}>
                            <th style={{ padding: '12px' }}>Username</th>
                            <th style={{ padding: '12px' }}>Created By</th>
                            <th style={{ padding: '12px' }}>Created Date</th>
                            <th style={{ padding: '12px' }}>Active Permissions</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subAdmins.map(sa => {
                            const activePermsCount = Object.values(sa.permissions).filter(Boolean).length;
                            return (
                                <tr key={sa.subAdminId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{sa.username}</td>
                                    <td style={{ padding: '12px' }}>{sa.createdBy}</td>
                                    <td style={{ padding: '12px', color: '#6b7280' }}>
                                        {new Date(sa.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {activePermsCount} Enabled
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold',
                                            background: sa.status === 'active' ? '#d1fae5' : '#fee2e2',
                                            color: sa.status === 'active' ? '#059669' : '#991b1b'
                                        }}>
                                            {sa.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                                        <button onClick={() => initiateEdit(sa)} style={{ background: '#374151', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                            Edit Permissions
                                        </button>
                                        <button onClick={() => toggleStatus(sa)} style={{ background: sa.status === 'active' ? '#f59e0b' : '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                            {sa.status === 'active' ? 'Disable' : 'Enable'}
                                        </button>
                                        <button onClick={() => deleteSubAdmin(sa)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {subAdmins.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                                    No sub admins created yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Authentication Modal */}
            {showAuthModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 16px 0' }}>Confirm Admin Authentication</h3>
                        <p style={{ color: '#6b7280', marginBottom: '20px', fontSize: '14px' }}>Please verify your identity as an owner to create a sub admin.</p>

                        {authError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{authError}</div>}

                        <form onSubmit={handleAuthSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Admin Username</label>
                                <input
                                    type="text"
                                    value={authUsername}
                                    onChange={e => setAuthUsername(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Admin Password</label>
                                <input
                                    type="password"
                                    value={authPassword}
                                    onChange={e => setAuthPassword(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setShowAuthModal(false)} style={{ background: 'transparent', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Verify</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create/Edit Sub Admin Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ margin: '0 0 20px 0' }}>{editingId ? 'Edit Sub Admin' : 'Create Sub Admin'}</h3>

                        <form onSubmit={handleSaveSubAdmin}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Sub Admin Username</label>
                                <input
                                    type="text"
                                    value={formUsername}
                                    onChange={e => setFormUsername(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Sub Admin Password</label>
                                <input
                                    type="password"
                                    value={formPassword}
                                    onChange={e => setFormPassword(e.target.value)}
                                    placeholder={editingId ? "Leave blank to keep unchanged" : ""}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                                    required={!editingId}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ margin: '0 0 16px 0', paddingBottom: '8px', borderBottom: '2px solid #f3f4f6' }}>Permissions</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <ToggleSwitch label="View Users" checked={permissions.viewUsers} onChange={c => setPermissions({ ...permissions, viewUsers: c })} />
                                    <ToggleSwitch label="Delete Users" checked={permissions.deleteUsers} onChange={c => setPermissions({ ...permissions, deleteUsers: c })} />
                                    <ToggleSwitch label="View Recipes" checked={permissions.viewRecipes} onChange={c => setPermissions({ ...permissions, viewRecipes: c })} />
                                    <ToggleSwitch label="Delete Recipes" checked={permissions.deleteRecipes} onChange={c => setPermissions({ ...permissions, deleteRecipes: c })} />
                                    <ToggleSwitch label="View Comments" checked={permissions.viewComments} onChange={c => setPermissions({ ...permissions, viewComments: c })} />
                                    <ToggleSwitch label="Delete Comments" checked={permissions.deleteComments} onChange={c => setPermissions({ ...permissions, deleteComments: c })} />
                                    <ToggleSwitch label="Moderate Reports" checked={permissions.moderateReports} onChange={c => setPermissions({ ...permissions, moderateReports: c })} />
                                    <ToggleSwitch label="Maintenance Mode Control" checked={permissions.maintenanceControl} onChange={c => setPermissions({ ...permissions, maintenanceControl: c })} />
                                    <ToggleSwitch label="View Admin Logs" checked={permissions.viewLogs} onChange={c => setPermissions({ ...permissions, viewLogs: c })} />
                                    <ToggleSwitch label="Access Trash/Restore" checked={permissions.trashControl} onChange={c => setPermissions({ ...permissions, trashControl: c })} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', position: 'sticky', bottom: 0, background: 'white', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                                <button type="submit" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{editingId ? 'Save Changes' : 'Create Account'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
