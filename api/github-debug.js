/**
 * Vercel serverless function: /api/github-debug
 * Returns GitHub configuration status for the debug admin panel.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "";
  const repo = process.env.GITHUB_REPO || "";
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !owner || !repo) {
    return res.status(200).json({
      githubToken: !!token,
      githubOwner: owner,
      githubRepo: repo,
      githubBranch: branch,
      repoAccessible: false,
      productsCount: 0,
      collectionsCount: 0,
      ordersCount: 0,
      lastSync: null,
      error: !token ? "Missing GITHUB_TOKEN" : !owner ? "Missing GITHUB_OWNER" : "Missing GITHUB_REPO",
    });
  }

  let repoAccessible = false;
  let productsCount = 0;
  let collectionsCount = 0;
  let ordersCount = 0;
  let error = null;

  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    repoAccessible = repoRes.ok;
    if (!repoRes.ok) error = `Repository not accessible (${repoRes.status})`;
  } catch (err) {
    error = err.message;
  }

  if (repoAccessible) {
    const readFile = async (path) => {
      const r = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
      });
      if (!r.ok) return null;
      const d = await r.json();
      return JSON.parse(Buffer.from(d.content, "base64").toString("utf-8"));
    };

    try { const p = await readFile("data/products.json"); if (Array.isArray(p)) productsCount = p.length; } catch {}
    try { const c = await readFile("data/collections.json"); if (Array.isArray(c)) collectionsCount = c.length; } catch {}
    try { const o = await readFile("data/orders.json"); if (Array.isArray(o)) ordersCount = o.length; } catch {}
  }

  return res.status(200).json({
    githubToken: true,
    githubOwner: owner,
    githubRepo: repo,
    githubBranch: branch,
    repoAccessible,
    productsCount,
    collectionsCount,
    ordersCount,
    lastSync: repoAccessible ? new Date().toISOString() : null,
    error,
  });
}
