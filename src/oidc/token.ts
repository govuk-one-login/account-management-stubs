import { v4 as uuid } from "uuid";
import { importJWK, JWK, JWTHeaderParameters, JWTPayload, SignJWT } from "jose";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Token } from "../common/models";
import {
  validateClientIdMatches,
  validateRedirectURLSupported,
  validateSupportedGrantType,
  verifyParametersExistAndOnlyOnce,
} from "./validate-token";

export interface Response {
  statusCode: number;
  body: string;
}

interface OicdPersistedData {
  code: string;
  nonce: string;
}

const algorithm = "ES256";

const marshallOptions = {
  convertClassInstanceToMap: true,
};
const translateConfig = { marshallOptions };
const dynamoClient = new DynamoDBClient({});
const dynamoDocClient = DynamoDBDocumentClient.from(
  dynamoClient,
  translateConfig
);

const epochDateNow = (): number => Math.round(Date.now() / 1000);

const newClaims = (
  oidcClientId: string,
  environemnt: string,
  randomString: string,
  nonce: string
): JWTPayload => ({
  sub: `urn:fdc:gov.uk:2022:${randomString}`,
  iss: `https://oidc-stub.home.${environemnt}.account.gov.uk/`,
  aud: oidcClientId,
  exp: epochDateNow() + 3600,
  iat: epochDateNow(),
  sid: uuid(),
  nonce,
  vot: "Cl.Cm",
});

const newJwtHeader = (): JWTHeaderParameters => ({
  kid: "B-QMUxdJOJ8ubkmArc4i1SGmfZnNNlM-va9h0HJ0jCo",
  alg: algorithm,
});

const persistedNonce = async (code: string): Promise<string> => {
  const { TABLE_NAME } = process.env;
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      code,
    },
  });
  const results = await dynamoDocClient.send(command);
  if (results.Item === undefined) {
    throw new Error("code not found in DB");
  }
  return (results.Item as OicdPersistedData).nonce;
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  if (!event.body) {
    throw new Error(`no request body is provided`);
  }

  console.log(`Event body is: ${event.body}`);

  verifyParametersExistAndOnlyOnce(event.body);

  validateRedirectURLSupported(event.body);

  validateSupportedGrantType(event.body);

  const code = event.body.substring(
    event.body.indexOf("&code=") + 6,
    event.body.indexOf("&redirect_uri=")
  );

  const nonce = await persistedNonce(code);

  const { JWK_KEY_SECRET, OIDC_CLIENT_ID, ENVIRONMENT } = process.env;

  if (
    typeof JWK_KEY_SECRET === "undefined" ||
    typeof OIDC_CLIENT_ID === "undefined" ||
    typeof ENVIRONMENT === "undefined"
  ) {
    throw new Error(
      `an environment variable is undefined OIDC_CLIENT_ID: ${OIDC_CLIENT_ID}
      or ENVIRONMENT: ${ENVIRONMENT} or JWK_KEY_SECRET: ${JWK_KEY_SECRET}`
    );
  }

  validateClientIdMatches(event.body, OIDC_CLIENT_ID);

  const jwkSecret = JSON.parse(JWK_KEY_SECRET);
  const jwk: JWK = JSON.parse(jwkSecret);
  const privateKey = await importJWK(jwk, algorithm);
  const jwt = await new SignJWT(
    newClaims(OIDC_CLIENT_ID, ENVIRONMENT, uuid(), nonce)
  )
    .setProtectedHeader(newJwtHeader())
    .sign(privateKey);
  const tokenResponse = (): Token => ({
    access_token: jwt,
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
