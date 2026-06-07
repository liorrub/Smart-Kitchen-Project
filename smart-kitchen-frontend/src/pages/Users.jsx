import "./Users.css";

import { useEffect, useState } from "react";

import AppButton from "../components/AppButton";
import CustomSelect from "../components/CustomSelect";
import DataTable from "../components/DataTable";
import FormCard from "../components/FormCard";
import FormField from "../components/FormField";
import PageHero from "../components/PageHero";

import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from "../services/userService";

import { validateUserManagementForm } from "../validators/userValidator";

const ROLE_OPTIONS = [
    { value: "user", label: "User" },
    { value: "chef", label: "Chef" },
    { value: "influencer", label: "Influencer" },
    { value: "admin", label: "Admin" }
];

const COOKING_LEVEL_OPTIONS = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
];

const EMPTY_USER_FORM = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    city: "",
    age: "",
    userRole: "user",
    cookingLevel: "beginner",
    preferences: []
};

function formatText(value) {
    if (!value) {
        return "Unknown";
    }

    return String(value)
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function Users() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState(EMPTY_USER_FORM);
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const currentUser = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setLoading(true);
            setError("");

            const data = await getUsers();

            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setError("Failed to load users.");
        } finally {
            setLoading(false);
        }
    }

    function clearMessages() {
        setError("");
        setSuccess("");
    }

    function handleNewUserChange(event) {
        const { name, value } = event.target;

        setNewUser((previousUser) => ({
            ...previousUser,
            [name]: name === "age"
                ? value.replace(/\D/g, "")
                : value
        }));
    }

    function handleEditUser(user) {
        clearMessages();

        setEditingUser({
            ...user,
            password: "",
            age: user.age || ""
        });
    }

    function handleEditingFieldChange(fieldName, value) {
        setEditingUser((previousUser) => ({
            ...previousUser,
            [fieldName]: fieldName === "age"
                ? value.replace(/\D/g, "")
                : value
        }));
    }

    async function handleCreateUser(event) {
        event.preventDefault();

        clearMessages();

        const userData = {
            ...newUser,
            firstName: newUser.firstName.trim(),
            lastName: newUser.lastName.trim(),
            email: newUser.email.trim(),
            city: newUser.city.trim(),
            age: Number(newUser.age),
            preferences: []
        };

        const validationError = validateUserManagementForm(
            userData,
            true
        );

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setCreating(true);

            await createUser(userData);

            setNewUser(EMPTY_USER_FORM);
            await loadUsers();

            setSuccess("User added successfully.");
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.error?.message ||
                "Failed to add user."
            );
        } finally {
            setCreating(false);
        }
    }

    async function handleSaveUser(event) {
        event.preventDefault();

        if (!editingUser) {
            return;
        }

        clearMessages();

        const userData = {
            firstName: editingUser.firstName.trim(),
            lastName: editingUser.lastName.trim(),
            email: editingUser.email.trim(),
            city: editingUser.city.trim(),
            age: Number(editingUser.age),
            userRole: editingUser.userRole,
            cookingLevel: editingUser.cookingLevel,
            preferences: editingUser.preferences || []
        };

        const validationError = validateUserManagementForm(
            userData,
            false
        );

        if (validationError) {
            setError(validationError);
            return;
        }

        if (currentUser?.userId === editingUser.userId) {
            delete userData.userRole;
        }

        try {
            setSaving(true);

            await updateUser(
                editingUser.userId,
                userData
            );

            setEditingUser(null);
            await loadUsers();

            setSuccess("User updated successfully.");
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.error?.message ||
                "Failed to update user."
            );
        } finally {
            setSaving(false);
        }
    }

    function handleDeleteClick(user) {
        clearMessages();
        setUserToDelete(user);
    }

    async function confirmDeleteUser() {
        if (!userToDelete) {
            return;
        }

        clearMessages();

        try {
            await deleteUser(userToDelete.userId);

            setUserToDelete(null);
            await loadUsers();

            setSuccess("User deleted successfully.");
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.error?.message ||
                "Failed to delete user."
            );
        }
    }

    function cancelDeleteUser() {
        setUserToDelete(null);
    }

    function cancelEditUser() {
        setEditingUser(null);
        clearMessages();
    }

    if (loading) {
        return (
            <div className="users-page">
                <FormCard
                    title="Loading users..."
                    description="Please wait while we prepare the users list."
                />
            </div>
        );
    }

    if (error && users.length === 0) {
        return (
            <div className="users-page">
                <FormCard
                    title="Something went wrong"
                    description={error}
                    className="users-error-card"
                />
            </div>
        );
    }

    return (
        <div className="users-page">
            {success && (
                <div className="users-alert success">
                    {success}
                </div>
            )}

            {error && (
                <div className="users-alert error">
                    {error}
                </div>
            )}

            <PageHero
                label="System Users"
                title="Users Management"
                description="View users, add new accounts, edit profile details, and manage roles."
                stats={[
                    {
                        value: users.length,
                        label: "Total Users"
                    },
                    {
                        value: users.filter(
                            (user) => user.userRole === "admin"
                        ).length,
                        label: "Admins"
                    },
                    {
                        value: users.filter(
                            (user) => user.userRole === "chef"
                        ).length,
                        label: "Chefs"
                    }
                ]}
            />

            {userToDelete && (
                <FormCard
                    label="Delete user"
                    title="Are you sure?"
                    description={`Delete ${userToDelete.firstName} ${userToDelete.lastName}? This action cannot be undone.`}
                    className="users-delete-card"
                >
                    <div className="users-form-actions">
                        <AppButton
                            type="button"
                            onClick={confirmDeleteUser}
                        >
                            Yes, delete
                        </AppButton>

                        <AppButton
                            type="button"
                            variant="secondary"
                            onClick={cancelDeleteUser}
                        >
                            Cancel
                        </AppButton>
                    </div>
                </FormCard>
            )}

            <FormCard
                label="Create user"
                title="Add New User"
                description="Create a new system user with role and cooking level."
                className="users-create-card"
            >
                <form onSubmit={handleCreateUser}>
                    <div className="users-edit-grid">
                        <FormField
                            label="First Name"
                            type="text"
                            name="firstName"
                            value={newUser.firstName}
                            onChange={handleNewUserChange}
                        />

                        <FormField
                            label="Last Name"
                            type="text"
                            name="lastName"
                            value={newUser.lastName}
                            onChange={handleNewUserChange}
                        />

                        <FormField
                            label="Email"
                            type="email"
                            name="email"
                            value={newUser.email}
                            onChange={handleNewUserChange}
                        />

                        <FormField
                            label="Password"
                            type="password"
                            name="password"
                            value={newUser.password}
                            onChange={handleNewUserChange}
                        />

                        <FormField
                            label="City"
                            type="text"
                            name="city"
                            value={newUser.city}
                            onChange={handleNewUserChange}
                        />

                        <FormField
                            label="Age"
                            type="text"
                            name="age"
                            inputMode="numeric"
                            maxLength="3"
                            value={newUser.age}
                            onChange={handleNewUserChange}
                        />

                        <CustomSelect
                            label="Role"
                            name="userRole"
                            value={newUser.userRole}
                            onChange={handleNewUserChange}
                            options={ROLE_OPTIONS}
                        />

                        <CustomSelect
                            label="Cooking Level"
                            name="cookingLevel"
                            value={newUser.cookingLevel}
                            onChange={handleNewUserChange}
                            options={COOKING_LEVEL_OPTIONS}
                        />
                    </div>

                    <div className="users-form-actions">
                        <AppButton
                            type="submit"
                            disabled={creating}
                        >
                            {creating ? "Adding..." : "Add User"}
                        </AppButton>
                    </div>
                </form>
            </FormCard>

            <FormCard
                label="System users"
                title="Users Table"
            >
                <DataTable
                    columns={[
                        {
                            key: "userId",
                            label: "ID"
                        },
                        {
                            key: "firstName",
                            label: "First Name"
                        },
                        {
                            key: "lastName",
                            label: "Last Name"
                        },
                        {
                            key: "email",
                            label: "Email"
                        },
                        {
                            key: "city",
                            label: "City"
                        },
                        {
                            key: "userRole",
                            label: "Role",
                            render: (user) => (
                                <span className={`users-role-pill ${user.userRole}`}>
                                    {formatText(user.userRole)}
                                </span>
                            )
                        },
                        {
                            key: "cookingLevel",
                            label: "Cooking Level",
                            render: (user) => (
                                <span className="users-level-pill">
                                    {formatText(user.cookingLevel)}
                                </span>
                            )
                        },
                        {
                            key: "actions",
                            label: "Actions",
                            render: (user) => (
                                <div className="users-table-actions">
                                    <AppButton
                                        type="button"
                                        size="small"
                                        onClick={() => handleEditUser(user)}
                                    >
                                        Edit
                                    </AppButton>

                                    <AppButton
                                        type="button"
                                        size="small"
                                        variant="secondary"
                                        disabled={
                                            currentUser?.userId === user.userId
                                        }
                                        onClick={() => handleDeleteClick(user)}
                                    >
                                        Delete
                                    </AppButton>
                                </div>
                            )
                        }
                    ]}
                    data={users}
                />
            </FormCard>

            {editingUser && (
                <FormCard
                    label="Edit user"
                    title={`${editingUser.firstName} ${editingUser.lastName}`}
                    description="Update this user’s details and cooking preferences."
                    className="users-edit-card"
                >
                    <form onSubmit={handleSaveUser}>
                        <div className="users-edit-grid">
                            <FormField
                                label="First Name"
                                type="text"
                                value={editingUser.firstName}
                                onChange={(event) =>
                                    handleEditingFieldChange(
                                        "firstName",
                                        event.target.value
                                    )
                                }
                            />

                            <FormField
                                label="Last Name"
                                type="text"
                                value={editingUser.lastName}
                                onChange={(event) =>
                                    handleEditingFieldChange(
                                        "lastName",
                                        event.target.value
                                    )
                                }
                            />

                            <FormField
                                label="Email"
                                type="email"
                                value={editingUser.email}
                                onChange={(event) =>
                                    handleEditingFieldChange(
                                        "email",
                                        event.target.value
                                    )
                                }
                            />

                            <FormField
                                label="City"
                                type="text"
                                value={editingUser.city}
                                onChange={(event) =>
                                    handleEditingFieldChange(
                                        "city",
                                        event.target.value
                                    )
                                }
                            />

                            <FormField
                                label="Age"
                                type="text"
                                inputMode="numeric"
                                maxLength="3"
                                value={editingUser.age}
                                onChange={(event) =>
                                    handleEditingFieldChange(
                                        "age",
                                        event.target.value
                                    )
                                }
                            />

                            <CustomSelect
                                label="Role"
                                value={editingUser.userRole}
                                disabled={
                                    currentUser?.userId === editingUser.userId
                                }
                                helperText={
                                    currentUser?.userId === editingUser.userId
                                        ? "You cannot change your own role."
                                        : ""
                                }
                                onChange={(event) =>
                                    handleEditingFieldChange(
                                        "userRole",
                                        event.target.value
                                    )
                                }
                                options={ROLE_OPTIONS}
                            />

                            <CustomSelect
                                label="Cooking Level"
                                value={editingUser.cookingLevel}
                                onChange={(event) =>
                                    handleEditingFieldChange(
                                        "cookingLevel",
                                        event.target.value
                                    )
                                }
                                options={COOKING_LEVEL_OPTIONS}
                            />
                        </div>

                        <div className="users-form-actions">
                            <AppButton
                                type="submit"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </AppButton>

                            <AppButton
                                type="button"
                                variant="secondary"
                                onClick={cancelEditUser}
                            >
                                Cancel
                            </AppButton>
                        </div>
                    </form>
                </FormCard>
            )}
        </div>
    );
}

export default Users;