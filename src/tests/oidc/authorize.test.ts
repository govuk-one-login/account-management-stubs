// This suite fails using plain jest due to a dynamic import error.
// Run using `npm run test:esm` to use the experimental ESM support in Node.js

import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import { jest } from "@jest/globals";
import { describe, expect, test } from "@jest/globals";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
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
    process.env.CODE_CHALLENGE_TABLE = "CodeChallengeTable";
    process.env.DUMMY_TXMA_QUEUE_URL =
      "https://sqs.eu-west-2.amazonaws.com/123456789012/dummy-txma-queue";

    process.env.AWS_ACCESS_KEY_ID = "testing";
    process.env.AWS_SECRET_ACCESS_KEY = "testing";
    process.env.AWS_SECURITY_TOKEN = "testing";
    process.env.AWS_SESSION_TOKEN = "testing";
    process.env.AWS_REGION = "eu-west-2";
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  test("returns a 500 error response if event body is undefined", async () => {
    const mockApiEvent: APIGatewayProxyEvent = {
      body: "",
    } as never;
    let errorThrown = false;
    try {
      await handler(mockApiEvent);
    } catch (error) {
      errorThrown = true;
    }
    expect(errorThrown).toBeTruthy();
  });

  test("throws an error if TXMA queue URL is undefined", async () => {
    delete process.env.DUMMY_TXMA_QUEUE_URL;
    const mockApiEvent: APIGatewayProxyEvent = {
      body: "state=Authenticate&nonce=67890&redirectUri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_challenge_method=S256&code_challenge=abc123",
      queryStringParameters: {
        clientId: "12345",
        responseType: "code",
        scope: "openid",
        redirectUri: "https://home.dev.account.gov.uk/auth/callback",
        state: "AUTHENTICATE",
        nonce: "67890",
      } as APIGatewayProxyEventQueryStringParameters,
    } as never;
    let errorThrown = false;
    try {
      await handler(mockApiEvent);
    } catch (error) {
      errorThrown = true;
    }
    expect(errorThrown).toBeTruthy();
  });

  test("throws an error if nonce is undefined", async () => {
    const mockApiEvent: APIGatewayProxyEvent = {
      body: "state=Authenticate&redirectUri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_challenge_method=S256&code_challenge=abc123",
      queryStringParameters: {
        clientId: "12345",
        responseType: "code",
        scope: "openid",
        redirectUri: "https://home.dev.account.gov.uk/auth/callback",
        state: "AUTHENTICATE",
      } as APIGatewayProxyEventQueryStringParameters,
    } as never;
    let errorThrown = false;
    try {
      await handler(mockApiEvent);
    } catch (error) {
      errorThrown = true;
    }
    expect(errorThrown).toBeTruthy();
  });

  test("Logs error and returns 500 response if SQS message sending fails", async () => {
    const sqsMock = mockClient(SQSClient);
    sqsMock.on(SendMessageCommand).rejects(new Error("SQS error"));

    const mockApiEvent: APIGatewayProxyEvent = {
      body: "state=Authenticate&nonce=67890&redirectUri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_challenge_method=S256&code_challenge=abc123",
      queryStringParameters: {
        clientId: "12345",
        responseType: "code",
        scope: "openid",
        redirectUri: "https://home.dev.account.gov.uk/auth/callback",
        state: "AUTHENTICATE",
        nonce: "67890",
      } as APIGatewayProxyEventQueryStringParameters,
    } as never;

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {
        // Mock implementation to suppress error logging during test
      });

    const result = await handler(mockApiEvent);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error :: Error: SQS error")
    );
    expect(result.statusCode).toEqual(500);
    expect(result.headers.Location).toContain("Internal Server Error");

    consoleErrorSpy.mockRestore();
  });

  test("redirects with error: invalid_request if code_challenge_method is not S256", async () => {
    const mockApiEvent: APIGatewayProxyEvent = {
      body: "state=Authenticate&nonce=67890&redirectUri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_challenge_method=plain",
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
      `${mockApiEvent.queryStringParameters?.redirectUri}?error=invalid_request`
    );
  });

  test("redirects with error: invalid_request if code_challenge not present", async () => {
    const mockApiEvent: APIGatewayProxyEvent = {
      body: "state=Authenticate&nonce=67890&redirectUri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_challenge_method=S256",
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
      `${mockApiEvent.queryStringParameters?.redirectUri}?error=invalid_request`
    );
  });

  test("redirects with error: invalid_request if code_challenge is empty", async () => {
    const mockApiEvent: APIGatewayProxyEvent = {
      body: "state=Authenticate&nonce=67890&redirectUri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_challenge_method=S256&code_challenge=",
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
      `${mockApiEvent.queryStringParameters?.redirectUri}?error=invalid_request`
    );
  });

  test("stores the code challenge with a ttl of one hour", async () => {
    const dynamoMock = mockClient(DynamoDBDocumentClient);
    const dynamoPutSpy = jest.spyOn(DynamoDBDocumentClient.prototype, "send");

    const mockApiEvent: APIGatewayProxyEvent = {
      body: "state=Authenticate&nonce=67890&redirectUri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_challenge_method=S256&code_challenge=abc123",
      queryStringParameters: {
        clientId: "12345",
        responseType: "code",
        scope: "openid",
        redirectUri: "https://home.dev.account.gov.uk/auth/callback",
        state: "AUTHENTICATE",
        nonce: "67890",
      } as APIGatewayProxyEventQueryStringParameters,
    } as never;
    await handler(mockApiEvent);

    expect(dynamoPutSpy).toHaveBeenCalled();
    const ttl =
      dynamoMock.commandCalls(PutCommand)[0].args[0].input.Item?.remove_at;
    const nowInSeconds = Math.floor(Date.now() / 1000);
    expect(ttl).toBeGreaterThanOrEqual(nowInSeconds + 3590); // allow a few seconds of leeway
    expect(ttl).toBeLessThanOrEqual(nowInSeconds + 3600);
  });

  test("logs an error if saving the code challenge fails but still returns a 302 response", async () => {
    const dynamoMock = mockClient(DynamoDBDocumentClient);
    dynamoMock.on(PutCommand).rejectsOnce(new Error("DynamoDB error"));

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {
        // Mock implementation to suppress error logging during test
      });

    const mockApiEvent: APIGatewayProxyEvent = {
      body: "state=Authenticate&nonce=67890&redirectUri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_challenge_method=S256&code_challenge=abc123",
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

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Error saving code challenge: Error: DynamoDB error"
      )
    );
    expect(result.statusCode).toEqual(302);
    expect(result.headers.Location).toContain(
      mockApiEvent.queryStringParameters?.redirectUri
    );
  });
});

