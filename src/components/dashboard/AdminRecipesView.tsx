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
    const { recipes, deleteRecipe } = useApp();
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
        <div className="admin-view">
            <div className="admin-header">
                <h2>Recipes Management</h2>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        Total: <strong>{recipes.length}</strong> | Non-Veg: <strong>{nonVegCount}</strong> | Veg: <strong>{vegCount}</strong> | Vegan: <strong>{veganCount}</strong>
                    </div>
                    <input
                        type="text"
                        placeholder="Search recipes or host..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-search-input"
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '300px' }}
                    />
                </div>
            </div>

            <div className="recipes-list" style={{ marginTop: '20px', background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Recipe Name</th>
                            <th style={{ padding: '10px' }}>Host</th>
                            <th style={{ padding: '10px' }}>Type</th>
                            <th style={{ padding: '10px' }}>Rating</th>
                            <th style={{ padding: '10px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecipes.map(recipe => (
                            <tr key={recipe.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td
                                    style={{ padding: '10px', cursor: 'pointer', color: '#2563eb', fontWeight: 500 }}
                                    onClick={() => setSelectedRecipe(recipe)}
                                    title="View Value"
                                >
                                    {recipe.title}
                                </td>
                                <td
                                    style={{ padding: '10px', cursor: 'pointer', color: '#2563eb', fontWeight: 500 }}
                                    onClick={() => onNavigateToUser(recipe.hostId)}
                                    title="View user details"
                                >
                                    @{recipe.hostName}
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        fontSize: '12px',
                                        background: recipe.type === 'Vegan' ? '#d1fae5' : '#fef3c7',
                                        color: recipe.type === 'Vegan' ? '#065f46' : '#92400e'
                                    }}>
                                        {recipe.type}
                                    </span>
                                </td>
                                <td style={{ padding: '10px' }}>★ {recipe.rating.toFixed(1)}</td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => handleDelete(recipe.id, recipe.title)}
                                        style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#ef4444' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredRecipes.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No recipes found.</td>
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
