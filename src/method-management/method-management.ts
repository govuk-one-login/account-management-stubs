import { APIGatewayProxyEvent } from "aws-lambda";
import { components } from "./models/schema";
import assert from 'node:assert/strict'

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

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};

export const createMfaMethodHandler = async (event: APIGatewayProxyEvent): Promise<Response> => {
  const { email, otp, credential, mfaMethod: {priorityIdentifier, mfaMethodType}} = JSON.parse(event.body || '{}');
  try {
    assert(email, 'no email provided')
    assert(otp, 'no otp provided')
    assert(credential, 'no credential provided')
    assert.match(priorityIdentifier, /^(PRIMARY|SECONDARY)$/, 'invalid priorityIdentifier')
    assert.match(mfaMethodType, /^(AUTH_APP|SMS)$/, 'invalid mfaMethodType')
  } catch(e) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: (e as Error).message}),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({}),
  };
};
