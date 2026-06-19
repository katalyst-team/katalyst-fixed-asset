export interface UserPreferencesType {
  theme: "light" | "dark" | "system";
  color_theme: "blue" | "green" | "indigo" | "slate" | "purple";
  density: "comfortable" | "compact";
  dismissed_alerts: string[];
}

export interface GetUserPreferencesParams {
  userId: string;
}

export interface GetUserPreferencesResponse {
  theme: "light" | "dark" | "system";
  color_theme: "blue" | "green" | "indigo" | "slate" | "purple";
  density: "comfortable" | "compact";
  dismissed_alerts: string[];
}

export interface UpdateUserPreferencesParams {
  userId: string;
  theme?: "light" | "dark" | "system";
  color_theme?: "blue" | "green" | "indigo" | "slate" | "purple";
  density?: "comfortable" | "compact";
  dismiss_alert_id?: string;
}

export interface UpdateUserPreferencesResponse {
  theme?: "light" | "dark" | "system";
  color_theme?: "blue" | "green" | "indigo" | "slate" | "purple";
  density?: "comfortable" | "compact";
  dismissed_alerts?: string[];
}
