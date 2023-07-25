import { v4 as uuid } from "uuid";
import { importJWK, JWTHeaderParameters, JWTPayload, SignJWT } from "jose";
import { TokenResponse } from "./models";

export interface Response {
  statusCode: number;
  body: string;
}

const epochDateNow = (): number => Math.round(Date.now() / 1000);

const newClaims = (
  OIDC_CLIENT_ID: string,
  randomString: string
): JWTPayload => ({
  sub: `urn:fdc:gov.uk:2022:${randomString}`,
  iss: "https://oidc-stub.home.account.gov.uk",
  aud: OIDC_CLIENT_ID,
  exp: epochDateNow() + 3600,
  iat: epochDateNow(),
  sid: uuid(),
});

const jwk = {
  kty: "EC",
  d: "Ob4_qMu1nkkBLEw97u--PHVsShP3xOKOJ6z0WsdU0Xw",
  use: "sig",
  crv: "P-256",
  kid: "B-QMUxdJOJ8ubkmArc4i1SGmfZnNNlM-va9h0HJ0jCo",
  x: "YrTTzbuUwQhWyaj11w33k-K8bFydLfQssVqr8mx6AVE",
  y: "8UQcw-6Wp0bp8iIIkRw8PW2RSSjmj1I_8euyKEDtWRk",
  alg: "ES256",
};

const algorithm = "ES256";

const newJwtHeader = (): JWTHeaderParameters => ({
  kid: "B-QMUxdJOJ8ubkmArc4i1SGmfZnNNlM-va9h0HJ0jCo",
  alg: algorithm,
});

export const handler = async (): Promise<Response> => {
  const { OIDC_CLIENT_ID } = process.env;
  if (typeof OIDC_CLIENT_ID === "undefined") {
    throw new Error("OIDC_CLIENT_ID environemnt variable is null");
  }
  const privateKey = await importJWK(jwk, algorithm);
  const jwt = await new SignJWT(newClaims(OIDC_CLIENT_ID, uuid()))
    .setProtectedHeader(newJwtHeader())
    .sign(privateKey);
  const tokenResponse = (): TokenResponse => ({
    access_token: "123ABC",
    refresh_token: "456DEF",
    token_type: "Bearer",
    expires_in: 3600,
    id_token: jwt,
  });
  return {
    statusCode: 200,
    body: JSON.stringify(tokenResponse()),
  };
};
