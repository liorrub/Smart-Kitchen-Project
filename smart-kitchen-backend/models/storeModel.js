"use strict";

const { Op } = require("sequelize");
const { Store } = require("./index");

// Strips Sequelize timestamps — original Stores API never exposed createdAt or updatedAt.
function toPlain(instance) {
    const { createdAt, updatedAt, ...rest } = instance.get({ plain: true });
    return rest;
}

async function getAllStores() {
    const rows = await Store.findAll({ order: [["storeId", "ASC"]] });
    return rows.map(toPlain);
}

async function getStoreById(storeId) {
    const instance = await Store.findByPk(storeId);
    return instance ? toPlain(instance) : undefined;
}

// Filter stores by optional criteria. Currently supports minRating.
async function getFilteredStores(filters = {}) {
    const where = {};

    if (filters.minRating) {
        where.rating = { [Op.gte]: Number(filters.minRating) };
    }

    const rows = await Store.findAll({
        where,
        order: [["storeId", "ASC"]]
    });

    return rows.map(toPlain);
}

async function getNearbyStoresByCity(city) {
    const rows = await Store.findAll({
        where: { city },
        order: [["storeId", "ASC"]]
    });
    return rows.map(toPlain);
}

module.exports = {
    getAllStores,
    getStoreById,
    getFilteredStores,
    getNearbyStoresByCity
};
