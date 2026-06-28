const express = require("express");
const router = express.Router();

const storesController = require("../controllers/storesController");

const {
    validateIdParam
} = require("../validators/commonValidator");

// Get all stores
router.get(
    "/",
    storesController.getStores
);

// Nearby stores
router.get(
    "/nearby",
    storesController.getNearby
);

// Get single store
router.get(
    "/:id",
    validateIdParam(),
    storesController.getSingleStore
);

module.exports = router;