import { mockClient } from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { handler, Response } from "../oidc-authorize-stub";

const sqsMock = mockClient(SQSClient);
const queueUrl = "http://my_queue_url";
const frontendUrl = "http://home.account.gov.uk";
const state = "fQXbG9oLnvU1pw";
const token =
  ":eyJraWQiOiJCLVFNVXhkSk9KOHVia21BcmM0aTFTR21mWm5OTmxNLXZhOWgwSEowakNvIiwiYWxnIjoiRVMyNTYifQ.eyJzdWIiOiJ1cm46ZmRjOmdvdi51azoyMDIyOmZhNmNmNDA3LTNjYjEtNDU3MS1hYjJiLTZlNzQyOTA5OTllNCIsImlzcyI6Imh0dHBzOi8vb2lkYy1zdHViLmhvbWUuYWNjb3VudC5nb3YudWsiLCJhdWQiOiJWY2VyNy1pejlCTnJkVkZHLUpWcUo0azJtdnciLCJleHAiOjE2OTA0NTc3NDgsImlhdCI6MTY5MDQ1NDE0OCwic2lkIjoiZjhjNmU5MmMtZTViYS00OTMwLWI3YWEtZTZmYTY2OGFmNzRjIn0.UfkhJXC7i-3l2Qmq8XRqunJJdvCNNHBwGUFSfqIwctmvvdTz2Z_yA8oxkpsdj-fazM83XWdD4DZLJA_Zzdi0Zg";

jest.mock("uuid", () => ({ v4: () => "12345" }));

describe("handler", () => {
  const event: any = {
    queryStringParameters: {
      client_id: "Vcer7-iz9BNrdVFG-JVqJ4k2mvw",
      scope: "openid%20phone%20email%20am%20offline_access%20govuk-account",
      response_type: "code",
      redirect_uri: frontendUrl,
      state,
      nonce: "-w5rAsKJlP67ZKEhOHaY",
      vtr: "%5B%22Cl.Cm%22%5D",
    },
  };
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
    const redirectReturnUrl = `${frontendUrl}/auth/callback/?state=${state}&code=12345&id_token=${token}`;

    const result: Response = await handler(event);
    expect(result.statusCode).toEqual(302);
    expect(result.headers.Location).toEqual(redirectReturnUrl);
    expect(sqsMock.commandCalls(SendMessageCommand).length).toEqual(1);
  });
});
