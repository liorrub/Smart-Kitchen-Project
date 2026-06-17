export function toLocalDateKey(date) {
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);

    return localDate.toISOString().slice(0, 10);
}
