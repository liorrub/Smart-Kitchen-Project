import axios from "axios";

import { getAuthHeaders } from "../utils/authUtils";
import { API_BASE_URL } from "../utils/apiConfig";
import { getNestedResponseData } from "../utils/apiUtils";

// Submit a new chef role request with a reason message.
export async function submitChefRequest(reason) {
    const response = await axios.post(
        `${API_BASE_URL}/chef-requests`,
        { reason },
        { headers: getAuthHeaders() }
    );
    return getNestedResponseData(response);
}

// Fetch all pending chef requests (admin only).
export async function getChefRequests() {
    const response = await axios.get(
        `${API_BASE_URL}/chef-requests`,
        { headers: getAuthHeaders() }
    );
    return getNestedResponseData(response) || [];
}

// Fetch the current user's most recent chef request to check its status.
export async function getMyChefRequest() {
    const response = await axios.get(
        `${API_BASE_URL}/chef-requests/my`,
        { headers: getAuthHeaders() }
    );
    return getNestedResponseData(response);
}

// Approve a pending chef request and grant the chef role to the requester.
export async function approveChefRequest(requestId) {
    const response = await axios.put(
        `${API_BASE_URL}/chef-requests/${requestId}/approve`,
        {},
        { headers: getAuthHeaders() }
    );
    return getNestedResponseData(response);
}

// Reject a pending chef request.
export async function rejectChefRequest(requestId) {
    const response = await axios.put(
        `${API_BASE_URL}/chef-requests/${requestId}/reject`,
        {},
        { headers: getAuthHeaders() }
    );
    return getNestedResponseData(response);
}
