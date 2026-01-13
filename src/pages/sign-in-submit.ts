import type { APIContext } from "astro";
import type { AuthorizeParams } from "./authorize";
import { generateFakeUser } from "../utils/fake_user";
import { createJwt } from "../utils/tokens";

const CODE_TTL = 60;
const ID_TOKEN_TTL = 3600;

export async function POST(context :APIContext) {
    if (!context.session) {
        return new Response("Session expired. Please perform a new authorization request.", { status: 401 });
    }
    const params :AuthorizeParams = await context.session.get('params') as AuthorizeParams;
    if (!params) {
        return new Response("Invalid session. Please perform a new authorization request.", { status: 401 });
    }

    const redirectUrl = new URL(params.redirect_uri as string);
    const KV = context.locals.runtime.env.KV;

    const response_type_parts = params.response_type.split(" ");
    if (response_type_parts.includes("code")) {
        const code :string = crypto.randomUUID();
        await KV.put(`codes/${code}`, JSON.stringify(params), { expirationTtl: CODE_TTL });
        redirectUrl.searchParams.set("code", code);
    }

    if (response_type_parts.includes("id_token")) {
        // create a dummy id_token (JWT)
        const user = generateFakeUser();
        const id_token = await createJwt({
            iss: context.url.origin,
            aud: params.client_id,
            exp: Math.floor(Date.now() / 1000) + ID_TOKEN_TTL,
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
