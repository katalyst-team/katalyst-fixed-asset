export interface ScanRfidsResponse {
  success: boolean;
  message: string;
  epcs: string[];
  count: number;
}

export interface DesktopReaderStatusResponse {
  connected: boolean;
  status: string;
  timestamp: string;
}
