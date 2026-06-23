# Smart Kitchen

A complete full-stack recipe and pantry management application built for Assignment 4.

**Detailed documentation:**
- [Frontend Documentation](smart-kitchen-frontend/docs/README.md)
- [Backend Documentation](smart-kitchen-backend/docs/README.md)
- [API Reference](smart-kitchen-backend/docs/API_REFERENCE.md)

---

## Project Overview

Smart Kitchen combines:

| Layer | Technology |
|---|---|
| Frontend | React 19 SPA, React Router 7, Axios, Socket.IO client |
| Backend | Node.js 20, Express 5, Socket.IO server |
| Database | MySQL 8.0, Sequelize 6 ORM |
| AI | Google Gemini API (backend-only) |

The frontend runs at **http://localhost:5173**.
The backend API and Socket.IO server run at **http://localhost:3000**.

---

## Main Features

### Authentication and Roles
Users log in with a bcrypt-protected password. Sessions are tab-local (sessionStorage). Every API request carries `x-user-id` and `x-user-role` headers used for role-based authorization. Four roles exist: User, Chef, Foodie (displayed name; stored internally as `influencer`), and Admin.

### Recipes
Browse, search, filter, and sort the recipe catalog. View a recipe in a detail modal or on its own page. Chefs and Admins create, edit, and delete recipes. Recipe images upload to the backend or link to external URLs. A three-stage fallback chain (`imageUrl → category default → general default`) ensures every recipe always displays an image. Foodie-submitted recipes enter a pending approval workflow before appearing publicly.

### Pantry, Shopping List, and Meal Planning
Track per-user ingredient stock with expiry monitoring. Maintain a shopping list. Plan meals by date and meal type (breakfast, lunch, dinner, snack) with calorie summaries displayed in the Kitchen Sidebar.

### Reviews and Moderation
One review per user per recipe, with a star rating. Admins receive a badge counter for pending review reports. Helpful vote tracking. Users can flag inappropriate reviews.

### Real-Time Recipe Discussions
Each recipe has a live discussion page (`/recipes/:id/discussion`) powered by Socket.IO. All viewers in the same recipe room see new comments, edits, deletions, typing indicators, and viewer counts instantly — no page refresh.

### Social Features
Follow users, browse a personalized Feed, like recipes and comments, view public profiles, search users by name.

### Notifications
Real-time Socket.IO notifications: follows, recipe approvals and rejections, replies, @mentions, helpful votes, chef request decisions, comment likes.

### AI Tools
Three Google Gemini-powered tools at `/ai-assistant`:
1. **Recipe Generator** — creates a recipe from the user's pantry contents
2. **Personalized Suggestions** — recommends recipes based on preferences and pantry
3. **Ingredient Substitute** — proposes alternatives for a specific ingredient

The Gemini API key lives only in the backend `.env`. The frontend never contacts Gemini directly. Every AI result is saved to the user's personal history in MySQL.

### Administration
Admins manage user accounts, the global ingredient catalog, recipe approvals, chef request decisions, and review moderation from dedicated pages.

---

## Full Architecture

```
Browser (http://localhost:5173)
  React 19 SPA
  Axios HTTP client  ──────────────────────────────►  Express 5 REST API
  socket.io-client   ◄────────────────────────────►  Socket.IO server
                                                           │
                                                     Sequelize 6 ORM
                                                           │
                                                      MySQL 8.0
                                                      (smart_kitchen_enriched)

                                                           │
                                              Google Gemini API
                                          (called by the backend only;
                                          API key never sent to browser)
```

Socket.IO shares port 3000 with the REST API via a single `http.Server` instance.
Uploaded recipe images are stored in `smart-kitchen-backend/uploads/` and served statically at `http://localhost:3000/uploads/`.

---

## Repository Structure

