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
		ttl: 600
	},
});
