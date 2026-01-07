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
  path: string,
  base64EncodeBody = false,
  authHeader?: string
): APIGatewayProxyEventV2 => {
  return {
    body: base64EncodeBody ? btoa(JSON.stringify(body)) : JSON.stringify(body),
    rawPath: path,
    pathParameters: {},
    isBase64Encoded: base64EncodeBody,
    headers: {
      authorization: authHeader || "Bearer token",
    },
    queryStringParameters: undefined,
    stageVariables: undefined,
    version: "2.0",
    routeKey: "$default",
    rawQueryString: "",
    requestContext: {} as APIGatewayEventRequestContextV2,
  };
};

const EXPECTED_MISSING_PARAMS_ERROR = {
  code: 1001,
  message: "Request is missing parameters",
};
const EXPECTED_INVALID_OTP = {
  code: 1020,
  message: "Invalid OTP code",
};
const BAD_REQUEST = {
  message: "bad request",
};

const expectBadRequestError = (
  result: Response | ResponseWithOptionalBody,
  expectedError: { code?: number; message: string },
  statusCode: number
) => {
  expect(result.statusCode).toEqual(statusCode);
  const errorBody = JSON.parse(result.body as string);
  expect(errorBody).toMatchObject(expectedError);
};

interface ResponseWithOptionalBody extends Omit<Response, "body"> {
  body?: string;
}

