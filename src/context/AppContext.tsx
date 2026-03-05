import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Recipe, MaintenanceSettings, DisabledFeatures } from '../types';
import { addAdminLog } from '../utils/adminUtils';

const DEFAULT_DISABLED_FEATURES: DisabledFeatures = {
    postRecipes: false,
    comments: false,
    ratings: false,
    registration: false,
    search: false,
    editing: false
};

const DEFAULT_MAINTENANCE_SETTINGS: MaintenanceSettings = {
    maintenanceActive: false,
    maintenanceType: 'full',
    schedulingMode: 'immediate',
    startTime: null,
    endTime: null,
    countdownMinutes: null,
    countdownStartedAt: null,
    messageTitle: '',
    messageDescription: '',
    eta: '',
    disabledFeatures: DEFAULT_DISABLED_FEATURES
};

interface AppContextType {
    currentUser: User | null;
    recipes: Recipe[];
    users: User[];
    login: (username: string, password: string) => boolean;
    adminLogin: (username: string, password: string) => boolean;
    signup: (user: Omit<User, 'id' | 'likedRecipes' | 'watchLaterRecipes' | 'myRecipes'> & { password: string }) => void;
    logout: () => void;
    postRecipe: (recipe: Omit<Recipe, 'id' | 'hostId' | 'hostName' | 'rating' | 'reviews' | 'image'>) => void;
    toggleLike: (recipeId: string) => void;
    toggleWatchLater: (recipeId: string) => void;
    getRecipeById: (id: string) => Recipe | undefined;
    updateUser: (userData: Partial<User>) => void;
    updateRecipe: (recipeId: string, updatedData: Partial<Recipe>) => void;
    rateRecipe: (id: string, rating: number) => void;
    maintenanceStatus: 'off' | 'pending' | 'active';
    setMaintenanceStatus: (status: 'off' | 'pending' | 'active') => void;
    maintenanceStartTime: number | null;
    setMaintenanceStartTime: (time: number | null) => void;
    toggleUserStatus: (userId: string) => void;
    deleteUser: (userId: string, deleteRecipes: boolean) => void;
    permanentDeleteUser: (userId: string, deleteRecipes: boolean) => void;
    deleteRecipe: (recipeId: string) => void;
    permanentDeleteRecipe: (recipeId: string) => void;
    maintenanceSettings: MaintenanceSettings;
    setMaintenanceSettings: (settings: MaintenanceSettings) => void;
    isFeatureDisabled: (feature: keyof DisabledFeatures) => boolean;
}
// ... (skip down to Provider return)


const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const MOCK_RECIPES: Recipe[] = [
    {
        id: 'r1',
        title: 'Palak Paneer',
        hostId: 'u0',
        hostName: 'Chef Sanjeev',
        info: 'A popular North Indian curry made with spinach and cottage cheese.',
        ingredients: ['Spinach', 'Paneer', 'Garlic', 'Ginger', 'Cream', 'Spices'],
        process: '1. Blanch spinach. 2. Sauté spices. 3. Blend spinach. 4. Mix with paneer.',
        tips: "Don't overcook the spinach to keep it green.",
        tags: ['Vegetarian', 'Main Course', 'Healthy'],
        rating: 4.8,
        reviews: 120,
        image: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
        time: 40,
        type: 'Veg',
        likedBy: [],
        ratings: {}
    },
    {
        id: 'r2',
        title: 'Mac and Cheese',
        hostId: 'u1',
        hostName: 'Chef Gordon',
        info: 'The ultimate comfort food.',
        ingredients: ['Macaroni', 'Cheddar Cheese', 'Milk', 'Butter', 'Flour'],
        process: '1. Boil pasta. 2. Make roux. 3. Add cheese. 4. Mix.',
        tips: 'Use freshly grated cheese for better melting.',
        tags: ['Vegetarian', 'Snacks', 'Main Course'],
        rating: 4.5,
        reviews: 85,
        image: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
        time: 25,
        type: 'Veg',
        likedBy: [],
        ratings: {}
    }
];

