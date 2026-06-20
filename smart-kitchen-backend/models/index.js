"use strict";

const sequelize = require("../config/database");
const User = require("./User");
const Recipe = require("./Recipe");
const Ingredient = require("./Ingredient");
const RecipeIngredient = require("./RecipeIngredient");
const RecipeComment = require("./RecipeComment");
const AiHistory = require("./AiHistory");

// User → Recipe (one-to-many via creatorId)
User.hasMany(Recipe, { foreignKey: "creatorId", as: "recipes" });
Recipe.belongsTo(User, { foreignKey: "creatorId", as: "creator" });

// Recipe → RecipeIngredient (one-to-many)
Recipe.hasMany(RecipeIngredient, { foreignKey: "recipeId", as: "recipeIngredients" });
RecipeIngredient.belongsTo(Recipe, { foreignKey: "recipeId" });

// Ingredient → RecipeIngredient (one-to-many)
Ingredient.hasMany(RecipeIngredient, { foreignKey: "ingredientId" });
RecipeIngredient.belongsTo(Ingredient, { foreignKey: "ingredientId", as: "ingredient" });

// Recipe → RecipeComment (one-to-many)
Recipe.hasMany(RecipeComment, { foreignKey: "recipeId", as: "comments" });
RecipeComment.belongsTo(Recipe, { foreignKey: "recipeId", as: "recipe" });

// User → RecipeComment (one-to-many, the comment author)
User.hasMany(RecipeComment, { foreignKey: "userId", as: "comments" });
RecipeComment.belongsTo(User, { foreignKey: "userId", as: "author" });

// User → RecipeComment (one-to-many, the mentioned user in a comment)
RecipeComment.belongsTo(User, { foreignKey: "mentionedUserId", as: "mentionedUser" });

// RecipeComment self-reference for replies (one level of nesting)
RecipeComment.belongsTo(RecipeComment, { foreignKey: "parentCommentId", as: "parent" });
RecipeComment.hasMany(RecipeComment, { foreignKey: "parentCommentId", as: "replies" });

// User → AiHistory (one-to-many)
User.hasMany(AiHistory, { foreignKey: "userId", as: "aiHistory" });
AiHistory.belongsTo(User, { foreignKey: "userId", as: "user" });

module.exports = {
    sequelize,
    User,
    Recipe,
    Ingredient,
    RecipeIngredient,
    RecipeComment,
    AiHistory
};
