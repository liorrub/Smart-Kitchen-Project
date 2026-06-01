# Smart Kitchen API

A backend REST API for the Smart Kitchen project.
The system supports management of users, recipes, ingredients, pantry items, shopping lists, meal planning, and mock AI-based food suggestion features through a structured REST API.

---

## Installation

Extract the project ZIP file and install dependencies:

```bash
npm install
```

This will install Express.js 5.2.1, which is the only runtime dependency.

---

## Starting the Server

Since there is no `npm start` script configured, run the server directly:

```bash
node server.js
```

You should see:
```
Server running on port 3000
```

---

## Server Configuration

| Property | Value |
|----------|-------|
| **Port** | 3000 |
| **Host** | localhost |
| **Base URL** | `http://localhost:3000` |
| **API Base Path** | `/api` |

---

## Project Structure

```
smart-kitchen-api/
├── server.js                    # Express app initialization and route mounting
├── package.json                 # Project dependencies
├── middleware/
│   ├── auth.js                  # Role-based authorization middleware
│   └── logger.js                # Request logging middleware
├── routes/                      # API endpoint definitions
├── controllers/                 # Business logic and request handlers
├── models/                      # In-memory data models and CRUD operations
├── validators/                  # Request validation logic
├── utils/
├── data/                        # Mock JSON data storage
└── docs/

```

---

## Authentication & Authorization

The API uses **header-based authentication** with role-based access control. No real token-based authentication is implemented;

### Authentication Headers

Every protected endpoint requires the following headers:

| Header | Description | Example |
|--------|-------------|---------|
| `x-user-id` | Authenticated user ID | `1` |
| `x-user-role` | User role | `chef`, `admin`, `user` |

### Public vs. Protected Endpoints

- **Public endpoints**: No headers required (e.g., GET recipes, GET ingredients)
- **Protected endpoints**: Require `x-user-id` and `x-user-role` headers
- **Role-restricted endpoints**: Require specific roles (`admin`, `chef`, etc.)
- **Self-or-admin endpoints**: Allow a user to access their own data or admins to access any user's data

### Access Control Examples

```
**Chef**
- Create and edit recipes
- Post recipe reviews
- Manage personal pantry, shopping list, and meal plan

**Admin**
- View all users
- Create and delete users
- Update and delete ingredients
- Manage stores
- View AI history

**User**
- View public resources
- Create ingredients
- Manage only personal resources
```

---

## API Response Format

All endpoints return a consistent JSON response structure:

### Success Response
```json
{
  "success": true,
  "data": {
    "id": 123,
    "message": "Operation completed successfully"
  },
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
    "details": {
      "field": "email"
    }
  }
}
```

**Fields:**
- `success` (`boolean`) – Indicates whether the request completed successfully
- `data` (`object | array | null`) – The response payload; `null` when the request fails
- `error` (`object | null`) – Error information; `null` when the request succeeds

---

## Testing the API

### Prerequisites

1. **Server running**: `node server.js` on port 3000
2. **Postman installed** (optional but recommended for easier testing)
3. **Sample user credentials** (see below)

### Using Postman

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

### Recommended Testing Flow

1. **Public endpoints** (no auth needed):
   - GET `/api/recipes` - List all recipes
   - GET `/api/ingredients` - List all ingredients
   - GET `/api/stores` - List all stores

2. **Protected user endpoints** ((using a Chef test user):
   - GET `/api/auth/me` - Get your profile
   - GET `/api/users/1/pantry` - Get your pantry
   - POST `/api/users/1/shopping-list` - Add to shopping list

3. **Admin-only endpoints**:
   - GET `/api/users` - List all users
   - POST `/api/users` - Create new user

4. **Authenticated user endpoints**:
   - POST `/api/ingredients` - Create ingredient

---

## Sample Test Users

The mock data includes two pre-configured users for testing different roles:

### Chef User
| Property | Value |
|----------|-------|
| **User ID** | 1 |
| **Name** | Lior Rubinshtein |
| **Email** | lior@project.com |
| **Password** | password_1 |
| **Role** | chef |
| **Cooking Level** | advanced |

**Use in headers:**
```
x-user-id: 1
x-user-role: chef
```

### Admin User
| Property | Value |
|----------|-------|
| **User ID** | 2 |
| **Name** | Ellen Levin |
| **Email** | ellen@project.com |
| **Password** | password_2 |
| **Role** | admin |
| **Cooking Level** | intermediate |

**Use in headers:**
```
x-user-id: 2
x-user-role: admin
```

---

## Important Assumptions

### Data Storage
- All data is loaded from JSON files inside the `data/` directory
- No real database is used
- Data exists in memory only while the server is running
- Restarting the server resets all mock data to its initial state

### Authentication
- Mock authentication is used for assignment purposes
- No real password hashing, JWT tokens, or session management
- Protected endpoints require `x-user-id` and `x-user-role` headers

### IDs & Generation
- Initial IDs are loaded from mock data
- New records are assigned the next available ID
- Generated IDs exist only in memory and are reset when the server restarts

### Validation
- Request validators enforce required fields, valid enums, and ID existence
- Email format is validated for user creation/updates
- Invalid requests return 400 Bad Request with error details

### Features & Limitations
- AI endpoints return mock suggestions, not real AI output
- Image analysis is mocked (no actual image processing)
- Store city data is hardcoded mock data and is used for city-based store recommendations
- Favorites and reviews are based on recipe IDs
- Ingredients can be created by authenticated users when a required ingredient does not already exist in the system.
- Ingredient updates and deletions remain restricted to administrators.
---

## API Endpoints Summary

The Smart Kitchen API provides 49 endpoints across the following resource categories:

| Category | Endpoints |
|----------|-----------|
| **Authentication** | 2 |
| **Users** | 5 |
| **Favorites** | 3 |
| **Pantry** | 4 |
| **Shopping List** | 6 |
| **Meal Plan** | 4 |
| **Recipes** | 5 |
| **Reviews** | 4 |
| **Ingredients** | 5 |
| **Stores** | 3 |
| **AI** | 7 |

**Total: 49 endpoints**

For detailed endpoint documentation, see:
- [API_REFERENCE.md](API_REFERENCE.md) - Comprehensive endpoint documentation
---

## Features

### Core Features
✓ User authentication and role-based access control  
✓ Recipe creation, retrieval, and management  
✓ Ingredient management and user-driven ingredient creation 
✓ Personal pantry tracking with expiry date monitoring  
✓ Shopping list generation and management  
✓ Meal planning by date and meal type  
✓ Recipe reviews and ratings  
✓ Favorite recipes tracking  
✓ City-based store recommendations and ingredient pricing
✓ Mock AI-based meal suggestions
✓ Recipe generation from available ingredients  

### Technical Features
✓ Structured error handling  
✓ Request validation  
✓ Request logging with password masking  
✓ Consistent API response format  
✓ Role-based authorization middleware  

---

## Error Handling

The API returns appropriate HTTP status codes and error codes:

| HTTP Status | Error Code | Description |
|-------------|-----------|-------------|
| 200 | SUCCESS | Request successful |
| 201 | CREATED | Resource created |
| 400 | VALIDATION_ERROR, INVALID_CREDENTIALS | Bad request or validation failed |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Permission denied |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 500 | SERVER_ERROR | Unexpected server error |
