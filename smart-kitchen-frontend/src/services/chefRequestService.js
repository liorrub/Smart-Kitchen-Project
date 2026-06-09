import axios from "axios";

const BASE_URL = "http://localhost:3000/api";

function getAuthHeaders() {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    return {
        "x-user-id": storedUser?.userId,
        "x-user-role": storedUser?.userRole || storedUser?.role
    };
}

function getResponseData(response) {
    return response.data?.data ?? null;
}

export async function submitChefRequest(reason) {
    const response = await axios.post(
        `${BASE_URL}/chef-requests`,
        { reason },
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

export async function getChefRequests() {
    const response = await axios.get(
        `${BASE_URL}/chef-requests`,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response) || [];
}

export async function getMyChefRequest() {
    const response = await axios.get(
        `${BASE_URL}/chef-requests/my`,
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

export async function approveChefRequest(requestId) {
    const response = await axios.put(
        `${BASE_URL}/chef-requests/${requestId}/approve`,
        {},
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}

export async function rejectChefRequest(requestId) {
    const response = await axios.put(
        `${BASE_URL}/chef-requests/${requestId}/reject`,
        {},
        { headers: getAuthHeaders() }
    );
    return getResponseData(response);
}
