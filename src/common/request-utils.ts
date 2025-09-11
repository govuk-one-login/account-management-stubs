import { APIGatewayProxyEventV2 } from "aws-lambda";

export const parseFormBody = (event: APIGatewayProxyEventV2) => {
  if (
    event.body &&
    event.headers["content-type"] === "application/x-www-form-urlencoded"
  ) {
    const bodyString = event.isBase64Encoded ? atob(event.body) : event.body;
    return Object.fromEntries(new URLSearchParams(bodyString));
  }
};
