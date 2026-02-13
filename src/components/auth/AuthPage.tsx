import React, { useMemo, useState } from 'react';
import './AuthPage.css';
import logo from '../../assets/flavrhunt-logo.png';
import { useApp } from '../../context/AppContext';
import { ProjectInfoCard } from '../ui/ProjectInfoCard';
import type { Recipe } from '../../types';

type AuthMode = 'signin' | 'signup' | 'admin';
type Preference = 'All' | 'Veg' | 'Vegan';

// Fallback recipe when no recipes exist
const FALLBACK_RECIPE: Recipe = {
    id: 'fallback',
    title: 'Welcome to FlavrHunt',
    image: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
    rating: 5.0,
    reviews: 0,
    time: 0,
    hostId: 'system',
    hostName: 'FlavrHunt',
    info: 'Start sharing your favorite recipes with the community!',
    ingredients: ['Your creativity', 'Fresh ingredients', 'Love for cooking'],
    process: 'Join our community and start sharing amazing recipes.',
    tips: 'Sign up to get started!',
    type: 'Veg',
    tags: ['Healthy'],
    likedBy: [],
    ratings: {}
};

export default function AuthPage() {
    const { login, signup, adminLogin, recipes, maintenanceStatus } = useApp();

    // Latest recipe is first (we prepend on post)
    const latestRecipe = useMemo(() => recipes[0] ?? FALLBACK_RECIPE, [recipes]);

    const [mode, setMode] = useState<AuthMode>('signin');

    // Force Admin mode if maintenance is on and user tries to do something? 
    // Or just show message.

    // ... rest of state ...
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        age: '',
        preference: 'All' as Preference,
    });

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (maintenanceStatus === 'active' && mode !== 'admin') {
            setError('FlavrHunt is currently under maintenance. Only Admin login is allowed.');
            return;
        }

        if (mode === 'signin') {
            const success = login(formData.username, formData.password);
            if (!success) setError('Invalid username or credentials.');
            return;
        }


        if (mode === 'admin') {
            const success = adminLogin(formData.username, formData.password);
            if (!success) setError('Invalid admin credentials.');
            return;
        }

        // Sign Up
        if (!formData.username || !formData.password || !formData.email || !formData.fullName || !formData.age) {
            setError('Please fill in all fields');
            return;
        }

        try {
            signup({
                ...formData,
                age: parseInt(formData.age, 10),
                status: 'active',
                joinedAt: new Date().toISOString(),
                recipesPosted: []
            });
            setMessage('Account Created! Please login.');
            setMode('signin');
            setFormData(prev => ({ ...prev, password: '' }));
        } catch (e: any) {
            setError(e.message || 'Signup failed');
        }
    };

    return (
        <div className="auth-page">
            {/* Left Panel - Brand */}
            <div className="auth-brand-panel">
                <div className="brand-content">
                    <div className="brand-logo">
                        <img src={logo} alt="FlavrHunt" className="logo-image" />
                    </div>

                    <div className="recipe-card-preview fade-in">
                        <div className="preview-image" style={{
                            background: (latestRecipe.image.startsWith('http') || latestRecipe.image.startsWith('data:')) ? `url(${latestRecipe.image})` : latestRecipe.image,
                            backgroundSize: (latestRecipe.image.startsWith('http') || latestRecipe.image.startsWith('data:')) ? 'cover' : undefined,
                            backgroundPosition: 'center',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px'
                        }}>
                            {(!latestRecipe.image.startsWith('http') && !latestRecipe.image.startsWith('data:')) && (latestRecipe.tags.includes('Vegan') ? '🥗' :
                                latestRecipe.tags.includes('Sweet') ? '🍓' :
                                    latestRecipe.tags.includes('Pasta') ? '🍝' :
                                        latestRecipe.tags.includes('Fish') ? '🐟' : '🥘')}
                        </div>
                        <div className="preview-content">
                            <h3>{latestRecipe.title}</h3>
                            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 8px 0' }}>
                                by @{latestRecipe.hostName}
                            </p>
                            <div className="preview-rating">
                                <span className="stars">★★★★★</span>
                                <span className="count">{latestRecipe.rating.toFixed(1)} ({latestRecipe.reviews})</span>
                            </div>
                            <div className="preview-tags">
                                {latestRecipe.tags.slice(0, 3).map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="auth-form-panel">
                <div className="auth-form-container fade-in">
                    {maintenanceStatus === 'active' && (
                        <div style={{ background: '#fef3c7', color: '#92400e', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', border: '1px solid #f59e0b' }}>
                            <strong>⚠️ FlavrHunt is currently under maintenance.</strong><br />
                            <span style={{ fontSize: '13px' }}>User sign in and sign up are disabled.</span>
                        </div>
                    )}
                    <div className="auth-header">
                        <h1>{mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Admin Login'}</h1>
                        <p>{mode === 'signin' ? 'Enter your credentials to continue' : mode === 'signup' ? 'Fill in your details to join' : 'Restricted access area'}</p>
                    </div>

                    {mode !== 'admin' && maintenanceStatus !== 'active' && (
                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
                                onClick={() => { setMode('signin'); setMessage(''); setError(''); }}
                            >
                                Sign in
                            </button>
                            <button
                                className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                                onClick={() => { setMode('signup'); setMessage(''); setError(''); }}
                            >
                                Sign up
                            </button>
                        </div>
                    )}

                    {message && <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{message}</div>}
                    {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Form content remains same */}
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                name="username"
                                placeholder="Enter username"
                                value={formData.username}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        {mode === 'signup' && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="hello@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="form-input"
                                        required
                                    />
                                </div>
                                <div className="form-group-row" style={{ display: 'flex', gap: '16px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label className="form-label">Age</label>
                                        <input
                                            type="number"
                                            name="age"
                                            placeholder="25"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className="form-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label className="form-label">Preference</label>
                                        <div className="preference-chips">
                                            {['All', 'Veg', 'Vegan'].map((pref) => (
                                                <div
                                                    key={pref}
                                                    className={`preference-chip ${pref === 'All' ? 'all-recipes' : pref === 'Veg' ? 'vegetarian' : 'vegan'} ${formData.preference === pref ? 'selected' : ''}`}
                                                    onClick={() => setFormData(prev => ({ ...prev, preference: pref as Preference }))}
                                                >
                                                    {pref}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                        </div>

                        <button type="submit" className="submit-btn" style={{ background: mode === 'admin' ? '#ef4444' : undefined }}>
                            {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Admin Login'}
                        </button>

                        <div style={{ marginTop: '16px', textAlign: 'center' }}>
                            {mode !== 'admin' ? (
                                <button
                                    type="button"
                                    onClick={() => { setMode('admin'); setMessage(''); setError(''); setFormData(prev => ({ ...prev, username: '', password: '' })); }}
                                    style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Admin Login
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => { setMode('signin'); setMessage(''); setError(''); setFormData(prev => ({ ...prev, username: '', password: '' })); }}
                                    style={{ background: 'transparent', border: 'none', color: '#6b7280', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Back to User Login
                                </button>
                            )}
                        </div>
                    </form>
                    <ProjectInfoCard />
                </div>
            </div>
        </div >
    );
}
