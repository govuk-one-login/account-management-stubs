import { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  getUserIdFromEvent,
  getUserScenario,
} from "../scenarios/scenarios-utils";
import { formatResponse } from "../common/response-utils";

export const handler = async (event: APIGatewayProxyEventV2) => {
  if (event?.rawPath.includes("send-otp-notification")) {
    const userId = await getUserIdFromEvent(event);
    const scenario = getUserScenario(userId, "otpNotification");

    const status = scenario.success ? 204 : 400;

    return formatResponse(status, scenario);
  } else if (event?.rawPath.includes("/update-email")) {
    console.log(JSON.stringify(event, null, 2));
  } else if (event?.rawPath.includes("/authenticate")) {
    const userId = await getUserIdFromEvent(event);
    const scenario = await getUserScenario(userId, "interventions");

    if (scenario?.blocked) {
      return formatResponse(403, {
        code: 1084,
        message: "User's account is blocked",
      });
    } else if (scenario?.suspended) {
      return formatResponse(403, {
        code: 1083,
        message: "User's account is suspended",
      });
    }
  }

  return {
    statusCode: 204,
  };
};
