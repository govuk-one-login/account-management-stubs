import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { components } from "../../method-management/models/schema";
import {
  updateMfaMethodHandler,
  Response,
  createMfaMethodHandler,
  deleteMethodHandler,
  retrieveMfaMethodHandler,
} from "../../method-management/method-management";
import { APIGatewayProxyEventHeaders } from "aws-lambda/trigger/api-gateway-proxy";

type MfaMethod = components["schemas"]["MfaMethod"];

interface HttpResponse {
  code: number;
  message: string;
}

interface Scenario {
  httpResponse: HttpResponse;
  mfaMethods?: MfaMethod[];
  [key: string]: HttpResponse | MfaMethod[] | undefined;
}

jest.mock("../../scenarios/scenarios-utils.ts", () => {
  return {
    getUserIdFromEvent: jest.fn().mockImplementation((event) => {
      if (event.headers.Authorization === "errorToken") {
        return Promise.resolve("errorMfa400");
      }
      if (event.headers.Authorization === "reject") {
        return Promise.reject("MFA Method could not be updated");
      }
      if (event.headers.Authorization === "mfaNotFound") {
        return Promise.resolve("errorMfa404");
      }
      if (event.headers.Authorization === "delete") {
        return Promise.resolve("deleteMethod");
      }
      return Promise.resolve("default");
    }),
    getUserScenario: jest.fn((userId: string, type: string) => {
      const scenarios: Record<string, Scenario> = {
        default: {
          httpResponse: {
            code: 200,
            message: "OK",
          },
          mfaMethods: [
            {
              mfaIdentifier: "1",
              priorityIdentifier: "DEFAULT",
              method: {
                mfaMethodType: "SMS",
                phoneNumber: "07123456789",
              },
              methodVerified: true,
            },
          ],
        },
        deleteMethod: {
          httpResponse: {
            code: 200,
            message: "OK",
          },
          mfaMethods: [
            {
              mfaIdentifier: "1",
              priorityIdentifier: "DEFAULT",
              method: {
                mfaMethodType: "SMS",
                phoneNumber: "07123456789",
              },
              methodVerified: true,
            },
            {
              mfaIdentifier: "2",
              priorityIdentifier: "BACKUP",
              method: {
                mfaMethodType: "AUTH_APP",
                credential: "ABC",
              },
              methodVerified: true,
            },
          ],
        },
        errorMfa400: {
          httpResponse: {
            code: 400,
            message: "BAD REQUEST",
          },
          mfaMethods: [
            {
              mfaIdentifier: "1",
              priorityIdentifier: "DEFAULT",
              method: {
                mfaMethodType: "SMS",
                phoneNumber: "07123456789",
              },
              methodVerified: true,
            },
          ],
        },
        errorMfa404: {
          httpResponse: {
            code: 404,
            message: "Not Found",
          },
          mfaMethods: [
            {
              mfaIdentifier: "1",
              priorityIdentifier: "DEFAULT",
              method: {
                mfaMethodType: "SMS",
                phoneNumber: "07123456789",
              },
              methodVerified: true,
            },
          ],
        },
        errorMfa500: {
          httpResponse: {
            code: 500,
            message: "METHOD COULD NOT BE UPDATED",
          },
        },
      };

      if (scenarios[userId]) {
        if (type && scenarios[userId][type]) {
          return scenarios[userId][type];
        } else {
          return scenarios[userId];
        }
      } else {
        return null;
      }
    }),
  };
});

