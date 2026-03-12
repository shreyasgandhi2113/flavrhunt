import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

import { RecipeDetailModal } from './RecipeDetailModal';
import type { Recipe } from '../../types';

interface AdminRecipesViewProps {
    selectedRecipeId: string | null;
    onClearSelectedRecipe: () => void;
    onNavigateToUser: (userId: string) => void;
}

export const AdminRecipesView: React.FC<AdminRecipesViewProps> = ({
    selectedRecipeId,
    onClearSelectedRecipe,
    onNavigateToUser
}) => {
    const { recipes, deleteRecipe, currentUser } = useApp();
    const canDelete = currentUser?.isSuperAdmin || currentUser?.permissions?.deleteRecipes;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

    // Auto-select recipe when navigating from another view
    useEffect(() => {
        if (selectedRecipeId) {
            const recipe = recipes.find(r => r.id === selectedRecipeId);
            if (recipe) {
                setSelectedRecipe(recipe);
                onClearSelectedRecipe();
            }
        }
    }, [selectedRecipeId, recipes, onClearSelectedRecipe]);

    const filteredRecipes = recipes.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.hostName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const nonVegCount = recipes.filter(r => r.type === 'Non-Veg').length;
    const vegCount = recipes.filter(r => r.type === 'Veg').length;
    const veganCount = recipes.filter(r => r.type === 'Vegan').length;

    const handleDelete = (id: string, title: string) => {
        if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
            deleteRecipe(id);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search recipes or host..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                height: '44px',
                                padding: '0 16px 0 44px',
                                borderRadius: '10px',
                                border: '1px solid #E5E7EB',
                                background: '#FFFFFF',
                                fontSize: '14px',
                                outline: 'none',
                                width: '320px',
                                transition: 'all 0.2s ease',
                                color: '#111111'
                            }}
                            onFocus={e => {
                                e.currentTarget.style.borderColor = '#FF7A18';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255,122,24,0.15)';
                            }}
                            onBlur={e => {
                                e.currentTarget.style.borderColor = '#E5E7EB';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#111111', fontWeight: 600 }}>{recipes.length}</span> Total</span>
                        <span style={{ color: '#E5E7EB' }}>|</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#111111', fontWeight: 600 }}>{nonVegCount}</span> Non-Veg</span>
                        <span style={{ color: '#E5E7EB' }}>|</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#111111', fontWeight: 600 }}>{vegCount}</span> Veg</span>
                        <span style={{ color: '#E5E7EB' }}>|</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ color: '#111111', fontWeight: 600 }}>{veganCount}</span> Vegan</span>
                    </div>
                </div>
            </div>

            <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <tr>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Recipe Image</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Title</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Author</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Type</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Posted Date</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280' }}>Status</th>
                            <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#6B7280', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecipes.map(recipe => {
                            const isUrl = recipe.image.startsWith('data:') || recipe.image.startsWith('http');
                            return (
                                <tr
                                    key={recipe.id}
                                    style={{ borderBottom: '1px solid #E5E7EB', height: '64px', transition: 'background 0.2s ease' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#FFF7F2'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '0 16px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden',
                                            background: isUrl ? `url(${recipe.image}) center/cover` : '#F9FAFB',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                                            border: '1px solid #E5E7EB'
                                        }}>
                                            {!isUrl && (recipe.type === 'Vegan' ? '🥗' : recipe.type === 'Veg' ? '🥦' : '🥩')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '0 16px', fontSize: '14px', fontWeight: 500, color: '#111111' }}>{recipe.title}</td>
                                    <td style={{ padding: '0 16px' }}>
                                        <div
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', transition: 'background 0.2s ease' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            onClick={() => onNavigateToUser(recipe.hostId)}
                                        >
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF7A18, #FF9F43)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'white', fontSize: '10px', justifyContent: 'center' }}>
                                                {recipe.hostName.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontSize: '13px', color: '#4B5563', fontWeight: 500 }}>{recipe.hostName}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0 16px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            background: recipe.type === 'Vegan' ? '#DCFCE7' : recipe.type === 'Veg' ? '#FEF3C7' : '#FEE2E2',
                                            color: recipe.type === 'Vegan' ? '#166534' : recipe.type === 'Veg' ? '#92400E' : '#991B1B'
                                        }}>
                                            {recipe.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0 16px', fontSize: '13px', color: '#6B7280' }}>
                                        {new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '0 16px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            background: '#F3F4F6',
                                            color: '#374151'
                                        }}>
                                            Published
                                        </span>
                                    </td>
                                    <td style={{ padding: '0 16px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => setSelectedRecipe(recipe)}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #E5E7EB',
                                                    background: 'transparent',
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    color: '#111111',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.borderColor = '#FF7A18';
                                                    e.currentTarget.style.color = '#FF7A18';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                                    e.currentTarget.style.color = '#111111';
                                                }}
                                            >
                                                View
                                            </button>

                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(recipe.id, recipe.title)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #FEE2E2',
                                                        background: '#FEF2F2',
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        color: '#EF4444',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.background = '#FEE2E2';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.background = '#FEF2F2';
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredRecipes.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>🍳</div>
                                    No recipes found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedRecipe && (
                <RecipeDetailModal
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                    viewMode="admin"
                />
            )}
        </div>
    );
};
