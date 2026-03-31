const SPEC_BASE_URL =
  "https://github.com/govuk-one-login/account-components/blob/main/solutions";
const API_SPEC_URL = `${SPEC_BASE_URL}/api/spec.yaml`;
const API_SPEC_LINK_TEXT = "account-components/solutions/api/spec.yaml";
const FRONTEND_SPEC_URL = `${SPEC_BASE_URL}/frontend/spec.yaml`;
const FRONTEND_SPEC_LINK_TEXT =
  "account-components/solutions/frontend/spec.yaml";

const DEFAULT_EMAIL = "testuser@test.null.local";
const DEFAULT_SUB = "urn:fdc:gov.uk:default";
const SUCCESS_OUTCOME_ID = "e015cbfbfb80b1d0b48454c2e033e04910c27d58827b31d8";
const FAILURE_OUTCOME_ID = "67ed54cfef70b3a5a7c88da6cabca2a128eb57a2aa92a81b";
const SUCCESS_TIMESTAMP = 1770630621788;
const FAILURE_TIMESTAMP = 1770631329893;

interface JourneyOutcomeLink {
  label: string;
  code: object;
}

interface ErrorLink {
  label: string;
  error: string;
  errorDescription: string;
}

const journeyOutcome = (
  journey: string,
  success: boolean,
  details: object = {}
): object => ({
  body: {
    email: DEFAULT_EMAIL,
    journeys: [
      {
        details,
        journey,
        success,
        timestamp: success ? SUCCESS_TIMESTAMP : FAILURE_TIMESTAMP,
      },
    ],
    outcome_id: success ? SUCCESS_OUTCOME_ID : FAILURE_OUTCOME_ID,
    scope: journey,
    sub: DEFAULT_SUB,
    success,
  },
  statusCode: 200,
});

const errorResponse = (
  statusCode: number,
  error?: string,
  errorDescription?: string
): object =>
  error
    ? { body: { error, error_description: errorDescription }, statusCode }
    : { statusCode };

const userSignedOut = { error: { code: 1001, description: "UserSignedOut" } };
const userAborted = {
  error: { code: 1002, description: "UserAbortedJourney" },
};

const successLinks: JourneyOutcomeLink[] = [
  {
    label: "testing-journey success",
    code: journeyOutcome("testing-journey", true),
  },
  {
    label: "account-delete success",
    code: journeyOutcome("account-delete", true),
  },
  {
    label: "passkey-create success",
    code: journeyOutcome("passkey-create", true, {
      aaguid: "9ddd1817-af5a-4672-a2b9-3e3dd95000a9",
    }),
  },
  {
    label: "passkey-create success (passkey has no display name)",
    code: journeyOutcome("passkey-create", true, {
      aaguid: "00000000-0000-0000-0000-000000000000",
    }),
  },
  {
    label: "testing-journey user signed out",
    code: journeyOutcome("testing-journey", false, userSignedOut),
  },
  {
    label: "account-delete user signed out",
    code: journeyOutcome("account-delete", false, userSignedOut),
  },
  {
    label: "passkey-create user signed out",
    code: journeyOutcome("passkey-create", false, userSignedOut),
  },
  {
    label: "passkey-create user aborted journey",
    code: journeyOutcome("passkey-create", false, userAborted),
  },
];

const journeyOutcomeErrorLinks: JourneyOutcomeLink[] = [
  {
    label: "invalid_authorization_header E4006",
    code: errorResponse(400, "invalid_request", "E4006"),
  },
  {
    label: "outcome_sub_does_not_match_payload E4005",
    code: errorResponse(400, "invalid_request", "E4005"),
  },
  {
    label: "invalid_access_token E4007",
    code: errorResponse(400, "invalid_request", "E4007"),
  },
  {
    label: "access_token_signature_invalid E4008",
    code: errorResponse(400, "invalid_request", "E4008"),
  },
  {
    label: "Missing or invalid access token",
    code: errorResponse(401),
  },
  {
    label: "missing_outcome E404",
    code: errorResponse(404, "not_found", "E404"),
  },
  {
    label: "generic_error E500",
    code: errorResponse(500, "internal_server_error", "E500"),
  },
  {
    label: "failed_to_find_outcome E5001",
    code: errorResponse(500, "internal_server_error", "E5001"),
  },
];

const tokenErrorLinks: JourneyOutcomeLink[] = [
  {
    label: "invalid_request E4001",
    code: errorResponse(400, "invalid_request", "E4001"),
  },
  {
    label: "invalid_client_assertion E4002",
    code: errorResponse(400, "invalid_request", "E4002"),
  },
  {
    label: "invalid_code E4003",
    code: errorResponse(400, "invalid_grant", "E4003"),
  },
  {
    label: "generic_error E500",
    code: errorResponse(500, "internal_server_error", "E500"),
  },
];

