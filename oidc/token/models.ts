export interface UserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  phone: string;
  phone_verified: boolean;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string; 
  refresh_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
}

export interface IdToken {
  sub: string;
  iss: string;
  nonce: string;
  aud: string;
  exp: number;
  iat: number;
  sid: string;
}