describe("retrieveMfaMethodHandler", () => {
  const createFakeAPIGatewayProxyEvent = (
    body: unknown,
    mfaIdentifier: string
  ): APIGatewayProxyEvent => {
    return {
      body: JSON.stringify(body),
      httpMethod: "GET",
      path: `/mfa-methods/${mfaIdentifier}`,
      pathParameters: { mfaIdentifier },
      isBase64Encoded: false,
      multiValueHeaders: {},
      queryStringParameters: null,
      headers: {
        Authorization: "delete", // used to switch mock scenarios
      },
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext:
        {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
      resource: "",
    };
  };
  test("Retrieve mfa methods for identifier", async () => {
    // Act
    const fakeEvent = createFakeAPIGatewayProxyEvent({}, "default");
    const result: Response = await retrieveMfaMethodHandler(fakeEvent);
    // Assert
    expect(result).toBeDefined();
    expect(result.statusCode).toEqual(200);
    expect(result.body).toBeDefined();
    const mfaMethod: MfaMethod[] = JSON.parse(result.body);
    expect(mfaMethod.length).toEqual(1);
    expect(mfaMethod[0].mfaIdentifier).toEqual("1");
    expect(mfaMethod[0].priorityIdentifier).toEqual("DEFAULT");
    expect(mfaMethod[0].method.mfaMethodType).toEqual("SMS");
    expect(
      mfaMethod[0].method.mfaMethodType === "SMS"
        ? mfaMethod[0].method.phoneNumber
        : false
    ).toEqual("07123456789");
    expect(mfaMethod[0].methodVerified).toBe(true);
  });
});

describe("createMfaMethodHandler", () => {
  const createFakeAPIGatewayProxyEvent = (
    scenario: string,
    body: unknown
  ): APIGatewayProxyEvent => {
    return {
      body: JSON.stringify(body),
      httpMethod: "POST",
      path: `/mfa-methods/${scenario}`,
      pathParameters: { publicSubjectId: scenario },
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

  test("should return 200 when adding phone number as backup method the request is valid", async () => {
    const requestBody = {
      priorityIdentifier: "BACKUP",
      method: {
        mfaMethodType: "SMS",
        phoneNumber: "07123456789",
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent("default", requestBody);
    const response = await createMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual({
      method: {
        mfaMethodType: "SMS",
        phoneNumber: "0123456789",
      },
      mfaIdentifier: "1",
      priorityIdentifier: "BACKUP",
    });
  });

  test("should return 400 when the MFA method type is not valid", async () => {
    const requestBody = {
      priorityIdentifier: "BAD_VALUE",
      method: {
        mfaMethodType: "SMS",
        phoneNumber: "07123456789",
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent("default", requestBody);
    const response = await createMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(400);
  });

  test("should pass through the response code from the scenario", async () => {
    const requestBody = {
      priorityIdentifier: "BACKUP",
      method: {
        mfaMethodType: "SMS",
        phoneNumber: "07123456789",
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      "errorMfa404",
      requestBody
    );
    const response = await createMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(404);
  });
});

describe("updateMfaMethodHandler", () => {
  const createFakeAPIGatewayProxyEvent = (
    body: unknown,
    mfaIdentifier: string
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

  test("should return 200 and the updated SMS method when the request is valid", async () => {
    const requestBody = {
      email: "email@email.com",
      credential: "email",
      otp: "123456",
      mfaMethod: {
        mfaIdentifier: 1,
        priorityIdentifier: "BACKUP",
        mfaMethodType: "SMS",
        endPoint: "07123456789",
        methodVerified: true,
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(requestBody, "1");
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      mfaIdentifier: 1,
      priorityIdentifier: "BACKUP",
      method: {
        mfaMethodType: "SMS",
        phoneNumber: "07123456789",
      },
      methodVerified: true,
    });
  });

  test("should return 200 and the updated auth app method when the request is valid", async () => {
    const requestBody = {
      email: "email@email.com",
      credential: "email",
      otp: "123456",
      mfaMethod: {
        mfaIdentifier: 1,
        priorityIdentifier: "DEFAULT",
        mfaMethodType: "AUTH_APP",
        endPoint: "ABC",
        methodVerified: true,
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(requestBody, "1");
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      mfaIdentifier: 1,
      priorityIdentifier: "DEFAULT",
      method: {
        mfaMethodType: "AUTH_APP",
        credential: "ABC",
      },
      methodVerified: true,
    });
  });

  test("should return 200 even when credential is not provided", async () => {
    const requestBody = {
      email: "email@email.com",
      otp: "123456",
      mfaMethod: {
        mfaIdentifier: 1,
        priorityIdentifier: "DEFAULT",
        mfaMethodType: "SMS",
        endPoint: "07111111111",
        methodVerified: true,
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(requestBody, "1");
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      mfaIdentifier: 1,
      priorityIdentifier: "DEFAULT",
      method: {
        mfaMethodType: "SMS",
        phoneNumber: "07111111111",
      },
      methodVerified: true,
    });
  });
});

describe("updateMfaMethodHandlerError", () => {
  const createFakeAPIGatewayProxyEvent = (
    headers: APIGatewayProxyEventHeaders,
    body: unknown,
    mfaIdentifier: string
  ): APIGatewayProxyEvent => {
    return {
      body: JSON.stringify(body),
      httpMethod: "PUT",
      path: `/mfa-methods/${mfaIdentifier}`,
      pathParameters: { mfaIdentifier },
      isBase64Encoded: false,
      headers,
      multiValueHeaders: {},
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext:
        {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
      resource: "",
    };
  };

  test("should return 404", async () => {
    const headers = {
      Authorization: "mfaNotFound",
    };
    const requestBody = {
      email: "errorMfa404@email.com",
      credential: "email",
      otp: "123456",
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(headers, requestBody, "1");
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(404);
  });

  test("should return 400", async () => {
    const headers = {
      Authorization: "errorToken",
    };
    const requestBody = {
      email: "errorMfa400@email.com",
      credential: "email",
      otp: "123456",
      mfaMethod: {
        mfaIdentifier: 1,
        priorityIdentifier: "DEFAULT",
        mfaMethodType: "SMS",
        phoneNumber: "07123456789",
        methodVerified: true,
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(headers, requestBody, "1");
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(400);
  });

  test("should return 500", async () => {
    const headers = {
      Authorization: "reject",
    };
    const requestBody = {
      email: "errorMfa500@email.com",
      credential: "email",
      otp: "123456",
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(headers, requestBody, "1");
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(500);
  });
});

describe("deleteMethodHandler", () => {
  const createFakeAPIGatewayProxyEvent = (
    body: unknown,
    mfaIdentifier: string
  ): APIGatewayProxyEvent => {
    return {
      body: JSON.stringify(body),
      httpMethod: "DELETE",
      path: `/mfa-methods/${mfaIdentifier}`,
      pathParameters: { mfaIdentifier },
      isBase64Encoded: false,
      multiValueHeaders: {},
      queryStringParameters: null,
      headers: {
        Authorization: "delete", // used to switch mock scenarios
      },
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext:
        {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
      resource: "",
    };
  };

  test("should delete MFA method correctly", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent({}, "2");
    const response = await deleteMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(200);
  });

  test("should 409 if user tries to delete default method", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent({}, "1");
    const response = await deleteMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(409);
  });

  test("should 404 if user tries to delete non existent method", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent({}, "3");
    const response = await deleteMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(404);
  });
});
