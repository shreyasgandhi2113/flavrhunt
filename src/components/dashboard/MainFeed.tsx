import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { DashboardView, Recipe, Category } from '../../types';
import { SearchBar } from './SearchBar';
import { RecipeCard } from '../home/RecipeCard'; // Reusing from Home
import { PostRecipeModal } from './PostRecipeModal';
import { RecipeDetailModal } from './RecipeDetailModal';

interface MainFeedProps {
    view: DashboardView;
}

export const MainFeed: React.FC<MainFeedProps> = ({ view }) => {
    const { recipes, currentUser, getRecipeById } = useApp();

    // Local State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState<string>('All');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [recipeToEdit, setRecipeToEdit] = useState<Recipe | undefined>(undefined);

    // Filter Logic
    const filteredRecipes = useMemo(() => {
        if (!currentUser) return [];

        let result = [...recipes];

        // 0. User Preference Filter (applied first as default filter)
        if (currentUser.preference === 'Veg') {
            // Veg users see Veg and Vegan
            result = result.filter(r => r.type === 'Veg' || r.type === 'Vegan');
        } else if (currentUser.preference === 'Vegan') {
            // Vegan users see only Vegan
            result = result.filter(r => r.type === 'Vegan');
        }
        // 'All' preference sees everything (Veg, Vegan, Non-Veg) - no filter needed

        // 1. View Filter
        if (view === 'liked') {
            result = result.filter(r => currentUser.likedRecipes.includes(r.id));
        } else if (view === 'watchLater') {
            result = result.filter(r => currentUser.watchLaterRecipes.includes(r.id));
        } else if (view === 'myRecipes') {
            result = result.filter(r => r.hostId === currentUser.id);
        }

        // 2. Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(r => r.title.toLowerCase().includes(q));
        }

        // 3. Tag Filter
        if (activeTag !== 'All') {
            result = result.filter(r => r.tags.includes(activeTag as any));
        }

        // Sort by rating (as requested "one with most star will come first")
        result.sort((a, b) => b.rating - a.rating);

        return result;
    }, [recipes, currentUser, view, searchQuery, activeTag]);

    const handleSearch = (q: string, tag: Category | 'All') => {
        setSearchQuery(q);
        setActiveTag(tag);
    };

    const selectedRecipe = selectedRecipeId ? getRecipeById(selectedRecipeId) : null;

    return (
        <div className="main-feed">
            <div className="feed-header">
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                        {view === 'feed' ? 'Discover Recipes' :
                            view === 'liked' ? 'Liked Recipes' :
                                view === 'watchLater' ? 'Watch Later' : 'My Recipes'}
                    </h1>
                    <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
                        {filteredRecipes.length} recipes found
                    </p>
                </div>

                <button className="post-btn" onClick={() => {
                    setRecipeToEdit(undefined);
                    setIsPostModalOpen(true);
                }}>
                    <span>+</span> Post Recipe
                </button>
            </div>

            <SearchBar onSearch={handleSearch} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {filteredRecipes.map(recipe => (
                    <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        variant="standard"
                        onClick={(id: string) => setSelectedRecipeId(id)}
                        onEdit={(recipe) => {
                            setRecipeToEdit(recipe);
                            setIsPostModalOpen(true);
                        }}
                    />
                ))}

                {filteredRecipes.length === 0 && (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '64px', color: '#9ca3af' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍳</div>
                        <h3>No recipes found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {isPostModalOpen && (
                <PostRecipeModal
                    onClose={() => {
                        setIsPostModalOpen(false);
                        setRecipeToEdit(undefined);
                    }}
                    initialData={recipeToEdit}
                />
            )}

            {selectedRecipe && (
                <RecipeDetailModal recipe={selectedRecipe} onClose={() => setSelectedRecipeId(null)} />
            )}
        </div>
    );
};
