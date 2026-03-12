import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminUsersView } from './AdminUsersView';
import { AdminRecipesView } from './AdminRecipesView';
import { AdminMaintenanceView } from './AdminMaintenanceView';
import { AdminActivityView } from './AdminActivityView';
import { AdminTrashView } from './AdminTrashView';
import { AdminCommentsView } from './AdminCommentsView';
import { AdminReportsView } from './AdminReportsView';
import { AdminManagementView } from './AdminManagementView';

type AdminViewProp = 'users' | 'recipes' | 'comments' | 'reports' | 'activity' | 'trash' | 'maintenance' | 'admin-management';

import logo from '../../assets/flavrhunt-logo.png';

export const AdminDashboard: React.FC = () => {
    const { logout, currentUser } = useApp();
    const [currentView, setCurrentView] = useState<AdminViewProp>('users');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

    const p = currentUser?.permissions;
    const isSuper = currentUser?.isSuperAdmin;

    const availableViews: AdminViewProp[] = [];
    if (isSuper || p?.viewUsers) availableViews.push('users');
    if (isSuper || p?.viewRecipes) availableViews.push('recipes');
    if (isSuper || p?.viewComments) availableViews.push('comments');
    if (isSuper || p?.moderateReports) availableViews.push('reports');
    if (isSuper || p?.viewLogs) availableViews.push('activity');
    if (isSuper || p?.trashControl) availableViews.push('trash');
    if (isSuper || p?.maintenanceControl) availableViews.push('maintenance');
    if (isSuper) availableViews.push('admin-management');

    useEffect(() => {
        if (!availableViews.includes(currentView) && availableViews.length > 0) {
            setCurrentView(availableViews[0]);
        }
    }, [currentUser, currentView, availableViews]);

    const handleNavigateToRecipe = (recipeId: string) => {
        if (availableViews.includes('recipes')) {
            setSelectedRecipeId(recipeId);
            setCurrentView('recipes');
        }
    };

    const handleNavigateToUser = (userId: string) => {
        if (availableViews.includes('users')) {
            setSelectedUserId(userId);
            setCurrentView('users');
        }
    };

    const handleNavigateToComment = (_commentId: string) => {
        if (availableViews.includes('comments')) {
            setCurrentView('comments');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#F7F7F8', fontFamily: 'Inter, sans-serif', color: '#111111' }}>
            {/* Sidebar */}
            <div style={{ width: '240px', background: '#FFFFFF', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid #E5E7EB', height: '64px', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
                    <img src={logo} alt="FlavrHunt" style={{ height: '32px', width: 'auto' }} />
                </div>

                <div style={{ padding: '24px 16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '14px' }}>Menu</div>
                    {availableViews.map(view => {
                        const iconMap: Record<AdminViewProp, string> = {
                            'users': '👤',
                            'recipes': '🥘',
                            'comments': '💬',
                            'reports': '🚩',
                            'activity': '📋',
                            'trash': '🗑️',
                            'maintenance': '⚙️',
                            'admin-management': '🔐'
                        };

                        const labelMap: Record<AdminViewProp, string> = {
                            'users': 'User Management',
                            'recipes': 'Recipe Management',
                            'comments': 'Comment Moderation',
                            'reports': 'Reports',
                            'activity': 'Activity Logs',
                            'trash': 'Trash / Soft Deletes',
                            'maintenance': 'Maintenance System',
                            'admin-management': 'Admin Settings'
                        };

                        return (
                            <button
                                key={view}
                                onClick={() => setCurrentView(view)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '10px 14px',
                                    background: currentView === view ? 'rgba(255,122,24,0.12)' : 'transparent',
                                    color: currentView === view ? '#FF7A18' : '#6B7280',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    transition: 'all 0.2s ease',
                                    textAlign: 'left'
                                }}
                                onMouseEnter={e => {
                                    if (currentView !== view) {
                                        e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                                        e.currentTarget.style.color = '#111111';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (currentView !== view) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#6B7280';
                                    }
                                }}
                            >
                                <span style={{ fontSize: '16px' }}>{iconMap[view]}</span>
                                {labelMap[view]}
                            </button>
                        );
                    })}
                </div>

                <div style={{ padding: '24px 16px', borderTop: '1px solid #E5E7EB' }}>
                    <button
                        onClick={logout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 14px',
                            background: 'transparent',
                            color: '#EF4444',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            width: '100%',
                            textAlign: 'left',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <span style={{ fontSize: '16px' }}>🚪</span>
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
                {/* Admin Header */}
                <div style={{
                    height: '64px',
                    background: '#FFFFFF',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    boxSizing: 'border-box'
                }}>
                    <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0, textTransform: 'capitalize' }}>
                        {currentView.replace('-', ' ')}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search..."
                                style={{
                                    height: '36px',
                                    padding: '0 16px 0 36px',
                                    borderRadius: '18px',
                                    border: '1px solid #E5E7EB',
                                    background: '#F9FAFB',
                                    fontSize: '14px',
                                    outline: 'none',
                                    width: '240px',
                                    transition: 'all 0.2s ease'
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

                        <div style={{ position: 'relative', cursor: 'pointer', fontSize: '20px' }}>
                            🔔
                            <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%' }}></span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FF7A18, #FF9F43)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}>
                                {currentUser?.fullName.charAt(0) || 'A'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '14px', fontWeight: 600 }}>{currentUser?.fullName || 'Admin'}</span>
                                <span style={{ fontSize: '12px', color: '#6B7280' }}>Super Admin</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                    {currentView === 'users' && (
                        <AdminUsersView
                            selectedUserId={selectedUserId}
                            onClearSelectedUser={() => setSelectedUserId(null)}
                            onNavigateToRecipe={handleNavigateToRecipe}
                        />
                    )}
                    {currentView === 'recipes' && (
                        <AdminRecipesView
                            selectedRecipeId={selectedRecipeId}
                            onClearSelectedRecipe={() => setSelectedRecipeId(null)}
                            onNavigateToUser={handleNavigateToUser}
                        />
                    )}
                    {currentView === 'comments' && (
                        <AdminCommentsView onNavigateToRecipe={handleNavigateToRecipe} onNavigateToUser={handleNavigateToUser} />
                    )}
                    {currentView === 'reports' && (
                        <AdminReportsView onNavigateToRecipe={handleNavigateToRecipe} onNavigateToUser={handleNavigateToUser} onNavigateToComment={handleNavigateToComment} />
                    )}
                    {currentView === 'activity' && <AdminActivityView />}
                    {currentView === 'trash' && <AdminTrashView />}
                    {currentView === 'maintenance' && <AdminMaintenanceView />}
                    {currentView === 'admin-management' && <AdminManagementView />}
                </div>
            </div>
        </div>
    );
};
