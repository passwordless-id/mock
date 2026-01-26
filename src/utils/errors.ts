import type { APIContext } from "astro";

export type AuthorizeEndpointError =
  | "invalid_request"
  | "unauthorized_client"
  | "access_denied"
  | "unsupported_response_type"
  | "invalid_scope"
  | "server_error"
  | "temporarily_unavailable"

  // OpenID Connect additions
  | "interaction_required"
  | "login_required"
  | "account_selection_required"
  | "consent_required"
  | "invalid_request_object"
  | "request_not_supported"
  | "request_uri_not_supported"
  | "registration_not_supported";


export type TokenEndpointError =
  | "invalid_request"         // HTTP 400
  | "invalid_client"          // HTTP 401
  | "invalid_grant"           // HTTP 400
  | "unauthorized_client"     // HTTP 400
  | "unsupported_grant_type"  // HTTP 400
  | "invalid_scope"           // HTTP 400
  | "server_error"            // HTTP 500
  | "temporarily_unavailable"; // HTTP 503


export type UserInfoEndpointError =
  | "invalid_request"      // HTTP 400
  | "invalid_token"        // HTTP 401
  | "insufficient_scope";  // HTTP 403

export function toErrorResponse(status: number, error: TokenEndpointError | UserInfoEndpointError, error_description: string) {
    return new Response(JSON.stringify({
            error,
            error_description
        }), {
            status,
            headers: {
                'Content-Type': 'application/json',
            },
        });
}


export async function showError(context :APIContext, error: AuthorizeEndpointError, error_description: string) :Promise<Response> {
    console.log("Showing error:", error, error_description);
    return context.rewrite(`/error?error=${error}&error_description=${encodeURIComponent(error_description)}`);
}


export function toErrorRedirect(redirect_uri: string, error: AuthorizeEndpointError, error_description: string, state?: string) {
    const url = new URL(redirect_uri);
    url.searchParams.set('error', error);
    url.searchParams.set('error_description', error_description);
    if (state) {
        url.searchParams.set('state', state);
    }
    return new Response(null, {
        status: 302,
        headers: {
            'Location': url.toString(),
        },
    });
}
