export interface ScanRfidsResponse {
  count: number;
  epcs: string[];
  message: string;
  success: boolean;
}

export interface DesktopReaderStatusResponse {
  connected: boolean;
  status: string;
  timestamp: string;
}
