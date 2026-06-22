const {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    filterRecipes,
    getMyRecipesForFoodie,
    getPendingRecipes
} = require("../models/recipesModel");

const {
    getReviewsByRecipeId,
    getReviewById,
    addReview,
    updateReview,
    deleteReview
} = require("../models/reviewsModel");

const {
    getUserById
} = require("../models/usersModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

const {
    getIngredientsByRecipeId,
    addRecipeIngredient,
    deleteIngredientsByRecipeId
} = require("../models/recipeIngredientModel");

const {
    getIngredientById
} = require("../models/ingredientsModel");

const { sequelize } = require("../models");
const fs = require("fs");
const path = require("path");

const { createNotification } = require("../models/notificationsModel");
const { resolveAuthUser } = require("../middleware/auth");
const { UPLOAD_DIR } = require("../middleware/upload");

async function buildRecipeWithIngredients(recipe) {
    const ingredients = await getIngredientsByRecipeId(recipe.recipeId);
    return {
        ...recipe,
        ingredients
    };
}

// Add ingredient relations for a recipe.
// Runs sequentially so a single invalid ingredientId aborts cleanly
// without leaving partial inserts behind (important when called inside a transaction).
async function addIngredientsToRecipe(recipeId, ingredients, options = {}) {
    for (const ingredient of ingredients) {
        const existingIngredient = await getIngredientById(
            Number(ingredient.ingredientId)
        );

        if (!existingIngredient) {
            const error = new Error(
                `Ingredient with id ${ingredient.ingredientId} was not found`
            );

            error.status = 404;
            error.code = "INGREDIENT_NOT_FOUND";

            throw error;
        }

        await addRecipeIngredient({
            recipeId,
            ingredientId: Number(ingredient.ingredientId),
            quantity: Number(ingredient.quantity),
            unit: ingredient.unit
        }, options);
    }
}

// Replace the full ingredient list of a recipe.
// Used when a chef/admin/influencer updates the ingredients of an existing recipe.
// First deletes the old relations, then creates the new relations.
async function replaceRecipeIngredients(recipeId, ingredients, options = {}) {
    await deleteIngredientsByRecipeId(recipeId, options);
    await addIngredientsToRecipe(recipeId, ingredients, options);
}

// Get all recipes (public — only approved)
async function getRecipes(req, res, next) {
    try {
        const filters = req.query;
        const recipes = Object.keys(filters).length ? await filterRecipes(filters) : await getAllRecipes();

        const recipesWithIngredients = await Promise.all(
            recipes.map(recipe =>
                buildRecipeWithIngredients(recipe)));

        return successResponse(res, 200, recipesWithIngredients);
    } catch (error) {
        next(error);
    }
}

// Get one recipe.
// Approved recipes are public. Non-approved recipes are visible only to their creator and admins.
async function getSingleRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const recipe = await getRecipeById(recipeId);

        if (!recipe) {
            return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
        }

        if (recipe.approvalStatus !== "approved") {
            await resolveAuthUser(req);
            const caller = req.authUser;
            const isCreator = caller && caller.userId === recipe.creatorId;
            const isAdmin = caller && caller.userRole === "admin";

            if (!isCreator && !isAdmin) {
                return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
            }
        }

        const recipeWithIngredients = await buildRecipeWithIngredients(recipe);
        return successResponse(res, 200, recipeWithIngredients);

    } catch (error) {
        next(error);
    }
}

// Create recipe.
// approvalStatus is set server-side: influencer → pending, chef/admin → approved.
// Never trust approvalStatus from the request body.
async function createSingleRecipe(req, res, next) {
    try {
        // Make sure the recipe creator exists before opening a transaction.
        const creator = await getUserById(req.body.creatorId);

        if (!creator) {
            return errorResponse(res, 404, "USER_NOT_FOUND", "Creator user not found");
        }

        const { userRole } = req.authUser;

        // Strip approval-related fields from the client payload — never trust them.
        // eslint-disable-next-line no-unused-vars
        const { ingredients, approvalStatus: _a, reviewedByUserId: _b, reviewedAt: _c, rejectionReason: _d, ...recipeData } = req.body;

        recipeData.approvalStatus = userRole === "influencer" ? "pending" : "approved";

        const recipe = await sequelize.transaction(async (t) => {
            const created = await createRecipe(recipeData, { transaction: t });
            await addIngredientsToRecipe(created.recipeId, ingredients, { transaction: t });
            return created;
        });

        const recipeWithIngredients = await buildRecipeWithIngredients(recipe);
        return successResponse(res, 201, recipeWithIngredients);
    } catch (error) {
        next(error);
    }
}

