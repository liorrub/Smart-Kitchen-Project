// Extract the inner data array from a backend response. Falls back to [] so callers always get an array.
export function getResponseData(response) {
    return response.data?.data || response.data || [];
}

// Like getResponseData but without the [] fallback — used for single-object responses.
export function getResponseDataOrBody(response) {
    return response.data?.data || response.data;
}

// Access data.data directly with no fallback — use only when a successful response with data is guaranteed.
export function getNestedResponseData(response) {
    return response.data.data;
}

export function getNestedResponseDataOrEmptyArray(response) {
    return response.data.data || [];
}

export function getErrorMessage(error, fallbackMessage) {
    const responseData = error.response?.data;

    if (typeof responseData?.error?.message === "string") {
        return responseData.error.message;
    }

    if (typeof responseData?.message === "string") {
        return responseData.message;
    }

    if (typeof responseData?.error === "string") {
        return responseData.error;
    }

    if (typeof error?.message === "string") {
        return error.message;
    }

    return fallbackMessage;
}
