# Ledgerly Database/API Setup

This project now includes a MySQL-backed API layer in addition to the browser-based frontend demo.

## 1) Database setup

Create/import the schema in MySQL:

```bash
mysql -u root -p < db/schema.sql
```

You can also import it through phpMyAdmin or any MySQL client using `db/schema.sql`.

### Default database config

The project expects the following database connection in `config/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'ledgerly');
define('DB_USER', 'root');
define('DB_PASS', '');
```

If your local MySQL uses a different username/password, update those values before running the API.

## 2) API structure

The backend endpoints are in the `api/` folder.

### Available endpoints

- `GET /api/members.php` - Get all members
- `POST /api/members.php` - Create member
- `PUT /api/members.php` - Update member
- `DELETE /api/members.php` - Delete member

- `GET /api/collections.php` - Get all collections
- `POST /api/collections.php` - Add collection record
- `DELETE /api/collections.php` - Delete collection record
- `POST /api/paymongo.php` - Create or resume a PayMongo test checkout
- `GET /api/paymongo.php?id=...` - Read checkout status for the return page
- `POST /api/paymongo.php?action=webhook` - Receive signed PayMongo test confirmation
- `POST /api/paymongo.php?action=link` - Create or replace a member's private payment link
- `GET /api/paymongo.php?action=member&token=...` - Read the linked member's outstanding balance
- `GET /api/paymongo.php?action=notifications` - Read unacknowledged, webhook-confirmed online payments
- `POST /api/paymongo.php?action=notification-read` - Mark an in-app payment notification as read

- `GET /api/expenses.php` - Get all expenses
- `POST /api/expenses.php` - Add expense
- `PUT /api/expenses.php` - Update expense
- `DELETE /api/expenses.php` - Delete expense

- `GET /api/core.php?table=...` - Read table data for supported entities
- `POST /api/core.php` - Create advances, cash returns, transactions, users, accounts, or settings
- `PUT /api/core.php` - Update transactions, users, or accounts
- `DELETE /api/core.php` - Delete supported core records

- `GET /api/sync.php` - Load all tables at once

## 3) Response format

All API responses are JSON and include CORS headers for browser access.

Example response:

```json
{
  "success": true,
  "data": []
}
```

Or on error:

```json
{
  "success": false,
  "error": "Database connection failed"
}
```

## 4) Notes

- This project still has a browser UI demo that can run without the backend.
- The database-backed PHP API is intended for persistent data storage and CRUD operations.
- If MySQL is not configured with `root` and empty password, update `config/database.php` accordingly.

## 5) PayMongo test checkout

Hosted checkout requires PHP `pdo_mysql`, HTTPS stream support (`allow_url_fopen` with OpenSSL enabled), a PayMongo test secret key, and a webhook signing secret. Set these server environment variables (never in JavaScript):

- `PAYMONGO_SECRET_KEY` — PayMongo test secret key (`sk_test_...`)
- `PAYMONGO_WEBHOOK_SECRET` — test webhook signing secret
- `PAYMONGO_APP_URL` — full URL of `index.html`; HTTPS is required except for localhost

In the PayMongo dashboard, subscribe to `checkout_session.payment.paid` and set the webhook URL to `https://<your-public-host>/api/paymongo.php?action=webhook`. For local development, Cloudflare Quick Tunnels are a free temporary HTTPS option: run `cloudflared tunnel --url http://localhost:8000` and use its generated URL as the webhook host. Anyone with that temporary URL can reach the local app, so use it only for testing. The endpoint verifies the test webhook signature and records a collection only after PayMongo confirms payment.

For an existing database, re-run `db/schema.sql` to create the `online_payments`, `member_payment_links`, and `payment_notifications` tables. This integration is test-mode only and the app has no authentication; do not expose it through a public tunnel with real data or use live keys until access control and production security are in place.
