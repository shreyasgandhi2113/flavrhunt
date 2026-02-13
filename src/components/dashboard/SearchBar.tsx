import React, { useState, useEffect } from 'react';
import type { Category } from '../../types';

interface SearchBarProps {
    onSearch: (query: string, tag: Category | 'All') => void;
}

const TAGS: Category[] = ['Snacks', 'Munchies', 'Bread/Rotis', 'Main Course', 'Starter', 'Dessert', 'Shakes & Beverages', 'Healthy'];

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [activeTag, setActiveTag] = useState<Category | 'All'>('All');

    useEffect(() => {
        const timeout = setTimeout(() => {
            onSearch(query, activeTag);
        }, 300);
        return () => clearTimeout(timeout);
    }, [query, activeTag]);

    return (
        <div style={{ marginBottom: '32px' }}>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
                <input
                    type="text"
                    placeholder="Search for a recipe (e.g. Palak Paneer)..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        borderRadius: '99px',
                        border: 'none',
                        background: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        fontSize: '16px',
                        outline: 'none'
                    }}
                />
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
