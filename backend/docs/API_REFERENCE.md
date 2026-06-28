# API Reference

**Base URL:** `http://localhost:3000`  
**API prefix:** `/api`  
**Total endpoints:** 98

All responses use the format: `{ "success": bool, "data": any|null, "error": object|null }`.  
All protected endpoints require `x-user-id` and `x-user-role` headers unless stated otherwise.

---

# Authentication

| Method | Path | Access | Headers | Query Params | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|---|
| POST | `/api/auth/login` | public | `Content-Type: application/json` | None | `{"email":"lior@project.com","password":"password_1"}` | `{"success":true,"data":{"userId":1,"firstName":"Lior","lastName":"Rubinshtein","username":"lior_rubinshtein","avatarKey":"chef_masculine","userRole":"chef","token":"mock-token-1"},"error":null}` | `{"success":false,"data":null,"error":{"code":"INVALID_CREDENTIALS","message":"Invalid email or password","details":{}}}` | 200, 400, 401 |
| POST | `/api/auth/register` | public | `Content-Type: application/json` | None | `{"firstName":"Dana","lastName":"Levi","email":"dana@gmail.com","password":"123456","username":"dana_levi","city":"Tel Aviv","cookingLevel":"beginner","age":24}` | `{"success":true,"data":{"userId":41,"firstName":"Dana","lastName":"Levi","email":"dana@gmail.com","username":"dana_levi","userRole":"user","city":"Tel Aviv","preferences":{"dietary":[],"cuisine":[]},"cookingLevel":"beginner","age":24,"avatarKey":"masculine","createdAt":"2026-06-22T10:00:00.000Z","updatedAt":"2026-06-22T10:00:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"EMAIL_ALREADY_EXISTS","message":"Email already exists","details":{}}}` | 201, 400, 409 |
| GET | `/api/auth/me` | protected | `x-user-id: 1` | None | None | `{"success":true,"data":{"userId":1,"firstName":"Lior","lastName":"Rubinshtein","email":"lior@project.com","username":"lior_rubinshtein","avatarKey":"chef_masculine","userRole":"chef","city":"Gan Yavne","preferences":{"dietary":["vegan"],"cuisine":["italian"]},"cookingLevel":"advanced","age":26,"createdAt":"2026-05-03T10:00:00.000Z","updatedAt":"2026-05-03T10:00:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"UNAUTHORIZED","message":"Authentication required","details":{}}}` | 200, 401, 404 |
| POST | `/api/auth/logout` | public | None | None | None | `{"success":true,"data":{"message":"Logged out successfully"},"error":null}` | — | 200 |

**Register notes:**
- `userRole` is always set to `"user"` server-side; the field is ignored if sent.
- `username` is required, must be 3–30 chars, alphanumeric + underscores only; normalized to lowercase.
- `avatarKey` is optional; defaults to `"masculine"` if omitted.
- `city` is optional but required for city-based features (nearby stores, store recommendations).

---

# Users

