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
    status: 'active' | 'disabled';
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
    hostId: string;
    hostName: string;
    info: string;
    ingredients: string[];
    process: string;
    tips: string;
    tags: Category[];
    rating: number; // average rating calculated from ratings object
    reviews: number; // total count of ratings
    image: string; // Emoji or URL
    time: number; // minutes
    type: 'Veg' | 'Vegan' | 'Non-Veg';
    likedBy: string[]; // user IDs who have liked this recipe
    ratings: { [userId: string]: number }; // per-user ratings: userId -> rating value (1-5)
}
