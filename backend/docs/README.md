# Smart Kitchen — Backend

> **Part of the Smart Kitchen full-stack application.**
> - [Root README (full-system setup)](../../README.md)
> - [Frontend Documentation](../../frontend/docs/README.md)
> - [API Reference](API_REFERENCE.md)

A backend REST API for the Smart Kitchen project.
The system supports user management, recipes with an approval workflow, ingredients, pantry tracking, shopping lists with city-based store recommendations, meal planning, chef account requests, real-time recipe discussions via Socket.IO, social features (follows, likes, feeds, notifications), and AI-powered food suggestions via Google Gemini.

---

## Prerequisites

| Requirement | Minimum Version |
|-------------|----------------|
| **Node.js** | 20.x |
| **MySQL** | 8.0 |
| **npm** | 9.x |

---

## Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env`:

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

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3000) |
| `DB_HOST` | Yes | MySQL host |
| `DB_PORT` | No | MySQL port (default: 3306) |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | MySQL username |
| `DB_PASSWORD` | Yes | MySQL password |
| `GEMINI_API_KEY` | Yes | Google Gemini API key (for AI endpoints) |
| `GEMINI_MODEL` | No | Gemini model name (default: `gemini-3.1-flash-lite`) |

---

## Installation and Database Setup

### Fresh database setup (first time or new empty database)

Use this process when setting up from scratch or when the target database has no tables yet.

```bash
cd backend
npm install
```

Create the database. Either use the Sequelize CLI (requires CREATE DATABASE privilege):

```bash
npx sequelize-cli db:create
```

Or connect to MySQL directly:

```sql
CREATE DATABASE smart_kitchen_enriched CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run all migrations:

```bash
npx sequelize-cli db:migrate
```

> [!WARNING]
> Run `npx sequelize-cli db:seed:all` only when preparing a new or empty development database. Running all seeders again on a populated database may create duplicate records or fail due to database constraints.

```bash
npx sequelize-cli db:seed:all
```

Start the backend:

```bash
npm start
```

### Existing database setup (database already migrated and seeded)

Use this process on subsequent starts when the database already contains tables and data.

```bash
cd backend
npm install
npx sequelize-cli db:migrate
npm start
```

Only new pending migrations run — already-applied migrations are skipped automatically.

### Verifying migration status

To see which migrations have been applied without making any changes:

```bash
npx sequelize-cli db:migrate:status
```

### What the seeders create

The 18 seeder files populate the following data when run against a fresh database:

| Seeder | Data created |
|---|---|
| `seed-users` | 40 users across all roles (user, chef, influencer, admin) |
| `seed-ingredients` | Global ingredient catalog |
| `seed-recipes` | Recipe records with metadata |
| `seed-recipe-ingredients` | Ingredient links for each recipe |
| `seed-favorites` | Saved recipe relationships |
| `seed-pantry-items` | Per-user pantry inventory |
| `seed-shopping-list` | Per-user shopping list entries |
| `seed-meal-plan-items` | Per-user meal plan records |
| `seed-stores` | Local store records |
| `seed-ingredient-stores` | Ingredient-store price data |
| `seed-reviews` | Recipe reviews and ratings |
| `seed-chef-requests` | Chef upgrade request records |
| `seed-recipe-likes` | Recipe like relationships |
| `seed-user-follows` | User follow relationships |
| `seed-recipe-comments` | Recipe discussion comments |
| `seed-notifications` | User notification records |
| `seed-comment-likes` | Comment like relationships |
| `update-recipe-image-urls` | Applies image URL data to recipe records |

AI history is **not seeded** — it accumulates through normal application usage of the AI tools.

---

## Starting the Server

```bash
# Production
npm start

# Development (with auto-restart via nodemon)
npm run dev
```

You should see:
```
Server running on port 3000
```

---

## Server Configuration

| Property | Value |
|----------|-------|
| **Port** | 3000 (configurable via `PORT` env) |
| **Host** | localhost |
| **Base URL** | `http://localhost:3000` |
| **API Base Path** | `/api` |
| **Static Files** | `http://localhost:3000/uploads/recipes/<filename>` |
| **WebSocket** | `ws://localhost:3000` (Socket.IO) |

---

## Project Structure

