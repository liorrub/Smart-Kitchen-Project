export function getResponseData(response) {
    return response.data?.data || response.data || [];
}

export function getResponseDataOrBody(response) {
    return response.data?.data || response.data;
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
