import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { decodeJwt, JWTPayload } from "jose";
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventQueryStringParameters,
} from "aws-lambda";
import {
  SendMessageCommand,
  SendMessageRequest,
  SQSClient,
} from "@aws-sdk/client-sqs";

import { TxmaEvent } from "../common/models";
import { userScenarios } from "../scenarios/scenarios";
import assert from "node:assert/strict";

const SUPPORTED_CODE_CHALLENGE_METHOD = "S256" as const;
const CODE_CHALLENGE_TTL_SECONDS = 3600;
const NONCE_TTL_SECONDS = 24 * 60 * 60;

interface PkceParams {
  code_challenge_method?: unknown;
  code_challenge?: unknown;
}

interface AuthorizeRequestBody {
  nonce: string;
  state: string;
  redirectUri: string;
  request: string;
  scenario: string;
}

class PkceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PkceValidationError";
  }
}

const marshallOptions = {
  convertClassInstanceToMap: true,
};
const translateConfig = { marshallOptions };

const dynamoClient = new DynamoDBClient({});
const dynamoDocClient = DynamoDBDocumentClient.from(
  dynamoClient,
  translateConfig
);

const { AWS_REGION, TABLE_NAME, CODE_CHALLENGE_TABLE } = process.env;
const sqsClient = new SQSClient({ region: AWS_REGION });

export interface Response {
  statusCode: number;
  headers: {
    Location: string;
  };
}

const newTxmaEvent = (): TxmaEvent => ({
  event_id: randomUUID(),
  timestamp: Date.now(),
  event_name: "AUTH_AUTH_CODE_ISSUED",
  client_id: "vehicleOperatorLicense",
  user: {
    user_id: "user_id",
    session_id: randomUUID(),
  },
});

export const sendSqsMessage = async (
  messageBody: string,
  queueUrl: string | undefined
): Promise<string | undefined> => {
  const message: SendMessageRequest = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  };
  const result = await sqsClient.send(new SendMessageCommand(message));
  return result.MessageId;
};

export const writeNonce = async (
  code: string,
  nonce: string,
  userId = "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
  remove_at: number
): Promise<PutCommandOutput> => {
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      code,
      nonce,
      userId,
      remove_at,
    },
  });
  return dynamoDocClient.send(command);
};

const getQueryParams = (
  event: APIGatewayProxyEvent
): APIGatewayProxyEventQueryStringParameters => {
  return event.queryStringParameters as APIGatewayProxyEventQueryStringParameters;
};

const getRequestObjectJwt = (
  params: APIGatewayProxyEventQueryStringParameters
): JWTPayload => {
  const { request } = params;
  assert(request, "no request object");
  return decodeJwt(request);
};

const isValidCodeChallenge = (
  codeChallengeMethod: string,
  codeChallenge: string | null | undefined
): boolean => {
  if (codeChallengeMethod !== SUPPORTED_CODE_CHALLENGE_METHOD) {
    return false;
  }
  return Boolean(codeChallenge && codeChallenge.length > 0);
};

const saveCodeChallenge = async (
  codeChallenge: string
): Promise<PutCommandOutput> => {
  const removeAt = Math.floor(Date.now() / 1000) + CODE_CHALLENGE_TTL_SECONDS;
  const command = new PutCommand({
    TableName: CODE_CHALLENGE_TABLE,
    Item: {
      code_challenge: codeChallenge,
      remove_at: removeAt,
    },
  });
  console.log(`Saving code challenge: ${codeChallenge}`);
  return dynamoDocClient.send(command);
};

const validateAndSavePkce = async (jwtPayload: JWTPayload): Promise<void> => {
  const pkceParams = jwtPayload as PkceParams;
  const {
    code_challenge_method: codeChallengeMethod,
    code_challenge: codeChallenge,
  } = pkceParams;

  if (codeChallengeMethod == null) {
    console.log("No PKCE parameters provided");
    return;
  }

  if (typeof codeChallengeMethod !== "string") {
    throw new PkceValidationError("code_challenge_method must be a string");
  }

  if (typeof codeChallenge !== "string") {
    throw new PkceValidationError("code_challenge must be a string");
  }

  if (!isValidCodeChallenge(codeChallengeMethod, codeChallenge)) {
    throw new PkceValidationError(
      `Invalid PKCE parameters: method must be ${SUPPORTED_CODE_CHALLENGE_METHOD} with non-empty challenge`
    );
  }

  console.log(`Valid PKCE parameters provided: ${codeChallengeMethod}`);
  await saveCodeChallenge(codeChallenge);
};