// Update recipe.
// Influencers can only edit their own recipes; editing resets approvalStatus to pending.
// approvalStatus is never accepted from the request body for any role.
async function updateSingleRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const { userRole, userId } = req.authUser;

        // Strip approval-related fields from the client payload — never trust them.
        // eslint-disable-next-line no-unused-vars
        const { ingredients, approvalStatus: _a, reviewedByUserId: _b, reviewedAt: _c, rejectionReason: _d, ...recipeData } = req.body;

        if (userRole === "influencer") {
            const existing = await getRecipeById(recipeId);
            if (!existing) {
                return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
            }
            if (existing.creatorId !== userId) {
                return errorResponse(res, 403, "FORBIDDEN", "You can only edit your own recipes");
            }
            // Any edit by the influencer resets the recipe back to pending review.
            recipeData.approvalStatus = "pending";
            recipeData.reviewedByUserId = null;
            recipeData.reviewedAt = null;
            recipeData.rejectionReason = null;
        }

        let updatedRecipe;

        if (ingredients !== undefined) {
            updatedRecipe = await sequelize.transaction(async (t) => {
                const r = await updateRecipe(recipeId, recipeData, { transaction: t });
                if (!r) return null;
                await replaceRecipeIngredients(recipeId, ingredients, { transaction: t });
                return r;
            });
        } else {
            updatedRecipe = await updateRecipe(recipeId, recipeData);
        }

        if (!updatedRecipe) {
            return errorResponse(
                res,
                404,
                "RECIPE_NOT_FOUND",
                "Recipe not found"
            );
        }

        const recipeWithIngredients = await buildRecipeWithIngredients(updatedRecipe);
        return successResponse(res, 200, recipeWithIngredients);
    } catch (error) {
        next(error);
    }
}

// Delete recipe.
// Influencers can only delete their own recipes; chef and admin can delete any.
async function deleteSingleRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const { userRole, userId } = req.authUser;

        if (userRole === "influencer") {
            const existing = await getRecipeById(recipeId);
            if (!existing) {
                return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
            }
            if (existing.creatorId !== userId) {
                return errorResponse(res, 403, "FORBIDDEN", "You can only delete your own recipes");
            }
        }

        const deleted = await deleteRecipe(recipeId);

        if (!deleted) {
            return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
        }

        return successResponse(res, 200, {
            message: "Recipe deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}

// Return all recipes (all statuses) created by the authenticated influencer.
async function getMyFoodieRecipes(req, res, next) {
    try {
        const { userId } = req.authUser;
        const recipes = await getMyRecipesForFoodie(userId);
        const recipesWithIngredients = await Promise.all(
            recipes.map(recipe => buildRecipeWithIngredients(recipe))
        );
        return successResponse(res, 200, recipesWithIngredients);
    } catch (error) {
        next(error);
    }
}

// Return all pending recipes for the admin approval queue.
async function getPendingQueue(req, res, next) {
    try {
        const recipes = await getPendingRecipes();
        const recipesWithIngredients = await Promise.all(
            recipes.map(recipe => buildRecipeWithIngredients(recipe))
        );
        return successResponse(res, 200, recipesWithIngredients);
    } catch (error) {
        next(error);
    }
}

// Approve a recipe. Sends recipe_approved notification only on first approval.
async function approveRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const { userId } = req.authUser;

        const recipe = await getRecipeById(recipeId);
        if (!recipe) {
            return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
        }

        const wasAlreadyApproved = recipe.approvalStatus === "approved";

        const updated = await updateRecipe(recipeId, {
            approvalStatus: "approved",
            reviewedByUserId: userId,
            reviewedAt: new Date(),
            rejectionReason: null
        });

        if (!wasAlreadyApproved) {
            await createNotification({
                userId: recipe.creatorId,
                type: "recipe_approved",
                message: `Your recipe "${recipe.title}" has been approved!`,
                sourceUserId: userId,
                entityId: recipeId,
                entityType: "recipe"
            });
        }

        return successResponse(res, 200, updated);
    } catch (error) {
        next(error);
    }
}

// Reject a recipe with a required reason. Sends recipe_rejected notification only on first rejection.
async function rejectRecipe(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const { userId } = req.authUser;
        const { reason } = req.body;

        if (!reason || !String(reason).trim()) {
            return errorResponse(res, 400, "VALIDATION_ERROR", "Rejection reason is required");
        }

        const recipe = await getRecipeById(recipeId);
        if (!recipe) {
            return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
        }

        const wasAlreadyRejected = recipe.approvalStatus === "rejected";

        const updated = await updateRecipe(recipeId, {
            approvalStatus: "rejected",
            reviewedByUserId: userId,
            reviewedAt: new Date(),
            rejectionReason: String(reason).trim()
        });

        if (!wasAlreadyRejected) {
            await createNotification({
                userId: recipe.creatorId,
                type: "recipe_rejected",
                message: `Your recipe "${recipe.title}" has been reviewed.`,
                sourceUserId: userId,
                entityId: recipeId,
                entityType: "recipe"
            });
        }

        return successResponse(res, 200, updated);
    } catch (error) {
        next(error);
    }
}

// Get recipe reviews
async function getRecipeReviews(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const recipe = await getRecipeById(recipeId);

        if (!recipe) {
            return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
        }

        const reviews = await getReviewsByRecipeId(recipeId);
        return successResponse(res, 200, reviews);
    } catch (error) {
        next(error);
    }
}

