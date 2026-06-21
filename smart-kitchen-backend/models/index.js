"use strict";

const sequelize = require("../config/database");
const User = require("./User");
const Recipe = require("./Recipe");
const Ingredient = require("./Ingredient");
const RecipeIngredient = require("./RecipeIngredient");
const RecipeComment = require("./RecipeComment");
const Favorite = require("./Favorite");
const AiHistory = require("./AiHistory");
const PantryItem = require("./PantryItem");
const ShoppingListItem = require("./ShoppingListItem");
const MealPlanItem = require("./MealPlanItem");
const Store = require("./Store");
const IngredientStore = require("./IngredientStore");
const Review = require("./Review");
const ChefRequest = require("./ChefRequest");
const RecipeLike = require("./RecipeLike");
const UserFollow = require("./UserFollow");

// User → Recipe (one-to-many via creatorId)
User.hasMany(Recipe, { foreignKey: "creatorId", as: "recipes" });
Recipe.belongsTo(User, { foreignKey: "creatorId", as: "creator" });

// Recipe → RecipeIngredient (one-to-many)
Recipe.hasMany(RecipeIngredient, {
    foreignKey: "recipeId",
    as: "recipeIngredients"
});
RecipeIngredient.belongsTo(Recipe, { foreignKey: "recipeId" });

// Ingredient → RecipeIngredient (one-to-many)
Ingredient.hasMany(RecipeIngredient, { foreignKey: "ingredientId" });
RecipeIngredient.belongsTo(Ingredient, {
    foreignKey: "ingredientId",
    as: "ingredient"
});

// Recipe → RecipeComment (one-to-many)
Recipe.hasMany(RecipeComment, {
    foreignKey: "recipeId",
    as: "comments"
});
RecipeComment.belongsTo(Recipe, {
    foreignKey: "recipeId",
    as: "recipe"
});

// User → RecipeComment (one-to-many, the comment author)
User.hasMany(RecipeComment, {
    foreignKey: "userId",
    as: "comments"
});
RecipeComment.belongsTo(User, {
    foreignKey: "userId",
    as: "author"
});

// User → RecipeComment (mentioned user)
RecipeComment.belongsTo(User, {
    foreignKey: "mentionedUserId",
    as: "mentionedUser"
});

// RecipeComment self-reference for replies
RecipeComment.belongsTo(RecipeComment, {
    foreignKey: "parentCommentId",
    as: "parent"
});
RecipeComment.hasMany(RecipeComment, {
    foreignKey: "parentCommentId",
    as: "replies"
});

// User → Favorite (one-to-many)
User.hasMany(Favorite, {
    foreignKey: "userId",
    as: "favorites"
});
Favorite.belongsTo(User, {
    foreignKey: "userId"
});

// Recipe → Favorite (one-to-many)
Recipe.hasMany(Favorite, {
    foreignKey: "recipeId",
    as: "favoritedBy"
});
Favorite.belongsTo(Recipe, {
    foreignKey: "recipeId"
});

// User → AiHistory (one-to-many)
User.hasMany(AiHistory, {
    foreignKey: "userId",
    as: "aiHistory"
});
AiHistory.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});

// User → PantryItem (one-to-many)
User.hasMany(PantryItem, {
    foreignKey: "userId",
    as: "pantryItems"
});
PantryItem.belongsTo(User, {
    foreignKey: "userId"
});

// Ingredient → PantryItem (one-to-many)
Ingredient.hasMany(PantryItem, {
    foreignKey: "ingredientId",
    as: "pantryItems"
});
PantryItem.belongsTo(Ingredient, {
    foreignKey: "ingredientId",
    as: "ingredient"
});

// User → ShoppingListItem (one-to-many)
User.hasMany(ShoppingListItem, {
    foreignKey: "userId",
    as: "shoppingList"
});
ShoppingListItem.belongsTo(User, {
    foreignKey: "userId"
});

// Ingredient → ShoppingListItem (one-to-many)
Ingredient.hasMany(ShoppingListItem, {
    foreignKey: "ingredientId",
    as: "shoppingListItems"
});
ShoppingListItem.belongsTo(Ingredient, {
    foreignKey: "ingredientId",
    as: "ingredient"
});

// User → MealPlanItem (one-to-many)
User.hasMany(MealPlanItem, {
    foreignKey: "userId",
    as: "mealPlan"
});
MealPlanItem.belongsTo(User, {
    foreignKey: "userId"
});

// Ingredient → IngredientStore (one-to-many)
Ingredient.hasMany(IngredientStore, {
    foreignKey: "ingredientId",
    as: "ingredientStores"
});
IngredientStore.belongsTo(Ingredient, {
    foreignKey: "ingredientId",
    as: "ingredient"
});

// Store → IngredientStore (one-to-many)
Store.hasMany(IngredientStore, {
    foreignKey: "storeId",
    as: "ingredientStores"
});
IngredientStore.belongsTo(Store, {
    foreignKey: "storeId",
    as: "store"
});

// User → Review (one-to-many)
User.hasMany(Review, {
    foreignKey: "userId",
    as: "reviews"
});
Review.belongsTo(User, {
    foreignKey: "userId",
    as: "reviewer"
});

// Recipe → Review (one-to-many)
Recipe.hasMany(Review, {
    foreignKey: "recipeId",
    as: "reviews"
});
Review.belongsTo(Recipe, {
    foreignKey: "recipeId",
    as: "recipe"
});

// User → ChefRequest (one-to-many; a user may have multiple requests over time)
User.hasMany(ChefRequest, {
    foreignKey: "userId",
    as: "chefRequests"
});
ChefRequest.belongsTo(User, {
    foreignKey: "userId",
    as: "requester"
});

// User → RecipeLike (one-to-many)
User.hasMany(RecipeLike, {
    foreignKey: "userId",
    as: "likes"
});
RecipeLike.belongsTo(User, {
    foreignKey: "userId"
});

// Recipe → RecipeLike (one-to-many)
Recipe.hasMany(RecipeLike, {
    foreignKey: "recipeId",
    as: "likedBy"
});
RecipeLike.belongsTo(Recipe, {
    foreignKey: "recipeId"
});

// User → UserFollow (as follower — rows where this user is following others)
User.hasMany(UserFollow, {
    foreignKey: "followerId",
    as: "followingRelations"
});

// User → UserFollow (as followee — rows where others are following this user)
User.hasMany(UserFollow, {
    foreignKey: "followeeId",
    as: "followerRelations"
});

// UserFollow → User (the person who follows)
UserFollow.belongsTo(User, {
    foreignKey: "followerId",
    as: "follower"
});

// UserFollow → User (the person being followed)
UserFollow.belongsTo(User, {
    foreignKey: "followeeId",
    as: "followee"
});

module.exports = {
    sequelize,
    User,
    Recipe,
    Ingredient,
    RecipeIngredient,
    RecipeComment,
    Favorite,
    AiHistory,
    PantryItem,
    ShoppingListItem,
    MealPlanItem,
    Store,
    IngredientStore,
    Review,
    ChefRequest,
    RecipeLike,
    UserFollow
};
