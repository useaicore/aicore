export interface Env {
  // Cloudflare bindings
}

export default {
  async fetch(_request: Request, _env: Env, _ctx: ExecutionContext): Promise<Response> {
    // Logger would be injected here via a factory call in a real app
    return new Response("AICore Worker Active");
  },
};
