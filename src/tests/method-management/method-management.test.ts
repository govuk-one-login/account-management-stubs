import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { components } from "../../method-management/models/schema";
import {
  userInfoHandler,
  updateMfaMethodHandler,
  Response,
} from "../../method-management/method-management";

type MfaMethod = components["schemas"]["MfaMethod"];

describe("MFA Management API Mock", () => {
  test("Registered user with a single MFA of type SMS", async () => {
    // Act
    const result: Response = await userInfoHandler();

    // Assert
    expect(result).toBeDefined();
    expect(result.statusCode).toEqual(200);
    expect(result.body).toBeDefined();
    const mfaMethod: MfaMethod[] = JSON.parse(result.body);
    expect(mfaMethod.length).toEqual(1);
    expect(mfaMethod[0].mfaIdentifier).toEqual(1);
    expect(mfaMethod[0].priorityIdentifier).toEqual("PRIMARY");
    expect(mfaMethod[0].mfaMethodType).toEqual("SMS");
    expect(mfaMethod[0].endPoint).toEqual("07123456789");
    expect(mfaMethod[0].methodVerified).toBe(true);
  });
});

describe("updateMfaMethodHandler", () => {
  const createFakeAPIGatewayProxyEvent = (
    body: unknown,
    mfaIdentifier: string,
  ): APIGatewayProxyEvent => {
    return {
      body: JSON.stringify(body),
      httpMethod: "PUT",
      path: `/mfa-methods/${mfaIdentifier}`,
      pathParameters: { mfaIdentifier },
      isBase64Encoded: false,
      headers: {},
      multiValueHeaders: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext:
        {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
      resource: "",
    };
  };

  test("should return 200 and the updated method when the request is valid", async () => {
    const requestBody = {
      email: "email@email.com",
      credential: "email",
      otp: "123456",
      mfaMethod: {
        mfaIdentifier: 1,
        priorityIdentifier: "PRIMARY",
        mfaMethodType: "SMS",
        endPoint: "07123456789",
        methodVerified: true,
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(requestBody, "1");
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject(requestBody.mfaMethod);
  });
});
