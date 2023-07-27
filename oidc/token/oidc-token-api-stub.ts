import { v4 as uuid } from "uuid";
import { importJWK, JWTHeaderParameters, JWTPayload, SignJWT } from "jose";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { TokenResponse } from "./models";

export interface Response {
  statusCode: number;
  body: string;
}

interface EcJws {
  d: string;
  kty: string;
  use: string;
  crv: string;
  kid: string;
  x: string;
  y: string;
  alg: string;
}

const secret_name = "/account-mgmt-stubs/oidc/signing/key";
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

const client = new SecretsManagerClient({
  region: "eu-west-2",
});


export const handler = async (): Promise<Response> => {

  let secretManagerResponse;
  try {
    secretManagerResponse = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
      })
    );
    if (!secretManagerResponse.SecretString) {
      throw new Error();  
    }
  } catch (error) {
    throw new Error("Could not get JWK key from secrets manager");
  }

  const JwsKey: EcJws = JSON.parse(secretManagerResponse.SecretString);
  
  const { OIDC_CLIENT_ID, ENVIRONMENT } = process.env;
  if (typeof OIDC_CLIENT_ID === "undefined" || typeof ENVIRONMENT === "undefined") {
    throw new Error("OIDC_CLIENT_ID or ENVIRONMENT environemnt variable is undefined");
  }
  const privateKey = await importJWK(kwsKey, algorithm);
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
