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

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
}

export interface UserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  phone_number: string;
  phone_number_verified: boolean;
  updated_at: string;
}
