import type { APIContext } from "astro";
import type { AuthorizeParams } from "./authorize";
import { generateFakeUser } from "../utils/fake_user";
import { createJwt } from "../utils/tokens";
import { showError, toErrorRedirect } from "../utils/errors";

const CODE_TTL = 60;


export async function POST(context :APIContext) {
    if (!context.session) {
        return showError(context, "invalid_request", "Session support is required for this endpoint.");
    }
    const params :AuthorizeParams = await context.session.get('params') as AuthorizeParams;
    if (!params) {
        return showError(context, "invalid_request", "Invalid session. Please perform a new authorization request.");
    }

    const redirectUrl = new URL(params.redirect_uri as string);
    const KV = context.locals.runtime.env.KV;

    const formData = await context.request.formData();
    const user_selection = formData.get("user_selection") as string ?? "john";
    const token_type = formData.get("token_type") ?? "opaque";
    const expires_in = parseInt(formData.get("expires_in") as string) || 3600;
    if(expires_in < 0 || expires_in > 31536000) { // one year
        return showError(context, "invalid_request", "Invalid expiration value.");
    }

    const response_type_parts = params.response_type.split(" ");
    if (response_type_parts.includes("code")) {
        const code :string = crypto.randomUUID();
        await KV.put(`codes/${code}`, JSON.stringify({...params, token_type, expires_in, user_selection}), { expirationTtl: CODE_TTL });
        redirectUrl.searchParams.set("code", code);
    }

    if (response_type_parts.includes("id_token")) {
        // create a dummy id_token (JWT)
        const user = generateFakeUser(user_selection, params.scope);
        const id_token = await createJwt({
            iss: context.url.origin,
            aud: params.client_id,
            exp: Math.floor(Date.now() / 1000) + expires_in,
            iat: Math.floor(Date.now() / 1000),
            nonce: params.nonce,
            ...user
        });
        redirectUrl.searchParams.set("id_token", id_token);
    }

    if (params.state) {
        redirectUrl.searchParams.set("state", params.state);
    }
    
    return Response.redirect(redirectUrl.toString(), 302);
}
