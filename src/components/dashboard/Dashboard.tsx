import React, { useState } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { MainFeed } from './MainFeed';
import type { DashboardView } from '../../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const [view, setView] = useState<DashboardView>('feed');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('flavrDashboardTheme') === 'dark';
    });

    const toggleTheme = () => {
        setIsDarkMode(prev => {
            const next = !prev;
            localStorage.setItem('flavrDashboardTheme', next ? 'dark' : 'light');
            return next;
        });
    };

    return (
        <div className={`dashboard-layout ${isDarkMode ? 'theme-dark' : ''}`}>
            <LeftSidebar activeView={view} onViewChange={setView} />
            <MainFeed view={view} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <RightSidebar />
        </div>
    );
};
