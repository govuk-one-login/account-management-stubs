import { APIGatewayProxyEventV2 } from "aws-lambda";
import {
  getUserIdFromEvent,
  getUserScenario,
} from "../scenarios/scenarios-utils";
import { formatResponse } from "../common/response-utils";
import { validateBearerToken } from "../common/validation";

const OTP_REGEX = /^[0-9]{6}$/;
const EMAIL_REGEX = /[a-z0-9\\._%+!$&*=^|~#{}-]+@([a-z0-9-]+\.)+([a-z]{2,22})$/;
const OTP_DIGITS_ARE_ALL_THE_SAME = /^(.)\1*$/;

export const handler = async (event: APIGatewayProxyEventV2) => {
  try {
    validateBearerToken(event.headers?.authorization);
  } catch (e) {
    return formatResponse(403, { error: (e as Error).message });
  }

  if (event?.rawPath.includes("send-otp-notification")) {
    const userId = await getUserIdFromEvent(event);
    const scenario = getUserScenario(userId, "otpNotification");

    const status = scenario.success ? 204 : 400;

    return formatResponse(status, scenario);
  } else if (event.rawPath.includes("/update-email")) {
    if (typeof event.body == "string") {
      const body = JSON.parse(
        (event.isBase64Encoded ? atob(event.body) : event.body) ?? "{}"
      );

      if (body.replacementEmailAddress?.includes("fail.email.check")) {
        return formatResponse(403, {
          code: 1089,
          message: "Email address is denied",
        });
      }
    }
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
  } else if (event.rawPath.startsWith("/verify-otp")) {
    if (typeof event.body == "string") {
      const body = JSON.parse(event.body);
      if (
        !Object.prototype.hasOwnProperty.call(body, "email") ||
        !Object.prototype.hasOwnProperty.call(body, "otp") ||
        !Object.prototype.hasOwnProperty.call(body, "otpType")
      )
        return formatResponse(400, {
          code: 1001,
          message: "Request is missing parameters",
        });

      if (
        body.otpType !== "VERIFY_EMAIL" ||
        !OTP_REGEX.test(body.otp) ||
        !EMAIL_REGEX.test(body.email)
      )
        return formatResponse(400, {
          message: "bad request",
        });

      if (OTP_DIGITS_ARE_ALL_THE_SAME.test(body.otp))
        return formatResponse(400, {
          code: 1020,
          message: "Invalid OTP code",
        });
    } else {
      return formatResponse(400, {
        message: "bad request",
      });
    }
  }

  return {
    statusCode: 204,
  };
};
