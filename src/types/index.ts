export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    age: number;
    preference: 'All' | 'Veg' | 'Vegan';
    avatar?: string;
    likedRecipes: string[];
    watchLaterRecipes: string[];
    myRecipes: string[];
    password?: string; // Optional because we don't store it for all users/admins in all views
    role?: 'user' | 'admin';
    status: 'active' | 'disabled' | 'deleted';
    joinedAt: string; // ISO Date string
    recipesPosted: string[]; // Duplicate of myRecipes but specifically requested
}

// Tags used throughout the app. Kept flexible because users can post recipes with custom tags.
export type Category =
    | 'All'
    | 'Snacks'
    | 'Munchies'
    | 'Bread/Rotis'
    | 'Main Course'
    | 'Starter'
    | 'Dessert'
    | 'Shakes & Beverages'
    | 'Healthy'
    | 'Vegetarian'
    | 'Vegan'
    | 'Non-Veg'
    | 'Quick'
    | (string & {});

export type DashboardView = 'feed' | 'liked' | 'watchLater' | 'myRecipes';

export interface Recipe {
    id: string;
    title: string;
    image: string;
    rating: number;
    reviews: number;
    time: number;
    hostId: string;
    hostName: string;
    info: string;
    ingredients: string[];
    process: string;
    tips: string;
    type: string;
    tags: string[];
    likedBy: string[];
    ratings: Record<string, number>;
    status?: 'active' | 'deleted';
}