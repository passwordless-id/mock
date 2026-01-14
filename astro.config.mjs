// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
	site: "https://mock.passwordless.id",
	integrations: [mdx()],
	adapter: cloudflare(),
	output: "server",
	session: { 
		ttl: 600 // otherwise, the session data is kept forever
	},
	security: {
		checkOrigin: false // otherwise the oauth2 / openid calls fail since they come from another domain
	}
});
