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

export interface Claims {
  sub: string;
  iss: string;
  nonce: string;
  aud: string;
  exp: number;
  iat: number;
  sid: string;
}

export interface JwtHeader {
  kid: string;
  alg: string;
}


export interface LambdaResponse {
  statusCode: number;
  body: string;
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

export interface Response {
  statusCode: number;
  body: string;
}