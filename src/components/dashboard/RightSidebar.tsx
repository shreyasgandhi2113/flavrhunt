import React from 'react';
import { useApp } from '../../context/AppContext';
import { SettingsModal } from './SettingsModal';
import { ProjectInfoCard } from '../ui/ProjectInfoCard';

export const RightSidebar: React.FC = () => {
    const { currentUser, logout } = useApp();
    const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

    if (!currentUser) return null;

    return (
        <>
            <aside className="sidebar sidebar-right">
                <div className="section-label">My Account</div>

                <div className="user-card">
                    <div className="user-avatar-lg">
                        {currentUser.fullName.charAt(0)}
                    </div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>{currentUser.fullName}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>@{currentUser.username}</p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '600', fontSize: '16px' }}>{currentUser.myRecipes.length}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Posts</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: '600', fontSize: '16px' }}>{currentUser.likedRecipes.length}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Likes</div>
                        </div>
                    </div>
                </div>

                <div className="section-label">Account Actions</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                        className="nav-item"
                        style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left' }}
                        onClick={() => setIsSettingsOpen(true)}
                    >
                        <span>⚙️</span> Account Settings
                    </button>
                    <button
                        className="nav-item"
                        style={{ width: '100%', background: 'transparent', border: 'none', textAlign: 'left', color: '#ef4444' }}
                        onClick={() => {
                            if (window.confirm('Are you sure you want to logout?')) {
                                logout();
                            }
                        }}
                    >
                        <span>🚪</span> Logout
                    </button>
                </div>

                <ProjectInfoCard />
            </aside>

            {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
        </>
    );
};
