import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import assert from "node:assert/strict";
import { validateFields } from "../common/validation";
import { formatResponse } from "../common/response-utils";
import {
  getUserIdFromEvent,
  getUserScenario,
} from "../scenarios/scenarios-utils";
import { components } from "./models/schema";

export interface Response {
  statusCode: number;
  body: string;
}

export const userInfoHandler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  const response = getUserScenario(
    await getUserIdFromEvent(event),
    "mfaMethods"
  );

  if (response.length === 0) {
    // a user with no MFA factors
    return formatResponse(404, {});
  }

  if (response.length > 2) {
    // user with more than 2 methods
    return formatResponse(422, {});
  }

  const defaultMethodCount = response.filter(
    (m) => m.priorityIdentifier === "DEFAULT"
  ).length;

  if (defaultMethodCount === 0) {
    // user with no default method
    return formatResponse(422, {});
  }

  if (defaultMethodCount > 1) {
    // user with more than one default method
    return formatResponse(409, {});
  }

  const appMethodCount = response.filter(
    (m) => m.mfaMethodType === "AUTH_APP"
  ).length;

  if (appMethodCount > 1) {
    // user with more than one app method
    return formatResponse(409, {});
  }

  return formatResponse(200, response);
};

export const createMfaMethodHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
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
    const userId = await getUserIdFromEvent(event);
    const userScenario = getUserScenario(userId, "httpResponse");
    const { code: responseCode, message: responseMessage } = userScenario || {};

    if (responseCode && responseCode !== 200) {
      return formatResponse(responseCode, {
        error: responseMessage || "Unknown error",
      });
    }

    validateFields(
      { email, otp, credential, priorityIdentifier, mfaMethodType },
      {
        priorityIdentifier: /^(DEFAULT|BACKUP)$/,
        mfaMethodType: /^(AUTH_APP|SMS)$/,
      }
    );
  } catch (e) {
    return formatResponse(400, { error: (e as Error).message });
  }

  return formatResponse(200, {});
};

export const updateMfaMethodHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = await getUserIdFromEvent(event);
    const userScenario = getUserScenario(userId, "httpResponse");
    const { code: responseCode, message: responseMessage } = userScenario || {};

    if (responseCode && responseCode !== 200) {
      return formatResponse(responseCode, {
        error: responseMessage || "Unknown error",
      });
    }
    assert(event.body, "no body provided");

    const body = JSON.parse(event.body);
    const mfaIdentifier = event.pathParameters?.mfaIdentifier;
    const {
      email,
      otp,
      mfaMethod: {
        priorityIdentifier = undefined,
        mfaMethodType = undefined,
        endPoint = undefined,
        methodVerified = false,
      } = {},
    } = body;

    validateFields(
      { email, otp, mfaIdentifier },
      {
        priorityIdentifier: /^(DEFAULT|BACKUP)$/,
        mfaMethodType: /^(AUTH_APP|SMS)$/,
      }
    );

    const response: components["schemas"]["MfaMethod"] = {
      mfaIdentifier: Number(mfaIdentifier),
      priorityIdentifier,
      method: {
        mfaMethodType,
        endPoint,
      },
      methodVerified,
    };

    return formatResponse(200, response);
  } catch (error) {
    return formatResponse(500, { error: (error as Error).message });
  }
};
