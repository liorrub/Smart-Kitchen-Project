const {
    getAllStores,
    getStoreById,
    getNearbyStores
} = require("../models/storeModel");

const {
    successResponse,
    errorResponse
} = require("../utils/responseHelper");

// Get all stores
async function getStores(req, res, next) {
    try {
        const stores = Object.keys(req.query).length
            ? await getNearbyStores(req.query)
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
        const stores = await getNearbyStores(
            req.query
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