| Method | Path | Access | Headers | Query Params | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/users` | admin only | `x-user-id`, `x-user-role: admin` | `userRole`, `cookingLevel` | None | `{"success":true,"data":[{"userId":1,"firstName":"Lior","lastName":"Rubinshtein","email":"lior@project.com","username":"lior_rubinshtein","userRole":"chef","city":"Gan Yavne","cookingLevel":"advanced","age":26,"preferences":{"dietary":["vegan"],"cuisine":["italian"]}}],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| GET | `/api/users/search` | public | None | `q` (search term), `role`, `city` | None | `{"success":true,"data":[{"userId":1,"firstName":"Lior","lastName":"Rubinshtein","username":"lior_rubinshtein","userRole":"chef","city":"Gan Yavne","cookingLevel":"advanced"}],"error":null}` | — | 200 |
| POST | `/api/users` | admin only | `x-user-id`, `x-user-role: admin`, `Content-Type: application/json` | None | `{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","password":"secure123","userRole":"user","city":"Tel Aviv","preferences":{"dietary":["vegan"],"cuisine":["italian"]},"cookingLevel":"beginner","age":24,"username":"jane_doe"}` | `{"success":true,"data":{"userId":41,"firstName":"Jane","lastName":"Doe","email":"jane@example.com","userRole":"user","city":"Tel Aviv","cookingLevel":"beginner","age":24},"error":null}` | `{"success":false,"data":null,"error":{"code":"EMAIL_ALREADY_EXISTS","message":"Email already exists","details":{}}}` | 201, 400, 403, 409 |
| GET | `/api/users/:id` | self or admin | `x-user-id`, `x-user-role` | None | None | `{"success":true,"data":{"userId":1,"firstName":"Lior","lastName":"Rubinshtein","email":"lior@project.com","username":"lior_rubinshtein","avatarKey":"chef_masculine","userRole":"chef","city":"Gan Yavne","cookingLevel":"advanced","age":26,"preferences":{"dietary":["vegan"],"cuisine":["italian"]}},"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403, 404 |
| PUT | `/api/users/:id` | self or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"firstName":"Lior","email":"lior.new@example.com","cookingLevel":"advanced"}` | `{"success":true,"data":{"userId":1,"firstName":"Lior","email":"lior.new@example.com","userRole":"chef","cookingLevel":"advanced"},"error":null}` | `{"success":false,"data":null,"error":{"code":"EMAIL_ALREADY_EXISTS","message":"Email already exists","details":{}}}` | 200, 400, 403, 404, 409 |
| PUT | `/api/users/:id/change-password` | self only | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"currentPassword":"password_1","newPassword":"newPassword123"}` | `{"success":true,"data":{"message":"Password updated successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"INVALID_PASSWORD","message":"Current password is incorrect","details":{}}}` | 200, 400, 403, 404 |
| DELETE | `/api/users/:id` | admin only | `x-user-id`, `x-user-role: admin` | None | None | `{"success":true,"data":{"message":"User deleted successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"USER_NOT_FOUND","message":"User not found","details":{}}}` | 200, 403, 404 |
| GET | `/api/users/:id/profile` | public | None | None | None | `{"success":true,"data":{"userId":1,"firstName":"Lior","lastName":"Rubinshtein","username":"lior_rubinshtein","avatarKey":"chef_masculine","userRole":"chef","city":"Gan Yavne","cookingLevel":"advanced","followerCount":5,"followingCount":3,"isFollowedByMe":false},"error":null}` | `{"success":false,"data":null,"error":{"code":"USER_NOT_FOUND","message":"User not found","details":{}}}` | 200, 404 |

**Notes:**
- `GET /api/users` excludes passwords from response.
- Deleting the last admin user is blocked with a 403 error.
- `GET /api/users/:id/profile` is public; `isFollowedByMe` is `false` if no `x-user-id` header is sent.

---

# Settings

| Method | Path | Access | Headers | Query Params | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/settings` | protected | `x-user-id` | None | None | `{"success":true,"data":{"userId":1,"firstName":"Lior","lastName":"Rubinshtein","email":"lior@project.com","username":"lior_rubinshtein","avatarKey":"chef_masculine","userRole":"chef","city":"Gan Yavne","preferences":{"dietary":["vegan"],"cuisine":["italian"]},"cookingLevel":"advanced","age":26},"error":null}` | `{"success":false,"data":null,"error":{"code":"UNAUTHORIZED","message":"Authentication required","details":{}}}` | 200, 401, 404 |
| PUT | `/api/settings` | protected | `x-user-id`, `Content-Type: application/json` | None | `{"firstName":"Lior","city":"Tel Aviv","preferences":{"dietary":["vegan"],"cuisine":["italian","asian"]},"avatarKey":"chef_masculine","username":"lior_rubinshtein"}` | `{"success":true,"data":{"userId":1,"firstName":"Lior","city":"Tel Aviv","preferences":{"dietary":["vegan"],"cuisine":["italian","asian"]}},"error":null}` | `{"success":false,"data":null,"error":{"code":"EMAIL_ALREADY_EXISTS","message":"Email already exists","details":{}}}` | 200, 400, 401, 404, 409 |

**Updatable fields:** `firstName`, `lastName`, `email`, `city`, `cookingLevel`, `age`, `preferences`, `username`, `avatarKey`.  
Fields not in this list are silently ignored even if sent.  
`userRole` and `password` cannot be changed via this endpoint.

---

# Favorites

| Method | Path | Access | Headers | Query Params | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/users/:id/favorites` | self or admin | `x-user-id`, `x-user-role` | None | None | `{"success":true,"data":[{"favoriteId":1,"userId":1,"recipeId":102,"createdAt":"2026-05-11T10:00:00.000Z","updatedAt":"2026-05-11T10:00:00.000Z"}],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| POST | `/api/users/:id/favorites` | self or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"recipeId":101}` | `{"success":true,"data":{"favoriteId":2,"userId":1,"recipeId":101,"createdAt":"2026-05-15T10:30:00.000Z","updatedAt":"2026-05-15T10:30:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"FAVORITE_ALREADY_EXISTS","message":"Recipe already in favorites","details":{}}}` | 201, 400, 403, 404, 409 |
| DELETE | `/api/users/:id/favorites/:recipeId` | self or admin | `x-user-id`, `x-user-role` | None | None | `{"success":true,"data":{"message":"Favorite removed successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"FAVORITE_NOT_FOUND","message":"Favorite not found","details":{}}}` | 200, 403, 404 |

**Note:** Only approved recipes can be added to favorites.

---

# Pantry

| Method | Path | Access | Headers | Query Params | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/users/:id/pantry` | self or admin | `x-user-id`, `x-user-role` | `expired` (true/false), `ingredientId` | None | `{"success":true,"data":[{"pantryItemId":1,"userId":1,"ingredientId":1,"quantity":500,"unit":"gram","expiryDate":"2026-12-31T23:59:59.000Z","location":"pantry","isExpired":false}],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| POST | `/api/users/:id/pantry` | self or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"ingredientId":1,"quantity":500,"unit":"gram","expiryDate":"2026-12-31T23:59:59.000Z","location":"pantry"}` | `{"success":true,"data":{"pantryItemId":2,"userId":1,"ingredientId":1,"quantity":500,"unit":"gram","expiryDate":"2026-12-31T23:59:59.000Z","location":"pantry","isExpired":false},"error":null}` | `{"success":false,"data":null,"error":{"code":"INGREDIENT_NOT_FOUND","message":"Ingredient not found","details":{}}}` | 201, 400, 403, 404 |
| PUT | `/api/users/:id/pantry/:pantryItemId` | self or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"quantity":250,"location":"fridge"}` | `{"success":true,"data":{"pantryItemId":1,"userId":1,"ingredientId":1,"quantity":250,"unit":"gram","expiryDate":"2026-12-31T23:59:59.000Z","location":"fridge","isExpired":false},"error":null}` | `{"success":false,"data":null,"error":{"code":"PANTRY_ITEM_NOT_FOUND","message":"Pantry item not found","details":{}}}` | 200, 400, 403, 404 |
| DELETE | `/api/users/:id/pantry/:pantryItemId` | self or admin | `x-user-id`, `x-user-role` | None | None | `{"success":true,"data":{"message":"Pantry item deleted successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"PANTRY_ITEM_NOT_FOUND","message":"Pantry item not found","details":{}}}` | 200, 403, 404 |

**Valid `location` values:** `fridge`, `freezer`, `pantry`, `other`

---

# Shopping List

| Method | Path | Access | Headers | Query Params | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/users/:id/shopping-list` | self or admin | `x-user-id`, `x-user-role` | `completed` (true/false) | None | `{"success":true,"data":[{"shoppingItemId":1,"userId":1,"ingredientId":4,"quantity":2,"unit":"piece","completed":false,"source":null,"createDate":"2026-05-11T10:00:00.000Z","updateDate":"2026-05-11T10:00:00.000Z"}],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| POST | `/api/users/:id/shopping-list` | self or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"ingredientId":4,"quantity":2,"unit":"piece"}` | `{"success":true,"data":{"shoppingItemId":2,"userId":1,"ingredientId":4,"quantity":2,"unit":"piece","completed":false,"source":null,"createDate":"2026-05-15T10:30:00.000Z","updateDate":"2026-05-15T10:30:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"INGREDIENT_NOT_FOUND","message":"Ingredient not found","details":{}}}` | 201, 400, 403, 404 |
| POST | `/api/users/:id/shopping-list/generate` | self or admin | `x-user-id`, `x-user-role` | None | None | `{"success":true,"data":[{"shoppingItemId":3,"userId":1,"ingredientId":1,"quantity":500,"unit":"gram","completed":false,"source":"expired-pantry","createDate":"2026-05-15T10:35:00.000Z","updateDate":"2026-05-15T10:35:00.000Z"}],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| GET | `/api/users/:id/shopping-list/recommendations` | self or admin | `x-user-id`, `x-user-role` | None | None | `{"success":true,"data":[{"ingredientId":4,"stores":[{"ingredientStoreId":3,"ingredientId":4,"storeId":1,"price":8.00,"unit":"kg","store":{"name":"Super-Deal","city":"Gan Yavne","address":"Herzl St 1","rating":"4.50"},"updatedAt":"2026-05-11T10:00:00.000Z"}]}],"error":null}` | `{"success":false,"data":null,"error":{"code":"NO_CITY","message":"User has no city configured","details":{}}}` | 200, 400, 403 |
| PUT | `/api/users/:id/shopping-list/:itemId` | self or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"quantity":3,"completed":true}` | `{"success":true,"data":{"shoppingItemId":1,"userId":1,"ingredientId":4,"quantity":3,"unit":"piece","completed":true,"createDate":"2026-05-11T10:00:00.000Z","updateDate":"2026-05-15T10:35:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"SHOPPING_ITEM_NOT_FOUND","message":"Shopping item not found","details":{}}}` | 200, 403, 404 |
| DELETE | `/api/users/:id/shopping-list/:itemId` | self or admin | `x-user-id`, `x-user-role` | None | None | `{"success":true,"data":{"message":"Shopping item deleted successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"SHOPPING_ITEM_NOT_FOUND","message":"Shopping item not found","details":{}}}` | 200, 403, 404 |

**Recommendations notes:**
- Returns `NO_CITY` (400) if the user has no city set.
- Each store entry in `stores[]` includes the full `store` object (name, city, address, rating) from the database JOIN.
- Results are filtered to stores in the user's city only and sorted by price ascending.

---

# Meal Plan

Meal plan items support two types controlled by `itemType`:
- `"recipe"` — `itemId` references a recipe; recipe existence is validated.
- `"ingredient"` — `itemId` references a pantry ingredient; no recipe lookup is performed.

When `itemType` is omitted it defaults to `"recipe"`.

| Method | Path | Access | Headers | Query Params | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/users/:id/meal-plan` | self or admin | `x-user-id`, `x-user-role` | `date`, `mealType`, `itemType` | None | `{"success":true,"data":[{"mealId":1,"userId":1,"date":"2026-05-05","mealType":"breakfast","itemType":"recipe","itemId":101,"calories":400,"notes":"Light breakfast","createdAt":"2026-05-04T08:00:00.000Z","updatedAt":"2026-05-04T08:00:00.000Z"}],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| GET | `/api/users/:id/meal-plan/:mealId` | self or admin | `x-user-id`, `x-user-role` | None | None | `{"success":true,"data":{"mealId":1,"userId":1,"date":"2026-05-05","mealType":"breakfast","itemType":"recipe","itemId":101,"calories":400,"notes":"Light breakfast"},"error":null}` | `{"success":false,"data":null,"error":{"code":"MEAL_NOT_FOUND","message":"Meal plan item not found","details":{}}}` | 200, 403, 404 |
| POST | `/api/users/:id/meal-plan` | self or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"date":"2026-05-20","mealType":"lunch","itemType":"recipe","itemId":101}` | `{"success":true,"data":{"mealId":3,"userId":1,"date":"2026-05-20","mealType":"lunch","itemType":"recipe","itemId":101},"error":null}` | `{"success":false,"data":null,"error":{"code":"INVALID_MEAL_TYPE","message":"Invalid meal type","details":{"field":"mealType"}}}` | 201, 400, 403, 404 |
| PUT | `/api/users/:id/meal-plan/:mealId` | self or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"mealType":"dinner","itemId":102}` | `{"success":true,"data":{"mealId":1,"userId":1,"date":"2026-05-05","mealType":"dinner","itemType":"recipe","itemId":102,"calories":400,"notes":"Light breakfast"},"error":null}` | `{"success":false,"data":null,"error":{"code":"MEAL_NOT_FOUND","message":"Meal plan item not found","details":{}}}` | 200, 400, 403, 404 |
| DELETE | `/api/users/:id/meal-plan/:mealId` | self or admin | `x-user-id`, `x-user-role` | None | None | `{"success":true,"data":{"message":"Meal plan item deleted successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"MEAL_NOT_FOUND","message":"Meal plan item not found","details":{}}}` | 200, 403, 404 |

**Valid `mealType` values:** `breakfast`, `lunch`, `dinner`, `snack`

---

# Recipes

Recipe objects include an `ingredients` array with full ingredient details. Recipe responses also include `approvalStatus`, `imageUrl`, `imagePositionX`, `imagePositionY`, `reviewedByUserId`, `reviewedAt`, and `rejectionReason`.

`GET /api/recipes` returns only **approved** recipes. Non-approved recipes are accessible only to their creator or an admin.

| Method | Path | Access | Headers | Query Params | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/recipes` | public | None | `category`, `cuisine`, `difficulty`, `creatorId` | None | `{"success":true,"data":[{"recipeId":101,"title":"Simple Pasta","instructions":"...","difficulty":"easy","cuisine":"italian","category":"dinner","creatorId":1,"prepTime":30,"cookTime":20,"totalTime":50,"servings":2,"calories":400,"tags":["quick","easy"],"allergens":["gluten"],"approvalStatus":"approved","imageUrl":"/uploads/recipes/pasta.jpg","imagePositionX":50,"imagePositionY":50,"ingredients":[{"recipeIngredientId":1,"ingredientId":1,"name":"Flour","category":"pantry","isAllergen":true,"quantity":200,"unit":"gram"}]}],"error":null}` | — | 200 |
| GET | `/api/recipes/my-recipes` | influencer only | `x-user-id`, `x-user-role: influencer` | None | None | `{"success":true,"data":[{"recipeId":201,"title":"My Pending Recipe","approvalStatus":"pending","creatorId":6,"ingredients":[...]}],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| GET | `/api/recipes/pending/count` | admin only | `x-user-id`, `x-user-role: admin` | None | None | `{"success":true,"data":{"count":3},"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| GET | `/api/recipes/pending` | admin only | `x-user-id`, `x-user-role: admin` | None | None | `{"success":true,"data":[{"recipeId":201,"title":"My Pending Recipe","approvalStatus":"pending","creatorId":6,"ingredients":[...]}],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| GET | `/api/recipes/:id` | public (approved) / self or admin (non-approved) | `x-user-id`, `x-user-role` (optional for approved) | None | None | `{"success":true,"data":{"recipeId":101,"title":"Simple Pasta","approvalStatus":"approved","imageUrl":"/uploads/recipes/pasta.jpg","imagePositionX":50,"imagePositionY":50,"ingredients":[...]},"error":null}` | `{"success":false,"data":null,"error":{"code":"RECIPE_NOT_FOUND","message":"Recipe not found","details":{}}}` | 200, 404 |
| POST | `/api/recipes` | chef, influencer, admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"title":"New Recipe","instructions":"Cook this and that","difficulty":"easy","cuisine":"italian","category":"dinner","creatorId":1,"prepTime":15,"cookTime":25,"totalTime":40,"servings":2,"calories":350,"tags":["quick"],"ingredients":[{"ingredientId":1,"quantity":200,"unit":"gram"},{"ingredientId":3,"quantity":100,"unit":"ml"}]}` | `{"success":true,"data":{"recipeId":110,"title":"New Recipe","approvalStatus":"approved","ingredients":[...]},"error":null}` | `{"success":false,"data":null,"error":{"code":"USER_NOT_FOUND","message":"Creator user not found","details":{}}}` | 201, 400, 403, 404 |
| PUT | `/api/recipes/:id` | chef, influencer (own only), admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"title":"Updated Pasta","difficulty":"medium","ingredients":[{"ingredientId":1,"quantity":300,"unit":"gram"}]}` | `{"success":true,"data":{"recipeId":101,"title":"Updated Pasta","difficulty":"medium","approvalStatus":"approved","ingredients":[...]},"error":null}` | `{"success":false,"data":null,"error":{"code":"RECIPE_NOT_FOUND","message":"Recipe not found","details":{}}}` | 200, 400, 403, 404 |
| DELETE | `/api/recipes/:id` | chef, influencer (own only), admin | `x-user-id`, `x-user-role` | None | None | `{"success":true,"data":{"message":"Recipe deleted successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"RECIPE_NOT_FOUND","message":"Recipe not found","details":{}}}` | 200, 403, 404 |

**Recipe notes:**
- `ingredients` array is required on create (minimum 1 ingredient).
- `ingredients` array on update replaces the entire ingredient list atomically (transaction). Omitting `ingredients` leaves the existing list unchanged.
- `approvalStatus` is always set server-side: `influencer` → `pending`; `chef`/`admin` → `approved`. It is never accepted from the client.
- Influencer edits reset `approvalStatus` to `pending` automatically.
- `imageUrl` can be `/uploads/recipes/<filename>` (uploaded) or any external URL (set via PUT).
- `imagePositionX` and `imagePositionY` are integers 0–100 representing CSS `object-position` percentages (default: 50).

---

# Recipe Images

| Method | Path | Access | Headers | Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|
| POST | `/api/recipes/:id/image` | chef (own recipe), admin | `x-user-id`, `x-user-role`, `Content-Type: multipart/form-data` | `form-data` field `image` (JPEG/PNG/GIF/WebP, max 5 MB) | `{"success":true,"data":{"recipeId":101,"imageUrl":"/uploads/recipes/1719123456789-pasta.jpg","imagePositionX":50,"imagePositionY":50,...},"error":null}` | `{"success":false,"data":null,"error":{"code":"NO_FILE","message":"No image file was provided","details":{}}}` | 200, 400, 403, 404 |
| DELETE | `/api/recipes/:id/image` | chef (own recipe), admin | `x-user-id`, `x-user-role` | None | `{"success":true,"data":{"recipeId":101,"imageUrl":null,"imagePositionX":50,"imagePositionY":50,...},"error":null}` | `{"success":false,"data":null,"error":{"code":"RECIPE_NOT_FOUND","message":"Recipe not found","details":{}}}` | 200, 403, 404 |

**Notes:**
- Upload replaces any previously uploaded local file (the old file is deleted from disk automatically).
- If the previous `imageUrl` was an external URL (does not start with `/uploads/`), no file deletion occurs.
- After deletion, `imageUrl` is set to `null` in the database. The UI should fall back to a placeholder.
- `imagePositionX` and `imagePositionY` are updated separately via `PUT /api/recipes/:id`.

---

# Recipe Approval

| Method | Path | Access | Headers | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|
| POST | `/api/recipes/:id/approve` | admin only | `x-user-id`, `x-user-role: admin` | None | `{"success":true,"data":{"recipeId":201,"approvalStatus":"approved","reviewedByUserId":2,"reviewedAt":"2026-06-22T10:00:00.000Z","rejectionReason":null,...},"error":null}` | `{"success":false,"data":null,"error":{"code":"RECIPE_NOT_FOUND","message":"Recipe not found","details":{}}}` | 200, 403, 404 |
| POST | `/api/recipes/:id/reject` | admin only | `x-user-id`, `x-user-role: admin`, `Content-Type: application/json` | `{"reason":"The recipe is missing important steps."}` | `{"success":true,"data":{"recipeId":201,"approvalStatus":"rejected","reviewedByUserId":2,"reviewedAt":"2026-06-22T10:00:00.000Z","rejectionReason":"The recipe is missing important steps.",...},"error":null}` | `{"success":false,"data":null,"error":{"code":"VALIDATION_ERROR","message":"Rejection reason is required","details":{}}}` | 200, 400, 403, 404 |

**Notes:**
- `reason` is required for rejection.
- A `recipe_approved` / `recipe_rejected` notification is sent to the recipe creator via Socket.IO only on the first approval/rejection (not on re-approval of an already-approved recipe).

---

# Recipe Reviews

| Method | Path | Access | Headers | Query Params | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/recipes/:id/reviews` | public | None (optional `x-user-id` for `isHelpfulByMe` flag) | None | None | `{"success":true,"data":[{"reviewId":1,"userId":2,"recipeId":101,"rating":5,"title":"Amazing!","comment":"Amazing recipe!","isInfluencer":true,"helpfulVotes":12,"isHelpfulByMe":false,"createdAt":"2026-05-05T10:00:00.000Z","updatedAt":"2026-05-05T10:00:00.000Z"}],"error":null}` | `{"success":false,"data":null,"error":{"code":"RECIPE_NOT_FOUND","message":"Recipe not found","details":{}}}` | 200, 404 |
| POST | `/api/recipes/:id/reviews` | any authenticated user | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"rating":5,"title":"Amazing!","comment":"Amazing recipe!"}` | `{"success":true,"data":{"reviewId":2,"userId":1,"recipeId":101,"rating":5,"title":"Amazing!","comment":"Amazing recipe!","isInfluencer":false,"helpfulVotes":0,"createdAt":"2026-05-15T10:30:00.000Z","updatedAt":"2026-05-15T10:30:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"DUPLICATE_REVIEW","message":"You have already reviewed this recipe","details":{}}}` | 201, 400, 403, 404, 409 |
| PUT | `/api/recipes/:id/reviews/:reviewId` | review owner only | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"rating":4,"title":"Still good","comment":"Really enjoyed it"}` | `{"success":true,"data":{"reviewId":1,"userId":2,"recipeId":101,"rating":4,"title":"Still good","comment":"Really enjoyed it","isInfluencer":true,"helpfulVotes":12},"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You can only edit your own review","details":{}}}` | 200, 400, 403, 404 |
| DELETE | `/api/recipes/:id/reviews/:reviewId` | review owner only | `x-user-id`, `x-user-role` | None | None | `{"success":true,"data":{"message":"Review deleted successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You can only delete your own review","details":{}}}` | 200, 403, 404 |

**Notes:**
- One review per user per recipe is enforced.
- `isInfluencer` is set server-side based on the authenticated user's role.
- `isHelpfulByMe` is returned if `x-user-id` header is present.
- Only `rating`, `title`, and `comment` can be updated.

---

# Review Actions

| Method | Path | Access | Headers | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|
| POST | `/api/recipes/:id/reviews/:reviewId/helpful` | any authenticated user | `x-user-id`, `x-user-role` | None | `{"success":true,"data":{"voted":true,"helpfulVotes":13},"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You cannot mark your own review as helpful","details":{}}}` | 200, 403, 404 |
| POST | `/api/recipes/:id/reviews/:reviewId/report` | any authenticated user | `x-user-id`, `x-user-role`, `Content-Type: application/json` | `{"reason":"spam","details":"This review is promotional content."}` | `{"success":true,"data":{"reportId":3,"reviewId":1,"reporterUserId":4,"reason":"spam","details":"This review is promotional content.","status":"open","reviewedByUserId":null,"reviewedAt":null},"error":null}` | `{"success":false,"data":null,"error":{"code":"DUPLICATE_REPORT","message":"You have already reported this review","details":{}}}` | 201, 400, 403, 404, 409 |

**Helpful vote notes:**
- Toggles: calling again removes the vote. Response includes `voted` (bool) and updated `helpfulVotes` count.
- Users cannot vote on their own reviews.

**Report notes:**
- Valid `reason` values: `spam`, `inappropriate`, `harassment`, `misinformation`, `off-topic`, `other`.
- `details` is optional unless `reason` is `"other"` (then required).
- A user cannot report their own review.
- Duplicate open reports by the same user for the same review are blocked.

---

# Recipe Comments (REST)

Comments are primarily created and managed via Socket.IO events (`sendRecipeComment`, `editRecipeComment`, `deleteRecipeComment`). The REST endpoints below support reading comments and performing edits/deletes outside of a Socket.IO session.

| Method | Path | Access | Headers | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|
| GET | `/api/recipes/:id/comments` | public | None (optional `x-user-id` for `isLikedByMe`) | None | `{"success":true,"data":[{"commentId":1,"recipeId":101,"userId":4,"content":"Looks delicious!","parentCommentId":null,"mentionedUserId":null,"tags":null,"likeCount":2,"isLikedByMe":false,"createdAt":"2026-05-11T10:00:00.000Z","updatedAt":"2026-05-11T10:00:00.000Z"}],"error":null}` | — | 200 |
| PUT | `/api/recipes/:id/comments/:commentId` | comment owner or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | `{"content":"Updated comment text."}` | `{"success":true,"data":{"commentId":1,"recipeId":101,"userId":4,"content":"Updated comment text.","updatedAt":"2026-06-22T10:00:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to edit this comment","details":{}}}` | 200, 403, 404 |
| DELETE | `/api/recipes/:id/comments/:commentId` | comment owner or admin | `x-user-id`, `x-user-role` | None | `{"success":true,"data":{"message":"Comment deleted successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to delete this comment","details":{}}}` | 200, 403, 404 |

**Notes:**
- Comments are returned ordered oldest-first.
- Each comment includes `likeCount` and `isLikedByMe` (requires `x-user-id`).
- `parentCommentId` links a reply to its parent comment.
- `mentionedUserId` stores the user ID of a mentioned user (tagged with `@`).

---

# Recipe Likes

| Method | Path | Access | Headers | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|
| GET | `/api/users/:id/likes` | self or admin | `x-user-id`, `x-user-role` | None | `{"success":true,"data":[101,103,107],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| POST | `/api/recipes/:id/like` | any authenticated user | `x-user-id`, `x-user-role` | None | `{"success":true,"data":{"recipeLikeId":5,"userId":1,"recipeId":101,"createdAt":"2026-06-22T10:00:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"RECIPE_NOT_FOUND","message":"Recipe not found","details":{}}}` | 201, 403, 404, 409 |
| DELETE | `/api/recipes/:id/like` | any authenticated user | `x-user-id`, `x-user-role` | None | `{"success":true,"data":{"message":"Like removed successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"LIKE_NOT_FOUND","message":"Like not found","details":{}}}` | 200, 403, 404 |

**Notes:**
- Only approved recipes can be liked.
- `GET /api/users/:id/likes` returns an array of liked recipe IDs (integers), not full recipe objects.
- Liking an already-liked recipe returns 409.

---

# Ingredients

| Method | Path | Access | Headers | Query Params | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/ingredients` | public | None | `category`, `isAllergen` (true/false), `search` | None | `{"success":true,"data":[{"ingredientId":1,"name":"Flour","category":"pantry","isAllergen":true,"createdAt":"2026-05-03T10:00:00.000Z","updatedAt":"2026-05-03T10:00:00.000Z"}],"error":null}` | — | 200 |
| GET | `/api/ingredients/:id` | public | None | None | None | `{"success":true,"data":{"ingredientId":1,"name":"Flour","category":"pantry","isAllergen":true},"error":null}` | `{"success":false,"data":null,"error":{"code":"INGREDIENT_NOT_FOUND","message":"Ingredient not found","details":{}}}` | 200, 404 |
| POST | `/api/ingredients` | any authenticated user | `x-user-id`, `x-user-role`, `Content-Type: application/json` | None | `{"name":"Onion","category":"produce","isAllergen":false}` | `{"success":true,"data":{"ingredientId":35,"name":"Onion","category":"produce","isAllergen":false},"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 201, 400, 403 |
| PUT | `/api/ingredients/:id` | admin only | `x-user-id`, `x-user-role: admin`, `Content-Type: application/json` | None | `{"category":"grocery","isAllergen":false}` | `{"success":true,"data":{"ingredientId":1,"name":"Flour","category":"grocery","isAllergen":false},"error":null}` | `{"success":false,"data":null,"error":{"code":"INGREDIENT_NOT_FOUND","message":"Ingredient not found","details":{}}}` | 200, 400, 403, 404 |
| DELETE | `/api/ingredients/:id` | admin only | `x-user-id`, `x-user-role: admin` | None | None | `{"success":true,"data":{"message":"Ingredient deleted successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"INGREDIENT_NOT_FOUND","message":"Ingredient not found","details":{}}}` | 200, 403, 404 |
| GET | `/api/ingredients/:id/stores` | public | None | None | None | `{"success":true,"data":[{"ingredientStoreId":1,"ingredientId":1,"storeId":2,"price":10.50,"unit":"kg","store":{"name":"FreshMart","city":"Tel Aviv","address":"Ben Yehuda St 5","rating":"4.20"},"updatedAt":"2026-05-11T10:00:00.000Z"}],"error":null}` | `{"success":false,"data":null,"error":{"code":"INGREDIENT_NOT_FOUND","message":"Ingredient not found","details":{}}}` | 200, 404 |

---

# Stores

| Method | Path | Access | Headers | Query Params | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|
| GET | `/api/stores` | public | None | `minRating` | `{"success":true,"data":[{"storeId":1,"name":"Super-Deal","city":"Gan Yavne","address":"Herzl St 1","phone":"08-8500000","rating":"4.50","createdAt":"2026-05-03T10:00:00.000Z","updatedAt":"2026-05-03T10:00:00.000Z"}],"error":null}` | — | 200 |
| GET | `/api/stores/nearby` | protected | `x-user-id` | None | `{"success":true,"data":[{"storeId":1,"name":"Super-Deal","city":"Gan Yavne","address":"Herzl St 1","phone":"08-8500000","rating":"4.50"}],"error":null}` | `{"success":false,"data":null,"error":{"code":"NO_CITY","message":"User has no city set","details":{}}}` | 200, 400, 401, 404 |
| GET | `/api/stores/:id` | public | None | None | `{"success":true,"data":{"storeId":1,"name":"Super-Deal","city":"Gan Yavne","address":"Herzl St 1","phone":"08-8500000","rating":"4.50"},"error":null}` | `{"success":false,"data":null,"error":{"code":"STORE_NOT_FOUND","message":"Store not found","details":{}}}` | 200, 404 |

**`/api/stores/nearby` notes:**
- Reads the authenticated user's `city` from the database.
- Returns stores in the same city only.
- Returns `NO_CITY` (400) if the user has no city configured.

---

# AI

All AI endpoints call Google Gemini with structured prompts and save the request + response to `AiHistory`.

| Method | Path | Access | Headers | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|
| POST | `/api/users/:id/ai/generate-recipe` | self or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | `{"inputData":{"ingredients":["egg","cheese","tomato"],"constraints":"vegetarian, under 30 minutes"}}` | `{"success":true,"data":{"generatedRecipe":{"title":"Cheese Omelette","ingredients":["egg","cheese","tomato"],"instructions":["Beat eggs","Add cheese","Cook 10 min","Add tomato"]},"historyId":4},"error":null}` | `{"success":false,"data":null,"error":{"code":"VALIDATION_ERROR","message":"Missing required fields","details":{"missingFields":["inputData"]}}}` | 200, 400, 403 |
| POST | `/api/users/:id/ai/suggestions` | self or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | `{"inputData":{"preferences":["vegetarian","quick meals"]}}` | `{"success":true,"data":{"suggestions":[{"title":"Suggested Pasta","basedOn":[{"pantryItemId":1,"ingredientId":1}]}],"historyId":5},"error":null}` | `{"success":false,"data":null,"error":{"code":"USER_NOT_FOUND","message":"User not found","details":{}}}` | 200, 403, 404 |
| POST | `/api/users/:id/ai/substitute` | self or admin | `x-user-id`, `x-user-role`, `Content-Type: application/json` | `{"inputData":{"ingredient":"butter","context":"baking a cake","dietary":"vegan"}}` | `{"success":true,"data":{"substitutes":[{"ingredient":"coconut oil","ratio":"1:1","notes":"Works well in baking"},{"ingredient":"applesauce","ratio":"1:0.75","notes":"Adds moisture"}],"historyId":6},"error":null}` | `{"success":false,"data":null,"error":{"code":"VALIDATION_ERROR","message":"Missing required fields","details":{}}}` | 200, 400, 403 |
| GET | `/api/users/:id/ai/history` | self or admin | `x-user-id`, `x-user-role` | None | `{"success":true,"data":[{"historyId":1,"userId":1,"requestType":"recipe_generation","inputData":{"ingredients":["egg","cheese","tomato"]},"outputData":{"recipeTitle":"Quick Cheese Omelette"},"createdAt":"2026-05-11T10:30:00.000Z"}],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| GET | `/api/users/:id/ai/history/:historyId` | self or admin | `x-user-id`, `x-user-role` | None | `{"success":true,"data":{"historyId":1,"userId":1,"requestType":"recipe_generation","inputData":{"ingredients":["egg","cheese","tomato"]},"outputData":{"recipeTitle":"Quick Cheese Omelette","description":"A simple omelette.","estimatedPrepTime":10},"createdAt":"2026-05-11T10:30:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"HISTORY_NOT_FOUND","message":"AI history item not found","details":{}}}` | 200, 403, 404 |
| DELETE | `/api/users/:id/ai/history/:historyId` | self or admin | `x-user-id`, `x-user-role` | None | `{"success":true,"data":{"message":"AI history deleted successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"HISTORY_NOT_FOUND","message":"AI history item not found","details":{}}}` | 200, 403, 404 |

**Valid `requestType` values (stored in history):** `recipe_generation`, `suggestions`, `ingredient_substitute`

---

# Options

Returns all valid enum values for use in dropdowns.

| Method | Path | Access | Headers | Success Response Example | Status Codes |
|---|---|---|---|---|---|
| GET | `/api/options` | public | None | `{"success":true,"data":{"recipes":{"categories":["breakfast","lunch","dinner","snack","dessert"],"difficulties":["easy","medium","hard"],"cuisines":["italian","asian","mexican","american","israeli"]},"pantry":{"locations":["fridge","freezer","pantry","other"]},"users":{"cookingLevels":["beginner","intermediate","advanced"]},"mealPlan":{"mealTypes":["breakfast","lunch","dinner","snack"]},"ai":{"requestTypes":["recipe_generation","suggestions","image_analysis"]}},"error":null}` | 200 |

---

# Chef Requests

Regular users and influencers can request to become a chef. Admins review and approve or reject requests. Approving a request automatically elevates the user's role to `"chef"`.

A user cannot submit a new request while one with `"pending"` status exists. After a rejection the user may submit a new request.

| Method | Path | Access | Headers | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|
| POST | `/api/chef-requests` | any authenticated user | `x-user-id`, `x-user-role`, `Content-Type: application/json` | `{"reason":"I love cooking and want to share recipes with the community."}` | `{"success":true,"data":{"requestId":4,"userId":4,"status":"pending","reason":"I love cooking and want to share recipes with the community.","requestDate":"2026-06-22T10:00:00.000Z","reviewedDate":null,"reviewedBy":null},"error":null}` | `{"success":false,"data":null,"error":{"code":"REQUEST_ALREADY_EXISTS","message":"You already have a pending chef request.","details":{}}}` | 201, 400, 401, 409 |
| GET | `/api/chef-requests/my` | any authenticated user | `x-user-id`, `x-user-role` | None | `{"success":true,"data":{"requestId":1,"userId":4,"status":"pending","reason":"I love cooking.","requestDate":"2026-06-01T09:00:00.000Z","reviewedDate":null,"reviewedBy":null},"error":null}` | `{"success":false,"data":null,"error":{"code":"UNAUTHORIZED","message":"You must be logged in.","details":{}}}` | 200, 401 |
| GET | `/api/chef-requests` | admin only | `x-user-id`, `x-user-role: admin` | None | `{"success":true,"data":[{"requestId":1,"userId":4,"status":"pending","reason":"I love cooking.","requestDate":"2026-06-01T09:00:00.000Z","reviewedDate":null,"reviewedBy":null}],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| PUT | `/api/chef-requests/:requestId/approve` | admin only | `x-user-id`, `x-user-role: admin` | None | `{"success":true,"data":{"requestId":1,"userId":4,"status":"approved","reason":"I love cooking.","requestDate":"2026-06-01T09:00:00.000Z","reviewedDate":"2026-06-22T10:00:00.000Z","reviewedBy":2},"error":null}` | `{"success":false,"data":null,"error":{"code":"REQUEST_NOT_FOUND","message":"Chef request not found.","details":{}}}` | 200, 403, 404 |
| PUT | `/api/chef-requests/:requestId/reject` | admin only | `x-user-id`, `x-user-role: admin` | None | `{"success":true,"data":{"requestId":1,"userId":4,"status":"rejected","reason":"I love cooking.","requestDate":"2026-06-01T09:00:00.000Z","reviewedDate":"2026-06-22T10:00:00.000Z","reviewedBy":2},"error":null}` | `{"success":false,"data":null,"error":{"code":"REQUEST_NOT_FOUND","message":"Chef request not found.","details":{}}}` | 200, 403, 404 |

**Notes:**
- Approving a request runs inside a database transaction with a row-level lock to prevent race conditions.
- On approval/rejection, the requesting user receives a real-time notification via Socket.IO.

---

# User Follows

| Method | Path | Access | Headers | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|
| POST | `/api/users/:id/follow` | any authenticated user | `x-user-id`, `x-user-role` | `{"success":true,"data":{"followId":5,"followerId":4,"followeeId":1,"createdAt":"2026-06-22T10:00:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You cannot follow yourself","details":{}}}` | 201, 400, 403, 404, 409 |
| DELETE | `/api/users/:id/follow` | any authenticated user | `x-user-id`, `x-user-role` | `{"success":true,"data":{"message":"Unfollowed successfully"},"error":null}` | `{"success":false,"data":null,"error":{"code":"NOT_FOLLOWING","message":"You are not following this user","details":{}}}` | 200, 403, 404 |
| GET | `/api/users/:id/followers` | any authenticated user | `x-user-id`, `x-user-role` | `{"success":true,"data":[{"userId":4,"firstName":"Daniel","lastName":"Levi","username":"daniel_levi","avatarKey":"masculine","userRole":"user"}],"error":null}` | — | 200, 403 |
| GET | `/api/users/:id/following` | any authenticated user | `x-user-id`, `x-user-role` | `{"success":true,"data":[{"userId":1,"firstName":"Lior","lastName":"Rubinshtein","username":"lior_rubinshtein","avatarKey":"chef_masculine","userRole":"chef"}],"error":null}` | — | 200, 403 |

**Notes:**
- Self-follow is blocked (403).
- Duplicate follows are blocked (409).
- On follow, the followed user receives a `follow` notification via Socket.IO.
- Only chefs and influencers can be followed; following a regular user or admin is blocked.

---

# Feed

| Method | Path | Access | Headers | Success Response Example | Status Codes |
|---|---|---|---|---|---|
| GET | `/api/feed` | any authenticated user | `x-user-id`, `x-user-role` | `{"success":true,"data":[{"recipeId":101,"title":"Simple Pasta","approvalStatus":"approved","creatorId":1,"imageUrl":"/uploads/recipes/pasta.jpg","imagePositionX":50,"imagePositionY":50,"ingredients":[...]}],"error":null}` | 200, 401 |

**Note:** Returns approved recipes from creators the authenticated user follows, ordered newest first. Returns an empty array if the user follows no one.

---

# Feed Creators

| Method | Path | Access | Headers | Success Response Example | Status Codes |
|---|---|---|---|---|---|
| GET | `/api/feed/creators` | any authenticated user | `x-user-id`, `x-user-role` | `{"success":true,"data":[{"userId":1,"firstName":"Lior","lastName":"Rubinshtein","username":"lior_rubinshtein","avatarKey":"chef_masculine","userRole":"chef","city":"Gan Yavne","cookingLevel":"advanced","recipeCount":3,"avgRating":4.5,"reviewCount":8,"followerCount":0}],"error":null}` | 200, 401 |

**Note:** Returns all users with `userRole` of `chef` or `influencer`, ordered by `recipeCount` descending. Includes aggregated stats (`recipeCount`, `avgRating`, `reviewCount`). Used by the Feed page carousel ("Creators you may like").

---

# Notifications

| Method | Path | Access | Headers | Query Params | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|
| GET | `/api/notifications` | any authenticated user | `x-user-id`, `x-user-role` | `limit` (default: 20), `unreadOnly` (true/false) | `{"success":true,"data":[{"notificationId":1,"userId":1,"type":"follow","message":"Daniel Levi started following you","sourceUserId":4,"entityId":null,"entityType":null,"commentId":null,"isRead":false,"createdAt":"2026-06-22T10:00:00.000Z","updatedAt":"2026-06-22T10:00:00.000Z"}],"error":null}` | `{"success":false,"data":null,"error":{"code":"UNAUTHORIZED","message":"Authentication required","details":{}}}` | 200, 401 |
| GET | `/api/notifications/unread-count` | any authenticated user | `x-user-id`, `x-user-role` | None | `{"success":true,"data":{"count":3},"error":null}` | `{"success":false,"data":null,"error":{"code":"UNAUTHORIZED","message":"Authentication required","details":{}}}` | 200, 401 |
| PUT | `/api/notifications/read-all` | any authenticated user | `x-user-id`, `x-user-role` | None | `{"success":true,"data":{"message":"All notifications marked as read"},"error":null}` | `{"success":false,"data":null,"error":{"code":"UNAUTHORIZED","message":"Authentication required","details":{}}}` | 200, 401 |
| PUT | `/api/notifications/:id/read` | any authenticated user | `x-user-id`, `x-user-role` | None | `{"success":true,"data":{"notificationId":1,"isRead":true,"updatedAt":"2026-06-22T10:05:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"NOT_FOUND","message":"Notification not found","details":{}}}` | 200, 401, 404 |

**Valid `type` values:** `follow`, `comment_reply`, `mention`, `chef_approved`, `chef_rejected`, `recipe_comment`, `recipe_approved`, `recipe_rejected`

---

# Comment Likes

| Method | Path | Access | Headers | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|
| POST | `/api/comments/:commentId/likes` | any authenticated user | `x-user-id`, `x-user-role` | `{"success":true,"data":{"commentLikeId":10,"userId":1,"commentId":5,"createdAt":"2026-06-22T10:00:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You cannot like your own comment","details":{}}}` | 201, 403, 404 |
| DELETE | `/api/comments/:commentId/likes` | any authenticated user | `x-user-id`, `x-user-role` | `{"success":true,"data":{"message":"Comment like removed"},"error":null}` | — | 200, 403, 404 |

**Notes:**
- Self-likes are blocked (403).
- Liking an already-liked comment is idempotent (returns the existing like).
- Unliking a comment you have not liked is idempotent (returns 200).
- Like/unlike emits a Socket.IO event `commentLikeUpdate` to the recipe discussion room.

---

# Review Reports

| Method | Path | Access | Headers | Query Params | Request Body | Success Response Example | Error Response Example | Status Codes |
|---|---|---|---|---|---|---|---|---|
| GET | `/api/review-reports/count` | admin only | `x-user-id`, `x-user-role: admin` | None | None | `{"success":true,"data":{"count":5},"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| GET | `/api/review-reports` | admin only | `x-user-id`, `x-user-role: admin` | `status` (open/dismissed/actioned) | None | `{"success":true,"data":[{"reportId":1,"reviewId":3,"reporterUserId":4,"reason":"spam","details":null,"status":"open","reviewedByUserId":null,"reviewedAt":null,"createdAt":"2026-06-10T10:00:00.000Z"}],"error":null}` | `{"success":false,"data":null,"error":{"code":"FORBIDDEN","message":"You do not have permission to perform this action.","details":{}}}` | 200, 403 |
| PUT | `/api/review-reports/:reportId` | admin only | `x-user-id`, `x-user-role: admin`, `Content-Type: application/json` | None | `{"status":"dismissed"}` | `{"success":true,"data":{"reportId":1,"status":"dismissed","reviewedByUserId":2,"reviewedAt":"2026-06-22T10:00:00.000Z"},"error":null}` | `{"success":false,"data":null,"error":{"code":"REPORT_NOT_FOUND","message":"Report not found","details":{}}}` | 200, 400, 403, 404 |
| DELETE | `/api/review-reports/:reportId/delete-review` | admin only | `x-user-id`, `x-user-role: admin` | None | None | `{"success":true,"data":{"message":"Review deleted through moderation"},"error":null}` | `{"success":false,"data":null,"error":{"code":"REPORT_NOT_FOUND","message":"Report not found","details":{}}}` | 200, 403, 404 |

**Valid `status` values:** `open`, `dismissed`, `actioned`  
**Notes:**
- `GET /api/review-reports/count` returns only open reports count (navbar indicator).
- `DELETE /api/review-reports/:reportId/delete-review` deletes the review itself (not just the report); the report record remains.

---

TOTAL ENDPOINT COUNT: 98
