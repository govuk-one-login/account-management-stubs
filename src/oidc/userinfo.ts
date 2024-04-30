import { APIGatewayProxyEvent } from "aws-lambda";
import { UserInfo } from "../common/models";

export interface Response {
  statusCode: number;
  body: string;
}

const newUserInfo = (): UserInfo => ({
  sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
  email: "your.name@example.com",
  email_verified: true,
  phone_number: "1234567890",
  phone_number_verified: true,
  updated_at: Date.now().toString(),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  return {
    statusCode: 200,
    body: JSON.stringify(newUserInfo()),
  };
};
