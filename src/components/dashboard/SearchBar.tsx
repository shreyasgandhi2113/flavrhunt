import React, { useState, useEffect, useRef } from 'react';
import type { Category } from '../../types';
import { useApp } from '../../context/AppContext';

interface SearchBarProps {
    onSearch: (query: string, tag: Category | 'All') => void;
}

const TAGS: Category[] = ['Snacks', 'Munchies', 'Bread/Rotis', 'Main Course', 'Starter', 'Dessert', 'Shakes & Beverages', 'Healthy'];

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const { recipes } = useApp();
    const [query, setQuery] = useState('');
    const [activeTag, setActiveTag] = useState<Category | 'All'>('All');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const suggestons = query.trim()
        ? recipes.filter(r => r.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
        : [];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onSearch(query, activeTag);
        }, 300);
        return () => clearTimeout(timeout);
    }, [query, activeTag]);

    return (
        <div style={{ marginBottom: '32px' }}>
            <div ref={wrapperRef} style={{ position: 'relative', marginBottom: '16px' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', zIndex: 2 }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search for a recipe (e.g. Palak Paneer)..."
                    value={query}
                    onFocus={() => setShowSuggestions(true)}
                    onChange={e => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        borderRadius: '99px',
                        border: 'none',
                        background: 'var(--search-bg, white)',
                        color: 'var(--text-primary, inherit)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        fontSize: '16px',
                        outline: 'none',
                        position: 'relative',
                        zIndex: 1
                    }}
                />

                {showSuggestions && suggestons.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '8px',
                        background: 'var(--card-bg, white)',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1))',
                        zIndex: 10,
                        overflow: 'hidden',
                        padding: '8px'
                    }}>
                        {suggestons.map(recipe => (
                            <div
                                key={recipe.id}
                                className="search-suggestion-item"
                                onClick={() => {
                                    setQuery(recipe.title);
                                    setShowSuggestions(false);
                                    onSearch(recipe.title, activeTag);
                                }}
                                style={{
                                    padding: '12px 16px',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary, inherit)',
                                    transition: 'background 0.2s'
                                }}
                            >
                                <span style={{ marginRight: '8px' }}>🍳</span>
                                {recipe.title}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                <button
                    onClick={() => setActiveTag('All')}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '99px',
                        border: 'none',
                        background: activeTag === 'All' ? '#111827' : 'rgba(255,255,255,0.6)',
                        color: activeTag === 'All' ? 'white' : '#6b7280',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '13px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                    }}
                >
                    All
                </button>
                {TAGS.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setActiveTag(tag)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '99px',
                            border: 'none',
                            background: activeTag === tag ? '#111827' : 'rgba(255,255,255,0.6)',
                            color: activeTag === tag ? 'white' : '#6b7280',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '13px',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
};
