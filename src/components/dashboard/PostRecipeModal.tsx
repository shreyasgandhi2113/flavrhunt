import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Category, Recipe } from '../../types';

interface PostRecipeModalProps {
    onClose: () => void;
    initialData?: Recipe;
}

const CATEGORIES: Category[] = ['Snacks', 'Munchies', 'Bread/Rotis', 'Main Course', 'Starter', 'Dessert', 'Shakes & Beverages', 'Healthy'];

export const PostRecipeModal: React.FC<PostRecipeModalProps> = ({ onClose, initialData }) => {
    const { postRecipe, updateRecipe } = useApp();

    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        info: initialData?.info || '',
        ingredients: initialData?.ingredients.join('\n') || '',
        process: initialData?.process || '',
        tips: initialData?.tips || '',
        time: initialData?.time.toString() || '30',
        type: initialData?.type || 'Veg',
        image: initialData?.image || ''
    });

    const [selectedTags, setSelectedTags] = useState<Category[]>(initialData?.tags || []);

    const toggleTag = (tag: Category) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const recipeData: Omit<Recipe, 'id' | 'hostId' | 'hostName' | 'rating' | 'reviews'> = {
            title: formData.title,
            info: formData.info,
            ingredients: formData.ingredients.split('\n').filter(i => i.trim()),
            process: formData.process,
            tips: formData.tips,
            tags: selectedTags,
            time: parseInt(formData.time),
            type: formData.type,
            image: formData.image || '🥘',
            likedBy: [],
            ratings: {}
        };

        if (initialData) {
            updateRecipe(initialData.id, recipeData);
        } else {
            postRecipe(recipeData);
        }

        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                        {initialData ? 'Edit Recipe' : 'Post New Recipe'}
                    </h2>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Share your recipe with the community
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* BASIC INFORMATION */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>BASIC INFORMATION</h3>
                        <div className="modal-divider"></div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Recipe Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Mac and Cheese"
                                    className="modal-input"
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Recipe Type</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {['Veg', 'Vegan', 'Non-Veg'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                className="type-pill"
                                                onClick={() => setFormData({ ...formData, type })}
                                                style={{
                                                    background: formData.type === type ? 'var(--primary-accent)' : '#F3F4F6',
                                                    color: formData.type === type ? 'white' : '#374151',
                                                }}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Cover Image</label>
                                    <label className="upload-card">
                                        {formData.image && formData.image.startsWith('data:') ? (
                                            <img src={formData.image} alt="Preview" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                        ) : (
                                            <>
                                                <span style={{ fontSize: '24px', marginBottom: '8px' }}>📷</span>
                                                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Drag image here or click to upload</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RECIPE DETAILS */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>RECIPE DETAILS</h3>
                        <div className="modal-divider"></div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Category Tags</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {CATEGORIES.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '16px',
                                                border: 'none',
                                                background: selectedTags.includes(tag) ? 'var(--primary-accent)' : '#F3F4F6',
                                                color: selectedTags.includes(tag) ? 'white' : '#374151',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>Cooking Time</label>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Enter cooking time in minutes.</div>
                                <input
                                    type="number"
                                    name="time"
                                    value={formData.time}
                                    onChange={handleChange}
                                    className="modal-input"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>Short Description</label>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Write a short description of the recipe.</div>
                                <textarea
                                    name="info"
                                    value={formData.info}
                                    onChange={handleChange}
                                    placeholder="Describe your dish..."
                                    className="modal-input"
                                    style={{ height: '80px' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* INGREDIENTS */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>INGREDIENTS</h3>
                        <div className="modal-divider"></div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>Ingredients list</label>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Ingredients (One per line)<br />
                                Example:<br />
                                1 cup pasta<br />
                                200g cheese<br />
                                1 tbsp olive oil
                            </div>
                            <textarea
                                name="ingredients"
                                value={formData.ingredients}
                                onChange={handleChange}
                                placeholder="1 cup pasta&#10;200g cheese"
                                className="modal-input"
                                style={{ height: '120px' }}
                                required
                            />
                        </div>
                    </div>

                    {/* PREPARATION */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>PREPARATION</h3>
                        <div className="modal-divider"></div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>Preparation steps</label>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Write each step on a new line.</div>
                            <textarea
                                name="process"
                                value={formData.process}
                                onChange={handleChange}
                                placeholder="Step 1: Boil water&#10;Step 2: Add pasta"
                                className="modal-input"
                                style={{ height: '140px' }}
                                required
                            />
                        </div>
                    </div>

                    {/* TIPS */}
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>TIPS</h3>
                        <div className="modal-divider"></div>

                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>Important Tips</label>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Optional advice for better results.</div>
                            <textarea
                                name="tips"
                                value={formData.tips}
                                onChange={handleChange}
                                placeholder="Example:&#10;Use salted butter for better flavor."
                                className="modal-input"
                                style={{ height: '100px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'var(--primary-accent)',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--secondary-accent)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--primary-accent)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {initialData ? 'Save Changes' : 'Post Recipe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
