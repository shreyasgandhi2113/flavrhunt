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
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #E5E7EB', cursor: 'pointer' }}>
            <span style={{ fontWeight: 500, fontSize: '14px', color: '#111111' }}>{label}</span>
            <div style={{
                position: 'relative', width: '44px', height: '24px', backgroundColor: checked ? '#10B981' : '#E5E7EB',
                borderRadius: '12px', transition: 'background-color 0.2s ease', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
            }}>
                <div style={{
                    position: 'absolute', top: '2px', left: checked ? '22px' : '2px', width: '20px', height: '20px',
                    backgroundColor: '#FFFFFF', borderRadius: '50%', transition: 'left 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                }} />
            </div>
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ display: 'none' }} />
        </label>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111111' }}>Admin Management</h2>
                <button
                    onClick={initiateCreate}
                    style={{
                        background: '#111111',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                    Create Sub Admin
                </button>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <tr>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Username</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Created By</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Created Date</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Permissions</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subAdmins.map(sa => {
                            const activePermsCount = Object.values(sa.permissions).filter(Boolean).length;
                            return (
                                <tr
                                    key={sa.subAdminId}
                                    style={{ borderBottom: '1px solid #E5E7EB', height: '64px', transition: 'background 0.2s ease' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '0 16px', fontWeight: 600, fontSize: '14px', color: '#111111' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: '12px' }}>
                                                {sa.username.charAt(0).toUpperCase()}
                                            </div>
                                            {sa.username}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0 16px', fontSize: '14px', color: '#4B5563' }}>{sa.createdBy}</td>
                                    <td style={{ padding: '0 16px', fontSize: '13px', color: '#6B7280' }}>
                                        {new Date(sa.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0 16px' }}>
                                        <span style={{ background: '#F3E8FF', color: '#7E22CE', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                                            {activePermsCount} Enabled
                                        </span>
                                    </td>
                                    <td style={{ padding: '0 16px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                                            background: sa.status === 'active' ? '#DCFCE7' : '#FEF2F2',
                                            color: sa.status === 'active' ? '#166534' : '#991B1B'
                                        }}>
                                            {sa.status === 'active' ? 'Active' : 'Disabled'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0 16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => initiateEdit(sa)}
                                                style={{ background: 'transparent', color: '#374151', border: '1px solid #E5E7EB', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, transition: 'all 0.2s ease' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(sa)}
                                                style={{
                                                    background: sa.status === 'active' ? '#FFFBEB' : '#DCFCE7',
                                                    color: sa.status === 'active' ? '#B45309' : '#166534',
                                                    border: `1px solid ${sa.status === 'active' ? '#FEF3C7' : '#BBF7D0'}`,
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                {sa.status === 'active' ? 'Disable' : 'Enable'}
                                            </button>
                                            <button
                                                onClick={() => deleteSubAdmin(sa)}
                                                style={{ background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, transition: 'all 0.2s ease' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {subAdmins.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
                                    No sub admins created yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Authentication Modal */}
            {showAuthModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ background: '#FFFFFF', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div style={{ width: '48px', height: '48px', background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px auto' }}>🔒</div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 600, color: '#111111' }}>Owner Authentication</h3>
                            <p style={{ color: '#6B7280', margin: 0, fontSize: '14px', lineHeight: 1.5 }}>Please verify your identity as an owner to modify sub-admin settings.</p>
                        </div>

                        {authError && <div style={{ background: '#FEF2F2', color: '#EF4444', padding: '12px 16px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 500, border: '1px solid #FEE2E2', textAlign: 'center' }}>{authError}</div>}

                        <form onSubmit={handleAuthSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px', color: '#4B5563' }}>Username</label>
                                <input
                                    type="text"
                                    value={authUsername}
                                    onChange={e => setAuthUsername(e.target.value)}
                                    placeholder="Enter owner username"
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', boxSizing: 'border-box', background: '#F9FAFB', fontSize: '15px', outline: 'none', transition: 'all 0.2s ease' }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#FF7A18'; e.currentTarget.style.background = '#FFFFFF'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px', color: '#4B5563' }}>Password</label>
                                <input
                                    type="password"
                                    value={authPassword}
                                    onChange={e => setAuthPassword(e.target.value)}
                                    placeholder="Enter owner password"
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', boxSizing: 'border-box', background: '#F9FAFB', fontSize: '15px', outline: 'none', transition: 'all 0.2s ease' }}
                                    onFocus={e => { e.currentTarget.style.borderColor = '#FF7A18'; e.currentTarget.style.background = '#FFFFFF'; }}
                                    onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setShowAuthModal(false)} style={{ flex: 1, background: '#F3F4F6', color: '#374151', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'background 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#E5E7EB'} onMouseLeave={e => e.currentTarget.style.background = '#F3F4F6'}>Cancel</button>
                                <button type="submit" style={{ flex: 1, background: '#111111', color: '#FFFFFF', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'transform 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>Verify Identity</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create/Edit Sub Admin Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', zIndex: 10 }}>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: 600, color: '#111111' }}>{editingId ? 'Edit Sub Admin' : 'Create Sub Admin'}</h3>
                                <p style={{ margin: 0, fontSize: '14px', color: '#6B7280' }}>Configure access levels and permissions</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '24px', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}>&times;</button>
                        </div>

                        <div style={{ padding: '32px', overflowY: 'auto' }}>
                            <form id="sub-admin-form" onSubmit={handleSaveSubAdmin}>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px', color: '#4B5563' }}>Username</label>
                                        <input
                                            type="text"
                                            value={formUsername}
                                            onChange={e => setFormUsername(e.target.value)}
                                            placeholder="Enter username"
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', boxSizing: 'border-box', background: '#F9FAFB', fontSize: '15px', outline: 'none', transition: 'all 0.2s ease' }}
                                            onFocus={e => { e.currentTarget.style.borderColor = '#FF7A18'; e.currentTarget.style.background = '#FFFFFF'; }}
                                            onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}
                                            required
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '13px', color: '#4B5563' }}>Password</label>
                                        <input
                                            type="password"
                                            value={formPassword}
                                            onChange={e => setFormPassword(e.target.value)}
                                            placeholder={editingId ? "Leave blank to keep" : "Enter password"}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E5E7EB', boxSizing: 'border-box', background: '#F9FAFB', fontSize: '15px', outline: 'none', transition: 'all 0.2s ease' }}
                                            onFocus={e => { e.currentTarget.style.borderColor = '#FF7A18'; e.currentTarget.style.background = '#FFFFFF'; }}
                                            onBlur={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}
                                            required={!editingId}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 600, color: '#111111' }}>Access Permissions</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                            </form>
                        </div>

                        <div style={{ padding: '24px 32px', borderTop: '1px solid #E5E7EB', background: '#F9FAFB', display: 'flex', gap: '12px', justifyContent: 'flex-end', zIndex: 10 }}>
                            <button type="button" onClick={() => setShowCreateModal(false)} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', color: '#4B5563', transition: 'all 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'} onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}>Cancel</button>
                            <button type="submit" form="sub-admin-form" style={{ background: '#FF7A18', color: '#FFFFFF', border: 'none', padding: '12px 32px', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, fontSize: '14px', transition: 'transform 0.2s ease', boxShadow: '0 4px 12px rgba(255,122,24,0.2)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>{editingId ? 'Save Changes' : 'Create Account'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
