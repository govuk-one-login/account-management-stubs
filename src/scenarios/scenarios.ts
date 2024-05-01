import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import assert from "node:assert/strict";
import { APIGatewayProxyEvent } from "aws-lambda";

const marshallOptions = {
  convertClassInstanceToMap: true,
};

const translateConfig = { marshallOptions };
const dynamoClient = new DynamoDBClient({});
const dynamoDocClient = DynamoDBDocumentClient.from(
  dynamoClient,
  translateConfig
);

interface OicdPersistedData {
  code: string;
  nonce: string;
  userId: string;
}

interface UserScenarios {
  [key: string]: {
    userinfo: {
      email: string;
      email_verified: boolean;
      sub: keyof UserScenarios;
      phone_number: string;
      phone_number_verified: boolean;
      updated_at: string;
    };
    mfaMethods: {
      mfaIdentifier: number;
      priorityIdentifier: "PRIMARY" | "SECONDARY";
      mfaMethodType: "SMS" | "AUTH_APP";
      endPoint: string;
      methodVerified: boolean;
    }[];
  };
}

type NestedKeys<T> = keyof T[keyof T];

const userScenarios: UserScenarios = {
  "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA": {
    userinfo: {
      sub: "F5CE808F-75AB-4ECD-BBFC-FF9DBF5330FA",
      email: "your.name@example.com",
      email_verified: true,
      phone_number: "1234567890",
      phone_number_verified: true,
      updated_at: Date.now().toString(),
    },
    mfaMethods: [
      {
        mfaIdentifier: 0,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "07123456789",
        methodVerified: true,
      },
    ],
  },
  user1: {
    userinfo: {
      email: "user1@example.com",
      email_verified: true,
      sub: "user1",
      phone_number: "999",
      phone_number_verified: true,
      updated_at: Date.now().toString(),
    },
    mfaMethods: [
      {
        mfaIdentifier: 0,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "07123456789",
        methodVerified: true,
      },
      {
        mfaIdentifier: 1,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "AUTH_APP",
        endPoint: "1Password",
        methodVerified: true,
      },
    ],
  },
};

const parseJwt = (
  token: string
): {
  nonce: string;
} => {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
};

export const getUserIdFromEvent = async (
  event: APIGatewayProxyEvent
): Promise<string> => {
  const { TABLE_NAME } = process.env;
  assert(TABLE_NAME, "TABLE_NAME environment variable not set");
  assert(
    event?.headers?.Authorization,
    "There is no Authorization header in the request"
  );

  const jwt = parseJwt(event.headers.Authorization);

  const command = new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: "OidcNonceIndex",
    KeyConditionExpression: "nonce = :nonce",
    ExpressionAttributeValues: {
      ":nonce": jwt.nonce,
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

export const getUserScenario = (
  userId: keyof typeof userScenarios,
  scenario: NestedKeys<UserScenarios>
) => {
  assert(
    userScenarios[userId] && userScenarios[userId][scenario],
    `scenario "${scenario}" does not exist for user "${userId}"`
  );

  return userScenarios[userId][scenario];
};
