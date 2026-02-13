import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

interface SettingsModalProps {
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
    const { currentUser, updateUser } = useApp();

    const [formData, setFormData] = useState({
        username: currentUser?.username || '',
        email: currentUser?.email || '',
        fullName: currentUser?.fullName || '',
        age: currentUser?.age?.toString() || '',
        preference: currentUser?.preference || 'All'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            updateUser({
                username: formData.username,
                email: formData.email,
                fullName: formData.fullName,
                age: parseInt(formData.age) || 0,
                preference: formData.preference as any
            });
        }
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Account Settings</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Age</label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                                required
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Preference</label>
                            <select
                                name="preference"
                                value={formData.preference}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px', background: 'white' }}
                            >
                                <option value="All">All</option>
                                <option value="Veg">Veg</option>
                                <option value="Vegan">Vegan</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '14px', borderRadius: '99px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '99px',
                                border: 'none',
                                background: '#111827',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
