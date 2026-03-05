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
    const { logout, currentUser, maintenanceStatus, maintenanceSettings } = useApp();
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
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: '#f9fafb' }}>
            {/* Top Navigation */}
            <div style={{ height: '64px', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={logo} alt="FlavrHunt" style={{ height: '40px', width: 'auto' }} />
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>FlavrHunt Admin</span>
                    {/* Live Status Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600,
                        background: maintenanceStatus === 'active' ? 'rgba(220,38,38,0.2)'
                            : (maintenanceStatus === 'pending' || maintenanceSettings.startTime || maintenanceSettings.countdownStartedAt) ? 'rgba(245,158,11,0.2)'
                                : 'rgba(16,185,129,0.2)',
                        color: maintenanceStatus === 'active' ? '#fca5a5'
                            : (maintenanceStatus === 'pending' || maintenanceSettings.startTime || maintenanceSettings.countdownStartedAt) ? '#fcd34d'
                                : '#6ee7b7'
                    }}>
                        <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: maintenanceStatus === 'active' ? '#ef4444'
                                : (maintenanceStatus === 'pending' || maintenanceSettings.startTime || maintenanceSettings.countdownStartedAt) ? '#f59e0b'
                                    : '#10b981'
                        }} />
                        {maintenanceStatus === 'active' ? 'Maintenance Active'
                            : (maintenanceStatus === 'pending' || maintenanceSettings.startTime || maintenanceSettings.countdownStartedAt) ? 'Scheduled'
                                : 'Live'}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingRight: '12px' }}>
                        {availableViews.map(view => (
                            <button
                                key={view}
                                onClick={() => setCurrentView(view)}
                                style={{
                                    padding: '8px 16px',
                                    background: currentView === view ? '#374151' : 'transparent',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    fontWeight: currentView === view ? 'bold' : 'normal',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {view.replace('-', ' ')}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={logout}
                        style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
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
    );
};
