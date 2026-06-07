const { errorResponse } = require("../utils/responseHelper");

function validateIngredient(req, res, next) {
    const { name, category, isAllergen } = req.body;

    if (name === undefined || name === null || name === "") {
        return errorResponse(
            res,
            400,
            "VALIDATION_ERROR",
            "Ingredient name is required",
            {
                field: "name"
            }
        );
    }

    if (category === undefined || category === null || category === "") {
        return errorResponse(
            res,
            400,
            "VALIDATION_ERROR",
            "Ingredient category is required",
            {
                field: "category"
            }
        );
    }

    if (isAllergen === undefined || isAllergen === null) {
        return errorResponse(
            res,
            400,
            "VALIDATION_ERROR",
            "isAllergen is required",
            {
                field: "isAllergen"
            }
        );
    }

    if (typeof name !== "string") {
        return errorResponse(
            res,
            400,
            "VALIDATION_ERROR",
            "Ingredient name must be a string",
            {
                field: "name"
            }
        );
    }

    if (typeof category !== "string") {
        return errorResponse(
            res,
            400,
            "VALIDATION_ERROR",
            "Ingredient category must be a string",
            {
                field: "category"
            }
        );
    }

    const cleanName = name.trim();
    const cleanCategory = category.trim();

    const validTextPattern =
        /^[A-Za-zא-ת\s-]+$/;

    if (
        cleanName.length < 2 ||
        !validTextPattern.test(cleanName)
    ) {
        return errorResponse(
            res,
            400,
            "VALIDATION_ERROR",
            "Ingredient name must contain only letters, spaces or hyphen, and be at least 2 characters long",
            {
                field: "name"
            }
        );
    }

    if (
        cleanCategory.length < 2 ||
        !validTextPattern.test(cleanCategory)
    ) {
        return errorResponse(
            res,
            400,
            "VALIDATION_ERROR",
            "Ingredient category must contain only letters, spaces or hyphen, and be at least 2 characters long",
            {
                field: "category"
            }
        );
    }

    if (typeof isAllergen !== "boolean") {
        return errorResponse(
            res,
            400,
            "VALIDATION_ERROR",
            "isAllergen must be true or false",
            {
                field: "isAllergen"
            }
        );
    }

    req.body.name = cleanName;
    req.body.category = cleanCategory;

    next();
}

module.exports = {
    validateIngredient
};