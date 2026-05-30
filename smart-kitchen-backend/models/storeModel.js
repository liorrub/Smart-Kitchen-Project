const stores = require("../data/stores.json");

// Get all stores
async function getAllStores() {
    return stores;
}

// Get store by ID
async function getStoreById(storeId) {
    return stores.find(
        store => store.storeId === storeId
    );
}

// Filter stores by optional search criteria such as minimum rating
async function getNearbyStores(filters = {}) {
    let filteredStores = [...stores];

    if (filters.minRating) {
        filteredStores = filteredStores.filter(
            store =>
                store.rating >= Number(filters.minRating)
        );
    }

    return filteredStores;
}

module.exports = {
    getAllStores,
    getStoreById,
    getNearbyStores
};