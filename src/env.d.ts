interface MyEnv extends Cloudflare.Env {
  KV: KVNamespace;
}

type Runtime = import("@astrojs/cloudflare").Runtime<MyEnv>;

declare namespace App {
  interface Locals extends Runtime {}
}
