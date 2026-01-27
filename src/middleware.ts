import type { APIContext } from "astro";
import * as z from "zod";
import { toErrorResponse } from "./utils/errors";

export async function onRequest(context :APIContext, next :() => Promise<Response>) {
  try {
      const response = await next();
      // 2 step to allow inspecting content for debug purposes
      return response;
  }
  catch (error) {
    if (error instanceof z.ZodError) {
        // TODO: once Astro updates to v6 with Zod v4, use prettifyError:
        //const message :string = z.prettifyError(error); 
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
        return toErrorResponse(400, "invalid_request", `Invalid request parameters: ${message}`);
    }
    console.error("Unhandled error in middleware:", error);
    console.error(error.stack);
    return toErrorResponse(500, "server_error", "An internal server error occurred.");
  }
}
