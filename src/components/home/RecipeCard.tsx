import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Recipe } from '../../types';

interface RecipeCardProps {
    recipe: Recipe;
    variant?: 'hero' | 'standard' | 'compact' | 'dashboard';

    onClick?: (id: string) => void;
    onEdit?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, variant = 'standard', onClick, onEdit }) => {
    const { currentUser, toggleLike } = useApp();
    const [isHovered, setIsHovered] = useState(false);
    const [showHeart, setShowHeart] = useState(false);
    const isHero = variant === 'hero';
    const isCompact = variant === 'compact';
    const isOwner = currentUser?.id === recipe.hostId;

    // Container
    const containerStyle: React.CSSProperties = {
        background: 'var(--card-bg, white)',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        cursor: 'pointer',
        boxShadow: isHovered
            ? '0 20px 40px rgba(0,0,0,0.12)'
            : isHero ? '0 20px 40px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.05)',
        transform: isHovered ? (isHero ? 'scale(1.01) translateY(-4px)' : 'scale(1.03) translateY(-6px)') : 'translateY(0)',
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
        background: isUrl
            ? `${isHovered ? 'linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), ' : ''}url(${recipe.image})`
            : recipe.image,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isHero ? '80px' : '48px',
        position: 'relative',
        transition: 'all 0.3s ease'
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
        fontWeight: isHovered ? 800 : 700,
        color: 'var(--text-primary, #111827)',
        margin: '0 0 4px 0',
        lineHeight: 1.2,
        transition: 'font-weight 0.2s',
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

    if (variant === 'dashboard') {
        return (
            <div
                className="recipe-card dashboard-card"
                onClick={() => onClick?.(recipe.id)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    background: 'var(--card-bg, #FFFFFF)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    boxShadow: isHovered ? '0 12px 30px rgba(0,0,0,0.12)' : '0 6px 20px rgba(0,0,0,0.08)',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 0
                }}
            >
                <div style={{ width: '100%', height: '240px', overflow: 'hidden', position: 'relative' }}>
                    <div
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (currentUser && !currentUser.likedRecipes.includes(recipe.id)) {
                                toggleLike(recipe.id);
                                setShowHeart(true);
                                setTimeout(() => setShowHeart(false), 500);
                            }
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            background: isUrl ? 'var(--card-bg, #f3f4f6)' : recipe.image,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '48px',
                            transition: 'transform 0.2s ease',
                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                    >
                        {isUrl ? (
                            <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ transition: 'transform 0.5s ease', opacity: isUrl && isHovered ? 0 : 1 }}>
                                {recipe.tags.includes('Vegan') ? '🥗' :
                                    recipe.tags.includes('Sweet') ? '🍓' :
                                        recipe.tags.includes('Pasta') ? '🍝' :
                                            recipe.tags.includes('Fish') ? '🐟' : '🥘'}
                            </div>
                        )}
                    </div>
                    {/* Heart Burst Animation Overlay */}
                    {showHeart && (
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '64px',
                            color: '#ef4444',
                            animation: 'heartBurst 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
                            zIndex: 10,
                            pointerEvents: 'none'
                        }}>
                            ❤️
                        </div>
                    )}

                    {isOwner && onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(recipe);
                            }}
                            className="recipe-edit-btn"
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid #E5E7EB',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                color: '#374151',
                                transition: 'all 0.2s ease',
                                zIndex: 5,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = 'var(--primary-accent)';
                                e.currentTarget.style.color = 'var(--primary-accent)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#E5E7EB';
                                e.currentTarget.style.color = '#374151';
                            }}
                        >
                            Edit
                        </button>
                    )}
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {recipe.tags && recipe.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {recipe.tags.slice(0, 2).map(tag => (
                                <span key={tag} style={{
                                    background: 'var(--tag-bg, #FFF3E8)',
                                    color: 'var(--primary-accent)',
                                    borderRadius: '12px',
                                    padding: '4px 10px',
                                    fontSize: '12px',
                                    fontWeight: 500
                                }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                    <h3 style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        margin: '0 0 8px 0',
                        lineHeight: 1.3
                    }}>
                        {recipe.title}
                    </h3>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        margin: 0,
                        lineHeight: 1.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {recipe.info}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="recipe-card"
            style={containerStyle}
            onClick={() => onClick?.(recipe.id)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Section */}
            <div
                style={imageStyle}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (currentUser && !currentUser.likedRecipes.includes(recipe.id)) {
                        toggleLike(recipe.id);
                        setShowHeart(true);
                        setTimeout(() => setShowHeart(false), 500);
                    }
                }}
            >
                <div style={{ transition: 'transform 0.5s ease', opacity: isUrl && isHovered ? 0 : 1 }}>
                    {!isUrl && (recipe.tags.includes('Vegan') ? '🥗' :
                        recipe.tags.includes('Sweet') ? '🍓' :
                            recipe.tags.includes('Pasta') ? '🍝' :
                                recipe.tags.includes('Fish') ? '🐟' : '🥘')}
                </div>

                {/* Heart Burst Animation Overlay */}
                {showHeart && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '64px',
                        color: '#ef4444',
                        animation: 'heartBurst 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
                        zIndex: 10,
                        pointerEvents: 'none'
                    }}>
                        ❤️
                    </div>
                )}


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
