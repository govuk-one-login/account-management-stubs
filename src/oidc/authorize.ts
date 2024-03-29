import { v4 as uuid } from "uuid";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  PutCommandOutput,
} from "@aws-sdk/lib-dynamodb";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventQueryStringParameters,
} from "aws-lambda";
import {
  SendMessageCommand,
  SendMessageRequest,
  SQSClient,
} from "@aws-sdk/client-sqs";

import { TxmaEvent } from "../common/models";

const marshallOptions = {
  convertClassInstanceToMap: true,
};
const translateConfig = { marshallOptions };

const dynamoClient = new DynamoDBClient({});
const dynamoDocClient = DynamoDBDocumentClient.from(
  dynamoClient,
  translateConfig
);
export interface Response {
  statusCode: number;
  headers: {
    Location: string;
  };
}

const newTxmaEvent = (): TxmaEvent => ({
  event_id: uuid(),
  timestamp: Date.now(),
  event_name: "AUTH_AUTH_CODE_ISSUED",
  client_id: "vehicleOperatorLicense",
  user: {
    user_id: "user_id",
    session_id: uuid(),
  },
});

export const sendSqsMessage = async (
  messageBody: string,
  queueUrl: string | undefined
): Promise<string | undefined> => {
  const { AWS_REGION } = process.env;
  const client = new SQSClient({ region: AWS_REGION });
  const message: SendMessageRequest = {
    QueueUrl: queueUrl,
    MessageBody: messageBody,
  };
  const result = await client.send(new SendMessageCommand(message));
  return result.MessageId;
};

export const writeNonce = async (
  code: string,
  nonce: string
): Promise<PutCommandOutput> => {
  const { TABLE_NAME } = process.env;

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: {
      code,
      nonce,
    },
  });
  return dynamoDocClient.send(command);
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<Response> => {
  const queryStringParameters: APIGatewayProxyEventQueryStringParameters =
    event.queryStringParameters as APIGatewayProxyEventQueryStringParameters;

  const { state, nonce } = queryStringParameters;
  const redirectUri = queryStringParameters.redirect_uri;
  const { DUMMY_TXMA_QUEUE_URL } = process.env;

  const code = uuid();

  if (
    typeof DUMMY_TXMA_QUEUE_URL === "undefined" ||
    typeof nonce === "undefined"
  ) {
    throw new Error(
      "TXMA Queue URL or Frontend URL environemnt variables is null"
    );
  }
  try {
    await writeNonce(code, nonce);

    await sendSqsMessage(JSON.stringify(newTxmaEvent()), DUMMY_TXMA_QUEUE_URL);
    return {
      statusCode: 302,
      headers: {
        Location: `${redirectUri}?state=${state}&code=${code}`,
      },
    };
  } catch (err) {
    console.error(`Error :: ${err}`);
    return {
      statusCode: 500,
      headers: {
        Location: "Internal Server Error ",
      },
    };
  }
};
