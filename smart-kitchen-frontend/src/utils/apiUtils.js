export function getResponseData(response) {
    return response.data?.data || response.data || [];
}
