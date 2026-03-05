export interface AdminLog {
    logId: string;
    adminName: string;
    actionType: string;
    targetType: 'recipe' | 'user' | 'comment' | 'system';
    targetName: string;
    timestamp: number;
}

export const addAdminLog = (adminName: string, actionType: string, targetType: AdminLog['targetType'], targetName: string) => {
    try {
        const existing = localStorage.getItem('flavrAdminLogs');
        const logs: AdminLog[] = existing ? JSON.parse(existing) : [];
        logs.push({
            logId: Date.now().toString() + Math.random(),
            adminName,
            actionType,
            targetType,
            targetName,
            timestamp: Date.now()
        });
        localStorage.setItem('flavrAdminLogs', JSON.stringify(logs));
    } catch (e) {
        console.error("Failed to add admin log", e);
    }
};

export interface Report {
    reportId: string;
    reportType: 'recipe' | 'comment' | 'user';
    targetId: string;
    targetName: string;
    reportedByUser: string;
    reason: string;
    timestamp: number;
    status: 'pending' | 'resolved';
}

export const addReport = (reportType: Report['reportType'], targetId: string, targetName: string, reportedByUser: string, reason: string) => {
    try {
        const existing = localStorage.getItem('flavrReports');
        const reports: Report[] = existing ? JSON.parse(existing) : [];
        reports.push({
            reportId: Date.now().toString() + Math.random(),
            reportType,
            targetId,
            targetName,
            reportedByUser,
            reason,
            timestamp: Date.now(),
            status: 'pending'
        });
        localStorage.setItem('flavrReports', JSON.stringify(reports));
    } catch (e) {
        console.error("Failed to add report", e);
    }
};
