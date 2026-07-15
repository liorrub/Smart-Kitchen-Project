import "./Users.css";

import { useEffect, useMemo, useState } from "react";

import PageErrorState from "../components/PageErrorState";
import AppButton from "../components/AppButton";
import AvatarPicker from "../components/AvatarPicker";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import CustomSelect from "../components/CustomSelect";
import DataTable from "../components/DataTable";
import FormCard from "../components/FormCard";
import FormField from "../components/FormField";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";

import { AVATAR_DEFAULT } from "../utils/avatarCatalog";

import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from "../services/userService";

import { validateUserManagementForm } from "../validators/userValidator";
import { formatText } from "../utils/formatUtils";
import { TEXT_LIMITS } from "../constants/textLimits";
import { CITY_OPTIONS, COOKING_LEVEL_OPTIONS } from "../constants/options";
import CityPicker from "../components/CityPicker";

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
    { value: "user", label: "User" },
    { value: "chef", label: "Chef" },
    { value: "influencer", label: "Foodie" },
    { value: "admin", label: "Admin" }
];

const EMPTY_USER_FORM = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    username: "",
    avatarKey: AVATAR_DEFAULT,
    city: "",
    age: "",
    userRole: "user",
    cookingLevel: "beginner",
    preferences: []
};

function Users() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState(EMPTY_USER_FORM);
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const currentUser = JSON.parse(
        sessionStorage.getItem("user") || "null"
    );

    // Load all users from the server when the page mounts.
    useEffect(() => {
        loadUsers();
    }, []);

    // Prevent page scrolling while any user modal (create, edit, or delete) is open.
    useEffect(() => {
        const isOpen = isCreateModalOpen || !!editingUser || !!userToDelete;
        if (!isOpen) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isCreateModalOpen, editingUser, userToDelete]);

    // Fetch all users from the server and update the table.
    async function loadUsers() {
        try {
            setLoading(true);
            setError("");

            const data = await getUsers();

            setUsers(Array.isArray(data) ? data : []);
            setCurrentPage(1);
        } catch (error) {
            console.error(error);
            setError(
                !error.response
                    ? "Unable to connect to the server. Please try again in a few moments."
                    : "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    }

    const sortedUsers = useMemo(
        () => [...users].sort((a, b) =>
            a.firstName.localeCompare(b.firstName) ||
            a.lastName.localeCompare(b.lastName)
        ),
        [users]
    );

    const totalPages = Math.max(1, Math.ceil(sortedUsers.length / PAGE_SIZE));
    const paginatedUsers = useMemo(
        () => sortedUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [sortedUsers, currentPage]
    );

    function clearMessages() {
        setError("");
        setSuccess("");
    }

    function openCreateModal() {
        clearMessages();
        setEditingUser(null);
        setUserToDelete(null);
        setNewUser(EMPTY_USER_FORM);
        setIsCreateModalOpen(true);
    }

    function closeCreateModal() {
        setIsCreateModalOpen(false);
        setNewUser(EMPTY_USER_FORM);
        clearMessages();
    }

    // Update the create form, stripping non-digit characters from the age field.
    function handleNewUserChange(event) {
        const { name, value } = event.target;

        setNewUser((previousUser) => ({
            ...previousUser,
            [name]: name === "age"
                ? value.replace(/\D/g, "")
                : value
        }));
    }

    // Open the edit modal pre-populated with the selected user's current data.
    function handleEditUser(user) {
        clearMessages();
        setIsCreateModalOpen(false);
        setUserToDelete(null);

        setEditingUser({
            ...user,
            password: "",
            age: user.age || ""
        });
    }

    // Update a single field in the currently-edited user, stripping non-digits from age.
    function handleEditingFieldChange(fieldName, value) {
        setEditingUser((previousUser) => ({
            ...previousUser,
            [fieldName]: fieldName === "age"
                ? value.replace(/\D/g, "")
                : value
        }));
    }

    // Validate and submit the create user form, then reload the table on success.
    async function handleCreateUser(event) {
        event.preventDefault();

        clearMessages();

        const userData = {
            ...newUser,
            firstName: newUser.firstName.trim(),
            lastName: newUser.lastName.trim(),
            email: newUser.email.trim(),
            username: newUser.username.trim().toLowerCase(),
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
            setIsCreateModalOpen(false);

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

    // Validate and submit the edit user form. Prevents changing the role of the currently logged-in admin.
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
            preferences: editingUser.preferences || [],
            avatarKey: editingUser.avatarKey,
            username: editingUser.username?.trim().toLowerCase() || ""
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

    // Open the delete confirmation modal for the selected user.
    function handleDeleteClick(user) {
        clearMessages();
        setEditingUser(null);
        setIsCreateModalOpen(false);
        setUserToDelete(user);
    }

    // Delete the selected user on the server and reload the table on success.
    async function confirmDeleteUser() {
        if (!userToDelete) {
            return;
        }

        clearMessages();

        try {
            setDeleting(true);

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
        } finally {
            setDeleting(false);
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
                <PageErrorState
                    title="Users Error"
                    message={error}
                    onRetry={loadUsers}
                />
            </div>
        );
    }

    return (
        <div className="users-page">
            <MessageModal
                type="success"
                title="Success"
                message={success}
                buttonText="Great"
                onClose={() => setSuccess("")}
            />

            <MessageModal
                type="error"
                title="Please check the form"
                message={error}
                buttonText="OK, got it"
                onClose={() => setError("")}
            />

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

            <FormCard
                label="Create user"
                title="Need to add a new user?"
                className="users-create-cta"
                actions={
                    <AppButton
                        type="button"
                        size="large"
                        onClick={openCreateModal}
                    >
                        + Add User
                    </AppButton>
                }
            />

            {isCreateModalOpen && (
                <div
                    className="users-modal-overlay"
                    onClick={closeCreateModal}
                >
                    <div
                        className="users-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="users-modal-close"
                            onClick={closeCreateModal}
                            aria-label="Close add user modal"
                        >
                            ×
                        </button>

                        <div className="users-modal-body">
                        <FormCard
                            label="Create user"
                            title="Add New User"
                            description="Fill all required details and choose the user's role."
                            className="users-create-card users-modal-card"
                            actions={
                                <>
                                    <AppButton
                                        type="submit"
                                        form="create-user-form"
                                        disabled={creating}
                                    >
                                        {creating ? "Adding..." : "Add User"}
                                    </AppButton>

                                    <AppButton
                                        type="button"
                                        variant="secondary"
                                        onClick={closeCreateModal}
                                    >
                                        Cancel
                                    </AppButton>
                                </>
                            }
                        >
                            <form
                                id="create-user-form"
                                onSubmit={handleCreateUser}
                            >
                                <div className="users-edit-grid">
                                    <FormField
                                        label="First Name"
                                        type="text"
                                        name="firstName"
                                        value={newUser.firstName}
                                        onChange={handleNewUserChange}
                                        maxLength={TEXT_LIMITS.firstName}
                                        showCounter
                                    />

                                    <FormField
                                        label="Last Name"
                                        type="text"
                                        name="lastName"
                                        value={newUser.lastName}
                                        onChange={handleNewUserChange}
                                        maxLength={TEXT_LIMITS.lastName}
                                        showCounter
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
                                        label="Username"
                                        type="text"
                                        name="username"
                                        placeholder="e.g. lior_99 (letters, numbers, underscore)"
                                        value={newUser.username}
                                        onChange={handleNewUserChange}
                                        maxLength={TEXT_LIMITS.username}
                                        showCounter
                                    />

                                    <CityPicker
                                        label="City"
                                        name="city"
                                        value={newUser.city}
                                        onChange={handleNewUserChange}
                                        cities={CITY_OPTIONS}
                                        placeholder="Search or select city..."
                                        maxLength={TEXT_LIMITS.city}
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

                                <AvatarPicker
                                    value={newUser.avatarKey}
                                    onChange={(key) =>
                                        setNewUser(prev => ({ ...prev, avatarKey: key }))
                                    }
                                />
                            </form>
                        </FormCard>
                        </div>
                    </div>
                </div>
            )}

            {editingUser && (
                <div
                    className="users-modal-overlay"
                    onClick={cancelEditUser}
                >
                    <div
                        className="users-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="users-modal-close"
                            onClick={cancelEditUser}
                            aria-label="Close edit user modal"
                        >
                            ×
                        </button>

                        <div className="users-modal-body">
                        <FormCard
                            label="Edit user"
                            title={`${editingUser.firstName} ${editingUser.lastName}`}
                            description="Update this user’s details and cooking preferences."
                            className="users-edit-card users-modal-card"
                            actions={
                                <>
                                    <AppButton
                                        type="submit"
                                        form="edit-user-form"
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
                                </>
                            }
                        >
                            <form
                                id="edit-user-form"
                                onSubmit={handleSaveUser}
                            >
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
                                        maxLength={TEXT_LIMITS.firstName}
                                        showCounter
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
                                        maxLength={TEXT_LIMITS.lastName}
                                        showCounter
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
                                        label="Username"
                                        type="text"
                                        value={editingUser.username || ""}
                                        placeholder="e.g. lior_99"
                                        onChange={(event) =>
                                            handleEditingFieldChange(
                                                "username",
                                                event.target.value
                                            )
                                        }
                                        maxLength={TEXT_LIMITS.username}
                                        showCounter
                                    />

                                    <CityPicker
                                        label="City"
                                        name="city"
                                        value={editingUser.city}
                                        onChange={(event) =>
                                            handleEditingFieldChange(
                                                "city",
                                                event.target.value
                                            )
                                        }
                                        cities={CITY_OPTIONS}
                                        placeholder="Search or select city..."
                                        maxLength={TEXT_LIMITS.city}
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
                                        name="userRole"
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
                                        name="cookingLevel"
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

                                <AvatarPicker
                                    value={editingUser.avatarKey}
                                    onChange={(key) =>
                                        setEditingUser(prev => ({ ...prev, avatarKey: key }))
                                    }
                                />
                            </form>
                        </FormCard>
                        </div>
                    </div>
                </div>
            )}

            {userToDelete && (
                <ConfirmDeleteModal
                    label="Delete user"
                    description={`Delete ${userToDelete.firstName} ${userToDelete.lastName}? This action cannot be undone.`}
                    isDeleting={deleting}
                    onConfirm={confirmDeleteUser}
                    onCancel={cancelDeleteUser}
                />
            )}

            <FormCard
                label="System users"
                title="Users Table"
            >
                <DataTable
                    columns={[
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
                                        variant="danger"
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
                    data={paginatedUsers}
                />

                {totalPages > 1 && (
                    <div className="users-pagination">
                        <button
                            type="button"
                            className="users-pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            ← Previous
                        </button>
                        <span className="users-pagination-info">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            type="button"
                            className="users-pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </FormCard>
        </div>
    );
}

export default Users;
