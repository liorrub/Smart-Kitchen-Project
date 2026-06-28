# Smart Kitchen — Frontend

> **Part of the Smart Kitchen full-stack application.**
> - [Root README (full-system setup)](../../README.md)
> - [Backend Documentation](../../backend/docs/README.md)

## Project Overview

Smart Kitchen is a full-stack recipe and pantry management application built for Assignment 4. It combines a React 19 single-page application with an Express/Node.js REST API, a MySQL database managed by Sequelize, real-time collaboration powered by Socket.IO, and AI-generated recipe assistance through the Google Gemini API.

The frontend is responsible for all user-facing interactions: browsing and managing recipes, tracking pantry stock, planning meals, collaborating in live discussion threads, and using AI tools. It communicates exclusively with the backend REST API and Socket.IO server — never directly with any external AI provider.

---

## Main Features

### Authentication and Role-Based Interfaces

Users log in by selecting a seeded account. The session is stored in `sessionStorage` so each browser tab keeps an independent identity. Every API request includes `x-user-id` and `x-user-role` headers that the backend reads for authorization. The interface adapts based on the user's role (see [User Roles](#user-roles)).

### Recipe Browsing and Management

- Browse, filter, sort, and search the full recipe catalog.
- View detailed recipe information including ingredients, instructions, nutritional data, and user reviews.
- Chefs and admins can create, edit, and delete recipes through the Recipe Management page.
- Recipes carry images, category badges, cuisine labels, difficulty levels, and tag chips.
- Open a full recipe detail view in a modal or navigate to the standalone recipe page.

### Recipe Images and Category Fallback Images

Recipe images are loaded from `imageUrl` when stored. For recipes without an image, the frontend automatically falls back to a category-specific default image (breakfast, lunch, dinner, dessert, or snack) sourced from external URLs, and then to a general default if the category is unknown. Image loading is handled by `src/utils/recipeImageUtils.js`, which includes a controlled three-stage `onError` chain that prevents infinite fallback loops. Uploaded recipe images are served from the backend at `/uploads/` and resolved by `resolveImageUrl()` in `src/utils/apiConfig.js`.

### Pantry Management

Track ingredient stock levels, units, and minimum quantity thresholds. Low-stock items surface in the Kitchen Sidebar panel for quick visibility.

### Shopping List

Maintain a personal shopping list with item completion tracking. The Kitchen Sidebar shows the count of unchecked items at a glance.

### Meal Planning

Assign recipes or ingredients to specific dates and meal types (breakfast, lunch, dinner, snack). The Meal Planner page provides a calendar view. The sidebar reports today's meal count and total calorie estimate.

### Favorites

Save recipes to a personal favorites collection. The Favorites page lists all saved recipes with quick access to details.

### Reviews and Review Moderation

Authenticated users can write, edit, and delete their own review for any recipe. Each review shows a star rating and comment text. Reviews from Foodie accounts (influencers) are visually distinguished. Admins can moderate reviews through the Admin Review Control in the navbar. Users can report inappropriate reviews. The Review Report Control panel is visible to admins.

### Real-Time Recipe Discussions