```
Smart-Kitchen-Project/
├── README.md                              ← This file
├── smart-kitchen-frontend/
│   ├── src/
│   │   ├── pages/                         ← Route-level page components
│   │   ├── components/                    ← Reusable UI components
│   │   ├── services/                      ← Axios API clients (one per resource)
│   │   ├── context/                       ← React context providers
│   │   ├── utils/                         ← Shared helpers and image utilities
│   │   └── validators/                    ← Client-side form validation
│   ├── docs/
│   │   ├── README.md                      ← Frontend detailed documentation
│   │   └── Screenshots/                   ← Assignment 4 submission screenshots
│   └── package.json
└── smart-kitchen-backend/
    ├── server.js                          ← Express + Socket.IO entry point
    ├── routes/                            ← Express routers (21 files)
    ├── controllers/                       ← Request handlers (19 files)
    ├── models/                            ← Sequelize model definitions
    ├── migrations/                        ← Sequelize schema migrations (28 files)
    ├── seeders/                           ← Sequelize seed data (18 files)
    ├── services/
    │   ├── geminiService.js               ← Google Gemini API integration
    │   └── notificationService.js         ← Notification creation + Socket.IO emit
    ├── socket/                            ← Socket.IO event handlers
    ├── middleware/                        ← Auth, logger, error handler, upload
    ├── config/
    │   └── sequelize-config.js            ← Sequelize CLI configuration
    ├── .sequelizerc                       ← Tells Sequelize CLI where folders live
    ├── .env.example                       ← Variable names with safe placeholders
    ├── uploads/                           ← Recipe image storage (auto-created)
    └── docs/
        ├── README.md                      ← Backend detailed documentation
        └── API_REFERENCE.md              ← Full endpoint reference
```

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 20.x | Required by the backend |
| npm | bundled with Node | Used by both frontend and backend |
| MySQL | 8.0 | Must be running before starting the backend |
| Google Gemini API key | — | Required for AI endpoints only |

---

## Running the Complete Application Locally

Follow these steps in order. Use two separate terminals.

### Terminal 1 — Backend

#### Step 1: Enter the backend folder and install dependencies

```powershell
cd smart-kitchen-backend
npm install
```

#### Step 2: Configure environment variables

```powershell
Copy-Item .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=smart_kitchen_enriched
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
```

