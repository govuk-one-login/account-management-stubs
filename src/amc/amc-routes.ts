import { APIGatewayProxyEvent } from "aws-lambda";
import { generateJwks } from "./utils/generate-jwks";


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

  return {
    statusCode: 404,
    body: JSON.stringify({ error: "Not Found" }),
  };
};
