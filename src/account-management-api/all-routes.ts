import { APIGatewayProxyEvent } from "aws-lambda";
import { getUserIdFromEvent, getUserScenario } from "../scenarios/scenarios-utils";
import { formatResponse } from "../common/response-utils";

export interface Response {
  statusCode: number;
}

export const handler = async (
  event: APIGatewayProxyEvent
) => {
  if (event.path.includes("send-otp-notification")) {
    const userId = await getUserIdFromEvent(event)
    const scenario = getUserScenario(userId, "otpNotification")

    return formatResponse(200, scenario)
  }


  return {
    statusCode: 204,
  };
};
