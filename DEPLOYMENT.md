# Customer Services Platform — deployment notes

## Runtime configuration

Keep provider credentials in the hosting platform's secret manager. The application reads the following server-side variables:

| Variable | Purpose |
| --- | --- |
| `AD_PROVIDER` | Provider adapter name and source allow-list value. |
| `AD_PUBLISHER_ID` | Provider publisher/application identifier. |
| `AD_ZONE_ID` | Rewarded placement or zone identifier. |
| `AD_WEBHOOK_SECRET` | HMAC secret used to verify provider callbacks. |
| `DAILY_REWARD_LIMIT` | Platform-side daily cap; the stricter provider/platform limit applies. |
| `DATABASE_URL` | MySQL/TiDB connection string supplied by the managed project. |
| `JWT_SECRET` | Secure session signing secret supplied by the managed project. |

When the rewarded-ad variables are absent, the UI intentionally says that no rewarded ad is available and awards zero points. There is no fake timer, local video, completion button, or frontend points mutation.

## Webhook contract

Configure the verified provider to call `POST /api/webhooks/rewarded-ad` with JSON and these headers:

- `X-AD-SIGNATURE`: HMAC-SHA256 of the exact raw JSON body, optionally prefixed with `sha256=`.
- `X-AD-TIMESTAMP`: Unix timestamp within five minutes of server time.
- `X-AD-PROVIDER`: the configured provider name.

The payload must include `session_id`, `transaction_id`, and a provider completion event/status. The server verifies the signature, freshness, provider source, session, user, expiry, reward amount, and duplicate transaction before inserting one ledger credit. A second identical callback returns `duplicate: true` and adds zero points.

## Payments

Payment provider variables and payment routes are intentionally not enabled in this release.

## Hosting

The project includes a generic `Dockerfile` for a Node 22 host. The current project preview runs on the managed free development environment. A Workshark deployment requires a confirmed Workshark account or deployment endpoint; no Workshark connector or verified public documentation was available in the current session.
