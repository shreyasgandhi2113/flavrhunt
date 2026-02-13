import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { RecipeCard } from './RecipeCard';
import './Home.css';
import type { Recipe, Category } from '../../types';

// --- MOCK DATA ---
const currentUser = {
    id: 'u1',
    name: 'Shreyas',
    avatar: 'SG'
};

const FEATURED_RECIPE: Recipe = {
    id: 'r1',
    title: 'Truffle Mushroom Risotto',
    image: 'linear-gradient(135deg, #fce7f3 0%, #eef2ff 100%)',
    rating: 4.9,
    reviews: 428,
    time: 45,
    hostId: 'system',
    hostName: 'Chef Shreyas',
    info: 'A luxurious and creamy mushroom risotto.',
    ingredients: ['Arborio Rice', 'Mushrooms', 'Truffle Oil', 'Parmesan'],
    process: 'Cook rice slowly adding broth...',
    tips: 'Use warm broth for best results.',
    tags: ['Vegetarian', 'Gourmet', 'Dinner'],
    type: 'Veg'
};

const RECOMMENDED_RECIPES: Recipe[] = [
    { id: 'r2', title: 'Avocado Toast Deluxe', image: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', rating: 4.8, reviews: 156, time: 10, hostId: 'u1', hostName: 'Chef', info: '', ingredients: [], process: '', tips: '', type: 'Vegan', tags: ['Vegan', 'Breakfast'] },
    { id: 'r3', title: 'Berry Power Smoothie', image: 'linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%)', rating: 4.7, reviews: 89, time: 5, hostId: 'u1', hostName: 'Chef', info: '', ingredients: [], process: '', tips: '', type: 'Vegan', tags: ['Healthy', 'Quick', 'Sweet'] },
    { id: 'r4', title: 'Spicy Salmon Bowl', image: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)', rating: 4.9, reviews: 210, time: 25, hostId: 'u1', hostName: 'Chef', info: '', ingredients: [], process: '', tips: '', type: 'Non-Veg', tags: ['Healthy', 'Fish', 'Dinner'] },
    { id: 'r5', title: 'Pesto Pasta', image: 'linear-gradient(135deg, #ecfccb 0%, #d9f99d 100%)', rating: 4.6, reviews: 120, time: 20, hostId: 'u1', hostName: 'Chef', info: '', ingredients: [], process: '', tips: '', type: 'Veg', tags: ['Vegetarian', 'Pasta', 'Quick'] },
];

const TRENDING_RECIPES: Recipe[] = [
    { id: 'r6', title: 'Classic Cheeseburger', image: 'linear-gradient(135deg, #fee2e2 0%, #ffcaca 100%)', rating: 4.8, reviews: 1024, time: 30, hostId: 'u1', hostName: 'Chef', info: '', ingredients: [], process: '', tips: '', type: 'Non-Veg', tags: ['Dinner', 'Comfort Food', 'Non-Veg'] },
    { id: 'r7', title: 'Caesar Salad', image: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', rating: 4.5, reviews: 540, time: 15, hostId: 'u1', hostName: 'Chef', info: '', ingredients: [], process: '', tips: '', type: 'Veg', tags: ['Healthy', 'Salad', 'Vegetarian'] },
    { id: 'r8', title: 'Chocolate Lava Cake', image: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', rating: 4.9, reviews: 2300, time: 35, hostId: 'u1', hostName: 'Chef', info: '', ingredients: [], process: '', tips: '', type: 'Veg', tags: ['Sweet', 'Dessert', 'Vegetarian'] },
    { id: 'r9', title: 'Thai Green Curry', image: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)', rating: 4.7, reviews: 850, time: 40, hostId: 'u1', hostName: 'Chef', info: '', ingredients: [], process: '', tips: '', type: 'Non-Veg', tags: ['Dinner', 'Spicy', 'Non-Veg'] },
];

const MASTER_RECIPES = [FEATURED_RECIPE, ...RECOMMENDED_RECIPES, ...TRENDING_RECIPES];

const CATEGORIES: Category[] = ['All', 'Vegan', 'Vegetarian', 'Non-Veg', 'Healthy', 'Quick'];

export const HomePage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(TRENDING_RECIPES);

    const handleFilter = (cat: Category) => {
        setSelectedCategory(cat);
        if (cat === 'All') {
            setFilteredRecipes(TRENDING_RECIPES);
        } else {
            let filterTag = cat as string;
            setFilteredRecipes(MASTER_RECIPES.filter(r =>
                r.tags.includes(filterTag) || (filterTag === 'Quick' && r.time <= 20)
            ));
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-gradient)' }}>
            <Navbar user={currentUser} onLogout={() => console.log('logout')} />

            <main className="container home-main">

                {/* SECTION 1: Welcome Header */}
                <section style={{ marginBottom: '48px' }}>
                    <h1 className="welcome-title">
                        Welcome back, {currentUser.name}
                    </h1>
                    <p className="welcome-subtitle">
                        Discover recipes curated just for you
                    </p>
                </section>

                {/* SECTION 2: Hero Layout (Featured + Top Picks) */}
                <section className="hero-grid">
                    <div className="hero-main">
                        <h2 className="section-title">
                            Featured Recipe
                            <span style={{ fontSize: '13px', padding: '2px 10px', background: '#fef3c7', color: '#b45309', borderRadius: '99px' }}>Top Pick</span>
                        </h2>
                        <div style={{ height: '400px' }}>
                            <RecipeCard recipe={FEATURED_RECIPE} variant="hero" />
                        </div>
                    </div>
                    <div className="quick-picks">
                        <h2 className="section-title" style={{ margin: 0 }}>⚡ Quick Picks</h2>
                        {RECOMMENDED_RECIPES.slice(0, 3).map(recipe => (
                            <RecipeCard key={recipe.id} recipe={recipe} variant="compact" />
                        ))}
                    </div>
                </section>

                {/* SECTION 3: Recommended Horizontal Scroll */}
                <section style={{ marginBottom: '64px' }}>
                    <div className="scroll-header">
                        <h2 className="section-title" style={{ marginBottom: 0 }}>Recommended for You</h2>
                        <button style={{ background: 'none', border: 'none', color: '#14b8a6', fontWeight: 500, cursor: 'pointer' }}>See All</button>
                    </div>
                    <div className="scroll-container">
                        {RECOMMENDED_RECIPES.map(recipe => (
                            <div key={recipe.id} style={{ minWidth: '280px' }}>
                                <RecipeCard recipe={recipe} variant="standard" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 5: Filters */}
                <div className="filter-bar hide-scrollbar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => handleFilter(cat)}
                            className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* SECTION 6: Trending Grid */}
                <section className="trending-grid">
                    <div style={{ gridColumn: '1 / -1' }}>
                        <h2 className="section-title">Trending Now 🔥</h2>
                    </div>
                    {filteredRecipes.map(recipe => (
                        <RecipeCard key={recipe.id} recipe={recipe} variant="standard" />
                    ))}
                </section>

                {/* FOOTER */}
                <footer className="footer">
                    <p>© 2025 FlavrHunt. Crafted with love for food lovers.</p>
                </footer>

            </main>
        </div>
    );
};
