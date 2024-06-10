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
  remove_at: string;
}

interface UserScenarios {
  default: {
    userinfo: {
      email: string;
      email_verified: boolean;
      sub: string;
      phone_number: string;
      phone_number_verified: boolean;
      updated_at: string;
    };
    mfaMethods: {
      mfaIdentifier: number;
      priorityIdentifier: "PRIMARY" | "SECONDARY";
      mfaMethodType: "SMS" | "AUTH_APP";
      endPoint?: string;
      methodVerified: boolean;
    }[];
  };
  [key: string]: Partial<UserScenarios["default"]>;
}

export const userScenarios: UserScenarios = {
  default: {
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
  userPrimaryAuthApp: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "AUTH_APP",
        methodVerified: true,
      },
    ],
  },
  userPrimarySms: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "0123456789",
        methodVerified: true,
      },
    ],
  },
  userPrimarySmsBackupAuthApp: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "0123456789",
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "AUTH_APP",
        methodVerified: true,
      },
    ],
  },
  userPrimaryAuthAppBackupSms: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "AUTH_APP",
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "0123456789",
        methodVerified: true,
      },
    ],
  },
  userPrimarySmsBackupSms: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "0123456789",
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
    ],
  },
  errorNoMfaMethods: {
    mfaMethods: [],
  },
  errorMoreThanTwoMethods: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
      {
        mfaIdentifier: 3,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
    ],
  },
  errorNoPrimaryMethod: {
    mfaMethods: [
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
      {
        mfaIdentifier: 3,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
    ],
  },
  errorMultiplePrimaryMethods: {
    mfaMethods: [
      {
        mfaIdentifier: 2,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
      {
        mfaIdentifier: 3,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "99940850934",
        methodVerified: true,
      },
    ],
  },
  errorMultipleAuthAppMethods: {
    mfaMethods: [
      {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "AUTH_APP",
        methodVerified: true,
      },
      {
        mfaIdentifier: 2,
        priorityIdentifier: "SECONDARY",
        mfaMethodType: "AUTH_APP",
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

export const getUserScenario = <
  T extends keyof UserScenarios[keyof UserScenarios],
>(
  userId: keyof typeof userScenarios,
  scenario: T
): UserScenarios["default"][T] => {
  const id = userScenarios[userId] ? userId : "default";

  const response =
    userScenarios[id][scenario] || userScenarios.default[scenario];

  if ("email" in response) {
    response.email = `${id}@example.org`;
  }

  return response;
};
