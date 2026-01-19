import type { APIContext } from "astro";
import { generateFakeUser } from "../utils/fake_user";
import { toErrorResponse } from "../utils/errors";

export async function GET(context :APIContext) {
    // Read the ID token from the Authorization header
    const authHeader = context.request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return toErrorResponse(401, "invalid_token", "Missing or invalid Authorization header");
    }
    const access_token = authHeader.substring("Bearer ".length);
    const KV = context.locals.runtime.env.KV;
    const rawJson = await KV.get(`access_tokens/${access_token}`);
    if (!rawJson) {
        return toErrorResponse(401, "invalid_token", "Invalid access token");
    }

    const tokenData = JSON.parse(rawJson);
    const userInfo = generateFakeUser(tokenData.scope);
    return new Response(JSON.stringify(userInfo), { headers: { 'Content-Type': 'application/json' } });
}