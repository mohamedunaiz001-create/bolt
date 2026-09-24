import { app } from "../server";

/**
 * Vercel can invoke catch-all functions with the `/api` prefix removed from
 * the request URL. Restore it before handing the request to Express so the
 * app's `/api/...` routes resolve consistently in both local and deployed use.
 */
export default function handler(req: any, res: any) {
  if (typeof req.url === "string" && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }

  return app(req, res);
}
