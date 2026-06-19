export function convertToTitleCase(input: string): string {
  return input
    .toLowerCase() // convert to lowercase
    .split("_") // split by underscore
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize each word
    .join(" "); // join with space
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateString);
  }
}
