const express = require("express");
const app = express();
const cors = require("cors");

// Import middleware
const logger = require("./middleware/logger");

// Import routes
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const recipesRoutes = require("./routes/recipesRoutes");
const ingredientsRoutes = require("./routes/ingredientsRoutes");
const favoritesRoutes = require("./routes/favoritesRoutes");
const pantryRoutes = require("./routes/pantryRoutes");
const shoppingListRoutes = require("./routes/shoppingListRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const storesRoutes = require("./routes/storesRoutes");
const aiRoutes = require("./routes/aiRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const optionsRoutes = require("./routes/optionsRoutes");
const chefRequestsRoutes = require("./routes/chefRequestsRoutes");

// Parse JSON body
app.use(express.json());

app.use(cors());

// Request logger
app.use(logger);

// API routes
app.use("/api/auth", authRoutes);

// User-related nested resources
app.use("/api/users", usersRoutes);
app.use("/api/users", favoritesRoutes);
app.use("/api/users", pantryRoutes);
app.use("/api/users", shoppingListRoutes);
app.use("/api/users", mealPlanRoutes);

app.use("/api/recipes", recipesRoutes);
app.use("/api/ingredients", ingredientsRoutes);
app.use("/api/stores", storesRoutes);
app.use("/api", aiRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/options", optionsRoutes);
app.use("/api/chef-requests", chefRequestsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        data: null,
        error: {
            code: "NOT_FOUND",
            message: "Route not found",
            details: {}
        }
    });
});

// Global error handler
app.use((err, req, res, _next) => {
    console.error(err);

    return res.status(500).json({
        success: false,
        data: null,
        error: {
            code: "SERVER_ERROR",
            message: "Unexpected server error",
            details: {}
        }
    });
});

// Start server
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});