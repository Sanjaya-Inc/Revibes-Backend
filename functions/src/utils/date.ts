export function isDateToday(someDate: Date): boolean {
  const today = new Date(); // Get the current date and time

  // Compare year, month, and day
  return (
    someDate.getDate() === today.getDate() && // Day of the month (1-31)
    someDate.getMonth() === today.getMonth() && // Month (0-11)
    someDate.getFullYear() === today.getFullYear() // Full year (e.g., 2025)
  );
}
