import type { APIContext } from "astro";
import { generateFakeUser } from "../utils/fake_user";

export async function GET(context :APIContext) {
    // Read the ID token from the Authorization header
    const authHeader = context.request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Missing or invalid Authorization header", { status: 401 });
    }
    const access_token = authHeader.substring("Bearer ".length);
    const KV = context.locals.runtime.env.KV;
    const rawJson = await KV.get(`access_tokens/${access_token}`);
    if (!rawJson) {
        return new Response("Invalid access token", { status: 401 });
    }

    const tokenData = JSON.parse(rawJson);
    const userInfo = generateFakeUser(tokenData.scope);
    return new Response(JSON.stringify(userInfo), { headers: { 'Content-Type': 'application/json' } });
}