```
backend/
├── server.js                    # Express app + Socket.IO initialization
├── package.json
├── .env                         # Environment variables (not committed)
├── .env.example                 # Environment variable template
├── .sequelizerc                 # Sequelize CLI configuration
├── config/
│   └── sequelize-config.js      # Sequelize CLI database config
├── data/                        # JSON source files used by seeders
├── models/                      # Sequelize model definitions and query functions
├── migrations/                  # Sequelize database migrations (28 files)
├── seeders/                     # Sequelize seed data (18 files)
├── scripts/                     # Utility scripts (reset DB, etc.)
├── uploads/
│   └── recipes/                 # Uploaded recipe images (served by /uploads static route)
├── src/
│   ├── routes/                  # Express router files (21 files)
│   ├── controllers/             # Business logic and request handlers (19 files)
│   ├── services/
│   │   ├── geminiService.js     # Google Gemini API integration
│   │   └── notificationService.js # Notification creation + Socket.IO emit
│   ├── socket/
│   │   ├── index.js             # Socket.IO server initialization
│   │   ├── recipeDiscussion.js  # Real-time comment events
│   │   └── notifications.js     # Real-time notification events
│   ├── middleware/
│   │   ├── auth.js              # Role-based authorization middleware
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── logger.js            # Request logging middleware (masks passwords)
│   │   ├── notFoundHandler.js   # 404 handler for unmatched routes
│   │   └── upload.js            # Multer config for recipe image uploads (5 MB max)
│   ├── validators/              # Request validation helpers
│   └── utils/
│       └── responseHelper.js    # successResponse / errorResponse helpers
└── docs/
    ├── README.md                # Backend detailed documentation
    └── API_REFERENCE.md         # Full endpoint reference
```

---

## Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20.x | Runtime |
| **Express** | 5.2.1 | HTTP framework |
| **MySQL** | 8.0 | Relational database |
| **Sequelize** | 6.37.8 | ORM + migrations + seeders |
| **mysql2** | 3.22.5 | MySQL driver for Sequelize |
| **bcryptjs** | 3.0.3 | Password hashing |
| **Socket.IO** | 4.8.3 | Real-time WebSocket events |
| **Multer** | 2.2.0 | File upload handling |
| **@google/generative-ai** | 0.24.1 | Gemini AI integration |
| **cors** | 2.8.6 | Cross-origin request support |
| **dotenv** | 17.4.2 | Environment variable loading |
| **nodemon** | 3.1.14 | Dev auto-restart (devDependency) |
| **sequelize-cli** | 6.6.5 | Migration + seeder CLI (devDependency) |

---

## Authentication & Authorization

The API uses **header-based authentication** with role-based access control.
Passwords are hashed with bcrypt (salt rounds: 10). Login returns a mock token for demonstration purposes; the token itself is not validated on subsequent requests — only `x-user-id` is read.

### Authentication Headers

Every protected endpoint requires:

| Header | Description | Example |
|--------|-------------|---------|
| `x-user-id` | Authenticated user's database ID | `1` |
| `x-user-role` | User's role (used for authorization checks) | `chef` |

### Roles

| Role | Capabilities |
|------|-------------|
| `user` | View public resources, manage own pantry/shopping list/meal plan, submit chef request |
| `chef` | All user capabilities + create/edit/delete recipes, post reviews |
| `influencer` | All user capabilities + create/edit/delete own recipes (approval required), reviews |
| `admin` | Full access to all resources, approve/reject recipes and chef requests, manage users and ingredients |

### Endpoint Access Types

| Access Level | Description |
|---|---|
| Public | No headers required |
| `requireAuth` | Any authenticated user (`x-user-id` must resolve to a valid user) |
| `self or admin` | User ID in URL must match `x-user-id`, or role must be `admin` |
| `self only` | User ID in URL must match `x-user-id` exactly |
| `chef or admin` | Role must be `chef`, `influencer`, or `admin` |
| `admin only` | Role must be `admin` |

---

## API Response Format

All endpoints return a consistent JSON response structure:

### Success Response
```json
{
  "success": true,
  "data": { },
  "error": null
}
```

### Error Response
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

---

## Socket.IO

The server initializes a Socket.IO instance attached to the same HTTP server on port 3000.
Allowed CORS origin: `http://localhost:5173`.

### Recipe Discussion (real-time comments)

Clients authenticate via `socket.handshake.auth.userId`.

| Event (Client → Server) | Payload | Description |
|---|---|---|
| `joinRecipeRoom` | `{ recipeId }` | Join a recipe's discussion room |
| `leaveRecipeRoom` | `{ recipeId }` | Leave the room |
| `sendRecipeComment` | `{ recipeId, content, tags?, parentCommentId?, mentionedUserId? }` | Post a comment |
| `editRecipeComment` | `{ recipeId, commentId, content }` | Edit own comment |
| `deleteRecipeComment` | `{ recipeId, commentId }` | Delete own comment |
| `typingRecipeComment` | `{ recipeId }` | Broadcast typing indicator |
| `stopTypingRecipeComment` | `{ recipeId }` | Stop typing indicator |

