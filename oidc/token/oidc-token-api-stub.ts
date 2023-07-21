import { v4 as uuid } from "uuid";
import { IdToken, TokenResponse, UserInfo } from "./models";

export interface LambdaResponse {
  statusCode: number;
  body: string;
}

const newUserInfo = (): UserInfo => ({
  sub: uuid(),
  email: "test@test.com",
  email_verified: true,
  phone: "1234567890",
  phone_verified: true,
  updated_at: Date.now().toString(),
});

const newIdToken = (): IdToken => ({
  sub: "urn:fdc:gov.uk:2022:" + uuid(),
  iss: "https://oidc-stub.home.account.gov.uk",
  nonce: , // get from input params
  aud: , //client ID
  exp: epochDateNow() +  3600,
  iat: epochDateNow(),
  sid: uuid(),
});

const epochDateNow = (): number => (
  Math.round(Date.now() / 1000)
);

export const handler = async () => {
  const tokenResponse = (): TokenResponse => ({
    access_token: "123ABC",
    refresh_token: "456DEF",
    token_type: "Bearer", 
    expires_in: 3600,
    id_token: ,
  })

  return {
    statusCode: 200,
    body: JSON.stringify(tokenResponse),
  };
};