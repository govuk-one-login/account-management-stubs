import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { mockClient } from "aws-sdk-client-mock";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Response, handler } from "../../oidc/token";
import { Token } from "../../common/models";
import { createHash } from "node:crypto";

const dynamoMock = mockClient(DynamoDBDocumentClient);
const tableName = "TableName";
const code = "1234";
const nonce = "G-MyuYjjh6zpDlfhiKVb";

jest.mock("../../oidc/validate-token");

describe("handler", () => {
  beforeEach(() => {
    process.env.OIDC_CLIENT_ID = "12345";
    process.env.ENVIRONMENT = "dev";
    process.env.JWK_KEY_SECRET = JSON.stringify(
      '{"kty":"EC","d":"Ob4_qMu1nkkBLEw97u--PHVsShP3xOKOJ6z0WsdU0Xw","use":"sig","crv":"P-256","kid":"B-QMUxdJOJ8ubkmArc4i1SGmfZnNNlM-va9h0HJ0jCo","x":"YrTTzbuUwQhWyaj11w33k-K8bFydLfQssVqr8mx6AVE","y":"8UQcw-6Wp0bp8iIIkRw8PW2RSSjmj1I_8euyKEDtWRk","alg":"ES256"}'
    );
    process.env.TABLE_NAME = tableName;
    process.env.CODE_CHALLENGE_TABLE = "CodeChallengeTable";
    dynamoMock.reset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("returns 200 OK response including body with access token when code_verifier matches", async () => {
    const codeVerifier = "verifier123";
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const codeChallengeData = {
      code,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      nonce,
    };

    const oicdPersistedData = {
      code,
      nonce,
    };

    dynamoMock
      .on(GetCommand)
      .resolvesOnce({ Item: oicdPersistedData })
      .resolvesOnce({ Item: codeChallengeData });

    const mockApiEvent: APIGatewayProxyEvent = {
      body: `client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJhbGkpXVCJ9.ey5BPMzRJIn0.RmHvYkaw&grant_type=authorization_code&code=${code}&redirect_uri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_verifier=${encodeURIComponent(
        codeVerifier
      )}`,
    } as never;

    const result: Response = await handler(mockApiEvent);
    const body: Token = JSON.parse(result.body);
    expect(result.statusCode).toEqual(200);
    expect(body.id_token).toContain(
      "eyJraWQiOiJCLVFNVXhkSk9KOHVia21BcmM0aTFTR21mWm5OTmxNLXZhOWgwSEowakNvIiwiYWxnIjoiRVMyNTYifQ."
    );
  });

  test("returns 400 error: invalid_request when code_verifier is missing for code_challenge", async () => {
    const codeChallengeData = {
      code,
      code_challenge: "somechallenge",
      code_challenge_method: "S256",
      nonce,
    };

    const oicdPersistedData = {
      code,
      nonce,
    };

    dynamoMock
      .on(GetCommand)
      .resolvesOnce({ Item: oicdPersistedData })
      .resolvesOnce({ Item: codeChallengeData });

    const mockApiEvent: APIGatewayProxyEvent = {
      body: `client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJhbGkpXVCJ9.ey5BPMzRJIn0.RmHvYkaw&grant_type=authorization_code&code=${code}&redirect_uri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback`,
    } as never;

    const result = await handler(mockApiEvent);

    expect(result.statusCode).toEqual(400);
    expect(result.body).toContain('"error": "invalid_request"');
  });

  test("returns 400 error: invalid_request when code_verifier is empty for code_challenge", async () => {
    const codeVerifier = "";
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const codeChallengeData = {
      code,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      nonce,
    };

    const oicdPersistedData = {
      code,
      nonce,
    };

    dynamoMock
      .on(GetCommand)
      .resolvesOnce({ Item: oicdPersistedData })
      .resolvesOnce({ Item: codeChallengeData });

    const mockApiEvent: APIGatewayProxyEvent = {
      body: `client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJhbGkpXVCJ9.ey5BPMzRJIn0.RmHvYkaw&grant_type=authorization_code&code=${code}&redirect_uri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback`,
    } as never;

    const result = await handler(mockApiEvent);

    expect(result.statusCode).toEqual(400);
    expect(result.body).toContain('"error": "invalid_request"');
  });

  test("return 400 error: invalid_grant when code_verifier does not match stored code_challenge", async () => {
    const codeChallengeData = {
      code,
      code_challenge: "somechallenge",
      code_challenge_method: "S256",
      nonce,
    };

    const oicdPersistedData = {
      code,
      nonce,
    };

    dynamoMock
      .on(GetCommand)
      .resolvesOnce({ Item: oicdPersistedData })
      .resolvesOnce({ Item: codeChallengeData });

    const mockApiEvent: APIGatewayProxyEvent = {
      body: `client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJhbGkpXVCJ9.ey5BPMzRJIn0.RmHvYkaw&grant_type=authorization_code&code=${code}&redirect_uri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_verifier=badverifier`,
    } as never;

    const result = await handler(mockApiEvent);

    expect(result.statusCode).toEqual(400);
    expect(result.body).toContain('"error": "invalid_grant"');
  });

  test("returns 400 error: invalid_grant when the code challenge is not found in the CODE_CHALLENGE_TABLE", async () => {
    const codeChallengeData = undefined;

    const oicdPersistedData = {
      code,
      nonce,
    };

    dynamoMock
      .on(GetCommand)
      .resolvesOnce({ Item: oicdPersistedData })
      .resolvesOnce({ Item: codeChallengeData });

    const mockApiEvent: APIGatewayProxyEvent = {
      body: `client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJhbGkpXVCJ9.ey5BPMzRJIn0.RmHvYkaw&grant_type=authorization_code&code=${code}&redirect_uri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_verifier=badverifier`,
    } as never;

    const result = await handler(mockApiEvent);

    expect(result.statusCode).toEqual(400);
    expect(result.body).toContain('"error": "invalid_grant"');
  });

  test("returns 500 error response if event body is undefined", async () => {
    const mockApiEvent: APIGatewayProxyEvent = {
      body: "",
    } as never;
    let errorThrown = false;
    try {
      await handler(mockApiEvent);
    } catch (error) {
      errorThrown = true;
    }
    expect(errorThrown).toBeTruthy();
  });

  test("returns 500 error response if the Table Name is undefined", async () => {
    delete process.env.TABLE_NAME;

    const codeVerifier = "verifier123";
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const codeChallengeData = {
      code,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      nonce,
    };

    const oicdPersistedData = {
      code,
      nonce,
    };

    dynamoMock
      .on(GetCommand)
      .resolvesOnce({ Item: oicdPersistedData })
      .resolvesOnce({ Item: codeChallengeData });

    const mockApiEvent: APIGatewayProxyEvent = {
      body: `client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJhbGkpXVCJ9.ey5BPMzRJIn0.RmHvYkaw&grant_type=authorization_code&code=${code}&redirect_uri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_verifier=${encodeURIComponent(
        codeVerifier
      )}`,
    } as never;

    let errorThrown = false;
    let errorMessage = "";
    try {
      await handler(mockApiEvent);
    } catch (error) {
      errorThrown = true;
      errorMessage = (error as Error)?.message;
    }
    expect(errorThrown).toBeTruthy();
    expect(errorMessage).toContain(
      "TABLE_NAME environment variable is undefined"
    );
  });

  test("returns 500 error response if Code Challenge Table is undefined", async () => {
    delete process.env.CODE_CHALLENGE_TABLE;

    const codeVerifier = "verifier123";
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const codeChallengeData = {
      code,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      nonce,
    };

    const oicdPersistedData = {
      code,
      nonce,
    };

    dynamoMock
      .on(GetCommand)
      .resolvesOnce({ Item: oicdPersistedData })
      .resolvesOnce({ Item: codeChallengeData });

    const mockApiEvent: APIGatewayProxyEvent = {
      body: `client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJhbGkpXVCJ9.ey5BPMzRJIn0.RmHvYkaw&grant_type=authorization_code&code=${code}&redirect_uri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_verifier=${encodeURIComponent(
        codeVerifier
      )}`,
    } as never;

    let errorThrown = false;
    let errorMessage = "";
    try {
      await handler(mockApiEvent);
    } catch (error) {
      errorThrown = true;
      errorMessage = (error as Error)?.message || "";
    }
    expect(errorThrown).toBeTruthy();
    expect(errorMessage).toContain(
      "CODE_CHALLENGE_TABLE environment variable is undefined"
    );
  });

  test("returns a 500 error if the OICD code is not found in the Table", async () => {
    const codeVerifier = "verifier123";
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const codeChallengeData = {
      code,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      nonce,
    };

    const oicdPersistedData = undefined;

    dynamoMock
      .on(GetCommand)
      .resolvesOnce({ Item: oicdPersistedData })
      .resolvesOnce({ Item: codeChallengeData });

    const mockApiEvent: APIGatewayProxyEvent = {
      body: `client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJhbGkpXVCJ9.ey5BPMzRJIn0.RmHvYkaw&grant_type=authorization_code&code=${code}&redirect_uri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_verifier=${encodeURIComponent(
        codeVerifier
      )}`,
    } as never;

    let errorThrown = false;
    let errorMessage = "";
    try {
      await handler(mockApiEvent);
    } catch (error) {
      errorThrown = true;
      errorMessage = (error as Error)?.message || "";
    }
    expect(errorThrown).toBeTruthy();
    expect(errorMessage).toContain("code not found in DB");
  });

  test("returns 500 error if OIDC Client ID is undefined", async () => {
    delete process.env.OIDC_CLIENT_ID;

    const codeVerifier = "verifier123";
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const codeChallengeData = {
      code,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      nonce,
    };

    const oicdPersistedData = {
      code,
      nonce,
    };

    dynamoMock
      .on(GetCommand)
      .resolvesOnce({ Item: oicdPersistedData })
      .resolvesOnce({ Item: codeChallengeData });

    const mockApiEvent: APIGatewayProxyEvent = {
      body: `client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJhbGkpXVCJ9.ey5BPMzRJIn0.RmHvYkaw&grant_type=authorization_code&code=${code}&redirect_uri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_verifier=${encodeURIComponent(
        codeVerifier
      )}`,
    } as never;

    let errorThrown = false;
    let errorMessage = "";
    try {
      await handler(mockApiEvent);
    } catch (error) {
      errorThrown = true;
      errorMessage = (error as Error)?.message;
    }
    expect(errorThrown).toBeTruthy();
    expect(errorMessage).toContain(
      `an environment variable is undefined OIDC_CLIENT_ID: ${process.env.OIDC_CLIENT_ID} or ENVIRONMENT: ${process.env.ENVIRONMENT}`
    );
  });

  test("returns 500 error if Environment is undefined", async () => {
    delete process.env.ENVIRONMENT;

    const codeVerifier = "verifier123";
    const codeChallenge = createHash("sha256")
      .update(codeVerifier)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const codeChallengeData = {
      code,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      nonce,
    };

    const oicdPersistedData = {
      code,
      nonce,
    };

    dynamoMock
      .on(GetCommand)
      .resolvesOnce({ Item: oicdPersistedData })
      .resolvesOnce({ Item: codeChallengeData });

    const mockApiEvent: APIGatewayProxyEvent = {
      body: `client_assertion_type=urn%3Aietf%3Aparams%3Aoauth%3Aclient-assertion-type%3Ajwt-bearer&client_assertion=eyJhbGkpXVCJ9.ey5BPMzRJIn0.RmHvYkaw&grant_type=authorization_code&code=${code}&redirect_uri=https%3A%2F%2Fhome.dev.account.gov.uk%2Fauth%2Fcallback&code_verifier=${encodeURIComponent(
        codeVerifier
      )}`,
    } as never;

    let errorThrown = false;
    let errorMessage = "";
    try {
      await handler(mockApiEvent);
    } catch (error) {
      errorThrown = true;
      errorMessage = (error as Error)?.message;
    }
    expect(errorThrown).toBeTruthy();
    expect(errorMessage).toContain(
      `an environment variable is undefined OIDC_CLIENT_ID: ${process.env.OIDC_CLIENT_ID} or ENVIRONMENT: ${process.env.ENVIRONMENT}`
    );
  });
});
