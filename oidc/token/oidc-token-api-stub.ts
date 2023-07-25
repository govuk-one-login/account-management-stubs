import { v4 as uuid } from "uuid";
import {
  IdToken,
  JwtHeader,
  Response,
  TokenResponse,
  UserInfo,
} from "./models";
import { sign } from "jsonwebtoken";

// const newUserInfo = (): UserInfo => ({
//   sub: uuid(),
//   email: "test@test.com",
//   email_verified: true,
//   phone: "1234567890",
//   phone_verified: true,
//   updated_at: Date.now().toString(),
// });

const newClaims = (OIDC_CLIENT_ID: string): IdToken => ({
  sub: "urn:fdc:gov.uk:2022:" + uuid(),
  iss: "https://oidc-stub.home.account.gov.uk",
  nonce: "to fill in", // get from input params
  aud: OIDC_CLIENT_ID,
  exp: epochDateNow() + 3600,
  iat: epochDateNow(),
  sid: uuid(),
});

const newJwtHeader = (): JwtHeader => ({
  kid: "to fill in", /// insert key identifier when key has been made
  alg: "ES256",
});

const epochDateNow = (): number => Math.round(Date.now() / 1000);

export const handler = async (): Promise<Response> => {
  const { OIDC_CLIENT_ID } = process.env;

  if (typeof OIDC_CLIENT_ID === "undefined") {
    throw new Error("OIDC_CLIENT_ID environemnt variable is null");
  }

  const jwtHeader: JwtHeader = newJwtHeader();
  const headerEncoded: string = Buffer.from(JSON.stringify(jwtHeader)).toString(
    "base64"
  );
  const claims = newClaims(OIDC_CLIENT_ID);
  const claimsEncoded: string = Buffer.from(JSON.stringify(claims)).toString(
    "base64"
  );

  const token = sign(
    claims,
    "kMHcCAQEEIF1b0TZRHZGsl/YHQ2tUs8ldvPdTOwrtXH9y13mm/YDdoAoGCCqGSM49AwEHoUQDQgAEW6/i8ocQVza/SJuVMud319gr1NURxzo6/OSCPlCa9CqnUUAGy+A0wx1A5YfzhVyhhm7FR3nI4q6R2gzLZqzKXA==ey",
    { algorithm: "ES256" }
  );

  console.log("token: " + token);

  const tokenResponse = (): TokenResponse => ({
    access_token: "123ABC",
    refresh_token: "456DEF",
    token_type: "Bearer",
    expires_in: 3600,
    id_token: "TBC",
  });

  return {
    statusCode: 200,
    body: JSON.stringify(tokenResponse),
  };
};
