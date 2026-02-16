import { randomUUID } from "node:crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { decodeJwt } from "jose";
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

const marshallOptions = {
  convertClassInstanceToMap: true,
};
const translateConfig = { marshallOptions };

const dynamoClient = new DynamoDBClient({});
const dynamoDocClient = DynamoDBDocumentClient.from(
  dynamoClient,
  translateConfig
);

const { AWS_REGION, TABLE_NAME } = process.env;
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
  console.log('sendSqsMessage - queueUrl:', queueUrl);
  const message: SendMessageRequest = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  };
  console.log('sendSqsMessage - sending message to SQS');
  const result = await sqsClient.send(new SendMessageCommand(message));
  console.log('sendSqsMessage - MessageId:', result.MessageId);
  return result.MessageId;
};

export const writeNonce = async (
  code: string,
  nonce: string,
  userId = "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
  remove_at: number
): Promise<PutCommandOutput> => {
  console.log('writeNonce - TABLE_NAME:', TABLE_NAME);
  console.log('writeNonce - code:', code, 'nonce:', nonce, 'userId:', userId);
  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      code,
      nonce,
      userId,
      remove_at,
    },
  });
  console.log('writeNonce - writing to DynamoDB');
  const result = await dynamoDocClient.send(command);
  console.log('writeNonce - write successful');
  return result;
};

export const selectScenarioHandler = async (event: APIGatewayProxyEvent) => {
  console.log('selectScenarioHandler - event:', JSON.stringify(event));
  const queryStringParameters: APIGatewayProxyEventQueryStringParameters =
    event.queryStringParameters as APIGatewayProxyEventQueryStringParameters;
  console.log('selectScenarioHandler - queryStringParameters:', queryStringParameters);
  let mockState, mockNonce, mockRedirectUri;
  const { state, nonce, redirect_uri, request } = queryStringParameters;
  if (request) {
    const decoded = decodeJwt(request);
    mockNonce = decoded.nonce;
    mockState = decoded.state;
    mockRedirectUri = decoded.redirect_uri;
  } else {
    mockNonce = nonce;
    mockRedirectUri = redirect_uri;
    mockState = state
  }
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
  console.log('handler - event:', JSON.stringify(event));
  console.log('handler - event.body:', event.body);
  assert(event.body, "no body");

  const properties = new URLSearchParams(event.body);
  const nonce = properties.get("nonce");
  const state = properties.get("state");
  const redirectUri = properties.get("redirectUri");
  const scenario = properties.get("scenario") || "default";
  console.log('handler - parsed properties:', { nonce, state, redirectUri, scenario });

  assert(nonce, "no nonce");
  assert(state, "no state");
  assert(redirectUri, "no redirect url");

  const { DUMMY_TXMA_QUEUE_URL } = process.env;
  console.log('handler - DUMMY_TXMA_QUEUE_URL:', DUMMY_TXMA_QUEUE_URL);
  console.log('handler - TABLE_NAME:', TABLE_NAME);

  const code = randomUUID();
  console.log('handler - generated code:', code);

  if (
    typeof DUMMY_TXMA_QUEUE_URL === "undefined" ||
    typeof nonce === "undefined"
  ) {
    console.error('handler - Missing environment variables');
    throw new Error(
      "TXMA Queue URL or Frontend URL environemnt variables is null"
    );
  }

  const remove_at = Math.floor(
    (new Date().getTime() + 24 * 60 * 60 * 1000) / 1000
  );
  console.log('handler - remove_at:', remove_at);

  try {
    console.log('handler - starting Promise.all for writeNonce and sendSqsMessage');
    await Promise.all([
      writeNonce(code, nonce, scenario, remove_at),
      sendSqsMessage(JSON.stringify(newTxmaEvent()), DUMMY_TXMA_QUEUE_URL),
    ]);
    console.log('handler - Promise.all completed successfully');

    const redirectUrl = `${redirectUri}?state=${state}&code=${code}`;
    console.log('handler - redirecting to:', redirectUrl);
    return {
      statusCode: 302,
      headers: {
        Location: redirectUrl,
      },
    };
  } catch (err) {
    console.error('handler - Error caught:', err);
    console.error('handler - Error stack:', err instanceof Error ? err.stack : 'No stack trace');
    console.error('handler - Error message:', err instanceof Error ? err.message : String(err));
    return {
      statusCode: 500,
      headers: {
        Location: "Internal Server Error ",
      },
    };
  }
};
