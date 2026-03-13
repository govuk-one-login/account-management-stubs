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

const TOKEN_EXPIRY_SECONDS = 3600;
const HASH_ALGORITHM = "sha256";
const HASH_ENCODING = "base64" as const;

interface TokenRequestParams {
  code: string;
  code_verifier?: string;
}

interface OAuthErrorResponse {
  error: string;
  error_description: string;
}

interface PersistedNonceData {
  code: string;
  nonce: string;
}

class TokenValidationError extends Error {
  constructor(
    message: string,
    public readonly error: string,
    public readonly errorDescription: string
  ) {
    super(message);
    this.name = "TokenValidationError";
  }
}

export interface Response {
  statusCode: number;
  body: string;
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
  expires_in: TOKEN_EXPIRY_SECONDS,
};

// Populate cache on runtime
getPrivateKey();

const getEpochSeconds = (): number => Math.round(Date.now() / 1000);

const createJwtClaims = (
  oidcClientId: string,
  environment: string,
  userId: string,
  nonce: string
): JWTPayload => ({
  sub: `urn:fdc:gov.uk:2022:${userId}`,
  iss: `https://oidc-stub.home.${environment}.account.gov.uk/`,
  aud: oidcClientId,
  exp: getEpochSeconds() + TOKEN_EXPIRY_SECONDS,
  iat: getEpochSeconds(),
  sid: randomUUID(),
  nonce,
  vot: "Cl.Cm",
});

const getPersistedNonce = async (code: string): Promise<string> => {
  const { TABLE_NAME } = process.env;

  if (!TABLE_NAME) {
    throw new Error("TABLE_NAME environment variable is not defined");
  }

  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: { code },
  });

  const result = await dynamoDocClient.send(command);

  if (!result.Item) {
    throw new TokenValidationError(
      "Authorization code not found",
      "invalid_grant",
      "The provided authorization code is invalid or has expired"
    );
  }

  return (result.Item as PersistedNonceData).nonce;
};

const computeCodeChallenge = (codeVerifier: string): string => {
  const codeChallenge = createHash(HASH_ALGORITHM)
    .update(codeVerifier)
    .digest(HASH_ENCODING);
  console.log(`Computed code challenge (${codeVerifier}): ${codeChallenge}`);
  return codeChallenge;
};

const verifyCodeChallenge = async (codeVerifier: string): Promise<boolean> => {
  const { CODE_CHALLENGE_TABLE } = process.env;

  if (!CODE_CHALLENGE_TABLE) {
    throw new Error("CODE_CHALLENGE_TABLE environment variable is not defined");
  }

  const codeChallenge = computeCodeChallenge(codeVerifier);

  const command = new GetCommand({
    TableName: CODE_CHALLENGE_TABLE,
    Key: { code_challenge: codeChallenge },
  });

  const result = await dynamoDocClient.send(command);

  if (result.Item?.code_challenge === codeChallenge) {
    console.log(`Code challenge (${codeVerifier}) verified`);
    return true;
  } else {
    console.log(`Code challenge (${codeVerifier}) verification failed`);
    return false;
  }
};

const parseTokenRequestParams = (body: string): TokenRequestParams => {
  const params = new URLSearchParams(body);
  const code = params.get("code");
  const codeVerifier = params.get("code_verifier");

  if (!code) {
    throw new TokenValidationError(
      "Missing authorization code",
      "invalid_request",
      "The authorization code parameter is required"
    );
  }

  return {
    code,
    code_verifier: codeVerifier !== null ? codeVerifier : undefined,
  };
};

const validateCodeVerifier = async (
  codeVerifier: string | null
): Promise<void> => {
  if (!codeVerifier || codeVerifier.length === 0) {
    throw new TokenValidationError(
      "Empty code verifier",
      "invalid_request",
      "The code_verifier parameter cannot be empty"
    );
  }

  const isValid = await verifyCodeChallenge(codeVerifier);

  if (!isValid) {
    throw new TokenValidationError(
      "Code verifier does not match code challenge",
      "invalid_grant",
      "The code_verifier does not match the code_challenge from the authorization request"
    );
  }
};

const createErrorResponse = (
  error: string,
  errorDescription: string
): Response => {
  const errorResponse: OAuthErrorResponse = {
    error,
    error_description: errorDescription,
  };
  console.log("Sent Error Response", error, errorDescription);
  return {
    statusCode: 400,
    body: JSON.stringify(errorResponse),
  };
};

const createTokenResponse = async (
  oidcClientId: string,
  environment: string,
  nonce: string
): Promise<Response> => {
  const privateKey = await getPrivateKey();
  const jwt = await new SignJWT(
    createJwtClaims(oidcClientId, environment, randomUUID(), nonce)
  )
    .setProtectedHeader(jwtHeader)
    .sign(privateKey);

  const tokenResponse: Token = {
    ...tokenResponseTemplate,
    access_token: jwt,
    id_token: jwt,
  };
  console.log("Sent Token Response", tokenResponse);
  return {
    statusCode: 200,
    body: JSON.stringify(tokenResponse),
  };
};

const getRequiredEnvVars = (): {
  oidcClientId: string;
  environment: string;
} => {
  const { OIDC_CLIENT_ID, ENVIRONMENT } = process.env;

  if (!OIDC_CLIENT_ID || !ENVIRONMENT) {
    throw new Error(
      `Required environment variables are not defined: OIDC_CLIENT_ID=${OIDC_CLIENT_ID}, ENVIRONMENT=${ENVIRONMENT}`
    );
  }

  return {
    oidcClientId: OIDC_CLIENT_ID,
    environment: ENVIRONMENT,
  };
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  if (!event.body) {
    throw new Error("Request body is required");
  }

  try {
    // Validate request format
    verifyParametersExistAndOnlyOnce(event.body);
    validateRedirectURLSupported(event.body);
    validateSupportedGrantType(event.body);

    // Parse request parameters
    const { code, code_verifier: codeVerifier } = parseTokenRequestParams(
      event.body
    );

    // Retrieve persisted nonce
    const nonce = await getPersistedNonce(code);

    // Validate PKCE if code_verifier is provided
    if (codeVerifier !== undefined) {
      await validateCodeVerifier(codeVerifier);
    }

    // Validate client ID
    const { oidcClientId, environment } = getRequiredEnvVars();
    validateClientIdMatches(event.body, oidcClientId);

    // Generate and return token
    return await createTokenResponse(oidcClientId, environment, nonce);
  } catch (error) {
    if (error instanceof TokenValidationError) {
      return createErrorResponse(error.error, error.errorDescription);
    }
    throw error;
  }
};
