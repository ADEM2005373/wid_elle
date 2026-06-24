# WID-ELLE

Luxury handbag e-commerce store — Tunisian brand.

## Deploy to Vercel (free)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo
3. Framework preset: **Vite**
4. Add these Environment Variables:

| Variable | Value |
|---|---|
| `GITHUB_TOKEN` | Your GitHub personal access token (repo read/write) |
| `GITHUB_OWNER` | Your GitHub username |
| `GITHUB_REPO` | Repo name where data JSON files live |
| `GITHUB_BRANCH` | `main` |

5. Click **Deploy** — done!

## Admin panel

Go to `/admin` on your deployed URL.

- **Username:** admin
- **Password:** widelle2025

## Local development

```bash
npm install
npm run dev
```
