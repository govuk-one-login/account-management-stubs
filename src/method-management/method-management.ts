import { APIGatewayProxyEvent } from "aws-lambda";
import assert from "node:assert/strict";
import { getUserIdFromEvent, getUserScenario } from "../scenarios/scenarios";

export interface Response {
  statusCode: number;
  body: string;
}

export const userInfoHandler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      getUserScenario(await getUserIdFromEvent(event), "mfaMethods")
    ),
  };
};

export const createMfaMethodHandler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  const {
    email,
    otp,
    credential,
    mfaMethod: {
      priorityIdentifier = undefined,
      mfaMethodType = undefined,
    } = {},
  } = JSON.parse(event.body || "{}");
  try {
    assert(email, "no email provided");
    assert(otp, "no otp provided");
    assert(credential, "no credential provided");
    assert.match(
      priorityIdentifier,
      /^(PRIMARY|SECONDARY)$/,
      "invalid priorityIdentifier"
    );
    assert.match(mfaMethodType, /^(AUTH_APP|SMS)$/, "invalid mfaMethodType");
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: (e as Error).message }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({}),
  };
};
