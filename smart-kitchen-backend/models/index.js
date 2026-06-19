"use strict";

const sequelize = require("../config/database");
const User = require("./User");
const Recipe = require("./Recipe");
const Ingredient = require("./Ingredient");
const RecipeIngredient = require("./RecipeIngredient");

// User → Recipe (one-to-many via creatorId)
User.hasMany(Recipe, { foreignKey: "creatorId", as: "recipes" });
Recipe.belongsTo(User, { foreignKey: "creatorId", as: "creator" });

// Recipe → RecipeIngredient (one-to-many)
Recipe.hasMany(RecipeIngredient, { foreignKey: "recipeId", as: "recipeIngredients" });
RecipeIngredient.belongsTo(Recipe, { foreignKey: "recipeId" });

// Ingredient → RecipeIngredient (one-to-many)
Ingredient.hasMany(RecipeIngredient, { foreignKey: "ingredientId" });
RecipeIngredient.belongsTo(Ingredient, { foreignKey: "ingredientId", as: "ingredient" });

module.exports = {
    sequelize,
    User,
    Recipe,
    Ingredient,
    RecipeIngredient
};