// No hardcoded users - all users come from localStorage

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(() => {
        try {
            const saved = localStorage.getItem('flavrUsers');
            if (saved) {
                const parsed = JSON.parse(saved);
                return Array.isArray(parsed) ? parsed : [];
            }
            return [];
        } catch (e) {
            console.error("Error initializing users:", e);
            return [];
        }
    });

    const [recipes, setRecipes] = useState<Recipe[]>(() => {
        try {
            // 1. Try new consistent key
            const saved = localStorage.getItem('flavrRecipes');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }

            // 2. Try old key for migration
            const oldSaved = localStorage.getItem('recipes');
            if (oldSaved) {
                const parsed = JSON.parse(oldSaved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    console.log("Migrating recipes from 'recipes' to 'flavrRecipes'...");
                    // Ensure each recipe has required fields from recent updates
                    const migrated = parsed.map((r: any) => ({
                        ...r,
                        likedBy: r.likedBy || [],
                        ratings: r.ratings || {}
                    }));
                    // Persist migration immediately
                    localStorage.setItem('flavrRecipes', JSON.stringify(migrated));
                    return migrated;
                }
            }

            // 3. Fallback to mock data only if pure first run
            return MOCK_RECIPES;
        } catch (e) {
            console.error("Error initializing recipes:", e);
            return MOCK_RECIPES;
        }
    });

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            // Check session storage for independent tabs
            const userSaved = sessionStorage.getItem('flavrCurrentUser');
            const adminSaved = sessionStorage.getItem('flavrAdminSession');

            if (adminSaved) return JSON.parse(adminSaved);
            if (userSaved) return JSON.parse(userSaved);

            return null;
        } catch (e) {
            console.error("Error initializing currentUser:", e);
            return null;
        }
    });

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('flavrUsers', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('flavrRecipes', JSON.stringify(recipes));
    }, [recipes]);

    useEffect(() => {
        // Move session to sessionStorage for multi-tab independence
        if (currentUser) {
            if (currentUser.role === 'admin') {
                sessionStorage.setItem('flavrAdminSession', JSON.stringify(currentUser));
                sessionStorage.removeItem('flavrCurrentUser');
            } else {
                sessionStorage.setItem('flavrCurrentUser', JSON.stringify(currentUser));
                sessionStorage.removeItem('flavrAdminSession');
            }
        } else {
            sessionStorage.removeItem('flavrCurrentUser');
            sessionStorage.removeItem('flavrAdminSession');
        }
    }, [currentUser]);

    const [maintenanceStatus, setMaintenanceStatus] = useState<'off' | 'pending' | 'active'>(() => {
        try {
            const saved = localStorage.getItem('flavrMaintenanceStatus');
            return (saved as any) || 'off';
        } catch (e) {
            return 'off';
        }
    });

    const updateMaintenanceStatus = (status: 'off' | 'pending' | 'active') => {
        setMaintenanceStatus(status);
        if (currentUser?.role === 'admin') {
            addAdminLog(currentUser.username, status === 'off' ? 'Stopped Maintenance Mode' : 'Started Maintenance Mode', 'system', 'System');
        }
    };

    const [maintenanceStartTime, setMaintenanceStartTime] = useState<number | null>(() => {
        try {
            const saved = localStorage.getItem('flavrMaintenanceStartTime');
            return saved ? parseInt(saved) : null;
        } catch (e) {
            return null;
        }
    });

    // Sync Maintenance across tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'flavrMaintenanceStatus') {
                setMaintenanceStatus((e.newValue as any) || 'off');
            }
            if (e.key === 'flavrMaintenanceStartTime') {
                setMaintenanceStartTime(e.newValue ? parseInt(e.newValue) : null);
            }
            // Sync user list updates (likes, status, etc.) across tabs
            if (e.key === 'flavrUsers' && e.newValue) {
                setUsers(JSON.parse(e.newValue));
            }
            if (e.key === 'flavrRecipes' && e.newValue) {
                setRecipes(JSON.parse(e.newValue));
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Persist Maintenance Mode
    useEffect(() => {
        localStorage.setItem('flavrMaintenanceStatus', maintenanceStatus);
        if (maintenanceStatus === 'off') {
            localStorage.removeItem('flavrMaintenanceStartTime');
            setMaintenanceStartTime(null);
        }
    }, [maintenanceStatus]);

    useEffect(() => {
        if (maintenanceStartTime) {
            localStorage.setItem('flavrMaintenanceStartTime', maintenanceStartTime.toString());
        } else {
            localStorage.removeItem('flavrMaintenanceStartTime');
        }
    }, [maintenanceStartTime]);

    // === Advanced Maintenance Settings ===
    const [maintenanceSettings, setMaintenanceSettingsState] = useState<MaintenanceSettings>(() => {
        try {
            const saved = localStorage.getItem('flavrMaintenanceSettings');
            if (saved) return { ...DEFAULT_MAINTENANCE_SETTINGS, ...JSON.parse(saved) };
            return DEFAULT_MAINTENANCE_SETTINGS;
        } catch { return DEFAULT_MAINTENANCE_SETTINGS; }
    });

    const setMaintenanceSettings = useCallback((settings: MaintenanceSettings) => {
        setMaintenanceSettingsState(settings);
        localStorage.setItem('flavrMaintenanceSettings', JSON.stringify(settings));
    }, []);

    // Persist maintenanceSettings
    useEffect(() => {
        localStorage.setItem('flavrMaintenanceSettings', JSON.stringify(maintenanceSettings));
    }, [maintenanceSettings]);

    // Sync maintenanceSettings across tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'flavrMaintenanceSettings' && e.newValue) {
                try {
                    setMaintenanceSettingsState({ ...DEFAULT_MAINTENANCE_SETTINGS, ...JSON.parse(e.newValue) });
                } catch { /* ignore */ }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Scheduled maintenance auto-activation/deactivation
    useEffect(() => {
        if (maintenanceSettings.schedulingMode !== 'scheduled') return;
        if (!maintenanceSettings.startTime) return;

        const interval = window.setInterval(() => {
            const now = Date.now();
            const start = new Date(maintenanceSettings.startTime!).getTime();
            const end = maintenanceSettings.endTime ? new Date(maintenanceSettings.endTime).getTime() : null;

            if (now >= start && maintenanceStatus !== 'active' && (!end || now < end)) {
                setMaintenanceStatus('active');
                localStorage.setItem('flavrMaintenanceStatus', 'active');
            }
            if (end && now >= end && maintenanceStatus === 'active') {
                setMaintenanceStatus('off');
                localStorage.setItem('flavrMaintenanceStatus', 'off');
                localStorage.removeItem('flavrMaintenanceStartTime');
                setMaintenanceSettings({ ...maintenanceSettings, maintenanceActive: false, startTime: null, endTime: null });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [maintenanceSettings, maintenanceStatus, setMaintenanceStatus, setMaintenanceSettings]);

    // Countdown maintenance auto-activation
    useEffect(() => {
        if (maintenanceSettings.schedulingMode !== 'countdown') return;
        if (!maintenanceSettings.countdownStartedAt || !maintenanceSettings.countdownMinutes) return;

        const interval = window.setInterval(() => {
            const elapsed = (Date.now() - maintenanceSettings.countdownStartedAt!) / 1000;
            const totalSec = maintenanceSettings.countdownMinutes! * 60;
            if (elapsed >= totalSec && maintenanceStatus !== 'active') {
                setMaintenanceStatus('active');
                localStorage.setItem('flavrMaintenanceStatus', 'active');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [maintenanceSettings, maintenanceStatus, setMaintenanceStatus]);

    const isFeatureDisabled = useCallback((feature: keyof DisabledFeatures): boolean => {
        if (maintenanceStatus === 'active' && maintenanceSettings.maintenanceType === 'full') return true;
        if (maintenanceSettings.maintenanceType === 'partial') {
            return maintenanceSettings.disabledFeatures[feature] === true;
        }
        return false;
    }, [maintenanceStatus, maintenanceSettings]);

    // Auto logout when maintenance becomes active
    useEffect(() => {
        if (maintenanceStatus === 'active' && maintenanceSettings.maintenanceType === 'full' && currentUser && currentUser.role !== 'admin') {
            setCurrentUser(null);
        }
    }, [maintenanceStatus, currentUser, maintenanceSettings.maintenanceType]);

    const login = (username: string, _pass: string) => {
        const user = users.find(u => u.username === username);
        if (user) {
            if (user.status === 'disabled') {
                alert("Your account is disabled. Please contact the owner of this project.");
                return false;
            }
            if (user.status === 'deleted') {
                alert("Your account has been deleted.");
                return false;
            }
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const toggleUserStatus = (userId: string) => {
        const userToUpdate = users.find(u => u.id === userId);
        if (!userToUpdate) return;
        const newStatus = userToUpdate.status === 'active' ? 'disabled' : 'active';

        const updatedUsers = users.map(u =>
            u.id === userId
                ? { ...u, status: newStatus as 'active' | 'disabled' | 'deleted' }
                : u
        );
        setUsers(updatedUsers);

        if (currentUser?.role === 'admin') {
            addAdminLog(currentUser.username, newStatus === 'active' ? 'Enabled User' : 'Disabled User', 'user', userToUpdate.username);
        }
    };

    const deleteUser = (userId: string, shouldDeleteRecipes: boolean) => {
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) return;

        // Soft delete user
        const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'deleted' as const } : u);
        setUsers(updatedUsers);

        if (currentUser?.role === 'admin') {
            addAdminLog(currentUser.username, 'Deleted User', 'user', userToDelete.username);
        }

        if (shouldDeleteRecipes) {
            const updatedRecipes = recipes.map(r => r.hostId === userId ? { ...r, status: 'deleted' as const } : r);
            setRecipes(updatedRecipes);
        }
    };

    const permanentDeleteUser = (userId: string, shouldDeleteRecipes: boolean) => {
        const userToDelete = users.find(u => u.id === userId);
        if (!userToDelete) return;

        const updatedUsers = users.filter(u => u.id !== userId);
        setUsers(updatedUsers);

        if (currentUser?.role === 'admin') {
            addAdminLog(currentUser.username, 'Permanently Deleted User', 'user', userToDelete.username);
        }

        if (shouldDeleteRecipes) {
            const updatedRecipes = recipes.filter(r => r.hostId !== userId);
            setRecipes(updatedRecipes);

            const cleanedUsers = updatedUsers.map(u => ({
                ...u,
                likedRecipes: u.likedRecipes.filter(id => !updatedRecipes.find(r => r.id === id && r.hostId === userId)),
                watchLaterRecipes: u.watchLaterRecipes.filter(id => !updatedRecipes.find(r => r.id === id && r.hostId === userId))
            }));
            setUsers(cleanedUsers);
        }
    };

    const deleteRecipe = (recipeId: string) => {
        const recipeToDelete = recipes.find(r => r.id === recipeId);
        if (!recipeToDelete) return;

        // Soft delete recipe
        setRecipes(recipes.map(r => r.id === recipeId ? { ...r, status: 'deleted' as const } : r));

        if (currentUser?.role === 'admin') {
            addAdminLog(currentUser.username, 'Deleted Recipe', 'recipe', recipeToDelete.title);
        }
    };

    const permanentDeleteRecipe = (recipeId: string) => {
        const recipeToDelete = recipes.find(r => r.id === recipeId);
        if (!recipeToDelete) return;

        setRecipes(recipes.filter(r => r.id !== recipeId));

        setUsers(users.map(u => ({
            ...u,
            likedRecipes: u.likedRecipes.filter(id => id !== recipeId),
            watchLaterRecipes: u.watchLaterRecipes.filter(id => id !== recipeId),
            myRecipes: u.myRecipes.filter(id => id !== recipeId)
        })));

        if (currentUser?.role === 'admin') {
            addAdminLog(currentUser.username, 'Permanently Deleted Recipe', 'recipe', recipeToDelete.title);
        }
    };

    const adminLogin = (username: string, pass: string) => {
        const admins = [
            { username: 'shreyas gandhi', password: 'adminflavrhunt' },
            { username: 'raj vishwakarma', password: 'adminflavrhunt' }
        ];

        const trimmedUsername = username.trim().toLowerCase();
        const trimmedPass = pass.trim();

        const admin = admins.find(a => a.username.toLowerCase() === trimmedUsername && a.password === trimmedPass);

        if (admin) {
            const adminUser: User = {
                id: `admin-${Date.now()}`,
                username: admin.username,
                email: 'admin@flavrhunt.com',
                fullName: 'Admin',
                age: 99,
                preference: 'All',
                likedRecipes: [],
                watchLaterRecipes: [],
                myRecipes: [],
                password: admin.password,
                role: 'admin',
                isSuperAdmin: true,
                status: 'active',
                joinedAt: new Date().toISOString(),
                recipesPosted: []
            };
            setCurrentUser(adminUser);
            return true;
        }

        try {
            const storedSubAdmins = localStorage.getItem('flavrSubAdmins');
            if (storedSubAdmins) {
                const subAdmins = JSON.parse(storedSubAdmins);
                const subAdmin = subAdmins.find((sa: any) => sa.username.toLowerCase() === trimmedUsername && sa.password === trimmedPass);

                if (subAdmin) {
                    if (subAdmin.status === 'disabled') {
                        alert("Your sub admin account is disabled. Please contact the main owner.");
                        return false;
                    }

                    const subAdminUser: User = {
                        id: subAdmin.subAdminId,
                        username: subAdmin.username,
                        email: 'subadmin@flavrhunt.com',
                        fullName: 'Sub Admin',
                        age: 99,
                        preference: 'All',
                        likedRecipes: [],
                        watchLaterRecipes: [],
                        myRecipes: [],
                        password: subAdmin.password,
                        role: 'admin',
                        isSuperAdmin: false,
                        permissions: subAdmin.permissions,
                        status: 'active',
                        joinedAt: new Date(subAdmin.createdAt).toISOString(),
                        recipesPosted: []
                    };
                    setCurrentUser(subAdminUser);
                    return true;
                }
            }
        } catch (e) {
            console.error("Failed to check sub admins", e);
        }

        return false;
    };

    const signup = (userData: any) => {
        // Read existing users from state (which is synced with localStorage)
        const usernameLower = userData.username.trim().toLowerCase();
        const exists = users.some(u => u.username.trim().toLowerCase() === usernameLower);

        if (exists) {
            throw new Error("Username already taken. Please choose another.");
        }

        const newUser: User = {
            id: Date.now().toString(),
            username: userData.username,
            email: userData.email,
            password: userData.password,
            fullName: userData.fullName,
            age: parseInt(userData.age),
            preference: userData.preference,
            likedRecipes: [],
            watchLaterRecipes: [],
            myRecipes: [],
            role: 'user',
            status: 'active',
            joinedAt: new Date().toISOString(),
            recipesPosted: []
        };

        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const postRecipe = (recipeData: any) => {
        if (!currentUser) return;

        // Default diet tag based on user's signup preference (no UI changes)
        const dietTag =
            currentUser.preference === 'Vegan' ? 'Vegan' :
                currentUser.preference === 'Veg' ? 'Vegetarian' :
                    null;

        const normalizedTags = Array.isArray(recipeData.tags) ? recipeData.tags : [];
        const tagsWithDiet = dietTag && !normalizedTags.includes(dietTag) ? [dietTag, ...normalizedTags] : normalizedTags;

        const newRecipe: Recipe = {
            id: Date.now().toString(),
            ...recipeData,
            tags: tagsWithDiet,
            hostId: currentUser.id,
            hostName: currentUser.username,
            rating: 0,
            reviews: 0,
            image: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
            likedBy: [],
            ratings: {}
        };
        setRecipes([newRecipe, ...recipes]);

        // Update user's myRecipes and recipesPosted
        const updatedUser = {
            ...currentUser,
            myRecipes: [...currentUser.myRecipes, newRecipe.id],
            recipesPosted: [...(currentUser.recipesPosted || []), newRecipe.id]
        };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    };

    const toggleLike = (recipeId: string) => {
        if (!currentUser) return;
        const isLiked = currentUser.likedRecipes.includes(recipeId);
        let updatedLikes;
        if (isLiked) {
            // Remove like
            updatedLikes = currentUser.likedRecipes.filter(id => id !== recipeId);
        } else {
            // Add like
            updatedLikes = [...currentUser.likedRecipes, recipeId];
        }
        const updatedUser = { ...currentUser, likedRecipes: updatedLikes };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

        // Update recipe's likedBy array
        const updatedRecipes = recipes.map(r => {
            if (r.id === recipeId) {
                const newLikedBy = isLiked
                    ? r.likedBy.filter(uid => uid !== currentUser.id)
                    : [...r.likedBy, currentUser.id];
                return { ...r, likedBy: newLikedBy };
            }
            return r;
        });
        setRecipes(updatedRecipes);
        localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    };

    const toggleWatchLater = (recipeId: string) => {
        if (!currentUser) return;
        const isSaved = currentUser.watchLaterRecipes.includes(recipeId);
        let updated;
        if (isSaved) {
            updated = currentUser.watchLaterRecipes.filter(id => id !== recipeId);
        } else {
            updated = [...currentUser.watchLaterRecipes, recipeId];
        }
        const updatedUser = { ...currentUser, watchLaterRecipes: updated };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    };

    const getRecipeById = (id: string) => recipes.find(r => r.id === id);

    const updateUser = (userData: Partial<User>) => {
        if (!currentUser) return;
        const updatedUser = { ...currentUser, ...userData };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    };

    const updateRecipe = (id: string, updates: Partial<Recipe>) => {
        const updatedRecipes = recipes.map(r => r.id === id ? { ...r, ...updates } : r);
        setRecipes(updatedRecipes);
    };

    const rateRecipe = (id: string, newRating: number) => {
        if (!currentUser) return;
        const updatedRecipes = recipes.map(r => {
            if (r.id === id) {
                // Update per-user rating
                const newRatings: Record<string, number> = { ...r.ratings, [currentUser.id]: newRating };

                // Calculate average rating from all ratings
                const allRatings = Object.values(newRatings);
                const averageRating = allRatings.length > 0
                    ? parseFloat((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1))
                    : 0;
                const reviewCount = allRatings.length;

                return {
                    ...r,
                    ratings: newRatings,
                    rating: averageRating,
                    reviews: reviewCount
                };
            }
            return r;
        });
        setRecipes(updatedRecipes);
    };

    return (
        <AppContext.Provider value={{
            currentUser,
            users,
            recipes,
            login,
            adminLogin,
            signup,
            logout,
            postRecipe,
            toggleLike,
            toggleWatchLater,
            getRecipeById,
            updateUser,
            updateRecipe,
            rateRecipe,
            maintenanceStatus,
            setMaintenanceStatus: updateMaintenanceStatus,
            maintenanceStartTime,
            setMaintenanceStartTime,
            toggleUserStatus,
            deleteUser,
            permanentDeleteUser,
            deleteRecipe,
            permanentDeleteRecipe,
            maintenanceSettings,
            setMaintenanceSettings,
            isFeatureDisabled
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};
