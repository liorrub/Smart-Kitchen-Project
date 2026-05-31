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
async function getFilteredStores(filters = {}) {
    let filteredStores = [...stores];

    if (filters.minRating) {
        filteredStores = filteredStores.filter(
            store =>
                store.rating >= Number(filters.minRating)
        );
    }

    return filteredStores;
}

// Get stores by city
async function getNearbyStoresByCity(city) {
    return stores.filter(
        store => store.city === city
    );
}

module.exports = {
    getAllStores,
    getStoreById,
    getFilteredStores,
    getNearbyStoresByCity
};