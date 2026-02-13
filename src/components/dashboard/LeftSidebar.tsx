import React from 'react';
import logo from '../../assets/flavrhunt-logo.png';

import type { DashboardView } from '../../types';

interface LeftSidebarProps {
    activeView: DashboardView;
    onViewChange: (view: DashboardView) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeView, onViewChange }) => {
    const menuItems: { id: DashboardView; label: string; icon: string }[] = [
        { id: 'feed', label: 'Main Feed', icon: '🏠' },
        { id: 'liked', label: 'Liked Recipes', icon: '❤️' },
        { id: 'watchLater', label: 'Watch Later', icon: '⏱️' },
        { id: 'myRecipes', label: 'My Recipes', icon: '👨‍🍳' },
    ];

    return (
        <aside className="sidebar">
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', paddingLeft: '12px' }}>
                <img src={logo} alt="FlavrHunt" style={{ width: '150px', height: 'auto' }} />
            </div>

            <div className="section-label">Menu</div>

            <nav>
                {menuItems.map(item => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                        onClick={() => onViewChange(item.id)}
                    >
                        <span style={{ fontSize: '20px' }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </nav>

        </aside>
    );
};
