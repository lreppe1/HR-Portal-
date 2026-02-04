const BASE = "http://localhost:4000";

const withSlash = (p) => (p.startsWith("/") ? p : `/${p}`);

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${withSlash(path)}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;
  return res.json();
}

export const apiGet = (path) => request(path);
export const apiPost = (path, body) => request(path, { method: "POST", body: JSON.stringify(body) });
export const apiPatch = (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) });
export const apiDelete = (path) => request(path, { method: "DELETE" });
