import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { formatResponse, Response } from "../common/response-utils";
import { getUserScenario } from "../scenarios/scenarios-utils";
import { components } from "./models/schema";

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

export const createMfaMethodHandler =
  async (): Promise<APIGatewayProxyResult> => {
    return formatResponse(401, { error: "Test 401" });
  };

export const updateMfaMethodHandler =
  async (): Promise<APIGatewayProxyResult> => {
    return formatResponse(401, { error: "Test 401" });
  };

export const deleteMethodHandler = async (): Promise<APIGatewayProxyResult> => {
  return formatResponse(401, { error: "Test 401" });
};
