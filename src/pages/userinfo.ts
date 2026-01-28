import type { APIContext } from "astro";
import { generateFakeUser } from "../utils/fake_user";
import { toErrorResponse } from "../utils/errors";
import { verifyJwt } from "../utils/tokens";

export async function GET(context :APIContext) {
    // Read the ID token from the Authorization header
    const authHeader = context.request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return toErrorResponse(401, "invalid_token", "Missing or invalid Authorization header");
    }
    const access_token = authHeader.substring("Bearer ".length);
    if(access_token.includes(".")) {
        // It's a JWT
        try {
            const tokenData = await verifyJwt(access_token);
            return buildUserInfo(tokenData.scope);
        } catch (error) {
            console.log("Invalid JWT token:", error);
            return toErrorResponse(401, "invalid_token", "Invalid access token");
        }
    }
    else {
        const KV = context.locals.runtime.env.KV;
        const rawJson = await KV.get(`access_tokens/${access_token}`);
        if (!rawJson) {
            console.log("Opaque token not found in KV");
            return toErrorResponse(401, "invalid_token", "Invalid access token");
        }
    
        const tokenData = JSON.parse(rawJson);
        return buildUserInfo(tokenData.scope);
    }
}

function buildUserInfo(scope: string) {
    const userInfo = generateFakeUser(scope);
    return new Response(JSON.stringify(userInfo), { headers: { 'Content-Type': 'application/json' } });
}
