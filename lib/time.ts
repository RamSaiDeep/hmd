export function formatTimeTo12Hour(time24: string | null | undefined): string {
  if (!time24) return "—";
  if (time24.toUpperCase().includes("AM") || time24.toUpperCase().includes("PM")) {
    return time24;
  }
  const parts = time24.split(":");
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    if (!isNaN(hours)) {
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 should be 12
      return `${hours}:${minutes} ${ampm}`;
    }
  }
  return time24;
}

export function convertTo12HourFormat(time24: string): string {
  if (!time24) return "";
  const [hoursStr, minutesStr] = time24.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return `${hours}:${minutes} ${ampm}`;
}
