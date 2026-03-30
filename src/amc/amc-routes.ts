import { APIGatewayProxyEvent } from "aws-lambda";
import { buildAuthorizePage } from "./utils/authorize-page";
import { generateJwks } from "./utils/generate-jwks";
import { validateTokenRequest } from "./utils/validate-token-request";
import { handleJourneyOutcomeRequest } from "./utils/validate-journeyoutcome-request";

export const handler = async (event: APIGatewayProxyEvent) => {
  if (event.path === "/status") {
    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  }

  if (event.path === "/.well-known/jwks.json" && event.httpMethod === "GET") {
    const jwks = await generateJwks();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jwks),
    };
  }

  if (event.path === "/authorize" && event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};
    const errors: string[] = [];

    if (!params.client_id || params.client_id.length === 0) {
      errors.push("client_id is required and must not be empty");
    }
    if (!params.scope || params.scope.length === 0) {
      errors.push("scope is required and must not be empty");
    }
    if (!params.response_type || params.response_type !== "code") {
      errors.push("response_type is required and must be 'code'");
    }
    if (!params.redirect_uri || params.redirect_uri.length === 0) {
      errors.push("redirect_uri is required and must not be empty");
    } else {
      try {
        new URL(params.redirect_uri);
      } catch {
        errors.push("redirect_uri must be a valid URL");
      }
    }
    if (!params.request || params.request.length === 0) {
      errors.push("request is required and must not be empty");
    }
    if (!params.state || params.state.length === 0) {
      errors.push("state is required and must not be empty");
    }

    if (errors.length > 0) {
      const html = `<!DOCTYPE html>
                    <html>
                    <head><title>Validation Error</title></head>
                    <body>
                    <h1>Validation Failed</h1>
                    <ul>${errors.map((error) => `<li>${error}</li>`).join("")}</ul>
                    </body>
                    </html>`;
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html" },
        body: html,
      };
    }

    const html = buildAuthorizePage(params.redirect_uri!, params.state!);

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html,
    };
  }

  if (event.path === "/journeyoutcome" && event.httpMethod === "GET") {
    return handleJourneyOutcomeRequest(event.headers || {});
  }

  if (event.path === "/token" && event.httpMethod === "POST") {
    try {
      const body = event.body || "";
      const bodyObj = Object.fromEntries(new URLSearchParams(body));
      return validateTokenRequest(bodyObj);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request" }),
      };
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: "Not Found" }),
  };
};
