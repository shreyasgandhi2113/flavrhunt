# Like and Rating System - Quick Start

## What Was Fixed

The Like and Rating system now properly enforces:
- **One like per user per recipe** - User can only like each recipe once
- **One rating per user per recipe** - User can only rate each recipe once (ratings update on re-rate)
- **Proper data structure** - Uses `likedBy[]` and `ratings{}` for clean per-user tracking
- **Correct average calculation** - Average rating computed from all unique user ratings
- **Visual feedback** - Stars show user's rating, like button shows state
- **Data persistence** - Everything saves and syncs across tabs via localStorage

---

## How to Test

### Quick Test (2 minutes)
1. Start the app: `npm run dev`
2. Login as a user
3. Open any recipe
4. Click the Like button → Should turn red with "❤️ Liked"
5. Click Like again → Should toggle back to gray "🤍 Like"
6. Click a star (e.g., 4 stars) → 4 stars fill, shows "4/5"
7. Click a different star (e.g., 2 stars) → Updates to 2 stars, shows "2/5" (not added, replaced)
8. Refresh page → Like and rating persist
9. Open in new tab → Same like and rating shows

### Multi-User Test (5 minutes)
1. Open two browser tabs
2. Login as User A in Tab 1, User B in Tab 2
3. In Tab 1: Rate recipe 5 stars
4. In Tab 2: Open same recipe → Shows 0 stars (you haven't rated yet)
5. Average shows 5.0
6. In Tab 2: Rate recipe 3 stars
7. Back to Tab 1: Refresh → Your 5 stars still show
8. Average now shows 4.0
9. In Tab 1: Change rating to 1 star
10. Back to Tab 2: Refresh → Your 3 stars still show
11. Average now shows 2.0

---

## Data Structure

When you open DevTools Console and check localStorage:

```javascript
// In browser console:
JSON.parse(localStorage.getItem('recipes'))[0]

// Will show:
{
  id: 'r1',
  title: 'Palak Paneer',
  hostId: 'u0',
  hostName: 'Chef Sanjeev',
  ...other fields,
  
  // NEW: Per-user likes
  likedBy: ['user123', 'user456'],  // User IDs who liked
  
  // NEW: Per-user ratings
  ratings: {
    'user123': 5,
    'user456': 4,
    'user789': 3
  },
  
  // CALCULATED from ratings
  rating: 4.0,    // Average of all ratings
  reviews: 3      // Total number of ratings
}
```

---

## Files Changed

- ✅ `src/types/index.ts` - Added likedBy and ratings fields
- ✅ `src/context/AppContext.tsx` - Fixed toggleLike and rateRecipe logic
- ✅ `src/components/dashboard/RecipeDetailModal.tsx` - Updated star UI and feedback
- ✅ `src/App.tsx` - Fixed imports
- ✅ `src/components/dashboard/MaintenancePage.tsx` - Moved to correct folder

---

## Backward Compatibility

✅ Old recipes without `likedBy` and `ratings` fields are automatically migrated when loaded

✅ Existing likes in `currentUser.likedRecipes` still work

✅ No data loss when upgrading

---

## Common Scenarios

### User Likes Multiple Times
```
User clicks Like
  ✅ Becomes "❤️ Liked" (red)
  ✅ Added to likedBy array
  ✅ Like count increases

User clicks Like again
  ✅ Becomes "🤍 Like" (gray)
  ✅ Removed from likedBy array
  ✅ Like count decreases

Result: User can toggle like on/off, but cannot like twice
```

### User Rates Multiple Times
```
User clicks 3 stars
  ✅ ratings['userId'] = 3
  ✅ Average updates
  ✅ 3/5 shown

User later clicks 5 stars
  ✅ ratings['userId'] = 5 (REPLACES, not added)
  ✅ Average recalculates
  ✅ 5/5 shown

Result: User can change rating, but never has 2 ratings
```

### Multiple Users Rate Same Recipe
```
User A rates 5 stars → ratings = { A: 5 }, avg = 5.0
User B rates 3 stars → ratings = { A: 5, B: 3 }, avg = 4.0
User C rates 4 stars → ratings = { A: 5, B: 3, C: 4 }, avg = 4.0
reviews = 3 (unique raters)

Result: Each user's rating tracked separately, average calculated correctly
```

---

## Troubleshooting

**Q: Like button doesn't toggle?**
- A: Make sure you're logged in (need currentUser)
- Check browser console for errors

**Q: Ratings not showing?**
- A: Refresh the page to load latest data
- Check localStorage in DevTools → Application → Local Storage

**Q: Stars not persisting after refresh?**
- A: Check if `ratings` object exists in recipe (should auto-migrate)
- Clear localStorage and restart if corrupted

**Q: Multiple tabs not syncing?**
- A: Cross-tab sync happens via localStorage events
- Refresh if needed - page will load latest from localStorage

---

## Performance Notes

- ✅ Minimal state updates (only affected recipe updates)
- ✅ Efficient localStorage saves (full recipes array only)
- ✅ No unnecessary re-renders
- ✅ Backward compatible migration on load (one-time)
- ✅ Average calculation is O(n) where n = unique raters

---

## Next Steps

After testing, verify:
1. [ ] Like/unlike works without duplicates
2. [ ] Rating update works (replaces, not adds)
3. [ ] Average rating shows correctly
4. [ ] Stars display user's rating accurately
5. [ ] Data persists after refresh
6. [ ] Multi-tab sync works
7. [ ] Old recipes migrate correctly