describe("handler", () => {
  test("returns status code 403 when Authorization header is missing", async () => {
    const event = createFakeAPIGatewayProxyEvent({}, "test", false, undefined);
    event.headers = {};
    const result: Response | ResponseWithOptionalBody = await handler(event);
    expect(result.statusCode).toEqual(403);
  });

  test("returns status code 403 when Authorization header does not start with Bearer", async () => {
    const result: Response | ResponseWithOptionalBody = await handler(
      createFakeAPIGatewayProxyEvent({}, "test", false, "Basic token")
    );
    expect(result.statusCode).toEqual(403);
  });

  test("returns status code 403 when Authorization header is 'Bearer ' without token", async () => {
    const result: Response | ResponseWithOptionalBody = await handler(
      createFakeAPIGatewayProxyEvent({}, "test", false, "Bearer ")
    );
    expect(result.statusCode).toEqual(403);
  });

  test("returns status code 204", async () => {
    const result: Response | ResponseWithOptionalBody = await handler(
      createFakeAPIGatewayProxyEvent({}, "test")
    );
    expect(result.statusCode).toEqual(204);
  });

  describe("/authenticate", () => {
    test("returns status code 204", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          { email: "test@test.com", password: "password" },
          "/authenticate"
        )
      );
      expect(result.statusCode).toEqual(204);
    });

    test("returns status code 400 when 'email' is missing", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          { password: "password" },
          "/authenticate"
        )
      );
      expectBadRequestError(result, EXPECTED_MISSING_PARAMS_ERROR, 400);
    });

    test("returns status code 400 when 'password' is missing", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          { email: "test@test.com" },
          "/authenticate"
        )
      );
      expectBadRequestError(result, EXPECTED_MISSING_PARAMS_ERROR, 400);
    });

    test("returns status code 403 for SUSPENDED intervention", async () => {
      mockedGetUserIdFromEvent.mockResolvedValue("temporarilySuspended");
      mockedGetUserScenario.mockResolvedValue({
        suspended: true,
        blocked: false,
      } as never);
      // Call the function
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          { email: "test@test.com", password: "password" },
          "/authenticate"
        )
      );
      expectBadRequestError(
        result,
        { code: 1083, message: "User's account is suspended" },
        403
      );
    });

    test("returns status code 403 for BLOCKED intervention", async () => {
      mockedGetUserIdFromEvent.mockResolvedValue("permanentlySuspended");
      mockedGetUserScenario.mockResolvedValue({
        suspended: false,
        blocked: true,
      } as never);

      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          { email: "test@test.com", password: "password" },
          "/authenticate"
        )
      );

      expectBadRequestError(
        result,
        { code: 1084, message: "User's account is blocked" },
        403
      );
    });

    test("returns status code 403 with BLOCKED if suspended and blocked is true", async () => {
      mockedGetUserIdFromEvent.mockResolvedValue("suspendedAndBlocked");
      mockedGetUserScenario.mockResolvedValue({
        suspended: true,
        blocked: true,
      } as never);

      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          { email: "test@test.com", password: "password" },
          "/authenticate"
        )
      );

      expectBadRequestError(
        result,
        { code: 1084, message: "User's account is blocked" },
        403
      );
    });
  });

  describe("/update-email", () => {
    test("returns status code 403 when email check has failed", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            replacementEmailAddress: "fail.email.check@test.com",
          },
          "/update-email"
        )
      );

      expectBadRequestError(
        result,
        { code: 1089, message: "Email address is denied" },
        403
      );
    });

    test("returns status code 204 when email check has passed", async () => {
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

    test("returns status code 403 when email check has failed (base64 encoded body)", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            replacementEmailAddress: "fail.email.check@test.com",
          },
          "/update-email",
          true
        )
      );

      expectBadRequestError(
        result,
        { code: 1089, message: "Email address is denied" },
        403
      );
    });

    test("returns status code 204 when email check has passed (base64 encoded body)", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            replacementEmailAddress: "test@test.com",
          },
          "/update-email",
          true
        )
      );
      expect(result.statusCode).toEqual(204);
    });
  });

  describe("/verify-otp-challenge", () => {
    test("returns status code 400 if body is empty", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {},
          "/verify-otp-challenge/user123",
          false
        )
      );
      expectBadRequestError(result, EXPECTED_MISSING_PARAMS_ERROR, 400);
    });

    test("returns status code 400 if body is null", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          undefined,
          "/verify-otp-challenge/user123",
          false
        )
      );
      expectBadRequestError(result, EXPECTED_MISSING_PARAMS_ERROR, 400);
    });

    test("returns status code 400 if body does not contain 'mfaMethodType'", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            otp: "123456",
          },
          "/verify-otp-challenge/user123",
          false
        )
      );
      expectBadRequestError(result, EXPECTED_MISSING_PARAMS_ERROR, 400);
    });

    test("returns status code 400 if body does not contain 'otp'", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            mfaMethodType: "EMAIL",
          },
          "/verify-otp-challenge/user123",
          false
        )
      );
      expectBadRequestError(result, EXPECTED_MISSING_PARAMS_ERROR, 400);
    });

    test("returns status code 400 if path does not contain 'publicSubjectId'", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            otp: "123456",
            mfaMethodType: "EMAIL",
          },
          "/verify-otp-challenge",
          false
        )
      );
      expectBadRequestError(result, EXPECTED_MISSING_PARAMS_ERROR, 400);
    });

    test("returns status code 400 if body does not contain a valid 'mfaMethodType'", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            otp: "123456",
            mfaMethodType: "XYZ",
          },
          "/verify-otp-challenge/user123",
          false
        )
      );
      expectBadRequestError(result, BAD_REQUEST, 400);
    });

    test("returns status code 400 if body does not contain a valid 'otp'", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            otp: "abcdef",
            mfaMethodType: "EMAIL",
          },
          "/verify-otp-challenge/user123",
          false
        )
      );
      expectBadRequestError(result, BAD_REQUEST, 400);
    });

    test("returns status code 400 if OTP is invalid (all digits the same)", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            otp: "000000",
            mfaMethodType: "EMAIL",
          },
          "/verify-otp-challenge/user123",
          false
        )
      );
      expectBadRequestError(result, EXPECTED_INVALID_OTP, 400);
    });

    test("returns status code 204 when OTP check has passed", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            otp: "123456",
            mfaMethodType: "EMAIL",
          },
          "/verify-otp-challenge/user123",
          false
        )
      );
      expect(result.statusCode).toEqual(204);
    });
  });

  describe("/send-otp-challenge", () => {
    test("returns status code 400 if body is empty", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent({}, "/send-otp-challenge/user123", false)
      );
      expectBadRequestError(result, EXPECTED_MISSING_PARAMS_ERROR, 400);
    });

    test("returns status code 400 if body is null", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          undefined,
          "/send-otp-challenge/user123",
          false
        )
      );
      expectBadRequestError(result, EXPECTED_MISSING_PARAMS_ERROR, 400);
    });

    test("returns status code 400 if body does not contain 'mfaMethodType'", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent({}, "/send-otp-challenge/user123", false)
      );
      expectBadRequestError(result, EXPECTED_MISSING_PARAMS_ERROR, 400);
    });

    test("returns status code 400 if path does not contain 'publicSubjectId'", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            mfaMethodType: "EMAIL",
          },
          "/send-otp-challenge",
          false
        )
      );
      expectBadRequestError(result, EXPECTED_MISSING_PARAMS_ERROR, 400);
    });

    test("returns status code 400 if body does not contain a valid 'mfaMethodType'", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            mfaMethodType: "XYZ",
          },
          "/send-otp-challenge/user123",
          false
        )
      );
      expectBadRequestError(result, BAD_REQUEST, 400);
    });

    test("returns status code 204", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            mfaMethodType: "EMAIL",
          },
          "/send-otp-challenge/user123",
          false
        )
      );
      expect(result.statusCode).toEqual(204);
    });
  });

  describe("/send-otp-notification", () => {
    test("returns status code 400 when phone number starts with +47", async () => {
      const result: Response | ResponseWithOptionalBody = await handler(
        createFakeAPIGatewayProxyEvent(
          {
            mfaMethod: {
              phoneNumber: "+4712345678",
            },
          },
          "/send-otp-notification",
          false
        )
      );
      expect(result.statusCode).toEqual(400);
      const responseBody = JSON.parse(result.body as string);
      expect(responseBody).toStrictEqual({ success: false });
    });
  });
});
