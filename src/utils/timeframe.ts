export interface TimeframeOption {
  label: string;
  value: string;
}

export const timeframeOptions: TimeframeOption[] = [
  { label: "All Time", value: "all" },
  { label: "1 Day", value: "1D" },
  { label: "7 Days", value: "7D" },
  { label: "14 Days", value: "14D" },
  { label: "30 Days", value: "30D" },
  { label: "1 Month", value: "1M" },
  { label: "3 Months", value: "3M" },
  { label: "6 Months", value: "6M" },
  { label: "9 Months", value: "9M" },
  { label: "1 Year", value: "1Y" },
];

export interface TimeframeDates {
  startDate: string;
  endDate: string;
}

export function calculateTimeframeDates(
  timeframe: string
): TimeframeDates | null {
  if (timeframe === "all") {
    return null; // No date range for "all"
  }

  const now = new Date();
  const endDate = new Date(now);
  endDate.setHours(23, 59, 59, 999);

  const startDate = new Date(now);
  startDate.setHours(0, 0, 0, 0);

  switch (timeframe) {
    case "1D":
      // Today only
      break;
    case "7D":
      startDate.setDate(startDate.getDate() - 6); // 7 days including today
      break;
    case "14D":
      startDate.setDate(startDate.getDate() - 13); // 14 days including today
      break;
    case "30D":
      startDate.setDate(startDate.getDate() - 29); // 30 days including today
      break;
    case "1M":
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case "3M":
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case "6M":
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case "9M":
      startDate.setMonth(startDate.getMonth() - 9);
      break;
    case "1Y":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    default:
      return null;
  }

  return {
    endDate: endDate.toISOString(),
    startDate: startDate.toISOString(),
  };
}
