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
  return formatResponse(401, { error: "Test 401" });
};

export const updateMfaMethodHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return formatResponse(401, { error: "Test 401" });
};

export const deleteMethodHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return formatResponse(401, { error: "Test 401" });
};
