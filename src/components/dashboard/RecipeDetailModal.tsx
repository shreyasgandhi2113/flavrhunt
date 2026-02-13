import React from 'react';
import type { Recipe } from '../../types';
import { useApp } from '../../context/AppContext';

interface RecipeDetailModalProps {
    recipe: Recipe;
    onClose: () => void;
    viewMode?: 'user' | 'admin';
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({ recipe, onClose, viewMode = 'user' }) => {
    const { toggleLike, toggleWatchLater, currentUser, rateRecipe } = useApp();

    const isLiked = currentUser?.likedRecipes.includes(recipe.id);
    const isWatchLater = currentUser?.watchLaterRecipes.includes(recipe.id);
    const userRating = currentUser ? (recipe.ratings[currentUser.id] || 0) : 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    style={{ float: 'right', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
                >
                    ×
                </button>

                <div style={{
                    height: '200px',
                    background: (recipe.image.startsWith('http') || recipe.image.startsWith('data:')) ? `url(${recipe.image})` : recipe.image,
                    backgroundSize: (recipe.image.startsWith('http') || recipe.image.startsWith('data:')) ? 'cover' : undefined,
                    backgroundPosition: 'center',
                    borderRadius: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px'
                }}>
                    {(!recipe.image.startsWith('http') && !recipe.image.startsWith('data:')) && '🥘'}
                </div>

                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>{recipe.title}</h1>
                <div style={{ display: 'flex', gap: '12px', color: '#6b7280', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>By @{recipe.hostName}</span>
                    <span>•</span>
                    <span>⏱️ {recipe.time} min</span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⭐ {recipe.rating} ({recipe.reviews})
                    </span>
                </div>

                {viewMode === 'user' && (
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => toggleLike(recipe.id)}
                            className="post-btn"
                            style={{ background: isLiked ? '#ef4444' : '#f3f4f6', color: isLiked ? 'white' : '#374151', flex: 1, justifyContent: 'center' }}
                        >
                            {isLiked ? '❤️ Liked' : '🤍 Like'}
                        </button>
                        <button
                            onClick={() => toggleWatchLater(recipe.id)}
                            className="post-btn"
                            style={{ background: isWatchLater ? '#3b82f6' : '#f3f4f6', color: isWatchLater ? 'white' : '#374151', flex: 1, justifyContent: 'center' }}
                        >
                            {isWatchLater ? '✅ Saved' : '🔖 Watch Later'}
                        </button>
                    </div>
                )}

                {viewMode === 'user' && (
                    <section style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Rate this recipe</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <button
                                    key={star}
                                    onClick={() => rateRecipe(recipe.id, star)}
                                    style={{
                                        fontSize: '24px',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        opacity: star <= userRating ? 1 : 0.3,
                                        transform: star <= userRating ? 'scale(1.2)' : 'scale(1)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {star <= userRating ? '⭐' : '☆'}
                                </button>
                            ))}
                            {userRating > 0 && (
                                <span style={{ marginLeft: '12px', color: '#6b7280', alignSelf: 'center' }}>
                                    {userRating}/5
                                </span>
                            )}
                        </div>
                    </section>
                )}

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Description</h3>
                    <p style={{ color: '#4b5563', lineHeight: 1.6 }}>{recipe.info}</p>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Ingredients</h3>
                    <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#4b5563', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                        {recipe.ingredients.map((ing, i) => (
                            <li key={i}>{ing}</li>
                        ))}
                    </ul>
                </section>

                <section style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Process</h3>
                    <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', color: '#4b5563', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                        {recipe.process}
                    </div>
                </section>

                <section>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#b45309' }}>💡 Important Tips</h3>
                    <p style={{ fontStyle: 'italic', color: '#4b5563', background: '#fffbeb', padding: '12px', borderRadius: '8px' }}>
                        {recipe.tips}
                    </p>
                </section>

            </div>
        </div>
    );
};
