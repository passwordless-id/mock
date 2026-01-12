import type { APIContext } from "astro";


/**
 * Parameters for the /token endpoint.
 * See https://openid.net/specs/openid-connect-core-1_0.html
 * See https://datatracker.ietf.org/doc/html/rfc6749
 */
export interface TokenParams {
    /**
     * The client identifier as described in Section 2.2 of the OAuth 2.1 specification.
     */
    client_id: string;

    /**
     * The client secret as described in Section 2.3 of the OAuth 2.1 specification.
     */
    client_secret?: string;

    /**
     * The grant type as described in Section 4.1 of the OAuth 2.1 specification.
     */
    grant_type: 'authorization_code' | 'client_credentials' | 'refresh_token' | 'password';

    /**
     * The authorization code received from the /authorize endpoint.
     */
    code?: string;

    /**
     * The redirect URI used in the authorization request.
     */
    redirect_uri?: string;

    /**
     * The refresh token used to obtain a new access token.
     */
    refresh_token?: string;

    /**
     * The username for password grant type.
     */
    username?: string;

    /**
     * The password for password grant type.
     */
    password?: string;
    /**
     * The code verifier used in the PKCE flow.
     */
    code_verifier?: string;
}

export async function POST(context :APIContext) {
    
}   