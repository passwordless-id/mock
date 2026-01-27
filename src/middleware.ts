import type { APIContext } from "astro";
import * as z from "zod";
import { toErrorResponse } from "./utils/errors";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Authorization, Content-Type",
  "Access-Control-Max-Age": "86400",
};

function applyCorsHeaders(response: Response) {
  // Clone to ensure headers are writable even if the upstream response is immutable
  const cloned = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    cloned.headers.set(key, value);
  });
  return cloned;
}

export async function onRequest(context :APIContext, next :() => Promise<Response>) {
  if (context.request.method === "OPTIONS") {
    // Fast path for CORS preflight requests
    return applyCorsHeaders(new Response(null, { status: 204 }));
  }

  try {
      const response = await next();
      // 2 step to allow inspecting content for debug purposes
      return applyCorsHeaders(response);
  }
  catch (error) {
    if (error instanceof z.ZodError) {
        // TODO: once Astro updates to v6 with Zod v4, use prettifyError:
        //const message :string = z.prettifyError(error); 
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
        return applyCorsHeaders(toErrorResponse(400, "invalid_request", `Invalid request parameters: ${message}`));
    }
    console.error("Unhandled error in middleware:", error);
    console.error(error.stack);
    return applyCorsHeaders(toErrorResponse(500, "server_error", "An internal server error occurred."));
  }
}