| Event (Server → Client) | Description |
|---|---|
| `roomUserCount` | Current viewer count in the recipe room |
| `newRecipeComment` | New comment broadcast to all room members |
| `recipeCommentEdited` | Edited comment broadcast |
| `recipeCommentDeleted` | Deleted comment broadcast |
| `userTyping` | Typing indicator (others in room) |
| `userStoppedTyping` | Stop typing indicator |

### Notifications (real-time)

Users join their personal room `user:{userId}` on connect.

| Event (Server → Client) | Description |
|---|---|
| `newNotification` | Fired when a notification is created for the user (follow, reply, mention, recipe approval/rejection, chef request approval/rejection, comment like) |

---

## File Uploads

Recipe images are uploaded via multipart form-data to `POST /api/recipes/:id/image`.

| Property | Value |
|----------|-------|
| **Field name** | `image` |
| **Allowed types** | JPEG, PNG, GIF, WebP |
| **Max size** | 5 MB |
| **Storage path** | `uploads/recipes/<timestamp>-<originalname>` |
| **Served at** | `http://localhost:3000/uploads/recipes/<filename>` |
| **imageUrl format** | `/uploads/recipes/<filename>` (relative path stored in DB) |

If a recipe already has a locally-uploaded image, the old file is deleted from disk when a new image is uploaded or when the image is deleted.
The `imageUrl` field also accepts external URLs — if `imageUrl` does not start with `/uploads/`, no file deletion occurs.

---

## Recipe Approval Workflow

| Role | On Create | On Update |
|------|-----------|-----------|
| `chef` / `admin` | `approvalStatus: approved` | Status unchanged |
| `influencer` | `approvalStatus: pending` | Reset to `pending` on every edit |

- Only **approved** recipes appear in `GET /api/recipes` (public list).
- An influencer can see all their own recipes (all statuses) via `GET /api/recipes/my-recipes`.
- Admins see pending recipes in `GET /api/recipes/pending`.
- On approval/rejection, the recipe creator receives a real-time notification via Socket.IO.
- `approvalStatus`, `reviewedByUserId`, `reviewedAt`, and `rejectionReason` are always set server-side and are stripped from the request body.

---

## Sample Test Users

The seed data includes 40 users. Key accounts for testing:

### Chef (userId: 1)
| Property | Value |
|----------|-------|
| **User ID** | 1 |
| **Name** | Lior Rubinshtein |
| **Username** | lior_rubinshtein |
| **Email** | lior@project.com |
| **Password** | password_1 |
| **Role** | chef |
| **City** | Gan Yavne |

```
x-user-id: 1
x-user-role: chef
```

### Admin (userId: 2)
| Property | Value |
|----------|-------|
| **User ID** | 2 |
| **Name** | Ellen Levin |
| **Username** | ellen_levin |
| **Email** | ellen@project.com |
| **Password** | password_2 |
| **Role** | admin |
| **City** | Ashdod |

```
x-user-id: 2
x-user-role: admin
```

### Influencer (userId: 6)
| Property | Value |
|----------|-------|
| **User ID** | 6 |
| **Name** | Shir Mizrahi |
| **Username** | shir_mizrahi |
| **Email** | shir@project.com |
| **Password** | password_6 |
| **Role** | influencer |
| **City** | Haifa |

```
x-user-id: 6
x-user-role: influencer
```

### Regular User (userId: 4)
| Property | Value |
|----------|-------|
| **User ID** | 4 |
| **Name** | Daniel Levi |
| **Email** | daniel@project.com |
| **Password** | password_4 |
| **Role** | user |
| **City** | Beer Sheva |

```
x-user-id: 4
x-user-role: user
```

---

## Testing with Postman

A Postman collection is provided for testing all endpoints:

```
docs/Smart Kitchen API.postman_collection.json
```

**To import the collection:**
1. Open Postman
2. Click `Import` → `File`
3. Select `Smart Kitchen API.postman_collection.json`
4. All endpoints will be pre-configured with paths, methods, and sample bodies

---

## API Endpoints Summary

| Category | Endpoints |
|----------|-----------|
| **Authentication** | 4 |
| **Users** | 8 |
| **Settings** | 2 |
| **Favorites** | 3 |
| **Pantry** | 4 |
| **Shopping List** | 6 |
| **Meal Plan** | 5 |
| **Recipes** | 8 |
| **Recipe Images** | 2 |
| **Recipe Approval** | 2 |
| **Recipe Reviews** | 4 |
| **Review Actions** | 2 |
| **Recipe Comments (REST)** | 3 |
| **Recipe Likes** | 3 |
| **Ingredients** | 6 |
| **Stores** | 3 |
| **AI** | 6 |
| **Options** | 1 |
| **Chef Requests** | 5 |
| **User Follows** | 4 |
| **Feed** | 1 |
| **Feed Creators** | 1 |
| **Notifications** | 4 |
| **Comment Likes** | 2 |
| **Review Reports** | 4 |

