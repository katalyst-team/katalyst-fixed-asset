const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const pad2 = (value: number): string => String(value).padStart(2, "0");

export const formatDisplayTimestamp = (
  timestamp: string | null | undefined,
): string => {
  if (!timestamp) return "-";

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) return timestamp;

  const day = pad2(parsed.getDate());
  const month = INDONESIAN_MONTHS[parsed.getMonth()] || "";
  const year = parsed.getFullYear();
  const hours = pad2(parsed.getHours());
  const minutes = pad2(parsed.getMinutes());
  const seconds = pad2(parsed.getSeconds());

  return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
};
