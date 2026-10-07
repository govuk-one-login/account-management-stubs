import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../../account-interventions/account-interventions";

const createEvent = (
  userId: string | undefined,
  queryStringParameters?: Record<string, string>
): APIGatewayProxyEvent => {
  return {
    pathParameters: userId !== undefined ? { userId } : null,
    queryStringParameters: queryStringParameters || null,
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: "GET",
    isBase64Encoded: false,
    path: `/ais/${userId}`,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent["requestContext"],
    resource: "",
  };
};

describe("Account Interventions Service Stub", () => {
  describe("input validation", () => {
    it("returns 400 when userId is missing", async () => {
      const event = createEvent(undefined);
      event.pathParameters = null;

      const result = await handler(event);

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body)).toEqual({
        message: "userId is required",
      });
    });

    it("returns 400 when userId is empty", async () => {
      const event = createEvent("");

      const result = await handler(event);

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body)).toEqual({
        message: "userId is required",
      });
    });

    it("returns 400 when userId contains spaces", async () => {
      const event = createEvent("invalid user id");

      const result = await handler(event);

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body)).toEqual({
        message: "userId contains invalid characters",
      });
    });

    it("returns 400 when userId contains commas", async () => {
      const event = createEvent("invalid,userid");

      const result = await handler(event);

      expect(result.statusCode).toEqual(400);
      expect(JSON.parse(result.body)).toEqual({
        message: "userId contains invalid characters",
      });
    });
  });

  describe("no intervention (default)", () => {
    it("returns no intervention for a normal userId", async () => {
      const event = createEvent(
        "urn:fdc:gov.uk:2022:JG0RJI1pYbnanbvPs-j4j5-a-PFcmhry9Qu9NCEp5d4"
      );

      const result = await handler(event);

      expect(result.statusCode).toEqual(200);
      const body = JSON.parse(result.body);
      expect(body.state).toEqual({
        blocked: false,
        suspended: false,
        reproveIdentity: false,
        resetPassword: false,
      });
      expect(body.intervention.description).toEqual("AIS_NO_INTERVENTION");
      expect(body.auditLevel).toEqual("standard");
    });
  });

  describe("blocked state", () => {
    it("returns blocked state when userId starts with 'blocked'", async () => {
      const event = createEvent("blocked-user-123");

      const result = await handler(event);

      expect(result.statusCode).toEqual(200);
      const body = JSON.parse(result.body);
      expect(body.state).toEqual({
        blocked: true,
        suspended: false,
        reproveIdentity: false,
        resetPassword: false,
      });
      expect(body.intervention.description).toEqual("AIS_ACCOUNT_BLOCKED");
    });

    it("is case-insensitive for blocked prefix", async () => {
      const event = createEvent("BLOCKED-user-456");

      const result = await handler(event);

      expect(result.statusCode).toEqual(200);
      const body = JSON.parse(result.body);
      expect(body.state.blocked).toBe(true);
    });
  });

  describe("suspended state", () => {
    it("returns suspended state when userId starts with 'suspended'", async () => {
      const event = createEvent("suspended-user-123");

      const result = await handler(event);

      expect(result.statusCode).toEqual(200);
      const body = JSON.parse(result.body);
      expect(body.state).toEqual({
        blocked: false,
        suspended: true,
        reproveIdentity: false,
        resetPassword: false,
      });
      expect(body.intervention.description).toEqual("AIS_ACCOUNT_SUSPENDED");
    });
  });

  describe("suspended with reprove identity", () => {
    it("returns suspended with reproveIdentity when userId starts with 'suspended-reprove-identity'", async () => {
      const event = createEvent("suspended-reprove-identity-user-123");

      const result = await handler(event);

      expect(result.statusCode).toEqual(200);
      const body = JSON.parse(result.body);
      expect(body.state).toEqual({
        blocked: false,
        suspended: true,
        reproveIdentity: true,
        resetPassword: false,
      });
      expect(body.intervention.description).toEqual(
        "AIS_FORCED_USER_IDENTITY_VERIFY"
      );
    });
  });

  describe("suspended with reset password", () => {
    it("returns suspended with resetPassword when userId starts with 'suspended-reset-password'", async () => {
      const event = createEvent("suspended-reset-password-user-123");

      const result = await handler(event);

      expect(result.statusCode).toEqual(200);
      const body = JSON.parse(result.body);
      expect(body.state).toEqual({
        blocked: false,
        suspended: true,
        reproveIdentity: false,
        resetPassword: true,
      });
      expect(body.intervention.description).toEqual(
        "AIS_FORCED_USER_PASSWORD_RESET"
      );
    });
  });

  describe("suspended with reprove identity and reset password", () => {
    it("returns suspended with both flags when userId starts with 'suspended-reprove-identity-and-reset-password'", async () => {
      const event = createEvent(
        "suspended-reprove-identity-and-reset-password-user-123"
      );

      const result = await handler(event);

      expect(result.statusCode).toEqual(200);
      const body = JSON.parse(result.body);
      expect(body.state).toEqual({
        blocked: false,
        suspended: true,
        reproveIdentity: true,
        resetPassword: true,
      });
      expect(body.intervention.description).toEqual(
        "AIS_FORCED_USER_PASSWORD_RESET_AND_IDENTITY_VERIFY"
      );
    });
  });

  describe("history parameter", () => {
    it("does not include history by default", async () => {
      const event = createEvent("some-user");

      const result = await handler(event);

      const body = JSON.parse(result.body);
      expect(body.history).toBeUndefined();
    });

    it("includes history when history=true", async () => {
      const event = createEvent("some-user", { history: "true" });

      const result = await handler(event);

      const body = JSON.parse(result.body);
      expect(body.history).toBeDefined();
      expect(body.history).toHaveLength(1);
      expect(body.history[0]).toMatchObject({
        component: "TICF_CRI",
        code: "01",
        intervention: "FRAUD_SUSPEND_ACCOUNT",
        reason: "stub history entry",
      });
    });

    it("includes history when history=1", async () => {
      const event = createEvent("some-user", { history: "1" });

      const result = await handler(event);

      const body = JSON.parse(result.body);
      expect(body.history).toBeDefined();
      expect(body.history).toHaveLength(1);
    });

    it("does not include history when history=false", async () => {
      const event = createEvent("some-user", { history: "false" });

      const result = await handler(event);

      const body = JSON.parse(result.body);
      expect(body.history).toBeUndefined();
    });
  });

  describe("response structure", () => {
    it("includes all required fields in the intervention metadata", async () => {
      const event = createEvent("some-user");

      const result = await handler(event);

      const body = JSON.parse(result.body);
      expect(body.intervention).toHaveProperty("updatedAt");
      expect(body.intervention).toHaveProperty("appliedAt");
      expect(body.intervention).toHaveProperty("sentAt");
      expect(body.intervention).toHaveProperty("description");
      expect(typeof body.intervention.updatedAt).toBe("number");
      expect(typeof body.intervention.appliedAt).toBe("number");
      expect(typeof body.intervention.sentAt).toBe("number");
    });

    it("includes auditLevel in the response", async () => {
      const event = createEvent("some-user");

      const result = await handler(event);

      const body = JSON.parse(result.body);
      expect(body.auditLevel).toEqual("standard");
    });
  });
});
