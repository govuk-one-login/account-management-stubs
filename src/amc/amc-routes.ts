import { APIGatewayProxyEvent } from "aws-lambda";
import { generateJwks } from "./utils/generate-jwks";
import { validateTokenRequest } from "./utils/validate-token-request";

export const handler = async (event: APIGatewayProxyEvent) => {
  if (event.path === "/status") {
    return {
      statusCode: 200,
      body: JSON.stringify({}),
    };
  }

  if (event.path === "/.well-known/jwks.json" && event.httpMethod === "GET") {
    const jwks = await generateJwks();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jwks),
    };
  }

  if (event.path === "/authorize" && event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};
    const errors: string[] = [];

    if (!params.client_id || params.client_id.length === 0) {
      errors.push("client_id is required and must not be empty");
    }
    if (!params.scope || params.scope.length === 0) {
      errors.push("scope is required and must not be empty");
    }
    if (!params.response_type || params.response_type !== "code") {
      errors.push("response_type is required and must be 'code'");
    }
    if (!params.redirect_uri || params.redirect_uri.length === 0) {
      errors.push("redirect_uri is required and must not be empty");
    } else {
      try {
        new URL(params.redirect_uri);
      } catch {
        errors.push("redirect_uri must be a valid URL");
      }
    }
    if (!params.request || params.request.length === 0) {
      errors.push("request is required and must not be empty");
    }
    if (!params.state || params.state.length === 0) {
      errors.push("state is required and must not be empty");
    }

    if (errors.length > 0) {
      const html = `<!DOCTYPE html>
                    <html>
                    <head><title>Validation Error</title></head>
                    <body>
                    <h1>Validation Failed</h1>
                    <ul>${errors.map((error) => `<li>${error}</li>`).join("")}</ul>
                    </body>
                    </html>`;
      return {
        statusCode: 400,
        headers: { "Content-Type": "text/html" },
        body: html,
      };
    }

    const redirectUri = params.redirect_uri;
    const state = params.state;

    const html = `<!DOCTYPE html>
                  <html>
                  <head><title>Account Management Component Stub</title></head>
                  <body>
                  <h1>Account Management Component Stub</h1>

                  <h2>Journey outcome endpoint success responses</h2>
                  <p>These links are for simulating /journeyoutcome success responses as detailed in the spec at <a href="https://github.com/govuk-one-login/account-components/blob/main/solutions/api/spec.yaml">account-components/solutions/api/spec.yaml</a></p>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%7D%2C%22journey%22%3A%22testing-journey%22%2C%22success%22%3Atrue%2C%22timestamp%22%3A1770630621788%7D%5D%2C%22outcome_id%22%3A%22e015cbfbfb80b1d0b48454c2e033e04910c27d58827b31d8%22%2C%22scope%22%3A%22testing-journey%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Atrue%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">testing-journey success</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%7D%2C%22journey%22%3A%22account-delete%22%2C%22success%22%3Atrue%2C%22timestamp%22%3A1770630621788%7D%5D%2C%22outcome_id%22%3A%22e015cbfbfb80b1d0b48454c2e033e04910c27d58827b31d8%22%2C%22scope%22%3A%22account-delete%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Atrue%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">account-delete success</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%7D%2C%22journey%22%3A%22passkey-create%22%2C%22success%22%3Atrue%2C%22timestamp%22%3A1770630621788%7D%5D%2C%22outcome_id%22%3A%22e015cbfbfb80b1d0b48454c2e033e04910c27d58827b31d8%22%2C%22scope%22%3A%22passkey-create%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Atrue%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">passkey-create success</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%22error%22%3A%7B%22code%22%3A1001%2C%22description%22%3A%22UserSignedOut%22%7D%7D%2C%22journey%22%3A%22testing-journey%22%2C%22success%22%3Afalse%2C%22timestamp%22%3A1770631329893%7D%5D%2C%22outcome_id%22%3A%2267ed54cfef70b3a5a7c88da6cabca2a128eb57a2aa92a81b%22%2C%22scope%22%3A%22testing-journey%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Afalse%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">testing-journey user signed out</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%22error%22%3A%7B%22code%22%3A1001%2C%22description%22%3A%22UserSignedOut%22%7D%7D%2C%22journey%22%3A%22account-delete%22%2C%22success%22%3Afalse%2C%22timestamp%22%3A1770631329893%7D%5D%2C%22outcome_id%22%3A%2267ed54cfef70b3a5a7c88da6cabca2a128eb57a2aa92a81b%22%2C%22scope%22%3A%22account-delete%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Afalse%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">account-delete user signed out</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%22error%22%3A%7B%22code%22%3A1001%2C%22description%22%3A%22UserSignedOut%22%7D%7D%2C%22journey%22%3A%22passkey-create%22%2C%22success%22%3Afalse%2C%22timestamp%22%3A1770631329893%7D%5D%2C%22outcome_id%22%3A%2267ed54cfef70b3a5a7c88da6cabca2a128eb57a2aa92a81b%22%2C%22scope%22%3A%22passkey-create%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Afalse%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">passkey-create user signed out</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22email%22%3A%22testuser%40test.null.local%22%2C%22journeys%22%3A%5B%7B%22details%22%3A%7B%22error%22%3A%7B%22code%22%3A1002%2C%22description%22%3A%22UserAbortedJourney%22%7D%7D%2C%22journey%22%3A%22passkey-create%22%2C%22success%22%3Afalse%2C%22timestamp%22%3A1770631329893%7D%5D%2C%22outcome_id%22%3A%2267ed54cfef70b3a5a7c88da6cabca2a128eb57a2aa92a81b%22%2C%22scope%22%3A%22passkey-create%22%2C%22sub%22%3A%22urn%3Afdc%3Agov.uk%3Adefault%22%2C%22success%22%3Afalse%7D%2C%22statusCode%22%3A200%7D%27&state=${state}">passkey-create user aborted journey</a><br>
                  
                  <h2>Journey outcome endpoint error responses</h2>
                  <p>These links are for simulating /journeyoutcome error responses as detailed in the spec at <a href="https://github.com/govuk-one-login/account-components/blob/main/solutions/api/spec.yaml">account-components/solutions/api/spec.yaml</a></p>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4006%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">invalid_authorization_header E4006</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4005%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">outcome_sub_does_not_match_payload E4005</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4007%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">invalid_access_token E4007</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4008%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">access_token_signature_invalid E4008</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22statusCode%22%3A401%7D&state=${state}">Missing or invalid access token</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22not_found%22%2C%22error_description%22%3A%22E404%22%7D%2C%22statusCode%22%3A404%7D&state=${state}">missing_outcome E404</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22internal_server_error%22%2C%22error_description%22%3A%22E500%22%7D%2C%22statusCode%22%3A500%7D&state=${state}">generic_error E500</a><br>
                  <a href="${redirectUri}?code=journeyoutcome_response__%7B%22body%22%3A%7B%22error%22%3A%22internal_server_error%22%2C%22error_description%22%3A%22E5001%22%7D%2C%22statusCode%22%3A500%7D&state=${state}">failed_to_find_outcome E5001</a><br>

                  <h2>Token endpoint error responses</h2>
                  <p>These links are for simulating /token error responses as detailed in the spec at <a href="https://github.com/govuk-one-login/account-components/blob/main/solutions/api/spec.yaml">account-components/solutions/api/spec.yaml</a></p>
                  <a href="${redirectUri}?code=token_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4001%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">invalid_request E4001</a><br>
                  <a href="${redirectUri}?code=token_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_request%22%2C%22error_description%22%3A%22E4002%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">invalid_client_assertion E4002</a><br>
                  <a href="${redirectUri}?code=token_response__%7B%22body%22%3A%7B%22error%22%3A%22invalid_grant%22%2C%22error_description%22%3A%22E4003%22%7D%2C%22statusCode%22%3A400%7D&state=${state}">invalid_code E4003</a><br>
                  <a href="${redirectUri}?code=token_response__%7B%22body%22%3A%7B%22error%22%3A%22internal_server_error%22%2C%22error_description%22%3A%22E500%22%7D%2C%22statusCode%22%3A500%7D&state=${state}">generic_error E500</a><br>

                  <h2>Authorize error responses</h2>
                  <p>These links are for simulating /authorize error responses as detailed in the spec at <a href="https://github.com/govuk-one-login/account-components/blob/main/solutions/frontend/spec.yaml">account-components/solutions/frontend/spec.yaml</a></p>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1001&state=${state}">alg_not_allowed E1001</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1002&state=${state}">jws_invalid E1002</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1003&state=${state}">jws_signature_verification_failed E1003</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1004&state=${state}">jwt_invalid E1004</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1005&state=${state}">jwt_expired E1005</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1006&state=${state}">jwt_claim_validation_failed E1006</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1007&state=${state}">verify_jwt_error E1007</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1008&state=${state}">invalid_claims E1008</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1009&state=${state}">jar_decrypt_failed E1009</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1010&state=${state}">jti_already_used E1010</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1011&state=${state}">cookie_for_checking_user_agent_not_set E1011</a><br>
                  <a href="${redirectUri}?error=invalid_request&error_description=E1012&state=${state}">user_agent_mismatch E1012</a><br>
                  <a href="${redirectUri}?error=unauthorized_client&error_description=E2001&state=${state}">jwks_timeout E2001</a><br>
                  <a href="${redirectUri}?error=unauthorized_client&error_description=E2002&state=${state}">jwks_invalid E2002</a><br>
                  <a href="${redirectUri}?error=unauthorized_client&error_description=E2003&state=${state}">jwks_no_matching_key E2003</a><br>
                  <a href="${redirectUri}?error=unauthorized_client&error_description=E2004&state=${state}">jwks_multiple_matching_keys E2004</a><br>
                  <a href="${redirectUri}?error=unauthorized_client&error_description=E2005&state=${state}">jwk_invalid E2005</a><br>
                  <a href="${redirectUri}?error=server_error&error_description=E3001&state=${state}">failed_to_check_jti_unused E3001</a><br>
                  <a href="${redirectUri}?error=server_error&error_description=E3002&state=${state}">verify_jwt_unknown_error E3002</a><br>
                  <a href="${redirectUri}?error=server_error&error_description=E3003&state=${state}">jar_decrypt_unknown_error E3003</a><br>
                  <a href="${redirectUri}?error=server_error&error_description=E3004&state=${state}">failed_to_start_session_and_go_to_journey E3004</a><br>

                  </body>
                  </html>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: html,
    };
  }

  if (event.path === "/token" && event.httpMethod === "POST") {
    try {
      const body = event.body || "";
      const bodyObj = Object.fromEntries(new URLSearchParams(body));
      return validateTokenRequest(bodyObj);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid request" }),
      };
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: "Not Found" }),
  };
};
