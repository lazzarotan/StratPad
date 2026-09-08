/*
* FILE: page.js
* PROJECT: SET Capstone - Stratpad
* AUTHORS:
* DATE: 03 - 19 - 2026
* DESCRIPTION: Admin dashboard page. Only accessible to users whose email is
*              in the ADMIN_EMAILS list in adminConfiguration.js.
*              Shows all users and dashboards, with options to delete or change roles.
*/

"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { isAdmin } from "@/lib/adminConfiguration";
import "./admin.css";

/*
* FUNCTION: AdminPage
* PARAMETERS: none
* RETURNS: JSX.Element - the admin dashboard page
* DESCRIPTION: Main component for the admin dashboard page.
*              Displays two tabs: one for managing users and one for managing dashboards.
*/
export default function AdminPage() {
    const { data: session, isPending } = useSession();

    const [users, setUsers] = useState([]);
    const [dashboards, setDashboards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Notes which tab is active: "users" or "dashboards"
    const [activeTab, setActiveTab] = useState("users");

    // Load all data on mount if user is an admin.
    // The middleware will prevent non-admin users from reaching this point.
    useEffect(() => {
        /*
        * FUNCTION: fetchAdminData
        * PARAMETERS: none
        * RETURNS: none
        * DESCRIPTION: Fetches all users and dashboards from the admin API
        *              and stores them in state.
        */
        async function fetchAdminData() {
            try {
                const res = await fetch("/api/admin");
                const data = await res.json();

                if (!data.success) {
                    setError("Failed to load admin data.");
                    return;
                }

                setUsers(data.users);
                setDashboards(data.dashboards);
            }
            catch (err) {
                setError("Something went wrong.");
            }
            finally {
                setLoading(false);
            }
        }

        // Only fetch if session is confirmed and user is an admin
        if (!isPending && session) {
            fetchAdminData();
        }

    }, [isPending, session]);


    /*
    * FUNCTION: handleDeleteUser
    * PARAMETERS: userId - the ID of the user to delete
    * RETURNS: none
    * DESCRIPTION: Sends a DELETE request to remove a user. Removes them
    *              from local state on success so the UI updates immediately.
    *              Deleting a user also deletes all their dashboards due to
    *              the CASCADE rule in the database schema.
    */
    async function handleDeleteUser(userId) {

        const confirmed = window.confirm("Are you sure you want to delete this user? This will also delete all their dashboards.");
        if (!confirmed)
        {

            return;

        }

        const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });

        // On success, remove the deleted user from state so they disappear from the UI immediately
        if (res.ok) {

            setUsers(users.filter(u => u.id !== userId));
            setDashboards(dashboards.filter(d => d.owner?.email !== users.find(u => u.id === userId)?.email));

        }
        else {

            alert("Failed to delete user.");

        }

    }


    /*
    * FUNCTION: handleChangeRole
    * PARAMETERS: userId - the ID of the user to update
    *             newRole - the new role to assign ("user", "moderator", "admin")
    * RETURNS: none
    * DESCRIPTION: Sends a PATCH request to update the user's role.
    *              Updates local state on success so the UI reflects the change
    *              without needing a full page reload.
    */
    async function handleChangeRole(userId, newRole) {

        const res = await fetch(`/api/admin/users/${userId}`,
            {

                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole })

            });

        // On success, update the user's role in local state
        if (res.ok)
        {

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

        }
        else
        {

            alert("Failed to update role.");

        }
    }


    /*
    * FUNCTION: handleDeleteDashboard
    * PARAMETERS: dashboardId - the ID of the dashboard to delete
    * RETURNS: none
    * DESCRIPTION: Sends a DELETE request to remove a dashboard.
    *              Removes it from local state on success so the UI
    *              updates immediately without a full page reload.
    */
    async function handleDeleteDashboard(dashboardId) {
        const confirmed = window.confirm("Are you sure you want to delete this dashboard?");
        if (!confirmed)
        {

            return;

        }

        const res = await fetch(`/api/admin/dashboards/${dashboardId}`, { method: "DELETE" });

        // On success, remove the deleted dashboard from state so it disappears from the UI immediately
        if (res.ok) {

            setDashboards(dashboards.filter(d => d.dashboardId !== dashboardId));

        }
        else {

            alert("Failed to delete dashboard.");

        }
    }


    // Show loading message while session is being checked
    if (isPending || loading) {

        return <div className="admin-loading">Loading...</div>;

    }

    // Double check on the client side (middleware is the real guard)
    if (!session || !isAdmin(session.user.email)) {

        return <div className="admin-denied">Access Denied.</div>;

    }

    if (error) {

        return <div className="admin-error">{error}</div>;

    }

    return (

        <div className="admin-page">

            <h1 className="admin-title">Admin Panel</h1>
            <p className="admin-subtitle">Logged in as: {session.user.email}</p>

            {/* Tab buttons */}
            <div className="admin-tabs">
                <button
                    className={activeTab === "users" ? "admin-tab admin-tab--active" : "admin-tab"}
                    onClick={() => setActiveTab("users")}
                >
                    Users ({users.length})
                </button>
                <button
                    className={activeTab === "dashboards" ? "admin-tab admin-tab--active" : "admin-tab"}
                    onClick={() => setActiveTab("dashboards")}
                >
                    Dashboards ({dashboards.length})
                </button>
            </div>

            {/* Users Table */}
            {activeTab === "users" && (
                <div className="admin-section">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Username</th>
                                <th>Dashboards</th>
                                <th>Joined</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.username ?? "-"}</td>
                                    <td>{user._count.dashboards}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <select
                                            className="admin-role-select"
                                            value={user.role ?? "user"}
                                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                        >
                                            <option value="user">user</option>
                                            <option value="admin">admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="admin-btn admin-btn--danger"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Dashboards Table */}
            {activeTab === "dashboards" && (
                <div className="admin-section">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Owner</th>
                                <th>Public</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboards.map(dashboard => (
                                <tr key={dashboard.dashboardId}>
                                    <td>{dashboard.title}</td>
                                    <td>{dashboard.owner?.name} ({dashboard.owner?.email})</td>
                                    <td>{dashboard.isPublic ? "Yes" : "No"}</td>
                                    <td>{new Date(dashboard.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="admin-btn admin-btn--danger"
                                            onClick={() => handleDeleteDashboard(dashboard.dashboardId)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}