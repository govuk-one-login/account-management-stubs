import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import assert from "node:assert/strict";
import { components } from "./models/schema";
import { validateFields } from "../common/validation";
import { formatResponse } from "../common/response-utils";

type MfaMethod = components["schemas"]["MfaMethod"];

export interface Response {
  statusCode: number;
  body: string;
}

export const userInfoHandler = async (): Promise<Response> => {
  const response: MfaMethod[] = [
    {
      mfaIdentifier: 1,
      priorityIdentifier: "PRIMARY",
      mfaMethodType: "SMS",
      endPoint: "07123456789",
      methodVerified: true,
    },
  ];

  return formatResponse(200, response);
};

export const createMfaMethodHandler = async (
  event: APIGatewayProxyEvent,
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
    validateFields(
      { email, otp, credential, priorityIdentifier, mfaMethodType },
      {
        priorityIdentifier: /^(PRIMARY|SECONDARY)$/,
        mfaMethodType: /^(AUTH_APP|SMS)$/,
      },
    );
  } catch (e) {
    return formatResponse(400, { error: (e as Error).message });
  }

  return formatResponse(200, {});
};

export const updateMfaMethodHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    assert(event.body, "no body provided");
    const body = JSON.parse(event.body);
    const mfaIdentifier = event.pathParameters?.mfaIdentifier;
    const {
      email,
      credential,
      otp,
      mfaMethod: {
        priorityIdentifier = undefined,
        mfaMethodType = undefined,
        endPoint = undefined,
        methodVerified = false,
      } = {},
    } = body;

    validateFields(
      { email, otp, credential, mfaIdentifier },
      {
        priorityIdentifier: /^(PRIMARY|SECONDARY)$/,
        mfaMethodType: /^(AUTH_APP|SMS)$/,
      },
    );

    const response = {
      mfaIdentifier: Number(mfaIdentifier),
      priorityIdentifier,
      mfaMethodType,
      endPoint,
      methodVerified,
    };
    return formatResponse(200, response);
  } catch (error) {
    return formatResponse(500, { error: (error as Error).message });
  }
};
