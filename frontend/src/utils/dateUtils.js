// Convert a Date to a YYYY-MM-DD string in the user's local timezone.
// The timezone offset is subtracted before calling toISOString so the string
// reflects local midnight rather than UTC midnight.
export function toLocalDateKey(date) {
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);

    return localDate.toISOString().slice(0, 10);
}
