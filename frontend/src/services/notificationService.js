import axios from "axios";
import { API_BASE_URL } from "../utils/apiConfig";
import { getAuthHeaders } from "../utils/authUtils";
import { getResponseDataOrBody } from "../utils/apiUtils";

export async function getNotifications({ limit = 20, unreadOnly = false } = {}) {
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: getAuthHeaders(),
        params: { limit, unreadOnly }
    });
    return getResponseDataOrBody(response) || [];
}

export async function getUnreadNotificationCount() {
    const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`, {
        headers: getAuthHeaders()
    });
    const data = getResponseDataOrBody(response);
    return data?.count ?? 0;
}

export async function markNotificationRead(notificationId) {
    const response = await axios.put(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        { headers: getAuthHeaders() }
    );
    return getResponseDataOrBody(response);
}

export async function markAllNotificationsRead() {
    const response = await axios.put(
        `${API_BASE_URL}/notifications/read-all`,
        {},
        { headers: getAuthHeaders() }
    );
    return getResponseDataOrBody(response);
}
