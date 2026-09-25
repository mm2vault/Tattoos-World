const ALLOWED_ORIGIN = "https://mm2vault.github.io";
const ALLOWED_REPOS = new Set([
  "mm2vault/Tattoos-World-Images",
  "mm2vault/Tattoos-World-Avatars",
  "mm2vault/Tattoos-World-Banners",
  "mm2vault/Tattoos-World-Cosmetics",
  "mm2vault/Tattoos-World-Assets"
]);
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg","image/png","image/webp","image/gif"]);

function headers(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin"
  };
}
function reply(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers(origin) }
  });
}
function safePath(value) {
  return typeof value === "string" &&
    value.length > 0 && value.length <= 180 &&
    !value.includes("..") && !value.startsWith("/") &&
    /^[a-zA-Z0-9_./-]+$/.test(value);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(origin) });
    if (request.method !== "POST") return reply({ error: "POST only" }, 405, origin);
    if (!env.GITHUB_TOKEN) return reply({ error: "Upload service is not configured." }, 503, origin);

    // The frontend must send a Firebase ID token. Verification should be added
    // before enabling public uploads; do not treat a client-provided UID as proof of identity.
    const authorization = request.headers.get("Authorization") || "";
    if (!authorization.startsWith("Bearer ")) return reply({ error: "Login required." }, 401, origin);

    let body;
    try { body = await request.json(); } catch { return reply({ error: "Invalid JSON." }, 400, origin); }

    const { repo, path, contentBase64, contentType } = body;
    if (!ALLOWED_REPOS.has(repo) || !safePath(path)) return reply({ error: "Invalid asset destination." }, 400, origin);
    if (!ALLOWED_TYPES.has(contentType)) return reply({ error: "Unsupported image type." }, 400, origin);
    if (typeof contentBase64 !== "string") return reply({ error: "Missing file data." }, 400, origin);

    const bytes = Math.floor(contentBase64.length * 0.75);
    if (bytes > MAX_BYTES) return reply({ error: "Maximum file size is 4 MB." }, 413, origin);

    const github = await fetch("https://api.github.com/repos/" + repo + "/contents/" + path, {
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + env.GITHUB_TOKEN,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Tattoos-World"
      },
      body: JSON.stringify({
        message: "Tattoos-World asset upload",
        content: contentBase64
      })
    });

    const result = await github.json();
    if (!github.ok) return reply({ error: "GitHub upload failed.", details: result?.message || "Unknown error" }, github.status, origin);
    return reply({ ok: true, path, url: result?.content?.download_url || null }, 200, origin);
  }
};