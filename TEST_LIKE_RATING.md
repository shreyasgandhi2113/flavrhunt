# Like and Rating System - Test Guide

## Test Scenario 1: One Like Per User Per Recipe

### Setup
1. Open app in browser
2. Login as user: `testuser` / `password` (create if needed)
3. Open any recipe detail modal

### Test Steps
1. Click "Like" button once
   - Expected: Button changes to "❤️ Liked" with red background
   - Expected: Like count should be 1

2. Click "Like" button again
   - Expected: Button changes back to "🤍 Like" with gray background
   - Expected: Like count should be 0

3. Click "Like" button once more
   - Expected: Button changes to "❤️ Liked" with red background
   - Expected: Like count should be 1

### Verification
- User cannot like the same recipe twice
- Like state persists correctly
- Like count reflects actual likedBy array length

---

## Test Scenario 2: One Rating Per User Per Recipe

### Setup
1. Logged in as same user
2. Recipe detail modal open

### Test Steps
1. Click on star 3 (3-star rating)
   - Expected: Stars 1-3 are filled (★), stars 4-5 are empty (☆)
   - Expected: Display shows "3/5"
   - Expected: Average rating updates on recipe card

2. Click on star 5 (change to 5-star rating)
   - Expected: All 5 stars are filled (★)
   - Expected: Display shows "5/5"
   - Expected: Average rating updates

3. Refresh page
   - Expected: User's rating persists (5 stars remain filled)
   - Expected: Average rating reflects the updated value

### Verification
- User can only have one rating per recipe
- Updating rating replaces old rating, doesn't duplicate
- Average is calculated from all users' ratings
- Persistence works across refresh

---

## Test Scenario 3: Star UI Display

### Setup
1. Multiple users logged in (test in different browser tabs)

### Test Steps
1. User A rates recipe 5 stars
2. Switch to User B tab, open same recipe
   - Expected: User B sees 0 stars (hasn't rated yet)
   - Expected: Recipe shows average 5.0 in display

3. User B rates recipe 4 stars
4. Switch back to User A
   - Expected: User A still sees 5 stars (their rating)
   - Expected: Recipe now shows average 4.5

### Verification
- Each user sees only their own rating, not others'
- Average rating updates correctly with multiple raters
- Stars don't interfere between users

---

## Test Scenario 4: Data Persistence

### Setup
1. Logged in user
2. Rate multiple recipes and like some

### Test Steps
1. Note likes and ratings
2. Close browser completely
3. Reopen and login again
   - Expected: All likes persist
   - Expected: All ratings persist
   - Expected: Average ratings remain correct

4. Open same recipe in new tab
   - Expected: Likes/ratings sync across tabs via localStorage events
   - Expected: UI matches exactly

### Verification
- Data persists in localStorage
- Persistence works across browser sessions
- Multi-tab sync works correctly

---

## Expected Data Structure

### Recipe with ratings/likes:
```
{
  id: 'r1',
  title: 'Palak Paneer',
  ...other fields,
  likedBy: ['user1', 'user3'],  // User IDs who liked
  ratings: {
    'user1': 5,
    'user2': 4,
    'user3': 3
  },
  rating: 4.0,    // Average of [5, 4, 3]
  reviews: 3      // Count of ratings
}
```

---

## Bugs to Watch For
- Duplicate entries in likedBy array
- User seeing other users' ratings
- Average rating calculation incorrect
- Stars not updating after rating
- Data not persisting
- Like/rating working even when user not logged in
