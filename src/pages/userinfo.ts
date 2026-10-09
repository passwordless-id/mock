import type { APIContext } from "astro";
import { env } from "cloudflare:workers";
import { generateFakeUser } from "../utils/fake_user";
import { toErrorResponse } from "../utils/errors";
import { verifyJwt } from "../utils/tokens";

export async function GET(context :APIContext) {
    // Read the access token from the Authorization header
    const authHeader = context.request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return toErrorResponse(401, "invalid_token", "Missing or invalid Authorization header");
    }
    const access_token = authHeader.substring("Bearer ".length);
    if(access_token.includes(".")) {
        // It's a JWT
        try {
            const tokenData = await verifyJwt(access_token);
            console.log("Verified JWT token data:", tokenData);
            // Get user_selection from sub
            const user_selection = getUserSelectionFromSub(tokenData.sub as string);
            if(!user_selection) {
                console.log("No user selection found for sub:", tokenData.sub);
                return toErrorResponse(401, "invalid_token", "Invalid access token");
            }
            return buildUserInfo(tokenData.scope, user_selection);
        } catch (error) {
            console.log("Invalid JWT token:", error);
            return toErrorResponse(401, "invalid_token", "Invalid access token");
        }
    }
    else {
        const KV = env.KV;
        const rawJson = await KV.get(`access_tokens/${access_token}`);
        if (!rawJson) {
            console.log("Opaque token not found in KV");
            return toErrorResponse(401, "invalid_token", "Invalid access token");
        }
    
        const tokenData = JSON.parse(rawJson);
        console.log("Verified opaque token data:", tokenData);
        return buildUserInfo(tokenData.scope, tokenData.user_selection);
    }
}

function getUserSelectionFromSub(sub: string): string {
    // Map sub IDs to user selections
    const subToUserMap: Record<string, string> = {
        "123-456-789": "john",
        "987-654-321": "admin",
        "555-555-555": "jane",
        "111-222-333": "anonymous",
        "222-333-444": "unverified"
    };
    console.log(`Mapping sub ${sub} to user selection:`, subToUserMap[sub]);
    return subToUserMap[sub];
}

function buildUserInfo(scope: string, user_selection?: string) {
    const userInfo = generateFakeUser(user_selection, scope);
    return new Response(JSON.stringify(userInfo), { headers: { 'Content-Type': 'application/json' } });
}
