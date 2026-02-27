export function validateTokenRequest(body: Record<string, string>): {
  statusCode: number;
  body: string;
  headers?: Record<string, string>;
} {
  const errorResponse = (msg: string) => ({
    statusCode: 400,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ error: msg }),
  });
  if (body.grant_type !== "authorization_code") {
    return errorResponse("grant_type must be 'authorization_code'");
  }

  if (typeof body.code !== "string" || body.code.length === 0) {
    return errorResponse("code is required and cannot be empty");
  }

  try {
    new URL(body.redirect_uri);
  } catch (e) {
    return errorResponse("redirect_uri must be a valid URL");
  }

  const expectedAssertionType =
    "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
  if (body.client_assertion_type !== expectedAssertionType) {
    return errorResponse(
      `client_assertion_type must be ${expectedAssertionType}`
    );
  }

  if (
    typeof body.client_assertion !== "string" ||
    body.client_assertion.length === 0
  ) {
    return errorResponse("client_assertion is required");
  }

  if (!body.code.startsWith("token_response__")) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        access_token: body.code,
        token_type: "Bearer",
        expires_in: 300,
      }),
    };
  } else {
    const noPrefix = body.code.slice("token_response__".length);

    try {
      const parsedJSON = JSON.parse(noPrefix);
      return {
        statusCode: parsedJSON.statusCode,
        headers: {
          "Content-Type": "application/json",
        },
        body: parsedJSON.body ? JSON.stringify(parsedJSON.body) : "",
      };
    } catch (e) {
      return errorResponse("Failed to parse code");
    }
  }
}
