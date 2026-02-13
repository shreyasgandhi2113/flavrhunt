import React, { useState } from 'react';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { MainFeed } from './MainFeed';
import type { DashboardView } from '../../types';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
    const [view, setView] = useState<DashboardView>('feed');

    return (
        <div className="dashboard-layout">
            <LeftSidebar activeView={view} onViewChange={setView} />
            <MainFeed view={view} />
            <RightSidebar />
        </div>
    );
};
