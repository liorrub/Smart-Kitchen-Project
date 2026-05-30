const users = require("../data/users.json");
const { generateId } = require("../utils/idGenerator");
const { getCurrentDateTime } = require("../utils/dateHelper");

const FILE_NAME = "users.json";

// Get all users
async function getAllUsers() {
    return users;
}

// Get user by ID
async function getUserById(userId) {
    return users.find(user => user.userId === userId);
}

// Get user by email
async function getUserByEmail(email) {
    return users.find(
        user => user.email === email
    );
}

// Add a new user with generated ID and timestamps
async function createUser(userData) {
    const currentDate = getCurrentDateTime();

    const newUser = {
        userId: generateId(users, "userId"),
        ...userData,
        createDate: currentDate,
        updateDate: currentDate
    };

    users.push(newUser);

    return newUser;
}

// Update user
async function updateUser(userId, updatedData) {
    const userIndex = users.findIndex(
        user => user.userId === userId
    );

    if (userIndex === -1) {
        return null;
    }

    users[userIndex] = {
        ...users[userIndex],
        ...updatedData,
        updateDate: getCurrentDateTime()
    };

    return users[userIndex];
}

// Delete user
async function deleteUser(userId) {
    const userIndex = users.findIndex(
        user => user.userId === userId
    );

    if (userIndex === -1) {
        return false;
    }

    users.splice(userIndex, 1);

    return true;
}

// Filter users by optional role or cooking level
async function filterUsers(filters = {}) {
    let filteredUsers = [...users];

    if (filters.userRole) {
        filteredUsers = filteredUsers.filter(
            user => user.userRole === filters.userRole
        );
    }

    if (filters.cookingLevel) {
        filteredUsers = filteredUsers.filter(
            user => user.cookingLevel === filters.cookingLevel
        );
    }

    return filteredUsers;
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    filterUsers
};