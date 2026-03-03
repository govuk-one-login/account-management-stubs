export const handleJourneyOutcomeRequest = (headers: Record<string, string | undefined>) => {
  const authHeader = headers.Authorization || headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      statusCode: 400,
      body: JSON.stringify({ errors: ["Authorization header must contain a value beginning with Bearer"] }),
    };
  }

  const token = authHeader.substring(7);

  if (!token.startsWith("journeyoutcome_response__")) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "The stub expects the authorization token to begin with journeyoutcome_response__" }),
    };
  }

  const jsonString = token.substring(26); 

  try {
    const parsed = JSON.parse(jsonString);
    return {
      statusCode: parsed.statusCode,
      headers: { "Content-Type": "application/json" },
      body: parsed.body ? JSON.stringify(parsed.body) : "",
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Failed to parse JSON", details: (err as Error).message }),
    };
  }
}
