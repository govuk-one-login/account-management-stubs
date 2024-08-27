import {
  APIGatewayEventRequestContextV2,
  APIGatewayProxyEventV2,
} from "aws-lambda";
import { handler, Response } from "../../account-management-api/all-routes";

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

describe("handler", () => {
  test("returns status code 204", async () => {
    const result: Response = await handler(
      createFakeAPIGatewayProxyEvent({}, "test")
    );
    expect(result.statusCode).toEqual(204);
  });
});
