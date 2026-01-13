import type { APIContext } from "astro";
import * as z from "zod";

/**
 * /authorize endpoint parameters according to the OAuth 2.1, PKCE and OpenID specification.
 * See: https://openid.net/specs/openid-connect-core-1_0.html
 * See: https://datatracker.ietf.org/doc/html/rfc6749
 * See: https://datatracker.ietf.org/doc/html/rfc7636
 * See: https://datatracker.ietf.org/doc/html/rfc8252
 */
export interface AuthorizeParams {
    /**
     * The client identifier as described in Section 2.2 of the OAuth 2.1 specification.
     */
    client_id: string;

    /**
     * The response type as described in Section 3.1.1 of the OAuth 2.1 specification.
     */
    response_type: 'none' | 'code' | 'token' | 'id_token' | 'code id_token' | 'code token' | 'id_token token' | 'code id_token token';

    /**
     * The redirect URI to which the authorization server will send the user-agent back once access is granted (or denied).
     */
    redirect_uri?: string;

    /**
     * The scope of the access request as described in Section 3.3 of the OAuth 2.1 specification.
     * Optional in OAuth2, but required in OpenID Connect.
     */
    scope?: string;

    /**
     * A unique identifier for the authorization request, used to prevent replay attacks.
     */
    state?: string;

    /**
     * The code challenge used in the PKCE (Proof Key for Code Exchange) flow, as described in Section 4.3 of the OAuth 2.1 specification.
     */
    code_challenge?: string;
    
    /**
     * The method used to transform the code challenge, as described in Section 4.3 of the OAuth 2.1 specification.
     */
    code_challenge_method?: 'plain' | 'S256';

    /**
     * String value to associate a client session with an ID token.
     * See: https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
     */
    nonce?: string;

    /**
     * Display mode for authentication UI. Allowed values: 'page', 'popup', 'touch', 'wap'.
     * See: https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
     */
    display?: 'page' | 'popup' | 'touch' | 'wap';

    /**
     * How the Authorization Server prompts the user.
     * See: https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
     */
    prompt?: string;

    /**
     * Maximum authentication age in seconds.
     * See: https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
     */
    max_age?: number;

    /**
     * Preferred languages and scripts for the UI.
     * See: https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
     */
    ui_locales?: string;

    /**
     * Previously issued ID Token as a hint.
     * See: https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
     */
    id_token_hint?: string;

    /**
     * Hint to the Authorization Server about the login identifier.
     * See: https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
     */
    login_hint?: string;

    /**
     * Requested Authentication Context Class Reference values.
     * See: https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest
     */
    acr_values?: string;

    /**
     * JWT containing authorization request parameters.
     * See: https://openid.net/specs/openid-connect-core-1_0.html#JWTRequests
     */
    request?: string;

    /**
     * URI referencing a JWT with request parameters.
     * See: https://openid.net/specs/openid-connect-core-1_0.html#JWTRequests
     */
    request_uri?: string;

    /**
     * Requested claims about the user.
     * See: https://openid.net/specs/openid-connect-core-1_0.html#ClaimsParameter
     */
    claims?: string;
}


/**
 * /authorize endpoint according to OpenID Connect spec and OAuth2
 * 
 * Only the id_token and code flows are supported for now.
 */
export async function GET(context :APIContext) {
    // validate parameters
    const url = new URL(context.request.url);
    
    const params : AuthorizeParams = z.object({
            client_id: z.string(),
            response_type: z.enum(['none', 'code', 'token', 'id_token', 'code id_token', 'code token', 'id_token token', 'code id_token token']),
            redirect_uri: z.string().url(),
            scope: z.string(),
            state: z.string().optional(),
            code_challenge: z.string().optional(),
            code_challenge_method: z.enum(['plain', 'S256']).optional(),
            nonce: z.string().optional(),
            display: z.enum(['page', 'popup', 'touch', 'wap']).optional(),
            prompt: z.string().optional(),
            max_age: z.number().optional(),
            ui_locales: z.string().optional(),
            id_token_hint: z.string().optional(),
            login_hint: z.string().optional(),
            acr_values: z.string().optional(),
            request: z.string().optional(),
            request_uri: z.string().optional(),
            claims: z.string().optional(),
        }).parse(Object.fromEntries(url.searchParams.entries()));
    
    const response_type_parts = params.response_type.split(" ");
    // only allow response_type 'code' and 'id_token' for now
    if (!response_type_parts.every(part => part === "code" || part === "id_token")) {
        return new Response("Unsupported response_type, only 'code' and 'id_token' are supported.", { status: 400 });
    }

    // check if clien_id is 'test'
    if (params.client_id !== "test") {
        return new Response("Unauthorized client_id, please use 'test'.", { status: 401 });
    }

    context.session?.set('params', params);
    return context.redirect('/sign-in');
}