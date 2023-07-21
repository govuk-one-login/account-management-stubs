import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { handler, Response } from "../oidc-authorize-stub";

const sqsMock = mockClient(SQSClient);

const queueUrl = "http://my_queue_url";
const frontendUrl = "http://home.account.gov.uk";

describe("handler", () => {
  beforeEach(() => {
    sqsMock.reset();
    process.env.DUMMY_TXMA_QUEUE_URL = queueUrl;
    process.env.ACCOUNT_MANAGEMENT_URL = frontendUrl;
    sqsMock.on(SendMessageCommand).resolves({ MessageId: "messageId" });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("sends message to TXMA Queue and returns a redirect", async () => {
    const result: Response = await handler();
    expect(result.statusCode).toEqual(302);
    expect(result.headers.Location).toEqual(frontendUrl);
    expect(sqsMock.commandCalls(SendMessageCommand).length).toEqual(1);
  });
});