// Add review
async function createRecipeReview(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const { userId, userRole } = req.authUser;

        const recipe = await getRecipeById(recipeId);

        if (!recipe) {
            return errorResponse(
                res,
                404,
                "RECIPE_NOT_FOUND",
                "Recipe not found"
            );
        }

        // Whitelist only user-supplied fields; all other fields are set server-side.
        const { rating, title, comment } = req.body;
        const review = await addReview({
            rating,
            title,
            comment,
            recipeId,
            userId,
            isInfluencer: userRole === "influencer"
        });

        return successResponse(res, 201, review);
    } catch (error) {
        next(error);
    }
}

// Update review
async function updateRecipeReview(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const reviewId = Number(req.params.reviewId);
        const { userId, userRole } = req.authUser;

        const review = await getReviewById(reviewId);

        if (!review || review.recipeId !== recipeId) {
            return errorResponse(
                res,
                404,
                "REVIEW_NOT_FOUND",
                "Review not found"
            );
        }

        // Only the review owner or admin can update the review
        if (
            review.userId !== userId &&
            userRole !== "admin"
        ) {
            return errorResponse(res, 403, "FORBIDDEN", "You can only edit your own review");
        }

        // Whitelist: only rating, title, comment may be changed by the client.
        const { rating, title, comment } = req.body;
        const updatePayload = {};
        if (rating !== undefined) updatePayload.rating = rating;
        if (title !== undefined) updatePayload.title = title;
        if (comment !== undefined) updatePayload.comment = comment;

        const updatedReview = await updateReview(recipeId, reviewId, updatePayload);
        return successResponse(res, 200, updatedReview);

    } catch (error) {
        next(error);
    }
}

// Delete review
async function deleteRecipeReview(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const reviewId = Number(req.params.reviewId);
        const { userId, userRole } = req.authUser;

        const review = await getReviewById(reviewId);

        if (!review || review.recipeId !== recipeId) {
            return errorResponse(
                res,
                404,
                "REVIEW_NOT_FOUND",
                "Review not found"
            );
        }

        // Only the review owner or admin can delete the review
        if (
            review.userId !== userId &&
            userRole !== "admin"
        ) {
            return errorResponse(res, 403, "FORBIDDEN", "You can only delete your own review");
        }

        await deleteReview(recipeId, reviewId);
        return successResponse(res, 200, {
            message: "Review deleted successfully"
        });

    } catch (error) {
        next(error);
    }
}

// Upload an image file for a recipe and store its path in imageUrl.
// If the recipe already had a locally-uploaded image, the old file is deleted.
async function uploadRecipeImage(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const recipe = await getRecipeById(recipeId);
        if (!recipe) {
            return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
        }

        const { userId, userRole } = req.authUser;
        if (userRole !== "admin" && recipe.creatorId !== userId) {
            return errorResponse(res, 403, "FORBIDDEN", "You can only edit images for your own recipes");
        }

        if (!req.file) {
            return errorResponse(res, 400, "NO_FILE", "No image file was provided");
        }

        // Delete the previous locally-uploaded file if it exists
        if (recipe.imageUrl && recipe.imageUrl.startsWith("/uploads/")) {
            const oldPath = path.join(__dirname, "..", recipe.imageUrl);
            fs.unlink(oldPath, () => {}); // ignore error if already gone
        }

        const imageUrl = `/uploads/recipes/${req.file.filename}`;
        const updated = await updateRecipe(recipeId, { imageUrl });
        return successResponse(res, 200, updated);
    } catch (error) {
        next(error);
    }
}

// Remove the image from a recipe (locally-uploaded files are deleted from disk).
async function deleteRecipeImage(req, res, next) {
    try {
        const recipeId = Number(req.params.id);
        const recipe = await getRecipeById(recipeId);
        if (!recipe) {
            return errorResponse(res, 404, "RECIPE_NOT_FOUND", "Recipe not found");
        }

        const { userId, userRole } = req.authUser;
        if (userRole !== "admin" && recipe.creatorId !== userId) {
            return errorResponse(res, 403, "FORBIDDEN", "You can only edit images for your own recipes");
        }

        if (recipe.imageUrl && recipe.imageUrl.startsWith("/uploads/")) {
            const filePath = path.join(__dirname, "..", recipe.imageUrl);
            fs.unlink(filePath, () => {}); // ignore if already gone
        }

        const updated = await updateRecipe(recipeId, { imageUrl: null });
        return successResponse(res, 200, updated);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRecipes,
    getSingleRecipe,
    createSingleRecipe,
    updateSingleRecipe,
    deleteSingleRecipe,
    getMyFoodieRecipes,
    getPendingQueue,
    approveRecipe,
    rejectRecipe,
    getRecipeReviews,
    createRecipeReview,
    updateRecipeReview,
    deleteRecipeReview,
    uploadRecipeImage,
    deleteRecipeImage
};