const parseRequestBody = (body: string): AuthorizeRequestBody => {
  const properties = new URLSearchParams(body);
  const nonce = properties.get("nonce");
  const state = properties.get("state");
  const redirectUri = properties.get("redirectUri");
  const request = properties.get("request");
  const scenario = properties.get("scenario");

  assert(nonce, "no nonce");
  assert(state, "no state");
  assert(redirectUri, "no redirect_url");
  assert(request, "no request");
  console.log("Request body is Ok");
  return {
    nonce,
    state,
    redirectUri,
    request,
    scenario: scenario || "default",
  };
};

const createErrorResponse = (
  redirectUri: string,
  error: string,
  errorDescription?: string
): Response => {
  const params = new URLSearchParams({ error });
  if (errorDescription) {
    params.append("error_description", errorDescription);
  }
  console.log("Sent Failure Response", error, redirectUri, errorDescription);
  return {
    statusCode: 302,
    headers: {
      Location: `${redirectUri}?${params.toString()}`,
    },
  };
};

const createSuccessResponse = (
  redirectUri: string,
  state: string,
  code: string
): Response => {
  console.log("Sent Success Response");
  return {
    statusCode: 302,
    headers: {
      Location: `${redirectUri}?state=${state}&code=${code}`,
    },
  };
};

export const selectScenarioHandler = async (event: APIGatewayProxyEvent) => {
  const params = getQueryParams(event);
  const requestObjectJwt = getRequestObjectJwt(params);
  const mockNonce = requestObjectJwt.nonce;
  const mockState = requestObjectJwt.state;
  const mockRedirectUri = requestObjectJwt.redirect_uri;

  const scenarios = Object.keys(userScenarios)
    .map((scenario) => {
      return `<button name="scenario" value="${scenario}">${scenario}</button>`;
    })
    .join("<br/>");

  const body = `<html><body>
      <form method="post" action='/authorize'>
        <input type="hidden" name="state" value="${mockState}" />
        <input type="hidden" name="nonce" value="${mockNonce}" /> 
        <input type="hidden" name="redirectUri" value="${mockRedirectUri}" />
        <input type="hidden" name="request" value="${params.request}" />
        
        <h1>API Simulation Tool</h1>
        <p>Choose a scenario below instead of logging in. The app will act like you're that user, helping you test its behavior in different situations.</p>
        ${scenarios}
      </form>
    </body></html>`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html" },
    body,
  };
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  assert(event.body, "no body");

  const { nonce, state, redirectUri, request, scenario } = parseRequestBody(
    event.body
  );

  try {
    await validateAndSavePkce(getRequestObjectJwt({ request }));
  } catch (error) {
    console.error(`Failed to validate/save PKCE: ${error}`);
    return createErrorResponse(
      redirectUri,
      "invalid_request",
      error instanceof PkceValidationError
        ? error.message
        : "Failed to process PKCE parameters"
    );
  }

  const { DUMMY_TXMA_QUEUE_URL } = process.env;

  if (!DUMMY_TXMA_QUEUE_URL) {
    throw new Error("DUMMY_TXMA_QUEUE_URL environment variable is not defined");
  }

  const code = randomUUID();
  const removeAt = Math.floor(Date.now() / 1000) + NONCE_TTL_SECONDS;

  try {
    await Promise.all([
      writeNonce(code, nonce, scenario, removeAt),
      sendSqsMessage(JSON.stringify(newTxmaEvent()), DUMMY_TXMA_QUEUE_URL),
    ]);

    return createSuccessResponse(redirectUri, state, code);
  } catch (err) {
    console.error(`Error processing authorization: ${err}`);
    return {
      statusCode: 500,
      headers: {
        Location: "Internal Server Error",
      },
    };
  }
};