**Total: 98 endpoints**

For full endpoint documentation see [API_REFERENCE.md](API_REFERENCE.md).

---

## Features

### Core Features
- User authentication with bcrypt password hashing
- Role-based access control (user / chef / influencer / admin)
- Recipe creation, retrieval, update, and deletion
- Recipe approval workflow — influencer recipes require admin approval
- Recipe image upload (JPEG/PNG/GIF/WebP, max 5 MB) with automatic old-file cleanup
- Recipe image position control via `imagePositionX` and `imagePositionY` (0–100, CSS object-position)
- Ingredient management with user-driven ingredient creation
- Personal pantry tracking with expiry date monitoring
- Shopping list generation from expired pantry items
- City-based store recommendations on shopping list (filtered by user's city)
- Meal planning by date and meal type (supports both recipe and ingredient item types)
- Recipe reviews and ratings (one review per user per recipe) with helpful vote tracking
- Review reporting and admin moderation workflow
- Recipe likes (public like count, one like per user per recipe)
- Favorites (private recipe saves)
- Chef account request workflow (submit, review, approve, reject)
- Real-time recipe discussions via Socket.IO (comments, replies, @mentions, typing indicators, viewer count)
- User follow / unfollow with social feed (recipes from followed creators)
- Feed creators carousel (`GET /api/feed/creators`) — lists all chefs and influencers with stats, used by the Feed page
- Public user profiles with follower/following counts
- Real-time notifications via Socket.IO (follows, recipe approval/rejection, replies, @mentions, helpful votes, chef request decisions, comment likes)
- AI-powered recipe generation, meal suggestions, and ingredient substitutions via Google Gemini
- User settings management (update profile, city, preferences, avatar, username)
- User search (by name, city, or role)
- Password change with current-password verification

### Technical Features
- Sequelize ORM with MySQL
- Database migrations and seeders (sequelize-cli)
- Socket.IO real-time WebSocket server
- Multer file upload middleware
- bcryptjs password hashing
- Structured error handling with global error middleware
- Request logging with password masking
- Consistent API response format (`success`, `data`, `error`)
- Role-based authorization middleware
- Sequelize transactions for atomic operations (recipe + ingredients, chef request approval)

---

## Error Handling

| HTTP Status | Error Code | Description |
|-------------|-----------|-------------|
| 200 | — | Request successful |
| 201 | — | Resource created |
| 400 | `VALIDATION_ERROR` | Missing or invalid fields |
| 400 | `MISSING_FIELD` | Required field absent |
| 400 | `INVALID_USERNAME` | Username format invalid |
| 400 | `INVALID_AVATAR_KEY` | Unknown avatar key |
| 400 | `NO_FILE` | Image upload missing file |
| 400 | `NO_CITY` | User has no city configured |
| 401 | `UNAUTHORIZED` | Authentication required |
| 401 | `EMAIL_NOT_FOUND` | No account was found with this email address |
| 401 | `INVALID_PASSWORD` | Incorrect password |
| 403 | `FORBIDDEN` | Permission denied |
| 404 | `NOT_FOUND` | Route not found |
| 404 | `USER_NOT_FOUND` | User does not exist |
| 404 | `RECIPE_NOT_FOUND` | Recipe does not exist |
| 404 | `INGREDIENT_NOT_FOUND` | Ingredient does not exist |
| 404 | `STORE_NOT_FOUND` | Store does not exist |
| 404 | `PANTRY_ITEM_NOT_FOUND` | Pantry item does not exist |
| 404 | `SHOPPING_ITEM_NOT_FOUND` | Shopping item does not exist |
| 404 | `MEAL_NOT_FOUND` | Meal plan item does not exist |
| 404 | `REVIEW_NOT_FOUND` | Review does not exist |
| 404 | `REPORT_NOT_FOUND` | Review report does not exist |
| 404 | `HISTORY_NOT_FOUND` | AI history item does not exist |
| 409 | `EMAIL_ALREADY_EXISTS` | Email already registered |
| 409 | `USERNAME_TAKEN` | Username already taken |
| 409 | `FAVORITE_ALREADY_EXISTS` | Recipe already in favorites |
| 409 | `DUPLICATE_REVIEW` | User already reviewed this recipe |
| 409 | `DUPLICATE_REPORT` | User already reported this review |
| 409 | `REQUEST_ALREADY_EXISTS` | Pending chef request already exists |
| 500 | `SERVER_ERROR` | Unexpected server error |

---

## Related Documentation

- [Root README — full-system setup and overview](../../README.md)
- [Frontend Documentation](../../frontend/docs/README.md)
- [API Reference](API_REFERENCE.md)
