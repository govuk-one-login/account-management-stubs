import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import assert from "node:assert/strict";
import { UserInfo } from "../common/models";
import getUserScenario from "../scenarios/scenarios";

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
  assert(TABLE_NAME, "TABLE_NAME environment variable not set");

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "OidcNonceIndex",
    KeyConditionExpression: "nonce = :nonce",
    ExpressionAttributeValues: {
      ":nonce": nonce,
    },
    Limit: 1,
  });
  const results = await dynamoDocClient.send(command);
  if (results.Items?.length !== 1) {
    throw new Error("nonce not found in DB");
  }
  return (
    (results.Items[0] as OicdPersistedData).userId ||
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

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  assert(
    event?.headers?.Authorization,
    "There is no Authorization header in the request"
  );

  const jwt = parseJwt(event.headers.Authorization);

  return {
    statusCode: 200,
    body: JSON.stringify(
      getUserScenario(await getUserId(jwt.nonce), "userinfo")
    ),
  };
};
