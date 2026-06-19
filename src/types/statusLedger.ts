export interface StatusType {
  id: string;
  name: string;
}

export interface StatusLedgerResponse {
  data: {
    statuses: StatusType[] | null;
  };
}
