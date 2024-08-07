import { APIGatewayProxyEventV2 } from "aws-lambda";
import { getUserIdFromEvent, getUserScenario } from "../scenarios/scenarios-utils";
import { formatResponse } from "../common/response-utils";

export interface Response {
  statusCode: number;
}

export const handler = async (
  event: APIGatewayProxyEventV2
) => {
  if (event?.rawPath.includes("send-otp-notification")) {
    const userId = await getUserIdFromEvent(event)
    const scenario = getUserScenario(userId, "otpNotification")

    return formatResponse(200, scenario)
  }

  return {
    statusCode: 204,
    body: 'test'
  };
};
