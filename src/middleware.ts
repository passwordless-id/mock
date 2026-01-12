import type { APIContext } from "astro";
import * as z from "zod";

export async function onRequest(context :APIContext, next :() => Promise<Response>) {
  try {
    return await next();
  }
  catch (error) {
      if (error instanceof z.ZodError) {
          // TODO: once Astro updates to v6 with Zod v4, use prettifyError:
          //const message :string = z.prettifyError(error); 
          const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
          return new Response("Invalid Request: " + message, { status: 400 });
      }
      console.error("Unhandled error in middleware:", error);
      return new Response("Internal server error", { status: 500 });
  }
}
