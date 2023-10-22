export default function getStartOfDay(date: string): Date {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
  return startOfDay;
}
