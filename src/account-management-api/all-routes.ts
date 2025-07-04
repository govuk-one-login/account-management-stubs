import { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  getUserIdFromEvent,
  getUserScenario,
} from "../scenarios/scenarios-utils";
import { formatResponse } from "../common/response-utils";

export const handler = async (event: APIGatewayProxyEventV2) => {
  if (event?.rawPath.includes("send-otp-notification")) {
    return formatResponse(401, { error: "Test 401" });
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