const authorizeErrorLinks: ErrorLink[] = [
  {
    label: "alg_not_allowed E1001",
    error: "invalid_request",
    errorDescription: "E1001",
  },
  {
    label: "jws_invalid E1002",
    error: "invalid_request",
    errorDescription: "E1002",
  },
  {
    label: "jws_signature_verification_failed E1003",
    error: "invalid_request",
    errorDescription: "E1003",
  },
  {
    label: "jwt_invalid E1004",
    error: "invalid_request",
    errorDescription: "E1004",
  },
  {
    label: "jwt_expired E1005",
    error: "invalid_request",
    errorDescription: "E1005",
  },
  {
    label: "jwt_claim_validation_failed E1006",
    error: "invalid_request",
    errorDescription: "E1006",
  },
  {
    label: "verify_jwt_error E1007",
    error: "invalid_request",
    errorDescription: "E1007",
  },
  {
    label: "invalid_claims E1008",
    error: "invalid_request",
    errorDescription: "E1008",
  },
  {
    label: "jar_decrypt_failed E1009",
    error: "invalid_request",
    errorDescription: "E1009",
  },
  {
    label: "jti_already_used E1010",
    error: "invalid_request",
    errorDescription: "E1010",
  },
  {
    label: "cookie_for_checking_user_agent_not_set E1011",
    error: "invalid_request",
    errorDescription: "E1011",
  },
  {
    label: "user_agent_mismatch E1012",
    error: "invalid_request",
    errorDescription: "E1012",
  },
  {
    label: "jwks_timeout E2001",
    error: "unauthorized_client",
    errorDescription: "E2001",
  },
  {
    label: "jwks_invalid E2002",
    error: "unauthorized_client",
    errorDescription: "E2002",
  },
  {
    label: "jwks_no_matching_key E2003",
    error: "unauthorized_client",
    errorDescription: "E2003",
  },
  {
    label: "jwks_multiple_matching_keys E2004",
    error: "unauthorized_client",
    errorDescription: "E2004",
  },
  {
    label: "jwk_invalid E2005",
    error: "unauthorized_client",
    errorDescription: "E2005",
  },
  {
    label: "failed_to_check_jti_unused E3001",
    error: "server_error",
    errorDescription: "E3001",
  },
  {
    label: "verify_jwt_unknown_error E3002",
    error: "server_error",
    errorDescription: "E3002",
  },
  {
    label: "jar_decrypt_unknown_error E3003",
    error: "server_error",
    errorDescription: "E3003",
  },
  {
    label: "failed_to_start_session_and_go_to_journey E3004",
    error: "server_error",
    errorDescription: "E3004",
  },
];

const encodeCode = (code: object): string =>
  encodeURIComponent(JSON.stringify(code));

const journeyOutcomeLinksHtml = (
  links: JourneyOutcomeLink[],
  redirectUri: string,
  state: string,
  codePrefix = ""
): string =>
  links
    .map(
      ({ label, code }) =>
        `<a href="${redirectUri}?code=${encodeURIComponent(codePrefix)}${encodeCode(code)}&state=${encodeURIComponent(state)}">${label}</a><br>`
    )
    .join("\n");

const authorizeErrorLinksHtml = (
  links: ErrorLink[],
  redirectUri: string,
  state: string
): string =>
  links
    .map(
      ({ label, error, errorDescription }) =>
        `<a href="${redirectUri}?error=${encodeURIComponent(error)}&error_description=${encodeURIComponent(errorDescription)}&state=${encodeURIComponent(state)}">${label}</a><br>`
    )
    .join("\n");

const specLink = (url: string, linkText: string, text: string): string =>
  `<p>These links are for simulating ${text} as detailed in the spec at <a href="${url}">${linkText}</a></p>`;

export const buildAuthorizePage = (
  redirectUri: string,
  state: string
): string => `<!DOCTYPE html>
<html>
<head><title>Account Management Component Stub</title></head>
<body>
<h1>Account Management Component Stub</h1>

<h2>Journey outcome endpoint success responses</h2>
${specLink(API_SPEC_URL, API_SPEC_LINK_TEXT, "/journeyoutcome success responses")}
${journeyOutcomeLinksHtml(successLinks, redirectUri, state)}

<h2>Journey outcome endpoint error responses</h2>
${specLink(API_SPEC_URL, API_SPEC_LINK_TEXT, "/journeyoutcome error responses")}
${journeyOutcomeLinksHtml(journeyOutcomeErrorLinks, redirectUri, state)}

<h2>Token endpoint error responses</h2>
${specLink(API_SPEC_URL, API_SPEC_LINK_TEXT, "/token error responses")}
${journeyOutcomeLinksHtml(tokenErrorLinks, redirectUri, state, "token_response__")}

<h2>Authorize error responses</h2>
${specLink(FRONTEND_SPEC_URL, FRONTEND_SPEC_LINK_TEXT, "/authorize error responses")}
${authorizeErrorLinksHtml(authorizeErrorLinks, redirectUri, state)}

</body>
</html>`;
