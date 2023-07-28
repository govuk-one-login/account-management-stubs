import { v4 as uuid } from "uuid";
import { importJWK, JWTHeaderParameters, JWTPayload, SignJWT } from "jose";
import { TokenResponse } from "./models";

export interface Response {
  statusCode: number;
  body: string;
}

const algorithm = "ES256";

const epochDateNow = (): number => Math.round(Date.now() / 1000);

const newClaims = (
  oidcClientId: string,
  environemnt: string,
  randomString: string
): JWTPayload => ({
  sub: `urn:fdc:gov.uk:2022:${randomString}`,
  iss: `https://oidc-stub.home.${environemnt}.account.gov.uk/`,
  aud: oidcClientId,
  exp: epochDateNow() + 3600,
  iat: epochDateNow(),
  sid: uuid(),
});

const newJwtHeader = (): JWTHeaderParameters => ({
  kid: "B-QMUxdJOJ8ubkmArc4i1SGmfZnNNlM-va9h0HJ0jCo",
  alg: algorithm,
});

export const handler = async (): Promise<Response> => {
  const { JWK_KEY_SECRET, OIDC_CLIENT_ID, ENVIRONMENT } = process.env;
  if (
    typeof JWK_KEY_SECRET === "undefined" ||
    typeof OIDC_CLIENT_ID === "undefined" ||
    typeof ENVIRONMENT === "undefined"
  ) {
    throw new Error(
      `OIDC_CLIENT_ID: ${OIDC_CLIENT_ID} or ENVIRONMENT: ${ENVIRONMENT} 
      or JWK_KEY_SECRET: ${JWK_KEY_SECRET} environemnt variable is undefined`
    );
  }
  const jwsKey = JSON.parse(JWK_KEY_SECRET);
  const privateKey = await importJWK(jwsKey, algorithm);
  const jwt = await new SignJWT(newClaims(OIDC_CLIENT_ID, ENVIRONMENT, uuid()))
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
