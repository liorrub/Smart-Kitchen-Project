import { useEffect, useState } from "react";
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser
} from "../services/userService";
import { validateUserManagementForm } from "../validators/userValidator";

function Users() {

    const emptyUserForm = {
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

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [newUser, setNewUser] = useState(emptyUserForm);
    const [editingUser, setEditingUser] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);

    const currentUser =
        JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        try {
            setLoading(true);

            const data = await getUsers();

            setUsers(data);
            setError("");
        }
        catch (error) {
            console.error(error);
            setError("Failed to load users.");
        }
        finally {
            setLoading(false);
        }
    }

    function clearMessages() {
        setError("");
        setMessage("");
    }

    function handleNewUserChange(event) {
        const { name, value } = event.target;

        setNewUser(previousUser => ({
            ...previousUser,
            [name]: value
        }));
    }

    function handleEditingUserChange(event) {
        const { name, value } = event.target;

        setEditingUser(previousUser => ({
            ...previousUser,
            [name]: value
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

        const validationError =
            validateUserManagementForm(userData, true);

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            await createUser(userData);

            setNewUser(emptyUserForm);
            await loadUsers();

            setMessage("User added successfully.");
        }
        catch (error) {
            console.error(error);

            setError(
                error.response?.data?.error?.message ||
                "Failed to add user."
            );
        }
    }

    function handleEditUser(user) {
        clearMessages();

        setEditingUser({
            ...user,
            password: "",
            age: user.age || ""
        });
    }

    async function handleSaveUser(event) {
        event.preventDefault();

        clearMessages();

        const userData = {
            ...editingUser,
            firstName: editingUser.firstName.trim(),
            lastName: editingUser.lastName.trim(),
            email: editingUser.email.trim(),
            city: editingUser.city.trim(),
            age: Number(editingUser.age)
        };

        const validationError =
            validateUserManagementForm(userData, false);

        if (validationError) {
            setError(validationError);
            return;
        }

        const {
            password,
            ...updateData
        } = userData;

        try {
            await updateUser(
                editingUser.userId,
                updateData
            );

            setEditingUser(null);
            await loadUsers();

            setMessage("User updated successfully.");
        }
        catch (error) {
            console.error(error);

            setError(
                error.response?.data?.error?.message ||
                "Failed to update user."
            );
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

            setMessage("User deleted successfully.");
        }
        catch (error) {
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
            <div>
                <h1>
                    Users Management
                </h1>

                <p>
                    Loading users...
                </p>
            </div>
        );
    }

    return (
        <div>
            <h1>
                Users Management
            </h1>

            {error && <p>{error}</p>}

            {message && <p>{message}</p>}

            {
                userToDelete &&
                (
                    <div>
                        <p>
                            Are you sure you want to delete
                            {" "}
                            {userToDelete.firstName}
                            {" "}
                            {userToDelete.lastName}
                            ?
                        </p>

                        <button
                            type="button"
                            onClick={confirmDeleteUser}
                        >
                            Yes, delete
                        </button>

                        <button
                            type="button"
                            onClick={cancelDeleteUser}
                        >
                            Cancel
                        </button>
                    </div>
                )
            }

            <h2>
                Add New User
            </h2>

            <form onSubmit={handleCreateUser}>
                <div>
                    <label>
                        First Name:
                    </label>

                    <input
                        type="text"
                        name="firstName"
                        value={newUser.firstName}
                        onChange={handleNewUserChange}
                    />
                </div>

                <div>
                    <label>
                        Last Name:
                    </label>

                    <input
                        type="text"
                        name="lastName"
                        value={newUser.lastName}
                        onChange={handleNewUserChange}
                    />
                </div>

                <div>
                    <label>
                        Email:
                    </label>

                    <input
                        type="text"
                        name="email"
                        value={newUser.email}
                        onChange={handleNewUserChange}
                    />
                </div>

                <div>
                    <label>
                        Password:
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={newUser.password}
                        onChange={handleNewUserChange}
                    />
                </div>

                <div>
                    <label>
                        City:
                    </label>

                    <input
                        type="text"
                        name="city"
                        value={newUser.city}
                        onChange={handleNewUserChange}
                    />
                </div>

                <div>
                    <label>
                        Age:
                    </label>

                    <input
                        type="text"
                        name="age"
                        value={newUser.age}
                        onChange={handleNewUserChange}
                    />
                </div>

                <div>
                    <label>
                        Role:
                    </label>

                    <select
                        name="userRole"
                        value={newUser.userRole}
                        onChange={handleNewUserChange}
                    >
                        <option value="user">
                            User
                        </option>

                        <option value="chef">
                            Chef
                        </option>

                        <option value="influencer">
                            Influencer
                        </option>

                        <option value="admin">
                            Admin
                        </option>
                    </select>
                </div>

                <div>
                    <label>
                        Cooking Level:
                    </label>

                    <select
                        name="cookingLevel"
                        value={newUser.cookingLevel}
                        onChange={handleNewUserChange}
                    >
                        <option value="beginner">
                            Beginner
                        </option>

                        <option value="intermediate">
                            Intermediate
                        </option>

                        <option value="advanced">
                            Advanced
                        </option>
                    </select>
                </div>

                <button type="submit">
                    Add User
                </button>
            </form>

            <hr />

            <h2>
                Existing Users
            </h2>

            <table>
                <thead>
                <tr>
                    <th>
                        ID
                    </th>

                    <th>
                        First Name
                    </th>

                    <th>
                        Last Name
                    </th>

                    <th>
                        Email
                    </th>

                    <th>
                        City
                    </th>

                    <th>
                        Role
                    </th>

                    <th>
                        Cooking Level
                    </th>

                    <th>
                        Actions
                    </th>
                </tr>
                </thead>

                <tbody>
                {
                    users.map(user => (
                        <tr key={user.userId}>
                            <td>
                                {user.userId}
                            </td>

                            <td>
                                {user.firstName}
                            </td>

                            <td>
                                {user.lastName}
                            </td>

                            <td>
                                {user.email}
                            </td>

                            <td>
                                {user.city}
                            </td>

                            <td>
                                {user.userRole}
                            </td>

                            <td>
                                {user.cookingLevel}
                            </td>

                            <td>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleEditUser(user)
                                    }
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    disabled={
                                        currentUser?.userId ===
                                        user.userId
                                    }
                                    onClick={() =>
                                        handleDeleteClick(user)
                                    }
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                }
                </tbody>
            </table>

            {
                editingUser &&
                (
                    <div>
                        <hr />

                        <h2>
                            Edit User
                        </h2>

                        <form onSubmit={handleSaveUser}>
                            <div>
                                <label>
                                    First Name:
                                </label>

                                <input
                                    type="text"
                                    name="firstName"
                                    value={editingUser.firstName}
                                    onChange={handleEditingUserChange}
                                />
                            </div>

                            <div>
                                <label>
                                    Last Name:
                                </label>

                                <input
                                    type="text"
                                    name="lastName"
                                    value={editingUser.lastName}
                                    onChange={handleEditingUserChange}
                                />
                            </div>

                            <div>
                                <label>
                                    Email:
                                </label>

                                <input
                                    type="text"
                                    name="email"
                                    value={editingUser.email}
                                    onChange={handleEditingUserChange}
                                />
                            </div>

                            <div>
                                <label>
                                    City:
                                </label>

                                <input
                                    type="text"
                                    name="city"
                                    value={editingUser.city}
                                    onChange={handleEditingUserChange}
                                />
                            </div>

                            <div>
                                <label>
                                    Age:
                                </label>

                                <input
                                    type="text"
                                    name="age"
                                    value={editingUser.age}
                                    onChange={handleEditingUserChange}
                                />
                            </div>

                            <div>
                                <label>
                                    Role:
                                </label>

                                <select
                                    name="userRole"
                                    value={editingUser.userRole}
                                    disabled={
                                        currentUser?.userId ===
                                        editingUser.userId
                                    }
                                    onChange={handleEditingUserChange}
                                >
                                    <option value="user">
                                        User
                                    </option>

                                    <option value="chef">
                                        Chef
                                    </option>

                                    <option value="influencer">
                                        Influencer
                                    </option>

                                    <option value="admin">
                                        Admin
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label>
                                    Cooking Level:
                                </label>

                                <select
                                    name="cookingLevel"
                                    value={editingUser.cookingLevel}
                                    onChange={handleEditingUserChange}
                                >
                                    <option value="beginner">
                                        Beginner
                                    </option>

                                    <option value="intermediate">
                                        Intermediate
                                    </option>

                                    <option value="advanced">
                                        Advanced
                                    </option>
                                </select>
                            </div>

                            <button type="submit">
                                Save Changes
                            </button>

                            <button
                                type="button"
                                onClick={cancelEditUser}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                )
            }
        </div>
    );
}

export default Users;