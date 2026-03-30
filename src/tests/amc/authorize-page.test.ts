import { buildAuthorizePage } from "../../amc/utils/authorize-page";

const REDIRECT_URI = "https://example.com/callback";
const STATE = "test-state-123";

describe("buildAuthorizePage", () => {
  let html: string;

  beforeAll(() => {
    html = buildAuthorizePage(REDIRECT_URI, STATE);
  });

  describe("page structure", () => {
    test("returns valid HTML document", () => {
      expect(html).toMatch(/^<!DOCTYPE html>/);
      expect(html).toContain("<html>");
      expect(html).toContain("</html>");
      expect(html).toContain("<head>");
      expect(html).toContain("</head>");
      expect(html).toContain("<body>");
      expect(html).toContain("</body>");
    });

    test("has correct page title", () => {
      expect(html).toContain(
        "<title>Account Management Component Stub</title>"
      );
    });

    test("has main heading", () => {
      expect(html).toContain("<h1>Account Management Component Stub</h1>");
    });

    test("has all four section headings", () => {
      expect(html).toContain(
        "<h2>Journey outcome endpoint success responses</h2>"
      );
      expect(html).toContain(
        "<h2>Journey outcome endpoint error responses</h2>"
      );
      expect(html).toContain("<h2>Token endpoint error responses</h2>");
      expect(html).toContain("<h2>Authorize error responses</h2>");
    });

    test("has spec links for each section", () => {
      const apiSpecUrl =
        "https://github.com/govuk-one-login/account-components/blob/main/solutions/api/spec.yaml";
      const frontendSpecUrl =
        "https://github.com/govuk-one-login/account-components/blob/main/solutions/frontend/spec.yaml";

      const apiSpecOccurrences = (html.match(new RegExp(apiSpecUrl, "g")) || [])
        .length;
      expect(apiSpecOccurrences).toBe(3);

      expect(html).toContain(`<a href="${frontendSpecUrl}">`);
    });
  });

  describe("journey outcome success links", () => {
    const expectedLabels = [
      "testing-journey success",
      "account-delete success",
      "passkey-create success",
      "testing-journey user signed out",
      "account-delete user signed out",
      "passkey-create user signed out",
      "passkey-create user aborted journey",
    ];

    test.each(expectedLabels)("contains link for '%s'", (label) => {
      expect(html).toContain(`>${label}</a>`);
    });

    test("success links contain correct journey data", () => {
      const hrefPattern = new RegExp(
        `href="${REDIRECT_URI}\\?code=([^"&]+)&[^"]*">[^<]*testing-journey success</a>`
      );
      const match = html.match(hrefPattern);
      expect(match).not.toBeNull();

      const code = JSON.parse(decodeURIComponent(match![1]));
      expect(code.statusCode).toBe(200);
      expect(code.body.email).toBe("testuser@test.null.local");
      expect(code.body.sub).toBe("urn:fdc:gov.uk:default");
      expect(code.body.scope).toBe("testing-journey");
      expect(code.body.success).toBe(true);
      expect(code.body.journeys).toHaveLength(1);
      expect(code.body.journeys[0].journey).toBe("testing-journey");
      expect(code.body.journeys[0].success).toBe(true);
      expect(code.body.journeys[0].details).toEqual({});
    });

    test("passkey-create success includes aaguid in details", () => {
      const hrefPattern = new RegExp(
        `href="${REDIRECT_URI}\\?code=([^"&]+)&[^"]*">passkey-create success</a>`
      );
      const match = html.match(hrefPattern);
      expect(match).not.toBeNull();

      const code = JSON.parse(decodeURIComponent(match![1]));
      expect(code.body.journeys[0].details.aaguid).toBe(
        "9ddd1817-af5a-4672-a2b9-3e3dd95000a9"
      );
    });

    test("user signed out links contain UserSignedOut error details", () => {
      const hrefPattern = new RegExp(
        `href="${REDIRECT_URI}\\?code=([^"&]+)&[^"]*">testing-journey user signed out</a>`
      );
      const match = html.match(hrefPattern);
      expect(match).not.toBeNull();

      const code = JSON.parse(decodeURIComponent(match![1]));
      expect(code.body.success).toBe(false);
      expect(code.body.journeys[0].success).toBe(false);
      expect(code.body.journeys[0].details.error.code).toBe(1001);
      expect(code.body.journeys[0].details.error.description).toBe(
        "UserSignedOut"
      );
    });

    test("user aborted journey link contains UserAbortedJourney error details", () => {
      const hrefPattern = new RegExp(
        `href="${REDIRECT_URI}\\?code=([^"&]+)&[^"]*">passkey-create user aborted journey</a>`
      );
      const match = html.match(hrefPattern);
      expect(match).not.toBeNull();

      const code = JSON.parse(decodeURIComponent(match![1]));
      expect(code.body.journeys[0].details.error.code).toBe(1002);
      expect(code.body.journeys[0].details.error.description).toBe(
        "UserAbortedJourney"
      );
    });

    test("success outcomes use different outcome_id and timestamp than failures", () => {
      const successPattern = new RegExp(
        `href="${REDIRECT_URI}\\?code=([^"&]+)&[^"]*">testing-journey success</a>`
      );
      const failurePattern = new RegExp(
        `href="${REDIRECT_URI}\\?code=([^"&]+)&[^"]*">testing-journey user signed out</a>`
      );

      const successCode = JSON.parse(
        decodeURIComponent(html.match(successPattern)![1])
      );
      const failureCode = JSON.parse(
        decodeURIComponent(html.match(failurePattern)![1])
      );

      expect(successCode.body.outcome_id).not.toBe(failureCode.body.outcome_id);
      expect(successCode.body.journeys[0].timestamp).not.toBe(
        failureCode.body.journeys[0].timestamp
      );
    });
  });

  describe("journey outcome error links", () => {
    const expectedErrors = [
      {
        label: "invalid_authorization_header E4006",
        status: 400,
        error: "invalid_request",
        desc: "E4006",
      },
      {
        label: "outcome_sub_does_not_match_payload E4005",
        status: 400,
        error: "invalid_request",
        desc: "E4005",
      },
      {
        label: "invalid_access_token E4007",
        status: 400,
        error: "invalid_request",
        desc: "E4007",
      },
      {
        label: "access_token_signature_invalid E4008",
        status: 400,
        error: "invalid_request",
        desc: "E4008",
      },
      {
        label: "missing_outcome E404",
        status: 404,
        error: "not_found",
        desc: "E404",
      },
      {
        label: "generic_error E500",
        status: 500,
        error: "internal_server_error",
        desc: "E500",
      },
      {
        label: "failed_to_find_outcome E5001",
        status: 500,
        error: "internal_server_error",
        desc: "E5001",
      },
    ];

    test.each(expectedErrors)(
      "contains correct code for '$label'",
      ({ label, status, error, desc }) => {
        const hrefPattern = new RegExp(
          `href="${REDIRECT_URI}\\?code=([^"&]+)&[^"]*">${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</a>`
        );
        const match = html.match(hrefPattern);
        expect(match).not.toBeNull();

        const code = JSON.parse(decodeURIComponent(match![1]));
        expect(code.statusCode).toBe(status);
        expect(code.body.error).toBe(error);
        expect(code.body.error_description).toBe(desc);
      }
    );

    test("Missing or invalid access token returns 401 with no body", () => {
      const hrefPattern = new RegExp(
        `href="${REDIRECT_URI}\\?code=([^"&]+)&[^"]*">Missing or invalid access token</a>`
      );
      const match = html.match(hrefPattern);
      expect(match).not.toBeNull();

      const code = JSON.parse(decodeURIComponent(match![1]));
      expect(code.statusCode).toBe(401);
      expect(code.body).toBeUndefined();
    });
  });

  describe("token error links", () => {
    const expectedTokenErrors = [
      {
        label: "invalid_request E4001",
        error: "invalid_request",
        desc: "E4001",
      },
      {
        label: "invalid_client_assertion E4002",
        error: "invalid_request",
        desc: "E4002",
      },
      { label: "invalid_code E4003", error: "invalid_grant", desc: "E4003" },
    ];

    test.each(expectedTokenErrors)(
      "contains token_response__ prefixed code for '$label'",
      ({ label, error, desc }) => {
        const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const hrefPattern = new RegExp(
          `href="${REDIRECT_URI}\\?code=([^"&]+)&[^"]*">${escapedLabel}</a>`
        );
        const match = html.match(hrefPattern);
        expect(match).not.toBeNull();

        const rawCode = decodeURIComponent(match![1]);
        expect(rawCode).toMatch(/^token_response__/);

        const code = JSON.parse(rawCode.replace("token_response__", ""));
        expect(code.body.error).toBe(error);
        expect(code.body.error_description).toBe(desc);
      }
    );
  });

  describe("authorize error links", () => {
    const invalidRequestErrors = [
      "E1001",
      "E1002",
      "E1003",
      "E1004",
      "E1005",
      "E1006",
      "E1007",
      "E1008",
      "E1009",
      "E1010",
      "E1011",
      "E1012",
    ];

    const unauthorizedClientErrors = [
      "E2001",
      "E2002",
      "E2003",
      "E2004",
      "E2005",
    ];

    const serverErrors = ["E3001", "E3002", "E3003", "E3004"];

    test.each(invalidRequestErrors)(
      "contains invalid_request error link for %s",
      (errorCode) => {
        expect(html).toContain(
          `?error=invalid_request&error_description=${errorCode}&state=${STATE}`
        );
      }
    );

    test.each(unauthorizedClientErrors)(
      "contains unauthorized_client error link for %s",
      (errorCode) => {
        expect(html).toContain(
          `?error=unauthorized_client&error_description=${errorCode}&state=${STATE}`
        );
      }
    );

    test.each(serverErrors)(
      "contains server_error error link for %s",
      (errorCode) => {
        expect(html).toContain(
          `?error=server_error&error_description=${errorCode}&state=${STATE}`
        );
      }
    );
  });

  describe("URL encoding and parameters", () => {
    test("all links include the state parameter", () => {
      const anchorPattern = /<a href="([^"]+)">/g;
      let match;
      while ((match = anchorPattern.exec(html)) !== null) {
        const href = match[1];
        if (href.startsWith(REDIRECT_URI)) {
          expect(href).toContain(`state=${STATE}`);
        }
      }
    });

    test("all links start with the redirect URI", () => {
      const anchorPattern = /<a href="([^"]+)">/g;
      const specUrlPrefix = "https://github.com/";
      let match;
      while ((match = anchorPattern.exec(html)) !== null) {
        const href = match[1];
        if (!href.startsWith(specUrlPrefix)) {
          expect(href.startsWith(REDIRECT_URI)).toBe(true);
        }
      }
    });

    test("code parameters contain valid URL-encoded JSON", () => {
      const codePattern = /\?code=([^&"]+)&/g;
      let match;
      while ((match = codePattern.exec(html)) !== null) {
        const decoded = decodeURIComponent(match[1]);
        const jsonPart = decoded.startsWith("token_response__")
          ? decoded.replace("token_response__", "")
          : decoded;
        expect(() => JSON.parse(jsonPart)).not.toThrow();
      }
    });

    test("handles special characters in state parameter", () => {
      const specialState = "state with spaces & special=chars";
      const result = buildAuthorizePage(REDIRECT_URI, specialState);
      expect(result).toContain(encodeURIComponent(specialState));
    });

    test("handles special characters in redirect URI", () => {
      const specialUri = "https://example.com/callback?existing=param";
      const result = buildAuthorizePage(specialUri, STATE);
      expect(result).toContain(`href="${specialUri}?code=`);
    });
  });

  describe("link counts", () => {
    test("has 7 journey outcome success links", () => {
      const successSection = html.split(
        "Journey outcome endpoint error responses"
      )[0];
      const linkCount = (
        successSection.match(
          new RegExp(`<a href="${REDIRECT_URI}\\?code=`, "g")
        ) || []
      ).length;
      expect(linkCount).toBe(7);
    });

    test("has 8 journey outcome error links", () => {
      const sections = html.split("<h2>");
      const errorSection = sections.find((s) =>
        s.startsWith("Journey outcome endpoint error responses")
      )!;
      const linkCount = (errorSection.match(/<a href="/g) || []).length;
      expect(linkCount).toBe(9); // 8 links + 1 spec link
    });

    test("has 4 token error links", () => {
      const sections = html.split("<h2>");
      const tokenSection = sections.find((s) =>
        s.startsWith("Token endpoint error responses")
      )!;
      const linkCount = (tokenSection.match(/<a href="/g) || []).length;
      expect(linkCount).toBe(5); // 4 links + 1 spec link
    });

    test("has 21 authorize error links", () => {
      const sections = html.split("<h2>");
      const authorizeSection = sections.find((s) =>
        s.startsWith("Authorize error responses")
      )!;
      const linkCount = (authorizeSection.match(/<a href="/g) || []).length;
      expect(linkCount).toBe(22); // 21 links + 1 spec link
    });
  });
});