describe("selectScenarioHandler", () => {
  test("returns 200 response", async () => {
    // build a minimal unsigned JWT (header.payload.) so decodeJwt can read payload
    const base64url = (obj: unknown) =>
      Buffer.from(JSON.stringify(obj))
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const payload = {
      nonce: "67890",
      state: "AUTHENTICATE",
      redirect_uri: "https://home.dev.account.gov.uk/auth/callback",
    };
    const requestJwt = `${base64url({ alg: "none", typ: "JWT" })}.${base64url(
      payload
    )}.`;

    const mockApiEvent: APIGatewayProxyEvent = {
      body: "scenario=AUTH_AUTH_CODE_ISSUED",
      queryStringParameters: {
        clientId: "12345",
        responseType: "code",
        scope: "openid",
        redirectUri: "https://home.dev.account.gov.uk/auth/callback",
        state: "AUTHENTICATE",
        nonce: "67890",
        request: requestJwt,
      } as APIGatewayProxyEventQueryStringParameters,
    } as never;
    const result = await selectScenarioHandler(mockApiEvent);
    expect(result.statusCode).toEqual(200);
  });

  test("returns a 500 error response if event body is undefined", async () => {
    const mockApiEvent: APIGatewayProxyEvent = {
      body: "",
    } as never;
    let errorThrown = false;
    try {
      await selectScenarioHandler(mockApiEvent);
    } catch (error) {
      errorThrown = true;
    }
    expect(errorThrown).toBeTruthy();
  });
});