Each recipe has a live discussion page (`/recipes/:id/discussion`) where users can post comments, reply to other comments, and @mention participants. The page connects via Socket.IO and displays a live viewer count, typing indicators, and instant comment updates across all open tabs without page refreshes (see [WebSocket Integration](#websocket-integration)).

### Social Features

- Follow and unfollow other users.
- Browse a social Feed showing recent recipe posts and activity from followed users.
- Like recipes and comment-like individual discussion comments.
- View any user's public profile showing their recipes, follower count, and biography.
- Search users by name using the search button in the navbar.

### AI-Powered Tools

Three Gemini-backed tools are available at `/ai-assistant` (see [AI Integration](#ai-integration)):
- **Recipe Generator** — generates a new recipe based on current pantry ingredients.
- **Personalized Suggestions** — recommends recipes tailored to the user's preferences and pantry.
- **Ingredient Substitute** — suggests alternatives for a specific ingredient.

### Dashboard

A personal overview showing meal planning summaries, pantry status, shopping list totals, and quick-action shortcuts.

### Feed

A social feed showing approved recipes from creators the user follows, plus a "Creators you may like" carousel (powered by `GET /api/feed/creators`) that surfaces chefs and influencers the user has not yet followed.

### Administration

- **Admin users** can create and manage user accounts from the Users page, manage ingredients globally, access the Recipe Management panel, and moderate both reviews and recipe approval requests.
- **Chef/Foodie role upgrades** are requested through a Chef Request flow and approved or rejected by admins.

---

## Technology Stack

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.6 | UI framework |
| `react-dom` | ^19.2.6 | DOM rendering |
| `react-router-dom` | ^7.16.0 | Client-side routing |
| `axios` | ^1.16.1 | HTTP API client |
| `socket.io-client` | ^4.8.3 | Real-time WebSocket client |
| `react-scripts` | 5.0.1 | Build tooling (Create React App) |
| `web-vitals` | ^2.1.4 | Performance metrics |

---

## Prerequisites

- **Node.js** — any version compatible with Create React App 5 (Node 14+ recommended).
- **npm** — included with Node.js.
- The **backend** must be running at `http://localhost:3000` before the frontend can reach the API.
- A **MySQL database** (`smart_kitchen_enriched`) must be configured, migrated, and seeded for the backend to serve data. See [Backend and Database Dependency](#backend-and-database-dependency).

---

## Installation and Running

The frontend requires the backend to be running first. For complete setup instructions see the [Root README](../../README.md). For backend-only setup see the [Backend Documentation](../../backend/docs/README.md).

### Quick backend preparation (new database)

Run these commands in a separate terminal before starting the frontend:

```powershell
cd backend
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm start
```

> [!WARNING]
> Run `npx sequelize-cli db:seed:all` only when preparing a new or empty development database. Running all seeders again on a populated database may create duplicate records or fail due to database constraints.

For an existing database (already migrated and seeded), skip `db:seed:all`:

```powershell
cd backend
npm install
npx sequelize-cli db:migrate
npm start
```

### Install frontend dependencies

```powershell
cd frontend
npm install
```

### Start the frontend

```powershell
npm start
```

The frontend starts at **http://localhost:5173**.

### Production build

```powershell
npm run build
```

Output is written to `frontend/build/`.

---

## Environment Variables

The frontend has **no required `.env` file**. The API base URL and Socket.IO server address are configured directly in source files:

| Constant | Value | File |
|---|---|---|
| `API_BASE_URL` | `http://localhost:3000/api` | `src/utils/apiConfig.js` |
| `BACKEND_BASE_URL` | `http://localhost:3000` | `src/utils/apiConfig.js` |
| `SOCKET_URL` | `http://localhost:3000` | `src/services/socketService.js` |

If the backend runs on a different port, update these two files before starting the frontend.

---

## Running the Application

```powershell
cd frontend
npm start
```

The frontend starts at **[http://localhost:5173](http://localhost:5173)**.

The backend must be running at `http://localhost:3000` before logging in or using any feature.

---

## Production Build

```powershell
cd frontend
npm run build
```

The optimized output is written to `frontend/build/`. Serve with any static file server.

---

## Backend and Database Dependency

The backend lives in `backend/` at the repository root.

### Start the backend

```powershell
cd backend
node server.js
```

Or with auto-reload during development:

```powershell
cd backend
npm run dev
```

### MySQL requirement

The backend uses **Sequelize ORM** (v6) with the `mysql2` driver to connect to a MySQL database. The database name is `smart_kitchen_enriched` by default.

Create a `.env` file at `backend/.env` before starting the server. Use `backend/.env.example` as the template — it contains all required variable names with placeholder values and never includes real credentials.

### Migrations and seeders

Run migrations once on a new database to create all tables:

```powershell
cd backend
npx sequelize-cli db:migrate
```

To populate the database with seed data on a new empty installation:

```powershell
npx sequelize-cli db:seed:all
```

> **Note:** Do not run `db:seed:all` on an existing database that already contains data — it will duplicate records. Only use seeders during initial setup.

---

## Application Routes

All routes below `/` and `/register` require the user to be logged in. Unauthenticated requests are redirected to `/`.

| Path | Page | Access | Purpose |
|---|---|---|---|
| `/` | Login | Public | Sign in to an existing account |
| `/register` | Register | Public | Create a new user account |
| `/dashboard` | Dashboard | All users | Personal overview and quick actions |
| `/feed` | Feed | All users | Social activity from followed users |
| `/recipes` | Recipes | All users | Browse, search, and filter all recipes |
| `/recipes/:id` | RecipePage | All users | Standalone full-detail recipe page |
| `/recipes/:id/discussion` | RecipeDiscussion | All users | Live comment discussion for a recipe |
| `/favorites` | Favorites | All users | Saved favorite recipes |
| `/pantry` | Pantry | All users | Manage personal pantry inventory |
| `/meal-planner` | MealPlanner | All users | Plan meals by date and type |
| `/shopping-list` | ShoppingList | All users | Manage the personal shopping list |
| `/ai-assistant` | AIAssistant | All users | AI-powered recipe and ingredient tools |
| `/settings` | Settings | All users | Edit profile, avatar, and preferences |
| `/profile/:id` | Profile | All users | View any user's public profile |
| `/users` | Users | Admin | Manage all user accounts |
| `/ingredients` | Ingredients | Admin | Manage the global ingredient catalog |
| `/recipe-management` | RecipeManagement | Chef / Admin | Create, edit, and delete recipes |
| `/chef/my-recipes` | ChefRecipes | Chef | View and manage chef's own recipes |
| `/foodie/my-recipes` | FoodieMyRecipes | Foodie (influencer) | View Foodie's submitted recipes |

---

## Frontend Project Structure

```
frontend/src/
├── assets/          # Static images: logo, login carousel, user avatars
├── components/      # Reusable UI elements (Navbar, Sidebar, RecipeCard,
│                    #   RecipeDetailsModal, ReviewCard, CommentItem, etc.)
├── context/         # React context providers
│   ├── AuthContext.jsx          # Logged-in user state (sessionStorage)
│   ├── NotificationContext.jsx  # Real-time notification state
│   ├── PendingRecipeContext.jsx  # Pending recipe approval badge count
│   └── ReviewReportContext.jsx  # Pending review report badge count
├── layouts/         # MainLayout.jsx — wraps pages with Navbar, Sidebar, Footer
├── pages/           # Full-page route components (one per route)
├── services/        # Axios API clients (one file per backend resource)
├── utils/           # Shared helpers: apiConfig, authUtils, formatUtils,
│                    #   recipeImageUtils, recipeSortUtils, etc.
└── validators/      # Client-side form validation functions
```

---

## API Communication

All HTTP requests use **Axios**. There is one service file per backend resource group inside `src/services/`. Every request that requires authentication includes two custom headers:

| Header | Value |
|---|---|
| `x-user-id` | Numeric ID of the logged-in user |
| `x-user-role` | Role string (`user`, `chef`, `influencer`, `admin`) |

These headers are assembled by `getAuthHeaders()` in `src/utils/authUtils.js` and attached to every Axios call that talks to a protected endpoint.

### Response format

All backend responses follow this shape:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

On error:

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

The helper `getResponseData(response)` in `src/utils/apiUtils.js` extracts `response.data.data` from successful responses.

### Backend endpoint groups

| Group | Base path | Service file |
|---|---|---|
| Authentication | `/api/auth` | `authService.js` |
| Users | `/api/users` | `userService.js`, `profileService.js` |
| Recipes | `/api/recipes` | `recipeService.js` |
| Ingredients | `/api/ingredients` | `ingredientsService.js` |
| Pantry | `/api/users/:id/pantry` | direct Axios calls (Pantry page) |
| Shopping list | `/api/users/:id/shopping-list` | direct Axios calls (ShoppingList page) |
| Meal plan | `/api/users/:id/meal-plan` | `mealPlanService.js` |
| Favorites | `/api/users/:id/favorites` | `favoritesService.js` |
| Reviews | `/api/recipes/:id/reviews` | `reviewsService.js` |
| Recipe comments | `/api/recipes/:id/comments` | `recipeCommentsService.js` |
| Comment likes | `/api/comments/:id/likes` | `commentLikeService.js` |
| Recipe likes | `/api/recipes/:id/like` | `likeService.js` |
| User follows | `/api/users/:id/follow` | `followService.js` |
| Notifications | `/api/notifications` | `notificationService.js` |
| AI tools | `/api/users/:id/ai/*` | `aiHistoryService.js` |
| Feed Creators | `/api/feed/creators` | `feedCreatorsService.js` |
| Feed | `/api/feed` | `followService.js` (getFeed) |
| Settings | `/api/settings` | `settingsService.js` |
| Chef requests | `/api/chef-requests` | `chefRequestService.js` |
| Options (enums) | `/api/options` | `optionsService.js` |

---

## WebSocket Integration

Smart Kitchen uses **Socket.IO** for real-time recipe discussion on the `/recipes/:id/discussion` page.

### How it works

When a user opens a recipe discussion, the frontend connects to the Socket.IO server at `http://localhost:3000` and joins a room scoped to that recipe (`recipe-{recipeId}`). All users viewing the same recipe receive live updates without refreshing the page.

- New comments posted by any user appear instantly for all viewers.
- Comment edits update in-place for all viewers.
- Deleted comments (and their replies) disappear immediately for all viewers.
- A live viewer count shows how many unique users are currently in the room.
- A typing indicator shows which users are currently composing a comment.

### Client initialization

The singleton socket client is in `src/services/socketService.js`:

```js
import { io } from "socket.io-client";
const socket = io("http://localhost:3000", { auth: { userId } });
```

The connection is established by `connectSocket(userId)` and managed by `NotificationContext` so it is shared across the whole app.

### Custom Socket.IO events

| Direction | Event name | Purpose |
|---|---|---|
| Client → Server | `joinRecipeRoom` | Join the room for a specific recipe |
| Client → Server | `leaveRecipeRoom` | Leave the room on unmount |
| Client → Server | `sendRecipeComment` | Post a new comment (saved to DB by server) |
| Client → Server | `editRecipeComment` | Edit own comment (validated server-side) |
| Client → Server | `deleteRecipeComment` | Delete own comment (validated server-side) |
| Client → Server | `typingRecipeComment` | Signal that the user is typing |
| Client → Server | `stopTypingRecipeComment` | Signal that the user stopped typing |
| Server → Client | `newRecipeComment` | A new comment was posted |
| Server → Client | `recipeCommentEdited` | A comment was updated |
| Server → Client | `recipeCommentDeleted` | A comment was removed |
| Server → Client | `roomUserCount` | Updated unique viewer count |
| Server → Client | `userTyping` | Another user started typing |
| Server → Client | `userStoppedTyping` | Another user stopped typing |
| Server → Client | `commentError` | Server rejected an edit or delete |
| Server → Client | `commentLikeUpdated` | A comment's like count changed |

### Pages and components that use Socket.IO

| File | Role |
|---|---|
| `src/pages/RecipeDiscussion.jsx` | Primary socket consumer: sends/receives all discussion events |
| `src/components/CommentInput.jsx` | Emits `sendRecipeComment`, `typingRecipeComment`, `stopTypingRecipeComment` |
| `src/context/NotificationContext.jsx` | Manages the shared socket connection; handles notification events |

### Two-tab demo

1. Open the same recipe discussion page in two browser tabs (log in as different users).
2. Type a comment in Tab A and submit it.
3. The comment appears instantly in Tab B without refreshing.
4. While typing in Tab A, Tab B shows the typing indicator with the sender's name.
5. Edit or delete a comment in Tab A; Tab B updates in place.

---

## AI Integration

The AI Assistant page (`/ai-assistant`) provides three tools, each backed by the Google Gemini API through the backend. The Gemini API key is stored exclusively in `backend/.env` and is never sent to or visible in the frontend.

### Tool 1 — Recipe Generator

Sends the user's current pantry ingredients (with optional difficulty, prep time, cook time, and servings constraints) to the backend. Gemini returns a structured recipe that is displayed in the result panel.

**Frontend service:** `aiHistoryService.generateRecipeFromPantry(ingredients, constraints)`  
**Backend endpoint:** `POST /api/users/:id/ai/generate-recipe`

### Tool 2 — Personalized Suggestions

Requests recipe recommendations based on the user's profile preferences and current pantry contents. Returns a list of suggestions with rationale.

**Frontend service:** `aiHistoryService.getPersonalizedSuggestions(pantryItems)`  
**Backend endpoint:** `POST /api/users/:id/ai/suggestions`

### Tool 3 — Ingredient Substitute

Asks Gemini for ingredient alternatives given a specific ingredient name, an optional recipe context, and an optional reason (e.g., allergy, unavailability).

**Frontend service:** `aiHistoryService.substituteIngredient(ingredient, context, reason)`  
**Backend endpoint:** `POST /api/users/:id/ai/substitute`

### AI Request History

Every successful AI request is saved to the `AiHistory` table in MySQL (via Sequelize) by the backend controller. The AI Assistant page fetches the current user's history at mount and after each new request.

- History is user-specific: one user cannot see another user's history.
- History rows include request type, input, output, and timestamp.
- Individual history items can be deleted.
- Clicking a history row reopens the matching tool panel and restores the saved result.

**History endpoint:** `GET /api/users/:id/ai/history`  
**Delete endpoint:** `DELETE /api/users/:id/ai/history/:historyId`

### Sidebar deep-links

The Kitchen Sidebar provides three shortcut buttons that navigate directly to each AI tool with the feature panel pre-opened via the `?feature=` query parameter (e.g., `/ai-assistant?feature=recipe-generator`).

---

## Recipe Images

Recipe images follow a three-stage fallback chain, implemented in `src/utils/recipeImageUtils.js`:

1. **Stored `imageUrl`** — resolved via `resolveImageUrl()`. Paths beginning with `/uploads/` are prefixed with `http://localhost:3000` to reach the backend static file server. External URLs are passed through unchanged.
2. **Category default image** — if `imageUrl` is absent or fails to load, `getCategoryDefaultImage(category)` returns the matching URL from `CATEGORY_DEFAULT_IMAGES`.
3. **General default image** — if the category is unknown or its default image also fails, `GENERAL_DEFAULT_IMAGE` is used.

After the general default fails, the `onError` handler is cleared to stop further retries.

### Supported categories and their defaults

| Category | Fallback behavior |
|---|---|
| `breakfast` | Dedicated category default image |
| `lunch` | Dedicated category default image |
| `dinner` | Dedicated category default image |
| `dessert` | Dedicated category default image |
| `snack` | Dedicated category default image |
| Unknown / missing | General default image |

### Image positioning

For recipes with a stored `imageUrl`, `imagePositionX` and `imagePositionY` (0–100) control the CSS `object-position` for cropped banners, allowing the focal point of the image to be preserved.

---

## User Roles

| Role value | Display name | Description |
|---|---|---|
| `user` | User | Standard authenticated user. Can browse recipes, manage pantry, shopping list, meal plan, and favorites. Can write and edit their own reviews and comments. Can request a role upgrade. |
| `chef` | Chef | All user permissions plus the ability to create, edit, and delete recipes via the Recipe Management page and the Chef My Recipes page. |
| `influencer` | Foodie | A content-creator role. Can submit recipes via the Foodie My Recipes page. Their reviews are visually distinguished. Submitted recipes require admin approval before appearing publicly. |
| `admin` | Admin | Full access. Can manage all user accounts, manage the global ingredient catalog, approve or reject recipe submissions and chef requests, and moderate reviews and review reports. |

---

## Running the Full System Locally

### 1. Configure MySQL

Create the `smart_kitchen_enriched` database in MySQL before running migrations.

```sql
CREATE DATABASE smart_kitchen_enriched CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configure backend environment variables

```powershell
cd backend
Copy-Item .env.example .env
```

Open `.env` and fill in your MySQL credentials and a valid Gemini API key. Do not commit this file.

### 3. Run migrations

```powershell
cd backend
npx sequelize-cli db:migrate
```

### 4. Seed the database (new installations only)

Only run this once, on a fresh empty database:

```powershell
npx sequelize-cli db:seed:all
```

### 5. Start the backend

```powershell
node server.js
```

The backend listens at `http://localhost:3000`.

### 6. Start the frontend

In a separate terminal:

```powershell
cd frontend
npm start
```

### 7. Open the application

Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser and log in with one of the seeded accounts.

**Seeded accounts** (password set during seeding):

| Name | Role |
|---|---|
| Lior | Chef |
| Ellen | Admin |
| Daniel | User |
| Maya | User |
| Shir | Foodie |
| Noa | Admin |

---

## Known Limitations

- **Gemini API key required** — the AI tools return an error if `GEMINI_API_KEY` is not set in the backend `.env`.
- **External image URLs** — category default images and recipe images hosted externally depend on third-party availability. If an external URL becomes unreachable, the next fallback in the chain is used.
- **Backend and MySQL required** — the frontend cannot display any data if the backend or database is not running.
- **Uploaded images tied to backend** — recipe images uploaded through the app are stored in `backend/uploads/` and served statically. Moving or restarting the backend with a different uploads directory will break existing image URLs.
- **Session is tab-local** — session state is stored in `sessionStorage`. Each browser tab maintains an independent login, which is required for the two-tab Socket.IO demo but means logging out in one tab does not affect others.
- **Role-restricted pages** — navigating to `/recipe-management`, `/users`, or `/ingredients` as a non-admin/chef returns an error or empty state; access control is enforced by the backend.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| All API calls return network errors | Backend not running | Run `node server.js` in `backend/` |
| Login fails silently | MySQL connection failure | Verify credentials in `.env` and that MySQL is running |
| "GEMINI_API_KEY is missing" in backend console | Key not set | Add `GEMINI_API_KEY=your_key` to `backend/.env` |
| AI tools return 500 errors | Invalid or missing Gemini key | Set a valid key in `.env` and restart the backend |
| Port 3000 already in use | Another process on port 3000 | Change `PORT` in `backend/.env` and update `src/utils/apiConfig.js` and `src/services/socketService.js` accordingly |
| Port 5173 already in use | Another process on port 5173 | Set `PORT=5174` in a `frontend/.env` file |
| Uploaded recipe images not loading | Backend uploads directory missing or wrong path | Ensure `backend/uploads/` exists and the backend is running |
| CORS errors in browser console | Backend CORS not configured for the frontend port | The backend uses `cors()` with default settings; if you change the frontend port, no change is needed unless you add strict origin rules |

---

## Security Notes

- **Never commit `.env`** — `backend/.env` is listed in `.gitignore`. Use `.env.example` for documentation of variable names only.
- **Never expose the Gemini API key** — the key is loaded exclusively in `backend/services/geminiService.js` and is never included in any API response or frontend bundle.
- **Never expose database credentials** — DB credentials live only in the backend `.env` file.
- **Do not submit `node_modules`** — both `frontend/node_modules/` and `backend/node_modules/` are excluded by `.gitignore`.
- **`.env.example` is safe to commit** — it contains only placeholder values and serves as setup documentation for other developers.

---

## Screenshots and Assignment 4 Submission

Assignment 4 submission screenshots are stored in:

```
frontend/docs/Screenshots/
```

Do not rename or delete files in that directory.

---

## Assignment 4 Coverage

| Requirement | Frontend participation |
|---|---|
| React frontend | This application — React 19 SPA with React Router 7, Axios, and Context API |
| Express backend communication | All data is fetched via Axios from `http://localhost:3000/api`; authentication headers sent with every request |
| MySQL persistence | All application state survives backend restarts; served by the backend Sequelize/MySQL layer |
| Sequelize ORM | Consumed transparently — the frontend receives normalized JSON from the backend's Sequelize queries |
| Socket.IO | The frontend connects via `socket.io-client`; live recipe discussion and notification delivery use custom events on both sides |
| AI integration | Frontend sends user inputs to backend AI endpoints; Gemini is called only server-side; results are displayed in `AIAssistant.jsx` and persisted as history in MySQL |

---

## Related Documentation

- [Root README — full-system setup and overview](../../README.md)
- [Backend Documentation](../../backend/docs/README.md)
- [API Reference](../../backend/docs/API_REFERENCE.md)
