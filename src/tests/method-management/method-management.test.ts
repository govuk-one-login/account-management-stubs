import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayEventRequestContextWithAuthorizer,
  APIGatewayProxyEvent,
} from "aws-lambda";
import { components } from "../../method-management/models/schema";
import {
  updateMfaMethodHandler,
  createMfaMethodHandler,
  deleteMethodHandler,
  retrieveMfaMethodHandler,
} from "../../method-management/method-management";
import { Response } from "../../common/response-utils";

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
    mfaIdentifier: string,
    authHeader?: string
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
        Authorization: authHeader || "Bearer token",
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

  test("should return 403 when Authorization header is missing", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent({}, "default", undefined);
    fakeEvent.headers = {};
    const result = await retrieveMfaMethodHandler(fakeEvent);
    expect(result.statusCode).toBe(403);
  });

  test("should return 403 when Authorization header does not start with Bearer", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      {},
      "default",
      "Basic token"
    );
    const result = await retrieveMfaMethodHandler(fakeEvent);
    expect(result.statusCode).toBe(403);
  });

  test("should return 403 when Authorization header is 'Bearer ' without token", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent({}, "default", "Bearer ");
    const result = await retrieveMfaMethodHandler(fakeEvent);
    expect(result.statusCode).toBe(403);
  });
});

describe("createMfaMethodHandler", () => {
  const createFakeAPIGatewayProxyEvent = (
    scenario: string,
    body: unknown,
    authHeader?: string
  ): APIGatewayProxyEvent => {
    return {
      body: JSON.stringify(body),
      httpMethod: "POST",
      path: `/mfa-methods/${scenario}`,
      pathParameters: { publicSubjectId: scenario },
      isBase64Encoded: false,
      headers: {
        Authorization: authHeader || "Bearer token",
      },
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
      mfaMethod: {
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
          otp: "987654",
        },
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
      mfaMethod: {
        priorityIdentifier: "BAD_VALUE",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent("default", requestBody);
    const response = await createMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(400);
  });

  test("should pass through the response code from the scenario", async () => {
    const requestBody = {
      mfaMethod: {
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      "errorMfa404",
      requestBody
    );
    const response = await createMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(404);
  });

  test("should return 403 when Authorization header is missing", async () => {
    const requestBody = {
      mfaMethod: {
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
          otp: "987654",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      "default",
      requestBody,
      undefined
    );
    fakeEvent.headers = {};
    const response = await createMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(403);
  });

  test("should return 403 when Authorization header does not start with Bearer", async () => {
    const requestBody = {
      mfaMethod: {
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
          otp: "987654",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      "default",
      requestBody,
      "Basic token"
    );
    const response = await createMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(403);
  });

  test("should return 403 when Authorization header is 'Bearer ' without token", async () => {
    const requestBody = {
      mfaMethod: {
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
          otp: "987654",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      "default",
      requestBody,
      "Bearer "
    );
    const response = await createMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(403);
  });
});

describe("updateMfaMethodHandler", () => {
  const createFakeAPIGatewayProxyEvent = (
    body: unknown,
    mfaIdentifier: string,
    scenario: string,
    authHeader?: string
  ): APIGatewayProxyEvent => {
    return {
      body: JSON.stringify(body),
      httpMethod: "PUT",
      path: `/mfa-methods/${scenario}/${mfaIdentifier}`,
      pathParameters: { mfaIdentifier, publicSubjectId: scenario },
      isBase64Encoded: false,
      headers: {
        Authorization: authHeader || "Bearer token",
      },
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
      mfaMethod: {
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      requestBody,
      "1",
      "default"
    );
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual({
      mfaIdentifier: "1",
      priorityIdentifier: "BACKUP",
      method: {
        mfaMethodType: "SMS",
        phoneNumber: "0123456789",
      },
    });
  });

  test("should return 200 and the updated auth app method when the request is valid", async () => {
    const requestBody = {
      mfaMethod: {
        priorityIdentifier: "DEFAULT",
        method: {
          mfaMethodType: "AUTH_APP",
          credential: "aabbccddeeff112233",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      requestBody,
      "1",
      "default"
    );
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      mfaIdentifier: "1",
      priorityIdentifier: "DEFAULT",
      method: {
        mfaMethodType: "AUTH_APP",
        credential: "aabbccddeeff112233",
      },
    });
  });

  test("should return 400 when the MFA method type is not valid", async () => {
    const requestBody = {
      mfaMethod: {
        priorityIdentifier: "BAD_VALUE",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      requestBody,
      "1",
      "default"
    );
    const response = await createMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(400);
  });

  test("should pass through the response code from the scenario", async () => {
    const requestBody = {
      mfaMethod: {
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "07123456789",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      requestBody,
      "1",
      "errorMfa404"
    );
    const response = await createMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(404);
  });

  test("should return 403 when Authorization header is missing", async () => {
    const requestBody = {
      mfaMethod: {
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      requestBody,
      "1",
      "default",
      undefined
    );
    fakeEvent.headers = {};
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(403);
  });

  test("should return 403 when Authorization header does not start with Bearer", async () => {
    const requestBody = {
      mfaMethod: {
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      requestBody,
      "1",
      "default",
      "Basic token"
    );
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(403);
  });

  test("should return 403 when Authorization header is 'Bearer ' without token", async () => {
    const requestBody = {
      mfaMethod: {
        priorityIdentifier: "BACKUP",
        method: {
          mfaMethodType: "SMS",
          phoneNumber: "0123456789",
        },
      },
    };
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      requestBody,
      "1",
      "default",
      "Bearer "
    );
    const response = await updateMfaMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(403);
  });
});

describe("deleteMethodHandler", () => {
  const createFakeAPIGatewayProxyEvent = (
    body: unknown,
    mfaIdentifier: string,
    scenario: string,
    authHeader?: string
  ): APIGatewayProxyEvent => {
    return {
      body: JSON.stringify(body),
      httpMethod: "DELETE",
      path: `/mfa-methods/${scenario}/${mfaIdentifier}`,
      pathParameters: { mfaIdentifier, publicSubjectId: scenario },
      isBase64Encoded: false,
      multiValueHeaders: {},
      queryStringParameters: null,
      headers: {
        Authorization: authHeader || "Bearer token",
      },
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext:
        {} as APIGatewayEventRequestContextWithAuthorizer<APIGatewayEventDefaultAuthorizerContext>,
      resource: "",
    };
  };

  test("should delete MFA method and return status 204", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent({}, "2", "deleteMethod");
    const response = await deleteMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(204);
  });

  test("should 409 if user tries to delete default method", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent({}, "1", "default");
    const response = await deleteMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(409);
  });

  test("should 404 if user tries to delete non existent method", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent({}, "3", "default");
    const response = await deleteMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(404);
  });

  test("should return 403 when Authorization header is missing", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      {},
      "2",
      "deleteMethod",
      undefined
    );
    fakeEvent.headers = {};
    const response = await deleteMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(403);
  });

  test("should return 403 when Authorization header does not start with Bearer", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      {},
      "2",
      "deleteMethod",
      "Basic token"
    );
    const response = await deleteMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(403);
  });

  test("should return 403 when Authorization header is 'Bearer ' without token", async () => {
    const fakeEvent = createFakeAPIGatewayProxyEvent(
      {},
      "2",
      "deleteMethod",
      "Bearer "
    );
    const response = await deleteMethodHandler(fakeEvent);
    expect(response.statusCode).toBe(403);
  });
});
