require("dotenv").config();

const http = require("http");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();

const { initSocket } = require("./src/socket/index");

// Import middleware
const logger = require("./src/middleware/logger");
const notFoundHandler = require("./src/middleware/notFoundHandler");
const errorHandler = require("./src/middleware/errorHandler");

// Import routes
const authRoutes = require("./src/routes/authRoutes");
const usersRoutes = require("./src/routes/usersRoutes");
const recipesRoutes = require("./src/routes/recipesRoutes");
const ingredientsRoutes = require("./src/routes/ingredientsRoutes");
const favoritesRoutes = require("./src/routes/favoritesRoutes");
const pantryRoutes = require("./src/routes/pantryRoutes");
const shoppingListRoutes = require("./src/routes/shoppingListRoutes");
const mealPlanRoutes = require("./src/routes/mealPlanRoutes");
const storesRoutes = require("./src/routes/storesRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");
const optionsRoutes = require("./src/routes/optionsRoutes");
const chefRequestsRoutes = require("./src/routes/chefRequestsRoutes");
const recipeCommentsRoutes = require("./src/routes/recipeCommentsRoutes");
const recipeLikesRoutes = require("./src/routes/recipeLikesRoutes");
const feedCreatorsRoutes = require("./src/routes/feedCreatorsRoutes");
const userFollowsRoutes = require("./src/routes/userFollowsRoutes");
const feedRoutes = require("./src/routes/feedRoutes");
const notificationsRoutes = require("./src/routes/notificationsRoutes");
const commentLikesRoutes = require("./src/routes/commentLikesRoutes");
const reviewReportsRoutes = require("./src/routes/reviewReportsRoutes");

// Parse JSON request bodies
app.use(express.json());

// Enable CORS
app.use(cors());

// Serve uploaded recipe images statically
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

// Request logger
app.use(logger);

// Authentication routes
app.use("/api/auth", authRoutes);

// User-related nested resources
app.use("/api/users", usersRoutes);
app.use("/api/users", favoritesRoutes);
app.use("/api/users", pantryRoutes);
app.use("/api/users", shoppingListRoutes);
app.use("/api/users", mealPlanRoutes);

// Other API routes
app.use("/api/recipes", recipesRoutes);
app.use("/api/ingredients", ingredientsRoutes);
app.use("/api/stores", storesRoutes);
app.use("/api", aiRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/options", optionsRoutes);
app.use("/api/chef-requests", chefRequestsRoutes);
app.use("/api/recipes", recipeCommentsRoutes);
app.use("/api", recipeLikesRoutes);
app.use("/api", feedCreatorsRoutes);
app.use("/api/users", userFollowsRoutes);
app.use("/api", feedRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api", commentLikesRoutes);
app.use("/api/review-reports", reviewReportsRoutes);

// Must come after every valid route
app.use(notFoundHandler);

// Must be the last middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
