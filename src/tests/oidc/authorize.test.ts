// This suite fails using plain jest due to a dynamic import error.
// Run using `npm run test:esm` to use the experimental ESM support in Node.js

import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import { jest } from "@jest/globals";
import { describe, expect, test } from "@jest/globals";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventQueryStringParameters,
} from "aws-lambda";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { selectScenarioHandler, handler } from "../../oidc/authorize";

describe("handler", () => {
  beforeEach(() => {
    jest.resetModules();

    const dynamoMock = mockClient(DynamoDBDocumentClient);
    dynamoMock
      .on(GetCommand)
      .resolves({ Item: { code: "1234", nonce: "67890" } });

    const sqsMock = mockClient(SQSClient);
    sqsMock.on(SendMessageCommand).resolves({ MessageId: "12345" });

    process.env.OIDC_CLIENT_ID = "12345";
    process.env.ENVIRONMENT = "dev";
    process.env.TABLE_NAME = "TableName";
    process.env.DUMMY_TXMA_QUEUE_URL =
      "https://sqs.eu-west-2.amazonaws.com/123456789012/dummy-txma-queue";

    process.env.AWS_ACCESS_KEY_ID = "testing";
    process.env.AWS_SECRET_ACCESS_KEY = "testing";
    process.env.AWS_SECURITY_TOKEN = "testing";
    process.env.AWS_SESSION_TOKEN = "testing";
    process.env.AWS_REGION = "eu-west-2";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns 302 response with Location header", async () => {
    const mockApiEvent: APIGatewayProxyEvent = {
      body: "state=Authenticate&nonce=67890&redirectUri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback",
      queryStringParameters: {
        clientId: "12345",
        responseType: "code",
        scope: "openid",
        redirectUri: "https://home.dev.account.gov.uk/auth/callback",
        state: "AUTHENTICATE",
        nonce: "67890",
      } as APIGatewayProxyEventQueryStringParameters,
    } as never;
    const result = await handler(mockApiEvent);
    expect(result.statusCode).toEqual(302);
    expect(result.headers.Location).toContain(
      mockApiEvent.queryStringParameters?.redirectUri
    );
  });
});
