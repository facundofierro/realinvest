---
created: 2026-10-02T13:33:51.211Z
status: done
summary: .agelum/work/summaries/2026-10-02-local-domains-1790948309301.md
type: task
workflowStatus: done
---

# local domains

Create local domains (Caddy + `/etc/hosts`, HTTPS) for the admin application and the wallet application, using the Agelum `local-domains` CLI (skill: "Caddy locally"). Do not hand-edit `~/.agelum/caddy/*` or reload Caddy manually.

## Targets

| App    | Suggested hostname | Target port | Dev port defined at           |
| ------ | ------------------ | ----------- | ----------------------------- |
| wallet | `wallet.realinvest.test` | 47310 | `apps/wallet/package.json:6`  |
| admin  | `admin.realinvest.test`  | 47311 | `apps/admin/package.json:6`   |

Hostnames are a suggestion (lowercase letters/digits/hyphens/dots; any suffix accepted). Confirm or adjust before running.

## Commands

```bash
agelum local-domains add \
  --project-path /Users/facundofierro/git/realinvest \
  --project-name realinvest \
  --title "Wallet" \
  --hostname wallet.realinvest.test \
  --target-port 47310

agelum local-domains add \
  --project-path /Users/facundofierro/git/realinvest \
  --project-name realinvest \
  --title "Admin" \
  --hostname admin.realinvest.test \
  --target-port 47311

agelum local-domains list --project-path /Users/facundofierro/git/realinvest
```

If `agelum` is not on PATH: `pnpm build:cli` then `./scripts/install-cli.sh` from the Agelum monorepo root. macOS only.

## Related source code

- `apps/wallet/package.json:6` – wallet `dev` script (`next dev -p 47310`)
- `apps/wallet/package.json:8` – wallet `start` script (`next start -p 47310`)
- `apps/admin/package.json:6` – admin `dev` script (`next dev -p 47311`)
- `apps/admin/package.json:8` – admin `start` script (`next start -p 47311`)
- `apps/wallet/README.md:34` – documents `http://localhost:47310` as wallet URL (update to the new domain)
- `apps/wallet/README.md:38` – Google OAuth redirect URI `http://localhost:47310/api/auth/callback/google`; add the new HTTPS wallet domain's `/api/auth/callback/google` as an authorized redirect URI
- `apps/wallet/README.md:40` – auth env setup (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`)
- `turbo.json:13` – `AUTH_URL` env passthrough (should point at the wallet domain when using it)
- `.env.example:1` – root env example (candidate place to document `AUTH_URL`)
- `native/wallet/nextjs/package.json:6` – native wrapper uses `NEXT_PUBLIC_API_URL=http://localhost:47310`
- `native/wallet/nextjs/package.json:8` – same API URL for `start`
- `apps/test/package.json:6` – test app on port 47312 (out of scope, listed for port reference)

## Notes

- Google OAuth for the wallet needs the new HTTPS callback URL registered in Google Cloud Console, and `AUTH_URL` set accordingly, or login via the domain will fail.
- Duplicate hostnames across projects are rejected with `CONFLICT`; use `agelum local-domains reconcile --id <id>` if a domain stops working after a restart.