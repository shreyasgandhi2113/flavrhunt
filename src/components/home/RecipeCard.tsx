import React from 'react';
import { useApp } from '../../context/AppContext';
import type { Recipe } from '../../types';

interface RecipeCardProps {
    recipe: Recipe;
    variant?: 'hero' | 'standard' | 'compact';

    onClick?: (id: string) => void;
    onEdit?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, variant = 'standard', onClick, onEdit }) => {
    const { currentUser } = useApp();
    const isHero = variant === 'hero';
    const isCompact = variant === 'compact';
    const isOwner = currentUser?.id === recipe.hostId;

    // Container
    const containerStyle: React.CSSProperties = {
        background: 'white',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        cursor: 'pointer',
        boxShadow: isHero ? '0 20px 40px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: isCompact ? 'row' : 'column',
        height: isHero ? '100%' : isCompact ? '100px' : '360px',
        minWidth: isHero ? '100%' : isCompact ? '280px' : '260px',
    };

    // Card Image
    const isUrl = recipe.image.startsWith('data:') || recipe.image.startsWith('http');
    const imageStyle: React.CSSProperties = {
        height: isHero ? '60%' : isCompact ? '100%' : '200px',
        width: isCompact ? '100px' : '100%',
        background: isUrl ? `url(${recipe.image})` : recipe.image,
        backgroundSize: isUrl ? 'cover' : undefined,
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isHero ? '80px' : '48px',
        position: 'relative',
    };

    // Badges
    const badgeContainerStyle: React.CSSProperties = {
        position: 'absolute',
        top: '16px',
        left: '16px',
        display: 'flex',
        gap: '8px',
    };

    const badgeStyle: React.CSSProperties = {
        padding: '4px 10px',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(4px)',
        borderRadius: '99px',
        fontSize: '11px',
        fontWeight: 600,
        color: '#374151',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    };



    // Content Area
    const contentStyle: React.CSSProperties = {
        padding: isCompact ? '0 16px' : '20px',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: isCompact ? 'center' : 'flex-start',
    };

    const titleStyle: React.CSSProperties = {
        fontSize: isHero ? '28px' : isCompact ? '16px' : '18px',
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 4px 0',
        lineHeight: 1.2,
    };

    const metaStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginTop: 'auto',
        fontSize: '13px',
        color: '#6b7280',
        fontWeight: 500,
    };

    return (
        <div
            className="recipe-card"
            style={containerStyle}
            onClick={() => onClick?.(recipe.id)}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = isHero ? 'scale(1.01) translateY(-4px)' : 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isHero ? '0 20px 40px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.05)';
            }}
        >
            {/* Image Section */}
            <div style={imageStyle}>
                <div style={{ transition: 'transform 0.5s ease' }}>
                    {!isUrl && (recipe.tags.includes('Vegan') ? '🥗' :
                        recipe.tags.includes('Sweet') ? '🍓' :
                            recipe.tags.includes('Pasta') ? '🍝' :
                                recipe.tags.includes('Fish') ? '🐟' : '🥘')}
                </div>


                {!isCompact && (
                    <div style={badgeContainerStyle}>
                        {recipe.tags.slice(0, 2).map(tag => (
                            <span key={tag} style={badgeStyle}>{tag}</span>
                        ))}
                    </div>
                )}

            </div>

            {/* Info Section */}
            <div style={contentStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={titleStyle}>{recipe.title}</h3>
                    {isHero && <span style={{ fontSize: '24px' }}>🔥</span>}
                </div>

                {!isCompact && (
                    <p style={{
                        fontSize: '14px', color: '#6b7280', margin: '4px 0 16px 0',
                        lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                        {recipe.info}
                    </p>
                )}

                <div style={metaStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#f59e0b' }}>★</span>
                        <span style={{ color: '#1f2937' }}>{recipe.rating}</span>
                        <span style={{ color: '#9ca3af' }}>({recipe.reviews})</span>
                    </div>
                    {isOwner && onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(recipe);
                            }}
                            style={{
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                borderRadius: '6px',
                                padding: '2px 8px',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                color: '#4b5563'
                            }}
                        >
                            Edit
                        </button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}>
                        <span>⏱</span>
                        <span>{recipe.time} m</span>
                    </div>
                </div>

                {isHero && (
                    <button style={{
                        marginTop: '24px',
                        width: '100%',
                        padding: '14px',
                        background: '#111827',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 600,
                        fontSize: '15px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                        View Recipe
                    </button>
                )}
            </div>
        </div>
    );
};
