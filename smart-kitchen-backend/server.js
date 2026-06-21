require("dotenv").config();

const http = require("http");
const express = require("express");
const cors = require("cors");

const app = express();

const { initSocket } = require("./socket/index");

// Import middleware
const logger = require("./middleware/logger");
const notFoundHandler = require("./middleware/notFoundHandler");
const errorHandler = require("./middleware/errorHandler");

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
const recipeCommentsRoutes = require("./routes/recipeCommentsRoutes");
const recipeLikesRoutes   = require("./routes/recipeLikesRoutes");
const userFollowsRoutes   = require("./routes/userFollowsRoutes");
const feedRoutes          = require("./routes/feedRoutes");

// Parse JSON request bodies
app.use(express.json());

// Enable CORS
app.use(cors());

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
app.use("/api/users", userFollowsRoutes);
app.use("/api", feedRoutes);

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
