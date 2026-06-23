function getCurrentDateTime() {
    return new Date().toISOString();
}

// Check whether the given expiry date has already passed
function isExpired(expiryDate) {
    return new Date(expiryDate) < new Date();
}

module.exports = {
    getCurrentDateTime,
    isExpired
};