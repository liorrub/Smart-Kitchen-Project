const { errorResponse } = require("../utils/responseHelper");

const {
    mealTypes,
    itemTypes
} = require("../data/enums/mealPlanEnums");

// Validate meal type
function validateMealType(req, res, next) {
    const { mealType } = req.body;

    if (
        mealType &&
        !mealTypes.includes(mealType)
    ) {
        return errorResponse(
            res,
            400,
            "INVALID_MEAL_TYPE",
            "Invalid meal type",
            {
                field: "mealType"
            }
        );
    }

    next();
}

// Validate item type
function validateItemType(req, res, next) {
    const { itemType } = req.body;

    if (
        itemType &&
        !itemTypes.includes(itemType)
    ) {
        return errorResponse(
            res,
            400,
            "INVALID_ITEM_TYPE",
            "Invalid item type",
            {
                field: "itemType"
            }
        );
    }

    next();
}

module.exports = {
    validateMealType,
    validateItemType
};