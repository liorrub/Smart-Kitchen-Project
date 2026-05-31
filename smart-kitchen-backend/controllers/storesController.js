const {
    getAllStores,
    getStoreById,
    getFilteredStores,
    getNearbyStoresByCity
} = require("../models/storeModel");

const {
    getUserById
} = require("../models/usersModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Get all stores
async function getStores(req, res, next) {
    try {
        const stores = Object.keys(req.query).length
            ? await getFilteredStores(req.query)
            : await getAllStores();

        return successResponse(res, 200, stores);
    } catch (error) {
        next(error);
    }
}

// Get one store
async function getSingleStore(req, res, next) {
    try {
        const storeId = Number(req.params.id);

        const store = await getStoreById(storeId);

        if (!store) {
            return errorResponse(
                res,
                404,
                "STORE_NOT_FOUND",
                "Store not found"
            );
        }

        return successResponse(res, 200, store);
    } catch (error) {
        next(error);
    }
}

// Nearby stores
async function getNearby(req, res, next) {
    try {
        const userId = Number(req.headers["x-user-id"]);

        if (!userId) {
            return errorResponse(
                res,
                401,
                "UNAUTHORIZED",
                "Authentication required"
            );
        }

        const user = await getUserById(userId);

        if (!user) {
            return errorResponse(
                res,
                404,
                "USER_NOT_FOUND",
                "User not found"
            );
        }

        if (!user.city) {
            return errorResponse(
                res,
                400,
                "NO_CITY",
                "User has no city set"
            );
        }

        const stores = await getNearbyStoresByCity(
            user.city
        );

        return successResponse(res, 200, stores);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getStores,
    getSingleStore,
    getNearby
};