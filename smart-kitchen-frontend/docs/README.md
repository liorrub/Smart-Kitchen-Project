# Smart Kitchen Frontend

A React-based frontend for the Smart Kitchen web application.
The frontend connects to a local REST API backend and provides a role-based
interface for managing recipes, pantry items, meal plans, shopping lists, and more.

---

## Prerequisites

- Node.js installed
- The Smart Kitchen backend must be running on `http://localhost:3000` before
  starting the frontend. See the backend README for setup instructions.

---

## Installation

```bash
npm install
```

---

## Starting the App

```bash
npm start
```

The app opens automatically in your browser.
The frontend runs on `http://localhost:5173`

---

## API Base URL

All API requests are sent to:

```
http://localhost:3000
```

Make sure the backend server is running at that address before using the app.

---

## Project Structure

```
src/
├── pages/          # Full-page components (Dashboard, Recipes, Settings, etc.)
├── components/     # Reusable UI components (Navbar, FormField, RecipeCard, etc.)
├── services/       # Axios API call functions, one file per resource
├── context/        # AuthContext — stores the logged-in user globally
├── validators/     # Client-side form validation helpers
└── layouts/        # Page layout wrappers (MainLayout with Navbar/Sidebar)
```

---

## Main Pages

| Page | Description |
|------|-------------|
| Login / Register | Authentication pages |
| Dashboard | Overview stats, alerts, and role-specific quick actions |
| Recipes | Browse all recipes, view details and reviews |
| Favorites | Saved favorite recipes |
| Pantry | Manage personal pantry items with expiry tracking |
| Shopping List | Add, complete, and generate shopping items |
| Meal Planner | Plan meals by date and type, supports recipes and pantry items |
| Settings | Edit profile, change password, request chef account |
| AI Assistant | Placeholder AI tools and saved conversation history |
| Chef — My Recipes | Chef-only page for creating and managing own recipes |
| Admin — Recipe Management | Admin-only page for managing all recipes in the system |
| Admin — Users | Admin-only user management |
| Admin — Ingredients | Ingredient catalog management |
| Admin — Stores | Store management |

---

## User Roles

| Role | What they can do in the UI |
|------|---------------------------|
| `user` | Browse recipes, manage personal pantry, shopping list, meal plan, and favorites. Can request to become a chef from the Settings page. |
| `influencer` | Same as user. Reviews they write are marked as influencer reviews. Can also request to become a chef. |
| `chef` | Everything a user can do, plus create and manage their own recipes from the Chef dashboard. |
| `admin` | Full access. Can manage all users, recipes, ingredients, and stores. Reviews and approves or rejects chef account requests from the Dashboard. |

---

## Test Users

| Name | Email | Role |
|------|-------|------|
| Lior Rubinshtein | lior@project.com | chef |
| Ellen Levin | ellen@project.com | admin |
| Noa Cohen | noa@project.com | admin |
| Daniel Levi | daniel@project.com | user |
| Maya David | maya@project.com | user |
| Shir Mizrahi | shir@project.com | influencer |

---

## Testing Instructions

1. Start the backend first (`node server.js` in the backend folder).
2. Start the frontend (`npm start` in this folder).
3. Open the app at `http://localhost:5173`.

**Suggested testing flow:**

- Log in as **Ellen** (admin) to test the admin dashboard, user management,
  recipe management, and chef request approval.
- Log in as **Lior** (chef) to test recipe creation, the chef dashboard, and
  recipe management.
- Log in as **Daniel** or **Maya** (user) to test pantry, shopping list, meal
  planner, favorites, and the chef account request in Settings.
- Log in as **Shir** (influencer) to verify that influencer reviews are marked
  and that the chef request option is visible in Settings.
- Register a brand new account to verify that a new user starts with an empty
  pantry, meal plan, and AI history.

---

## Note

This README covers the **frontend only**.
For backend setup, API reference, and endpoint documentation see the
`smart-kitchen-backend/docs/` folder.
