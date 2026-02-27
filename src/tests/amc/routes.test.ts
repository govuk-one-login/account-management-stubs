import { handler } from "../../amc/amc-routes";
import { APIGatewayProxyEvent } from "aws-lambda";

describe("token route", () => {
  const validBaseParams = {
    grant_type: "authorization_code",
    code: "some_auth_code",
    redirect_uri: "https://example.com/callback",
    client_assertion_type:
      "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
    client_assertion: "eyJhbGci.eyJzdWIi.signature",
  };

  const createEvent = (
    body: Record<string, string>
  ): Partial<APIGatewayProxyEvent> => ({
    path: "/token",
    httpMethod: "POST",
    body: new URLSearchParams(body).toString(),
  });

  test("returns 400 for invalid grant_type", async () => {
    const event = createEvent({ ...validBaseParams, grant_type: "test" });
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toMatch(/grant_type/);
  });

  test("returns 400 for malformed redirect_uri", async () => {
    const event = createEvent({
      ...validBaseParams,
      redirect_uri: "not-a-url",
    });
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe(
      "redirect_uri must be a valid URL"
    );
  });

  test("returns 200 and issues token for standard valid request", async () => {
    const event = createEvent(validBaseParams);
    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.access_token).toBe("some_auth_code");
    expect(body.token_type).toBe("Bearer");
  });

  test('processes "token_response__" prefix to return custom status and body', async () => {
    const customResponse = {
      statusCode: 201,
      body: { message: "Token response message" },
    };

    const event = createEvent({
      ...validBaseParams,
      code: `token_response__${JSON.stringify(customResponse)}`,
    });

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.message).toBe("Token response message");
  });

  test('returns 400 if the "token_response__" JSON is malformed', async () => {
    const event = createEvent({
      ...validBaseParams,
      code: `token_response__{invalid-json}`,
    });

    const result = await handler(event as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe("Failed to parse code");
  });

  test("returns 404 for wrong path", async () => {
    const event = createEvent(validBaseParams);
    event.path = "/not-token";

    const result = await handler(event as APIGatewayProxyEvent);
    expect(result.statusCode).toBe(404);
  });
});
