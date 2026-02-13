import React, { useState, useEffect } from 'react';
import logo from '../../assets/flavrhunt-logo.png';
import './Home.css';

interface NavbarProps {
    user: { name: string; avatar?: string };
    onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container nav-content">
                {/* Left: Logo */}
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <img src={logo} alt="FlavrHunt" style={{ height: '60px', width: 'auto' }} />
                </div>

                {/* Center: Search (Hidden on small screens) */}
                {!window.matchMedia('(max-width: 768px)').matches && (
                    <div className="nav-search">
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '14px' }}>
                            🔍
                        </span>
                        <input
                            type="text"
                            placeholder="Search recipes, ingredients..."
                        />
                    </div>
                )}

                {/* Right: User Actions */}
                <div className="nav-actions">
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                        <span style={{ fontSize: '20px' }}>❤️</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', position: 'relative' }} className="group">
                        <div style={{ textAlign: 'right', display: window.innerWidth < 640 ? 'none' : 'block' }}>
                            <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937', margin: 0 }}>{user.name}</p>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Foodie</p>
                        </div>

                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #14b8a6, #3b82f6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}>
                            {user.avatar || user.name.charAt(0)}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};
