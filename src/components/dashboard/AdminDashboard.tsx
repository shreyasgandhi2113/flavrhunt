import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminUsersView } from './AdminUsersView';
import { AdminRecipesView } from './AdminRecipesView';
import { AdminMaintenanceView } from './AdminMaintenanceView';


type AdminViewProp = 'users' | 'recipes' | 'maintenance';

import logo from '../../assets/flavrhunt-logo.png';

export const AdminDashboard: React.FC = () => {
    const { logout } = useApp();
    const [currentView, setCurrentView] = useState<AdminViewProp>('users');
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

    const handleNavigateToRecipe = (recipeId: string) => {
        setSelectedRecipeId(recipeId);
        setCurrentView('recipes');
    };

    const handleNavigateToUser = (userId: string) => {
        setSelectedUserId(userId);
        setCurrentView('users');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', background: '#f9fafb' }}>
            {/* Top Navigation */}
            <div style={{ height: '64px', background: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={logo} alt="FlavrHunt" style={{ height: '40px', width: 'auto' }} />
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>FlavrHunt Admin</span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {(['users', 'recipes', 'maintenance'] as const).map(view => (
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
                                fontWeight: currentView === view ? 'bold' : 'normal'
                            }}
                        >
                            {view}
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
                {currentView === 'maintenance' && <AdminMaintenanceView />}
            </div>
        </div>
    );
};
