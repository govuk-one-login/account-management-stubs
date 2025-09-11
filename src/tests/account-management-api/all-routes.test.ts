import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import { handler } from "../../account-management-api/all-routes";
import { Response } from "../../common/response-utils";
import * as scenarioModule from "../../scenarios/scenarios-utils";

jest.mock("../../scenarios/scenarios-utils.ts");

const mockedGetUserIdFromEvent =
  scenarioModule.getUserIdFromEvent as jest.MockedFunction<
    typeof scenarioModule.getUserIdFromEvent
  >;
const mockedGetUserScenario =
  scenarioModule.getUserScenario as jest.MockedFunction<
    typeof scenarioModule.getUserScenario
  >;

const createFakeAPIGatewayProxyEvent = (
  body: unknown,
  path: string
): APIGatewayProxyEventV2 => {
  return {
    body: JSON.stringify(body),
    rawPath: path,
    pathParameters: {},
    isBase64Encoded: false,
    headers: {},
    queryStringParameters: undefined,
    stageVariables: undefined,
    version: "2.0",
    routeKey: "$default",
    rawQueryString: "",
    requestContext: {} as APIGatewayEventRequestContextV2,
  };
};

interface ResponseWithOptionalBody extends Omit<Response, "body"> {
  body?: string;
}

describe("handler", () => {
  test("returns status code 204", async () => {
    const result: Response | ResponseWithOptionalBody = await handler(
      createFakeAPIGatewayProxyEvent({}, "test")
    );
    expect(result.statusCode).toEqual(204);
  });

  test("returns status code 403 for SUSPENDED intervention", async () => {
    mockedGetUserIdFromEvent.mockResolvedValue("temporarilySuspended");
    mockedGetUserScenario.mockResolvedValue({
      suspended: true,
      blocked: false,
    } as never);
    // Call the function
    const result: Response | ResponseWithOptionalBody = await handler(
      createFakeAPIGatewayProxyEvent({}, "/authenticate")
    );
    expect(result.statusCode).toEqual(403);
    expect(result.body).toEqual(
      '{"code":1083,"message":"User\'s account is suspended"}'
    );
  });

  test("returns status code 403 for BLOCKED intervention", async () => {
    mockedGetUserIdFromEvent.mockResolvedValue("permanentlySuspended");
    mockedGetUserScenario.mockResolvedValue({
      suspended: false,
      blocked: true,
    } as never);

    const result: Response | ResponseWithOptionalBody = await handler(
      createFakeAPIGatewayProxyEvent({}, "/authenticate")
    );

    expect(result.statusCode).toEqual(403);
    expect(result.body).toEqual(
      '{"code":1084,"message":"User\'s account is blocked"}'
    );
  });

  test("returns status code 403 with BLOCKED if suspended and blocked is true", async () => {
    mockedGetUserIdFromEvent.mockResolvedValue("suspendedAndBlocked");
    mockedGetUserScenario.mockResolvedValue({
      suspended: true,
      blocked: true,
    } as never);

    const result: Response | ResponseWithOptionalBody = await handler(
      createFakeAPIGatewayProxyEvent({}, "/authenticate")
    );

    expect(result.statusCode).toEqual(403);
    expect(result.body).toEqual(
      '{"code":1084,"message":"User\'s account is blocked"}'
    );
  });

  test("/update-email returns status code 403 when email check has failed", async () => {
    const result: Response | ResponseWithOptionalBody = await handler(
      createFakeAPIGatewayProxyEvent(
        {
          replacementEmailAddress: "fail.email.check@test.com",
        },
        "/update-email"
      )
    );
    expect(result.statusCode).toEqual(403);
    expect(result.body).toEqual(
      '{"code":1089,"message":"Email address is denied"}'
    );
  });

  test("/update-email returns status code 204 when email check has passed", async () => {
    const result: Response | ResponseWithOptionalBody = await handler(
      createFakeAPIGatewayProxyEvent(
        {
          replacementEmailAddress: "test@test.com",
        },
        "/update-email"
      )
    );
    expect(result.statusCode).toEqual(204);
  });
});
