import { APIContext } from "astro";

export async function GET(context :APIContext) {
    const origin = context.url.origin;
    const config = {
        "issuer": origin,
        "authorization_endpoint": `${origin}/authorize`,
        "token_endpoint": `${origin}/token`,
        "userinfo_endpoint": `${origin}/userinfo`,
        "jwks_uri": `${origin}/.well-known/jwks.json`,
        "response_types_supported": ["code", "id_token", "code id_token"],
        "subject_types_supported": ["public"],
        "id_token_signing_alg_values_supported": ["ES256"],
        "scopes_supported": ["openid", "profile", "email"],
        "claims_supported": ["sub", "iss", "aud", "exp", "iat", "nonce"]
    };
    return new Response(JSON.stringify(config), { headers: { 'Content-Type': 'application/json' } });
}