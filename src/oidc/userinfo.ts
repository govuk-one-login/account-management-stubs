import { APIGatewayProxyEvent } from "aws-lambda";
import assert from "node:assert/strict";
import { SignJWT } from "jose";
import {
  getUserScenario,
  getUserIdFromEvent,
} from "../scenarios/scenarios-utils";
import { getPrivateKey, jwtHeader } from "./util/sign";

export interface Response {
  statusCode: number;
  body: string;
  headers: {
    "Content-Type": string;
  };
}

const { OIDC_CLIENT_ID, ENVIRONMENT } = process.env;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  assert(
    event?.headers?.Authorization,
    "There is no Authorization header in the request"
  );

  if (
    typeof OIDC_CLIENT_ID === "undefined" ||
    typeof ENVIRONMENT === "undefined"
  ) {
    throw new Error(
      `an environment variable is undefined OIDC_CLIENT_ID: ${OIDC_CLIENT_ID} or ENVIRONMENT: ${ENVIRONMENT}`
    );
  }

  const userId = await getUserIdFromEvent(event);
  const userinfo = getUserScenario(userId, "userinfo");

  const privateKey = await getPrivateKey();
  const jwt = await new SignJWT(userinfo)
    .setProtectedHeader(jwtHeader)
    .setIssuer(`https://oidc-stub.home.${ENVIRONMENT}.account.gov.uk/`)
    .setAudience(OIDC_CLIENT_ID)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);

  return {
    statusCode: 200,
    body: jwt,
    headers: {
      "Content-Type": "application/jwt",
    },
  };
};