> Never commit `.env`. It is listed in `.gitignore`. See [Security Notes](#security-notes).

#### Step 3: Create the MySQL database

Make sure MySQL is running. Then create the database. Either use the Sequelize CLI:

```powershell
npx sequelize-cli db:create
```

Or connect to MySQL directly and run:

```sql
CREATE DATABASE smart_kitchen_enriched CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Step 4: Run migrations

```powershell
npx sequelize-cli db:migrate
```

This creates all database tables from the 28 migration files. Run only against a database that does not already have the tables.

To verify migration status without making changes:

```powershell
npx sequelize-cli db:migrate:status
```

#### Step 5: Seed initial data (new empty database only)

> [!WARNING]
> Run `npx sequelize-cli db:seed:all` only when preparing a new or empty development database. Running all seeders again on a populated database may create duplicate records or fail due to database constraints. Existing databases should run only pending migrations, not seeders.

```powershell
npx sequelize-cli db:seed:all
```

The 18 seeders populate: 40 users, ingredients, recipes with ingredient links, recipe comments, favorites, chef requests, pantry items, shopping list entries, meal plan items, stores, ingredient-store price data, recipe likes, user follows, notifications, comment likes, reviews, and recipe image URLs.

AI history is not seeded — it accumulates through normal application usage.

#### Step 6: Start the backend

```powershell
npm start
```

Expected output: `Server running on port 3000`

The backend is now available at **http://localhost:3000**. The API base path is `/api`. Socket.IO is also listening on port 3000.

---

### Terminal 2 — Frontend

#### Step 7: Enter the frontend folder and install dependencies

```powershell
cd smart-kitchen-frontend
npm install
```

#### Step 8: Start the frontend

```powershell
npm start
```

The frontend starts at **http://localhost:5173**.

The frontend has no `.env` file. The API base URL (`http://localhost:3000/api`) and Socket.IO server URL (`http://localhost:3000`) are configured directly in source files.

---

### Verifying the Running System

| Check | How to verify |
|---|---|
| Frontend loads | Open http://localhost:5173 — the Login page appears |
| Backend responds | Open http://localhost:3000/api/options — returns JSON with enum values |
| MySQL data visible | Log in and browse the Recipes page — seeded recipes appear |
| Login works | Use a seeded account (see table below) |
| Real-time works | Open the same recipe discussion in two tabs — comments appear instantly |
| AI works | Visit `/ai-assistant` — requires a valid `GEMINI_API_KEY` in the backend `.env` |

**Seeded test accounts:**

| Name | Role | Email | Password |
|---|---|---|---|
| Lior Rubinshtein | Chef | lior@project.com | `password_1` |
| Ellen Levin | Admin | ellen@project.com | `password_2` |
| Daniel Levi | User | daniel@project.com | `password_4` |
| Shir Mizrahi | Foodie | shir@project.com | `password_6` |

---

### Quick Two-Terminal Reference

**Terminal 1 — Backend (first time setup)**

```powershell
cd smart-kitchen-backend
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm start
```

> [!WARNING]
> `db:seed:all` is for a fresh/empty database only. Skip it if the database already contains data.

**Terminal 2 — Frontend**

```powershell
cd smart-kitchen-frontend
npm install
npm start
```

**Subsequent starts (database already set up)**

```powershell
# Terminal 1
cd smart-kitchen-backend
npm start

# Terminal 2
cd smart-kitchen-frontend
npm start
```

---

## Environment Variables

All variables are defined in `smart-kitchen-backend/.env.example`. The frontend requires no `.env` file.

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Backend server port |
| `DB_HOST` | Yes | — | MySQL host |
| `DB_PORT` | No | `3306` | MySQL port |
| `DB_NAME` | Yes | — | Database name (`smart_kitchen_enriched`) |
| `DB_USER` | Yes | — | MySQL username |
| `DB_PASSWORD` | Yes | — | MySQL password |
| `GEMINI_API_KEY` | Yes (AI) | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.1-flash-lite` | Gemini model name |

The Gemini API key is loaded exclusively by `smart-kitchen-backend/services/geminiService.js`. It is never included in any API response, never logged, and never sent to the frontend.

---

## Database and ORM

The backend uses **Sequelize 6** with the `mysql2` driver. All data is stored in MySQL and survives server restarts.

### Main Models

| Model | Table | Description |
|---|---|---|
| `User` | `Users` | Accounts with role, city, cooking level, avatar, preferences |
| `Recipe` | `Recipes` | Recipes with approval status, image URL, position coordinates |
| `Ingredient` | `Ingredients` | Global ingredient catalog |
| `RecipeIngredient` | `RecipeIngredients` | Junction: recipe ↔ ingredient (quantity, unit) |
| `Review` | `Reviews` | One review per user per recipe; helpful vote count |
| `ReviewReport` | `ReviewReports` | User-submitted review flags with admin resolution |
| `ReviewHelpfulVote` | `ReviewHelpfulVotes` | Junction: user ↔ review helpful votes |
| `RecipeComment` | `RecipeComments` | Threaded discussion comments with @mention support |
| `CommentLike` | `CommentLikes` | Junction: user ↔ comment |
| `RecipeLike` | `RecipeLikes` | Junction: user ↔ recipe likes |
| `Favorite` | `Favorites` | Junction: user ↔ saved recipes |
| `PantryItem` | `PantryItems` | Per-user ingredient stock with quantity and expiry |
| `ShoppingListItem` | `ShoppingItems` | Per-user shopping list entries |
| `MealPlanItem` | `MealPlans` | Per-user meal plan entries by date and meal type |
| `Store` | `Stores` | Local stores with city associations |
| `IngredientStore` | `IngredientStores` | Junction: ingredient ↔ store with price data |
| `ChefRequest` | `ChefRequests` | Upgrade request workflow |
| `UserFollow` | `UserFollows` | Junction: follower ↔ following |
| `Notification` | `Notifications` | Per-user in-app notifications |
| `AiHistory` | `AiHistory` | Per-user AI request log |

### Relationships

- **One-to-many:** User → Recipes, User → Reviews, User → RecipeComments, User → PantryItems, Recipe → Reviews, Recipe → RecipeComments
- **Many-to-many (junction tables):** Recipe ↔ Ingredient (RecipeIngredients), User ↔ Recipe (Favorites, RecipeLikes), User ↔ Comment (CommentLikes), User ↔ User (UserFollows)

---

## API

All endpoints use the prefix `/api`. There are **98 endpoints** across 25 route groups.

### Response Format

**Success:**
```json
{
  "success": true,
  "data": {},
  "error": null
}
```

**Error:**
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Missing required fields",
    "details": { "field": "email" }
  }
}
```

### Authentication Headers

All protected endpoints require:

```
x-user-id: <numeric user ID>
x-user-role: <user | chef | influencer | admin>
```

### Endpoint Groups Summary

| Group | Base Path |
|---|---|
| Authentication | `/api/auth` |
| Users | `/api/users` |
| Settings | `/api/settings` |
| Recipes | `/api/recipes` |
| Recipe Images | `/api/recipes/:id/image` |
| Recipe Approval | `/api/recipes/pending`, `/api/recipes/:id/approve` |
| Recipe Reviews | `/api/recipes/:id/reviews` |
| Review Reports | `/api/review-reports` |
| Recipe Comments | `/api/recipes/:id/comments` |
| Recipe Likes | `/api/recipes/:id/likes` |
| Comment Likes | `/api/comments/:id/likes` |
| Ingredients | `/api/ingredients` |
| Stores | `/api/stores` |
| Favorites | `/api/users/:id/favorites` |
| Pantry | `/api/users/:id/pantry` |
| Shopping List | `/api/users/:id/shopping-list` |
| Meal Plan | `/api/users/:id/meal-plan` |
| AI | `/api/users/:id/ai/*` |
| Chef Requests | `/api/chef-requests` |
| User Follows | `/api/users/:id/follows` |
| Feed | `/api/feed` |
| Discover | `/api/discover` |
| Notifications | `/api/notifications` |
| Options | `/api/options` |

Full endpoint reference: [smart-kitchen-backend/docs/API_REFERENCE.md](smart-kitchen-backend/docs/API_REFERENCE.md)

---

## WebSocket Integration

Socket.IO runs on port 3000, sharing the HTTP server with the REST API. CORS allows `http://localhost:5173`.

### Recipe Discussion Events

When a user opens `/recipes/:id/discussion`, the frontend joins room `recipe-{id}`.

**Client → Server:**

| Event | Purpose |
|---|---|
| `joinRecipeRoom` | Join the live discussion room |
| `sendRecipeComment` | Post a comment (saved to MySQL by the server) |
| `editRecipeComment` | Edit own comment |
| `deleteRecipeComment` | Delete own comment |
| `typingRecipeComment` | Broadcast typing indicator |
| `stopTypingRecipeComment` | Stop typing indicator |
| `leaveRecipeRoom` | Leave the room |

**Server → Client:**

| Event | Purpose |
|---|---|
| `newRecipeComment` | New comment broadcast to all room members |
| `recipeCommentEdited` | Edited comment broadcast |
| `recipeCommentDeleted` | Deletion broadcast |
| `roomUserCount` | Current unique viewer count |
| `userTyping` / `userStoppedTyping` | Typing indicators |
| `commentLikeUpdated` | Live comment like count update |

### Notification Events

Each connected user joins room `user:{userId}`. The server emits `newNotification` on: follows, recipe approvals/rejections, replies, @mentions, helpful votes, chef request decisions, comment likes.

### Two-Tab Demo

1. Open the same recipe discussion in two browser tabs (different seeded users).
2. Submit a comment in Tab A → Tab B receives `newRecipeComment` instantly.
3. Type in Tab A → Tab B shows a typing indicator via `userTyping`.
4. Edit or delete a comment in Tab A → Tab B updates in place with no page refresh.

---

## AI Integration

Three tools are exposed through the backend. The Gemini API key is stored only in the backend `.env`.

| Tool | Backend Endpoint | Frontend Route |
|---|---|---|
| Recipe Generator | `POST /api/users/:id/ai/generate-recipe` | `/ai-assistant?feature=recipe-generator` |
| Personalized Suggestions | `POST /api/users/:id/ai/suggestions` | `/ai-assistant?feature=suggestions` |
| Ingredient Substitute | `POST /api/users/:id/ai/substitute` | `/ai-assistant?feature=substitute` |

Every successful AI call is saved to the `AiHistory` MySQL table. History is user-specific; users can view and delete their own entries at `GET /api/users/:id/ai/history`.

---

## User Roles

| Stored value | Display name | Capabilities |
|---|---|---|
| `user` | User | Browse recipes, manage own pantry/shopping list/meal plan/favorites, write reviews and comments, request a role upgrade |
| `chef` | Chef | All User capabilities plus create/edit/delete recipes (auto-approved) via Recipe Management page |
| `influencer` | Foodie | All User capabilities plus create/edit/delete own recipes (requires admin approval before appearing publicly) |
| `admin` | Admin | Full access: manage users, ingredients, recipe approvals, chef request decisions, review and report moderation |

---

## Screenshots and Submission

Assignment 4 submission screenshots are located at:

```
smart-kitchen-frontend/docs/Screenshots/
```

Do not rename or delete files in that directory.

---

## Known Limitations

- **Gemini API key required** — AI tools return an error if `GEMINI_API_KEY` is unset or invalid.
- **Tab-local sessions** — `sessionStorage` keeps each browser tab's login independent. Logging out in one tab does not affect others. This is intentional for the two-tab Socket.IO demo.
- **Uploaded images tied to the backend file system** — files in `uploads/` are lost if the directory is removed or moved.
- **Seeders are one-shot** — re-running `db:seed:all` on a populated database creates duplicate records.
- **No JWT** — authentication reads `x-user-id` and `x-user-role` header values without cryptographic verification. This is an educational design.
- **External fallback images** — category default images are hosted externally; an unreachable URL falls through to the next stage in the three-stage chain.

---

## Security Notes

- **Never commit `.env`** — it is listed in `.gitignore`. Only `.env.example` (with placeholder values) is committed.
- **Never expose the Gemini API key** — it must live only in `smart-kitchen-backend/.env` and is loaded exclusively by `services/geminiService.js`. It never appears in any API response or log.
- **Never expose database credentials** — DB credentials live only in the backend `.env` file.
- **Never submit `node_modules`** — both `node_modules` directories are excluded by `.gitignore`.
- **Passwords are bcrypt-hashed** — plaintext passwords are never stored. The request logger masks the `password` field in request bodies.
- **`.env.example` is safe to commit** — it contains only variable names with placeholder values.

---

## Detailed Documentation

| Document | Contents |
|---|---|
| [Frontend Documentation](smart-kitchen-frontend/docs/README.md) | React stack, routing, components, API communication, Socket.IO client, AI tools, image fallbacks, troubleshooting |
| [Backend Documentation](smart-kitchen-backend/docs/README.md) | Express setup, Sequelize config, migrations, seeders, all Socket.IO events, Gemini service, file uploads, error codes, full user list |
| [API Reference](smart-kitchen-backend/docs/API_REFERENCE.md) | All 98 endpoints with request and response schemas |

---

## Authors

Ellen Levin — Assignment 4, Smart Kitchen Project
