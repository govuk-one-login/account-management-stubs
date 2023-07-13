import { v4 as uuid } from "uuid";
import {
  SendMessageCommand,
  SendMessageRequest,
  SQSClient,
} from "@aws-sdk/client-sqs";

import { TxmaEvent } from "./models";

export interface Response {
  statusCode: number;
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

export const handler = async () => {
  console.log("DEBUG request recieved");
  const { DUMMY_TXMA_QUEUE } = process.env;
  console.log(DUMMY_TXMA_QUEUE);
  sendSqsMessage(JSON.stringify(newTxmaEvent()), DUMMY_TXMA_QUEUE);
  console.log("Sent SQS message")
  return {
    statusCode: 302,
    headers: {
      Location: "home.build.account.gov.uk",
    },
  };
};
