"use strict";

const User = require("./User");

// Returns a plain object so controllers can safely destructure (e.g. { password, ...safe }).
// Strips createdAt/updatedAt — no current consumer reads date fields on user objects.
function toPlain(instance) {
    if (!instance) return null;
    const { createdAt, updatedAt, ...rest } = instance.get({ plain: true });
    return rest;
}

async function getAllUsers() {
    const users = await User.findAll({ order: [["userId", "ASC"]] });
    return users.map(toPlain);
}

async function getUserById(userId) {
    const user = await User.findByPk(userId);
    return toPlain(user);
}

async function getUserByEmail(email) {
    if (!email) return null;
    const user = await User.findOne({
        where: { email: email.trim().toLowerCase() }
    });
    return toPlain(user);
}

async function createUser(userData) {
    const user = await User.create(userData);
    return toPlain(user);
}

async function updateUser(userId, updatedData) {
    const user = await User.findByPk(userId);
    if (!user) return null;

    // Strip fields that must not be changed through the generic update path.
    // Password changes must use updateUserPassword.
    // Timestamps and PK are Sequelize-managed and must not be overwritten by client data.
    const {
        password,
        userId: _pk,
        createDate,
        updateDate,
        createdAt,
        updatedAt,
        ...safeData
    } = updatedData;

    await user.update(safeData);
    return toPlain(user);
}

async function deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) return false;
    await user.destroy();
    return true;
}

async function filterUsers(filters = {}) {
    const where = {};
    if (filters.userRole) where.userRole = filters.userRole;
    if (filters.cookingLevel) where.cookingLevel = filters.cookingLevel;

    const users = await User.findAll({ where, order: [["userId", "ASC"]] });
    return users.map(toPlain);
}

// Dedicated function for password updates.
// Caller must pass an already-hashed password — never plaintext.
async function updateUserPassword(userId, hashedPassword) {
    const user = await User.findByPk(userId);
    if (!user) return null;
    await user.update({ password: hashedPassword });
    return toPlain(user);
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    filterUsers,
    updateUserPassword
};
