import { v4 as uuid } from "uuid";
import {
  SendMessageCommand,
  SendMessageRequest,
  SQSClient,
} from "@aws-sdk/client-sqs";

import { TxmaEvent } from "./models";

export interface Response {
  statusCode: number;
  headers: {
    Location: string;
  };
}

const redirectReturnPath = "/auth/callback";

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

export const handler = async (): Promise<Response> => {
  const { DUMMY_TXMA_QUEUE_URL } = process.env;
  const { ACCOUNT_MANAGEMENT_URL } = process.env;

  if (
    typeof DUMMY_TXMA_QUEUE_URL === "undefined" ||
    typeof ACCOUNT_MANAGEMENT_URL === "undefined"
  ) {
    throw new Error(
      "TXMA Queue URL or Frontend URL environemnt variables is null"
    );
  }

  sendSqsMessage(JSON.stringify(newTxmaEvent()), DUMMY_TXMA_QUEUE_URL);
  return {
    statusCode: 302,
    headers: {
      Location: `${ACCOUNT_MANAGEMENT_URL}${redirectReturnPath}`,
    },
  };
};
