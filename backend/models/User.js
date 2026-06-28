"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
    "User",
    {
        userId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "First name is required" },
                notEmpty: { msg: "First name cannot be empty" }
            },
            set(value) {
                this.setDataValue("firstName", typeof value === "string" ? value.trim() : value);
            }
        },
        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "Last name is required" },
                notEmpty: { msg: "Last name cannot be empty" }
            },
            set(value) {
                this.setDataValue("lastName", typeof value === "string" ? value.trim() : value);
            }
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "Email is required" },
                isEmail: { msg: "Must be a valid email address" }
            },
            set(value) {
                this.setDataValue(
                    "email",
                    typeof value === "string" ? value.trim().toLowerCase() : value
                );
            }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notNull: { msg: "Password is required" }
            }
        },
        userRole: {
            type: DataTypes.ENUM("user", "chef", "influencer", "admin"),
            allowNull: false,
            defaultValue: "user",
            validate: {
                isIn: {
                    args: [["user", "chef", "influencer", "admin"]],
                    msg: "Invalid user role"
                }
            }
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notNull: { msg: "City is required" },
                notEmpty: { msg: "City cannot be empty" }
            },
            set(value) {
                this.setDataValue("city", typeof value === "string" ? value.trim() : value);
            }
        },
        cookingLevel: {
            type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
            allowNull: false,
            defaultValue: "beginner",
            validate: {
                isIn: {
                    args: [["beginner", "intermediate", "advanced"]],
                    msg: "Invalid cooking level"
                }
            }
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notNull: { msg: "Age is required" },
                isInt: { msg: "Age must be an integer" },
                min: { args: [1], msg: "Age must be at least 1" },
                max: { args: [120], msg: "Age must be at most 120" }
            }
        },
        preferences: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null
        },
        username: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
            validate: {
                notNull: { msg: "Username is required" },
                notEmpty: { msg: "Username cannot be empty" }
            },
            set(value) {
                this.setDataValue(
                    "username",
                    typeof value === "string" ? value.trim().toLowerCase() : value
                );
            }
        },
        avatarKey: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: "home_cook_neutral_01",
            validate: {
                notNull: { msg: "Avatar key is required" },
                notEmpty: { msg: "Avatar key cannot be empty" }
            }
        }
    },
    {
        tableName: "Users",
        timestamps: true
    }
);

module.exports = User;
