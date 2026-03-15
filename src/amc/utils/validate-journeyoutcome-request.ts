import { JWTPayload, UnsecuredJWT } from "jose";

export const handleJourneyOutcomeRequest = (
  headers: Record<string, string | undefined>
) => {
  const authHeader = headers.Authorization || headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        errors: [
          "Authorization header must contain a value beginning with Bearer",
        ],
      }),
    };
  }

  const token = authHeader.substring(7);
  let tokenPayload: JWTPayload;

  try {
    tokenPayload = UnsecuredJWT.decode(token).payload;
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Failed to decode JWT and get payload",
        details: (err as Error).message,
      }),
    };
  }

  if (typeof tokenPayload.journeyoutcome_response !== "string") {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "journeyoutcome_response claim is not set",
      }),
    };
  }

  try {
    const parsed = JSON.parse(tokenPayload.journeyoutcome_response);
    return {
      statusCode: parsed.statusCode,
      headers: { "Content-Type": "application/json" },
      body: parsed.body ? JSON.stringify(parsed.body) : "",
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Failed to parse JSON",
        details: (err as Error).message,
      }),
    };
  }
};
