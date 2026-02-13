import React from 'react';
import './ProjectInfoCard.css';

export const ProjectInfoCard: React.FC = () => {
    return (
        <div className="project-info-card">
            <span className="project-info-label">Project by</span>
            <div className="project-info-names">
                <span className="developer-name">Shreyas Gandhi</span>
                <span className="developer-name">Raj Vishwakarma</span>
            </div>
            <div className="project-info-contact">
                <a href="mailto:flavrhunt@gmail.com" className="contact-email">
                    Contact: flavrhunt@gmail.com
                </a>
            </div>
        </div>
    );
};
