import { components } from "./models/schema";

type MfaMethod = components["schemas"]["MfaMethod"];

export interface Response {
  statusCode: number;
  body: string;
}

export const handler = async (): Promise<Response> => {
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
