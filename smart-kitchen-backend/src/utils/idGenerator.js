// Generate the next sequential numeric ID
function generateId(items, idField) {
    if (!items || items.length === 0) {
        return 1;
    }

    const maxId = Math.max(
        ...items.map(item => item[idField])
    );

    return maxId + 1;
}

module.exports = {
    generateId
};