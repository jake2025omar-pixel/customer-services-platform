# Customer Services Platform — deployment notes

## Server-side configuration

Keep all credentials in the hosting platform's secret manager. The application reads these server-side variables; none are bundled into the frontend:

| Variable | Purpose | Required for |
| --- | --- | --- |
| `GOOGLE_ONLY_LOGIN=true` | Rejects OAuth identities that are not identified as Google. | Google-only sign-in |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token used only by `sendOrderToTelegram`. | Order notifications |
| `TELEGRAM_CHAT_ID` | Destination chat for verified order messages. | Order notifications |
| `TELEGRAM_WEBHOOK_SECRET` | Secret token for incoming `POST /api/telegram/webhook`. | Telegram webhook |
| `PAYONEER_URLS` | JSON map such as `{"default":"https://..."}` or service-id URLs. | Checkout links |
| `PAYONEER_WEBHOOK_SECRET` | HMAC-SHA256 secret for signed payment confirmations. | Creating verified orders |
| `AD_PROVIDER` | Rewarded-ad provider name and webhook source allow-list value. | Real rewarded ads |
| `AD_PUBLISHER_ID` | Provider publisher/application identifier. | Real rewarded ads |
| `AD_ZONE_ID` | Provider rewarded placement or zone identifier. | Real rewarded ads |
| `AD_WEBHOOK_SECRET` | HMAC secret used to verify provider callbacks. | Real rewarded ads |
| `DAILY_REWARD_LIMIT` | Platform-side daily cap; the stricter provider/platform limit applies. | Reward policy |
| `DATABASE_URL` | Managed MySQL/TiDB connection string. | Database |
| `JWT_SECRET` | Secure session signing secret. | Sessions |

`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `GOOGLE_ONLY_LOGIN` are configured in the current project. The Payoneer, Telegram incoming-webhook, and rewarded-ad provider secrets still need to be supplied by the corresponding providers before those callbacks can be enabled.

## Dynamic catalog and campaigns

`GET /api/services` returns only active services from the database. Administrator-only `POST`, `PUT`, and `DELETE /api/services` manage the catalog. The admin form accepts a real HTTPS image URL or uploads image bytes to Manus storage and stores only the resulting storage reference in the database.

`GET /api/campaigns` returns active, date-valid campaigns with a participant count from the database. `POST /api/campaigns/:id/join` requires an `Idempotency-Key`, checks the user's server-side ticket balance, deducts the campaign's ticket cost in the same transaction as the entry, and makes duplicate requests harmless.

## Verified orders and Telegram

The frontend does not receive Payoneer credentials. `POST /api/orders/checkout` returns only a server-selected Payoneer URL. `POST /api/payments/payoneer/webhook` requires an HMAC signature and a `paid` event containing `service_id`, `user_id`, and `payment_reference`. The server creates one order per provider/reference pair, decrements stock, and sends the order to Telegram. Telegram failure is recorded as `TELEGRAM_FAILED` rather than being silently treated as success.

## Rewarded-ad security

When the rewarded-ad variables are absent, the UI honestly reports that no ad is available and awards zero points. There is no fake timer, local completion button, or frontend points mutation. A real provider must call `POST /api/webhooks/rewarded-ad` with JSON and these headers:

- `X-AD-SIGNATURE`: HMAC-SHA256 of the exact raw JSON body, optionally prefixed with `sha256=`.
- `X-AD-TIMESTAMP`: Unix timestamp within five minutes of server time.
- `X-AD-PROVIDER`: the configured provider name.

The server verifies the signature, freshness, provider source, session, user, expiry, reward amount, and duplicate transaction before inserting one ledger credit. A second identical callback returns `duplicate: true` and adds zero points. A real ad-provider adapter still requires the provider's official web rewarded-ad and server-side verification contract; no provider or credential was invented.

## Hosting

The project builds with `pnpm check && pnpm test && pnpm build` and includes a generic Node 22 `Dockerfile`. The current managed preview is live during the project session. Public Workshark deployment cannot be completed from this session because no official Workshark deployment endpoint, connector, or account credentials were available; the public search did not identify an official Workshark hosting service. Do not substitute an unverified service or claim a live Workshark URL.
