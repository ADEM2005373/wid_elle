/**
 * Vercel serverless function: /api/github-read
 * Used by the frontend to read JSON files from GitHub.
 * Called via query param: ?path=data/products.json
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: "Missing path query param" });

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || "main";

  if (!token || !owner || !repo) {
    return res.status(500).json({ error: "Missing GitHub configuration. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO in Vercel env vars." });
  }

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const ghRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (ghRes.status === 401) return res.status(500).json({ error: "Invalid GitHub token" });
    if (ghRes.status === 404) return res.status(404).json({ error: `File not found: ${path}` });
    if (!ghRes.ok) return res.status(500).json({ error: `GitHub API error ${ghRes.status}` });

    const data = await ghRes.json();
    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    return res.status(200).json(JSON.parse(decoded));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
