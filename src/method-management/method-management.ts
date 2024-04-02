import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy";
import { components } from "./models/schema";

type MfaMethod = components["schemas"]["MfaMethod"];

export interface Response {
  statusCode: number;
  body: string;
}

const userInfoHandler = async (): Promise<Response> => {
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

const createMfaMethodHandler = async (): Promise<Response> => {

  return {
    statusCode: 200,
    body: JSON.stringify({})
  }
}

export const handler = async (event: APIGatewayProxyEvent): Promise<Response> => {
  if (event.path.endsWith('/retrieve')) {
    return userInfoHandler();
  }

  if (event.path.endsWith('/mfa-methods')) {
    return createMfaMethodHandler();
  }
}
