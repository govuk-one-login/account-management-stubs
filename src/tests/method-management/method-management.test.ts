import "aws-sdk-client-mock-jest";
import { components } from "../../method-management/models/schema";
import {
  userInfoHandler,
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
