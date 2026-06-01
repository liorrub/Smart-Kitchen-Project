import { useEffect, useState } from "react";
import { getUsers, updateUser } from "../services/userService";
import DataTable from "../components/DataTable";

function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Currently selected user for editing
    const [editingUser, setEditingUser] = useState(null);

    // Currently logged in user
    const currentUser = JSON.parse(localStorage.getItem("user"));

    // Load all users when the page is first rendered
    useEffect(() => {

        // Fetch users from backend
        async function loadUsers() {
            try {
                const data =
                    await getUsers();

                setUsers(data);
            }

            catch {
                setError(
                    "Failed to load users"
                );

            }
            finally {
                setLoading(false);
            }
        }

        loadUsers();

    }, []);

    // Open edit form for selected user
    function handleEditUser(user) {
        setEditingUser(user);
    }

    // Save updated user information
    async function handleSaveUser() {
        try {
            await updateUser(
                editingUser.userId,
                editingUser
            );

            // Reload users after update
            const updatedUsers = await getUsers();
            setUsers(updatedUsers);
            setEditingUser(null);
        }
        catch {
            alert("Failed to update user");
        }
    }

    if (loading) {
        return (
            <p>
                Loading...
            </p>
        );
    }

    if (error) {
        return (
            <p>
                {error}
            </p>
        );
    }

    return (
        <div>
            <h1>
                Users Management
            </h1>

            {/* Users table */}
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
                        label: "Role"
                    },

                    {
                        key: "cookingLevel",
                        label: "Cooking Level"
                    },

                    // Action buttons for each user
                    {
                        key: "actions",
                        label: "Actions",

                        render: (user) => (

                            <button
                                type="button"
                                onClick={
                                    () =>
                                        handleEditUser(
                                            user
                                        )
                                }
                            >
                                Edit
                            </button>

                        )
                    }

                ]}
                data={users}
            />

            {/* User edit form */}
            {
                editingUser && (

                    <div>

                        <h2>
                            Edit User
                        </h2>

                        <p>
                            First Name
                        </p>

                        <input
                            type="text"
                            value={
                                editingUser.firstName
                            }
                            onChange={
                                (event) =>
                                    setEditingUser({
                                        ...editingUser,
                                        firstName:
                                        event.target.value
                                    })
                            }
                        />

                        <p>
                            Last Name
                        </p>

                        <input
                            type="text"
                            value={
                                editingUser.lastName
                            }
                            onChange={
                                (event) =>
                                    setEditingUser({
                                        ...editingUser,
                                        lastName:
                                        event.target.value
                                    })
                            }
                        />

                        <p>
                            Email
                        </p>

                        <input
                            type="email"
                            value={
                                editingUser.email
                            }
                            onChange={
                                (event) =>
                                    setEditingUser({
                                        ...editingUser,
                                        email:
                                        event.target.value
                                    })
                            }
                        />

                        <p>
                            City
                        </p>

                        <input
                            type="text"
                            value={
                                editingUser.city
                            }
                            onChange={
                                (event) =>
                                    setEditingUser({
                                        ...editingUser,
                                        city:
                                        event.target.value
                                    })
                            }
                        />

                        <p>
                            Role
                        </p>

                        <select
                            value={
                                editingUser.userRole
                            }
                            disabled={
                                currentUser.userId ===
                                editingUser.userId
                            }
                            onChange={
                                (event) =>
                                    setEditingUser({
                                        ...editingUser,
                                        userRole:
                                        event.target.value
                                    })
                            }
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

                        <p>
                            Cooking Level
                        </p>

                        <select
                            value={
                                editingUser.cookingLevel
                            }
                            onChange={
                                (event) =>
                                    setEditingUser({
                                        ...editingUser,
                                        cookingLevel:
                                        event.target.value
                                    })
                            }
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

                        <br />
                        <br />

                        {/* Save user changes */}
                        <button
                            type="button"
                            onClick={handleSaveUser}
                        >
                            Save Changes
                        </button>

                        {/* Close edit form without saving */}
                        <button
                            type="button"
                            onClick={() =>
                                setEditingUser(null)
                            }
                        >
                            Cancel
                        </button>

                    </div>

                )
            }

        </div>

    );
}

export default Users;