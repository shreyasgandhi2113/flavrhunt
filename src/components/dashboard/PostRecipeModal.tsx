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

        const recipeData = {
            title: formData.title,
            info: formData.info,
            ingredients: formData.ingredients.split('\n').filter(i => i.trim()),
            process: formData.process,
            tips: formData.tips,
            tags: selectedTags,
            time: parseInt(formData.time),
            type: formData.type as 'Veg' | 'Vegan' | 'Non-Veg',
            image: formData.image || '🥘',
            likedBy: [],
            ratings: {}
        } as any;

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
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>{initialData ? 'Edit Recipe' : 'Post New Recipe'}</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Recipe Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. Mac and Cheese"
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '14px' }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Recipe Type</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="Veg"
                                        checked={formData.type === 'Veg'}
                                        onChange={handleChange}
                                    />
                                    Veg
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="Vegan"
                                        checked={formData.type === 'Vegan'}
                                        onChange={handleChange}
                                    />
                                    Vegan
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                                    <input
                                        type="radio"
                                        name="type"
                                        value="Non-Veg"
                                        checked={formData.type === 'Non-Veg'}
                                        onChange={handleChange}
                                    />
                                    Non-Veg
                                </label>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Cover Image</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {formData.image && formData.image.startsWith('data:') ? (
                                    <img src={formData.image} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                                ) : (
                                    <span style={{ fontSize: '24px' }}>{formData.image || '📷'}</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ fontSize: '12px' }}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Category Tags</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {CATEGORIES.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '99px',
                                        border: '1px solid',
                                        borderColor: selectedTags.includes(tag) ? '#111827' : '#e5e7eb',
                                        background: selectedTags.includes(tag) ? '#111827' : 'white',
                                        color: selectedTags.includes(tag) ? 'white' : '#4b5563',
                                        cursor: 'pointer',
                                        fontSize: '13px'
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Time (mins)</label>
                            <input
                                type="number"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Short Info</label>
                        <textarea
                            name="info"
                            value={formData.info}
                            onChange={handleChange}
                            placeholder="Describe your dish..."
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', height: '60px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Ingredients (One per line)</label>
                        <textarea
                            name="ingredients"
                            value={formData.ingredients}
                            onChange={handleChange}
                            placeholder="1 cup Pasta&#10;200g Cheese"
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', height: '100px' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Preparation Process</label>
                        <textarea
                            name="process"
                            value={formData.process}
                            onChange={handleChange}
                            placeholder="Step 1: Boil water..."
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', height: '120px' }}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Important Tips</label>
                        <textarea
                            name="tips"
                            value={formData.tips}
                            onChange={handleChange}
                            placeholder="Use salted butter for..."
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', height: '80px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '14px', borderRadius: '99px', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="post-btn"
                            style={{ flex: 1, justifyContent: 'center' }}
                        >
                            {initialData ? 'Save Changes' : 'Post Recipe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
