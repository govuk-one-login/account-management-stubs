import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import assert from "node:assert/strict";
import { validateFields } from "../common/validation";
import { formatResponse, Response } from "../common/response-utils";
import { getUserScenario } from "../scenarios/scenarios-utils";
import { components } from "./models/schema";

function createMfaMethod(
  priorityIdentifier: string,
  mfaMethodType: "SMS" | "AUTH_APP",
  mfaIdentifier = "1"
) {
  let method = {};
  if (mfaMethodType == "SMS") {
    method = { mfaMethodType, phoneNumber: "0123456789" };
  } else if (mfaMethodType == "AUTH_APP") {
    method = { mfaMethodType, credential: "aabbccddeeff112233" };
  }

  return {
    mfaIdentifier,
    priorityIdentifier,
    method,
  };
}

function handleMFAResponse(response: components["schemas"]["MfaMethod"][]) {
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
    (m) => m.method.mfaMethodType === "AUTH_APP"
  ).length;

  if (appMethodCount > 1) {
    // user with more than one app method
    return formatResponse(409, {});
  }

  return formatResponse(200, response);
}

export const retrieveMfaMethodHandler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  const publicSubjectId = event.pathParameters?.publicSubjectId;
  const response = getUserScenario(
    publicSubjectId ? publicSubjectId : "default",
    "mfaMethods"
  );
  return handleMFAResponse(response);
};

export const createMfaMethodHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const {
    priorityIdentifier = undefined,
    method: { mfaMethodType = undefined } = {},
  } = JSON.parse(event.body || "{}").mfaMethod ?? {};

  const publicSubjectId = event.pathParameters?.publicSubjectId || "default";
  const userScenario = getUserScenario(publicSubjectId, "httpResponse");

  try {
    const { code: responseCode, message: responseMessage } = userScenario || {};

    if (responseCode && responseCode !== 200) {
      return formatResponse(responseCode, {
        error: responseMessage || "Unknown error",
      });
    }

    validateFields(
      { priorityIdentifier, mfaMethodType },
      {
        priorityIdentifier: /^(DEFAULT|BACKUP)$/,
        mfaMethodType: /^(AUTH_APP|SMS)$/,
      }
    );
  } catch (e) {
    return formatResponse(400, { error: (e as Error).message });
  }

  return formatResponse(
    200,
    createMfaMethod(priorityIdentifier, mfaMethodType)
  );
};

export const updateMfaMethodHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const {
    priorityIdentifier = undefined,
    method: { mfaMethodType = undefined } = {},
  } = JSON.parse(event.body || "{}").mfaMethod ?? {};

  const publicSubjectId = event.pathParameters?.publicSubjectId || "default";
  const mfaIdentifier = event.pathParameters?.mfaIdentifier;
  const userScenario = getUserScenario(publicSubjectId, "httpResponse");

  try {
    assert(mfaIdentifier, "mfaIdentifier not present");
    const { code: responseCode, message: responseMessage } = userScenario || {};

    if (responseCode && responseCode !== 200) {
      return formatResponse(responseCode, {
        error: responseMessage || "Unknown error",
      });
    }

    validateFields(
      { priorityIdentifier },
      {
        priorityIdentifier: /^(DEFAULT|BACKUP)$/,
      }
    );
  } catch (e) {
    return formatResponse(400, { error: (e as Error).message });
  }

  return formatResponse(
    200,
    createMfaMethod(priorityIdentifier, mfaMethodType, mfaIdentifier)
  );
};

export const deleteMethodHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const publicSubjectId = event.pathParameters?.publicSubjectId || "default";
  const mfaIdentifier = event.pathParameters?.mfaIdentifier;

  const methods = getUserScenario(publicSubjectId, "mfaMethods");
  const methodToRemove = methods.find((m) => m.mfaIdentifier == mfaIdentifier);

  if (!methodToRemove) {
    return formatResponse(404, {});
  }

  if (methodToRemove.priorityIdentifier === "DEFAULT") {
    return formatResponse(409, {});
  }

  return formatResponse(204, {});
};
