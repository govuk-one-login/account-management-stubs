import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import assert from "node:assert/strict";
import { UserInfo } from "../common/models";

export interface Response {
  statusCode: number;
  body: string;
}

interface OicdPersistedData {
  code: string;
  nonce: string;
  userId: string;
}

const marshallOptions = {
  convertClassInstanceToMap: true,
};
const translateConfig = { marshallOptions };
const dynamoClient = new DynamoDBClient({});
const dynamoDocClient = DynamoDBDocumentClient.from(
  dynamoClient,
  translateConfig
);

const getUserId = async (nonce: string): Promise<string> => {
  const { TABLE_NAME } = process.env;
  const command = new GetCommand({
    TableName: TABLE_NAME,
    Key: {
      nonce,
    },
  });
  const results = await dynamoDocClient.send(command);
  if (results.Item === undefined) {
    throw new Error("nonce not found in DB");
  }
  return (
    (results.Item as OicdPersistedData).userId ||
    "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA"
  );
};

const parseJwt = (
  token: string
): {
  nonce: string;
} => {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};

const newUserInfo = (userId: string): UserInfo => ({
  sub: userId,
  email: "your.name@example.com",
  email_verified: true,
  phone_number: "1234567890",
  phone_number_verified: true,
  updated_at: Date.now().toString(),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  assert(event?.headers?.Authorization);

  console.log("event", event);
  const jwt = parseJwt(event?.headers?.Authorization);

  return {
    statusCode: 200,
    body: JSON.stringify(newUserInfo(await getUserId(jwt.nonce))),
  };
};
