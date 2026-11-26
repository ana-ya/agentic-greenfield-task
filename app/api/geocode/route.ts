import { searchPlaces } from "@/app/_data/open-meteo";

/**
 * GET /api/geocode?q=… → Suggestion[] (FR-SEARCH-01, TC-DATA-01).
 * Queries under 2 or over 100 characters (after trimming) answer `[]` without calling upstream.
 * Upstream failure or timeout → `{ error: true }`, which the search shows as a calm Notice (FR-SEARCH-08).
 * It is sent with HTTP 200 on purpose: browsers log every 4xx/5xx fetch to the console, and the spec
 * requires a silent console. `no-store` keeps the failure from being cached anywhere.
 */

const MIN_QUERY = 2;
const MAX_QUERY = 100;

export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim();
  const length = [...query].length;
  if (length < MIN_QUERY || length > MAX_QUERY) return Response.json([]);

  try {
    return Response.json(await searchPlaces(query));
  } catch {
    return Response.json({ error: true }, { headers: { "Cache-Control": "no-store" } });
  }
}
