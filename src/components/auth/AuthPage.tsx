import React, { useMemo, useState, useEffect } from 'react';
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
    const { login, signup, adminLogin, recipes, maintenanceStatus, users, isFeatureDisabled } = useApp();

    // Latest recipe is first (we prepend on post)
    const latestRecipe = useMemo(() => recipes[0] ?? FALLBACK_RECIPE, [recipes]);

    const [mode, setMode] = useState<AuthMode>('signin');
    const [showPassword, setShowPassword] = useState(false);

    // Login Limiter State
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [countdown, setCountdown] = useState(0);

    // Animation State
    const [isSuccess, setIsSuccess] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    // Form Validation State
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const storedAttempts = sessionStorage.getItem('flavrLoginAttempts');
        if (storedAttempts) {
            setLoginAttempts(parseInt(storedAttempts, 10));
        }

        const storedLockTime = sessionStorage.getItem('flavrLoginLockTime');
        if (storedLockTime) {
            const lockUntil = parseInt(storedLockTime, 10);
            if (lockUntil > Date.now()) {
                setCountdown(Math.ceil((lockUntil - Date.now()) / 1000));
            } else {
                sessionStorage.removeItem('flavrLoginAttempts');
                sessionStorage.removeItem('flavrLoginLockTime');
            }
        }
    }, []);

    useEffect(() => {
        let timer: ReturnType<typeof setInterval>;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        setLoginAttempts(0);
                        sessionStorage.removeItem('flavrLoginAttempts');
                        sessionStorage.removeItem('flavrLoginLockTime');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

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

    const usernameError = (!formData.username) ? ''
        : (formData.username.length < 3) ? 'Minimum 3 characters'
            : (/\s/.test(formData.username)) ? 'No spaces allowed'
                : (mode === 'signup' && users.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) ? 'Username already taken'
                    : '';

    const passwordError = (!formData.password) ? ''
        : (formData.password.length < 6) ? 'Minimum 6 characters'
            : '';

    const emailError = mode === 'signup' && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ? 'Invalid email format' : '';

    const isFormValid = mode === 'signin'
        ? (!usernameError && !passwordError && formData.username && formData.password)
        : mode === 'admin'
            ? (formData.username && formData.password)
            : (!usernameError && !passwordError && !emailError && formData.username && formData.password && formData.email && formData.fullName && formData.age);

    const isLoginBlocked = mode === 'signin' && countdown > 0;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // also touch the field when typing dynamically
        setTouchedFields(prev => ({ ...prev, [name]: true }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setTouchedFields(prev => ({ ...prev, [e.target.name]: true }));
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
            if (isLoginBlocked) return; // double check

            const user = users.find(u => u.username === formData.username);

            if (!user) {
                setError('Invalid username or password.');
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 600);

                const newAttempts = loginAttempts + 1;
                setLoginAttempts(newAttempts);
                sessionStorage.setItem('flavrLoginAttempts', newAttempts.toString());

                if (newAttempts >= 5) {
                    const lockUntil = Date.now() + 30000;
                    sessionStorage.setItem('flavrLoginLockTime', lockUntil.toString());
                    setCountdown(30);
                    setError('Too many failed attempts. Please wait 30 seconds.');
                }
            } else if (user.status === 'disabled') {
                login(formData.username, formData.password);
                setError('Your account is disabled.');
            } else {
                setIsSuccess(true);
                setLoginAttempts(0);
                sessionStorage.removeItem('flavrLoginAttempts');
                sessionStorage.removeItem('flavrLoginLockTime');

                setTimeout(() => {
                    login(formData.username, formData.password);
                }, 800);
            }
            return;
        }


        if (mode === 'admin') {
            const success = adminLogin(formData.username, formData.password);
            if (!success) {
                setError('Invalid admin credentials.');
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 600);
            }
            return;
        }

        // Sign Up
        if (!isFormValid) {
            setTouchedFields({
                username: true,
                password: true,
                email: true,
                fullName: true,
                age: true
            });
            setError('Please fill in all fields correctly');
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
            setTouchedFields({});
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

                    <h2 className="brand-tagline">Discover. Cook. Share.</h2>
                    <p className="brand-description">
                        Explore recipes from cooks around the world.
                    </p>

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
                            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '4px 0 8px 0', fontWeight: 500 }}>
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
            <div className={`auth-form-panel ${isShaking ? 'shake-animation' : ''}`}>
                <div className="auth-form-container fade-in">
                    {maintenanceStatus === 'active' && (
                        <div className="auth-alert auth-alert-warning">
                            <strong>⚠️ FlavrHunt is currently under maintenance.</strong><br />
                            <span style={{ fontSize: '13px' }}>User sign in and sign up are disabled.</span>
                        </div>
                    )}
                    <div className="auth-header">
                        <h1>{mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Admin Login'}</h1>
                        <p>{mode === 'signin' ? 'Sign in to continue exploring recipes' : mode === 'signup' ? 'Fill in your details to join the community' : 'Restricted access area'}</p>
                    </div>

                    {mode !== 'admin' && maintenanceStatus !== 'active' && (
                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
                                onClick={() => { setMode('signin'); setMessage(''); setError(''); setTouchedFields({}); }}
                            >
                                Sign in
                            </button>
                            {!isFeatureDisabled('registration') && (
                                <button
                                    className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                                    onClick={() => { setMode('signup'); setMessage(''); setError(''); setTouchedFields({}); }}
                                >
                                    Sign up
                                </button>
                            )}
                        </div>
                    )}

                    {message && <div className="auth-alert auth-alert-success">{message}</div>}
                    {error && <div className="auth-alert auth-alert-error">{error}</div>}

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
                                onBlur={handleBlur}
                                className={`form-input ${touchedFields.username ? (usernameError ? 'is-invalid' : 'is-valid') : ''}`}
                                required
                            />
                            {touchedFields.username && usernameError && <span className="error-text">{usernameError}</span>}
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
                                        onBlur={handleBlur}
                                        className={`form-input ${touchedFields.email ? (emailError ? 'is-invalid' : 'is-valid') : ''}`}
                                        required
                                    />
                                    {touchedFields.email && emailError && <span className="error-text">{emailError}</span>}
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

                        <div className="form-group" style={{ position: 'relative' }}>
                            <label className="form-label">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`form-input ${touchedFields.password ? (passwordError ? 'is-invalid' : 'is-valid') : ''}`}
                                    required
                                    style={{ paddingRight: '40px' }}
                                />
                                <span
                                    className="password-toggle-icon"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                            <line x1="2" x2="22" y1="2" y2="22" />
                                        </svg>
                                    )}
                                </span>
                            </div>
                            {touchedFields.password && passwordError && <span className="error-text">{passwordError}</span>}
                        </div>

                        <button
                            type="submit"
                            className={`submit-btn ${isSuccess ? 'success-animation' : ''} ${error && isShaking ? 'error-animation' : ''}`}
                            disabled={isLoginBlocked || !isFormValid}
                            style={{
                                background: mode === 'admin' ? '#EF4444' : undefined,
                                opacity: (isLoginBlocked || !isFormValid) ? 0.5 : 1,
                                cursor: (isLoginBlocked || !isFormValid) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {isSuccess ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    Success
                                </span>
                            ) : mode === 'signin' ? (
                                isLoginBlocked ? `Please wait ${countdown}s` : 'Sign in'
                            ) : mode === 'signup' ? (
                                'Create account'
                            ) : (
                                'Admin Login'
                            )}
                        </button>

                        <div className="auth-secondary-action">
                            {mode !== 'admin' ? (
                                <button
                                    type="button"
                                    onClick={() => { setMode('admin'); setMessage(''); setError(''); setFormData(prev => ({ ...prev, username: '', password: '' })); }}
                                    className="auth-secondary-btn"
                                >
                                    Admin Login
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => { setMode('signin'); setMessage(''); setError(''); setFormData(prev => ({ ...prev, username: '', password: '' })); }}
                                    className="auth-secondary-btn"
                                >
                                    ← Back to User Login
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
