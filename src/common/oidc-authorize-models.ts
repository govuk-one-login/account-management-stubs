export interface TxmaEvent {
  event_id: string;
  timestamp: number;
  event_name: string;
  client_id: string;
  user: UserData;
}

export interface UserData {
  user_id: string;
  session_id: string;
}
