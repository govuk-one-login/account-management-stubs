import { randomUUID, createHash } from "node:crypto";
import { JWTPayload, SignJWT } from "jose";
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
import { getPrivateKey, jwtHeader } from "./util/sign";

export interface Response {
  statusCode: number;
  body: string;
}

interface OicdPersistedData {
  code: string;
  nonce: string;
}

interface CodeChallengeData {
  code: string;
  code_challenge: string;
  code_challenge_method: string;
  nonce: string;
}

const dynamoClient = new DynamoDBClient({});
const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    convertClassInstanceToMap: true,
  },
});
const tokenResponseTemplate: Omit<Token, "access_token" | "id_token"> = {
  refresh_token: "456DEF",
  token_type: "Bearer",
  expires_in: 3600,
};
getPrivateKey(); //populate cache on runtime

const epochDateNow = (): number => Math.round(Date.now() / 1000);

const newClaims = (
  oidcClientId: string,
  environment: string,
  randomString: string,
  nonce: string
): JWTPayload => ({
  sub: `urn:fdc:gov.uk:2022:${randomString}`,
  iss: `https://oidc-stub.home.${environment}.account.gov.uk/`,
  aud: oidcClientId,
  exp: epochDateNow() + 3600,
  iat: epochDateNow(),
  sid: randomUUID(),
  nonce,
  vot: "Cl.Cm",
});

const persistedNonce = async (code: string): Promise<string> => {
  const { TABLE_NAME: tableName } = process.env;
  if (typeof tableName === "undefined") {
    throw new Error("TABLE_NAME environment variable is undefined");
  }
  const command = new GetCommand({
    TableName: tableName,
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

const persistedCodeChallenge = async (
  code: string
): Promise<{ code_challenge: string; code_challenge_method: string }> => {
  const { CODE_CHALLENGE_TABLE } = process.env;
  if (typeof CODE_CHALLENGE_TABLE === "undefined") {
    throw new Error("CODE_CHALLENGE_TABLE environment variable is undefined");
  }

  const command = new GetCommand({
    TableName: CODE_CHALLENGE_TABLE,
    Key: {
      code,
    },
  });
  const results = await dynamoDocClient.send(command);

  if (results.Item === undefined) {
    console.error("code challenge not found in DB");
    return {
      code_challenge: "not_found",
      code_challenge_method: "none",
    };
  }

  const item = results.Item as CodeChallengeData;

  return {
    code_challenge: item.code_challenge,
    code_challenge_method: item.code_challenge_method,
  };
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  if (!event.body) {
    throw new Error(`no request body is provided`);
  }
  const { OIDC_CLIENT_ID, ENVIRONMENT } = process.env;

  verifyParametersExistAndOnlyOnce(event.body);
  validateRedirectURLSupported(event.body);
  validateSupportedGrantType(event.body);

  const params = new URLSearchParams(event.body);

  const code = params.get("code");

  const nonce = await persistedNonce(code || "");

  const codeVerifier = params.get("code_verifier");
  if (!codeVerifier) {
    console.error("code_verifier missing");
    return {
      statusCode: 400,
      body: '{"error": "invalid_request"}',
    };
  }

  // verify PKCE code_verifier against stored code_challenge if present
  const codeChallengeEntry = await persistedCodeChallenge(code || "");
  const codeChallenge = codeChallengeEntry.code_challenge;

  if (codeChallenge === "not_found") {
    return {
      statusCode: 400,
      body: '{"error": "invalid_grant"}',
    };
  }

  const hashed = createHash("sha256")
    .update(codeVerifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  if (hashed !== codeChallenge) {
    console.error("invalid code_verifier");
    return {
      statusCode: 400,
      body: '"error": "invalid_grant"',
    };
  }

  if (
    typeof OIDC_CLIENT_ID === "undefined" ||
    typeof ENVIRONMENT === "undefined"
  ) {
    throw new Error(
      `an environment variable is undefined OIDC_CLIENT_ID: ${OIDC_CLIENT_ID} or ENVIRONMENT: ${ENVIRONMENT}`
    );
  }

  validateClientIdMatches(event.body, OIDC_CLIENT_ID);

  const privateKey = await getPrivateKey(); // Retrieve cached private key
  const jwt = await new SignJWT(
    newClaims(OIDC_CLIENT_ID, ENVIRONMENT, randomUUID(), nonce)
  )
    .setProtectedHeader(jwtHeader)
    .sign(privateKey);

  const tokenResponse: Token = {
    ...tokenResponseTemplate,
    access_token: jwt,
    id_token: jwt,
  };

  return {
    statusCode: 200,
    body: JSON.stringify(tokenResponse),
  };
};
