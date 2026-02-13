// Simple Express backend for FlavrHunt
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// In-memory data stores (mock)
let users = [];

let recipes = [
  {
    id: 'r1',
    title: 'Palak Paneer',
    hostId: 'u0',
    hostName: 'Chef Sanjeev',
    info: 'A popular North Indian curry made with spinach and cottage cheese.',
    ingredients: ['Spinach', 'Paneer', 'Garlic', 'Ginger', 'Cream', 'Spices'],
    process: '1. Blanch spinach. 2. Sauté spices. 3. Blend spinach. 4. Mix with paneer.',
    tips: "Don\\'t overcook the spinach to keep it green.",
    tags: ['Main Course', 'Healthy'],
    rating: 4.8,
    reviews: 120,
    image: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
    time: 40
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
    tags: ['Snacks', 'Main Course'],
    rating: 4.5,
    reviews: 85,
    image: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)',
    time: 25
  }
];

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Auth: signup
app.post('/api/auth/signup', (req, res) => {
  const { username, email, fullName, age, preference, password } = req.body;

  if (!username || !email || !fullName || !age || !preference || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = users.find(u => u.username === username);
  if (existing) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: Date.now().toString(),
    username,
    email,
    fullName,
    age: Number(age),
    preference,
    likedRecipes: [],
    watchLaterRecipes: [],
    myRecipes: []
  };

  users.push(newUser);
  // Never send password back
  res.status(201).json(newUser);
});

// Auth: login (very naive, no real password check)
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json(user);
});

// Recipes: list
app.get('/api/recipes', (_req, res) => {
  res.json(recipes);
});

// Recipes: create
app.post('/api/recipes', (req, res) => {
  const {
    title,
    info,
    ingredients,
    process,
    tips,
    tags,
    time,
    hostId,
    hostName
  } = req.body;

  if (!title || !info || !ingredients || !process || !tips || !tags || !time || !hostId || !hostName) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newRecipe = {
    id: Date.now().toString(),
    title,
    info,
    ingredients,
    process,
    tips,
    tags,
    time: Number(time),
    hostId,
    hostName,
    rating: 0,
    reviews: 0,
    image: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
  };

  recipes = [newRecipe, ...recipes];
  res.status(201).json(newRecipe);
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`FlavrHunt backend running on http://localhost:${PORT}`);
});

