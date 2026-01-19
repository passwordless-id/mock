import type { APIContext } from "astro";
import { z } from "astro/zod";
import type { AuthorizeParams } from "./authorize";
import { toErrorResponse } from "../utils/errors";


/**
 * Parameters for the /token endpoint.
 * See https://openid.net/specs/openid-connect-core-1_0.html
 * See https://datatracker.ietf.org/doc/html/rfc6749
 */
export interface TokenParams {
    /**
     * The client identifier as described in Section 2.2 of the OAuth 2.1 specification.
     */
    client_id?: string;

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

    /**
     * The scope of the access request. Usually used in client credentials flow.
     */
    scope?: string;
}


export async function POST(context :APIContext) {
    // read and parse the form data
    const formData = await context.request.formData();
    
    const params: TokenParams = z.object({
        client_id: z.string().optional(),
        client_secret: z.string().optional(),
        grant_type: z.enum(['authorization_code', 'client_credentials', 'refresh_token', 'password']),
        code: z.string().optional(),
        redirect_uri: z.string().optional(),
        refresh_token: z.string().optional(),
        code_verifier: z.string().optional(),
        scope: z.string().optional(),
    }).parse(Object.fromEntries(formData.entries()));


    // verify that either an Athorization header with client credentials or client_id and client_secret are provided
    const authHeader = context.request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Basic ")) {    
        const base64Credentials = authHeader.substring(6);
        const credentials = atob(base64Credentials);
        const [username, password] = credentials.split(":");
        if(username !== 'test' || password !== 's3cr3t') {
            return toErrorResponse(401, "invalid_client", "Invalid client credentials");
        }
    }
    else {
        // read it from the form data
        const username = formData.get("client_id");
        const password = formData.get("client_secret");
        if (!username || !password) {
            return toErrorResponse(401, "invalid_client", "Missing client credentials");
        }
        if(String(username) !== 'test' || String(password) !== 's3cr3t') {
            return toErrorResponse(401, "invalid_client", "Invalid client credentials");
        }
    }
    
    console.log("Token request params:", JSON.stringify(params));

    const KV = context.locals.runtime.env.KV;

    if (params.grant_type === 'authorization_code') {
        // Handle authorization code grant
        if (!params.code) {
            return toErrorResponse(400, "invalid_request", "Missing authorization code.");
        }

        const rawJson = await KV.get(`codes/${params.code}`);
        if (!rawJson) {
            return toErrorResponse(400, "invalid_grant", "Invalid authorization code.");
        }
        else {
            const storedParams: AuthorizeParams = JSON.parse(rawJson);
            if(storedParams.redirect_uri !== params.redirect_uri) {
                return toErrorResponse(400, "invalid_grant", "Redirect URI does not match authorization code");
            }
            if(storedParams.code_challenge) {
                if(!params.code_verifier) {
                    return toErrorResponse(400, "invalid_request", "Missing code verifier");
                }
                // verify PKCE
                const hashed = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(params.code_verifier));
                const base64url = btoa(String.fromCharCode(...new Uint8Array(hashed)))
                    .replace(/=/g, '')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_');
                if(base64url !== storedParams.code_challenge) {
                    return toErrorResponse(400, "invalid_grant", "Invalid code verifier");
                }
            }
            if(params.scope) {
                if(params.scope !== storedParams.scope) {
                    return toErrorResponse(400, "invalid_grant", "Requested scope does not match authorization code");
                }
            }
            else {
                params.scope = storedParams.scope;
            }

            // all checks passed, delete the code to prevent reuse
            await KV.delete(params.code);
        }
    } else  {
        // Other grant types are not supported in this mock implementation
        return toErrorResponse(400, "unsupported_grant_type", "Grant type not supported");
    }

    const access_token = crypto.randomUUID();
    await KV.put(`access_tokens/${access_token}`, JSON.stringify(params), { expirationTtl: 3600 });
    const tokenResponse = {
        access_token,
        token_type: "Bearer",
        expires_in: 3600,
        scope: params.scope
    };
    return new Response(JSON.stringify(tokenResponse), { headers: { 'Content-Type': 'application/json' } });
}