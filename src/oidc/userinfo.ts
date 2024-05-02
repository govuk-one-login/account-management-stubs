import { APIGatewayProxyEvent } from "aws-lambda";
import assert from "node:assert/strict";
import { getUserScenario, getUserIdFromEvent } from "../scenarios/scenarios";

export interface Response {
  statusCode: number;
  body: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  assert(
    event?.headers?.Authorization,
    "There is no Authorization header in the request"
  );

  return {
    statusCode: 200,
    body: JSON.stringify(
      getUserScenario(await getUserIdFromEvent(event), "userinfo")
    ),
  };
};
