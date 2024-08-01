import { APIGatewayEventDefaultAuthorizerContext, APIGatewayEventRequestContextWithAuthorizer, APIGatewayProxyEvent } from "aws-lambda";
import { handler, Response } from "../../account-management-api/all-routes";

const createFakeAPIGatewayProxyEvent = (
  body: unknown,
  path: string
): APIGatewayProxyEvent => {
  return {
    body: JSON.stringify(body),
    httpMethod: "PUT",
    path: path,
    pathParameters: {},
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

describe("handler", () => {
  test("returns status code 204", async () => {
    const result: Response = await handler(createFakeAPIGatewayProxyEvent({}, 'test'));
    expect(result.statusCode).toEqual(204);
  });
});
