# Ledgerly — Mini Accounting

Ledgerly is a lightweight, browser-based accounting dashboard for an organization or school-based group. It helps track members, membership fees, collections, expenses, advances, cash liquidation, and overall financial summaries in a single interface.

## Features

- Dashboard with summary metrics and recent transactions
- Membership management for organization members
- Fee collection tracking and outstanding balances
- Expense management by category
- Cash advance and liquidation workflow
- Financial reports and monthly cash-flow view
- Transaction history with add/edit/delete actions
- User management and settings pages
- Data saved in the browser using localStorage for demo use
- Optional PayMongo hosted checkout in test mode, with webhook-confirmed collection tracking

## Project structure

- `index.html` — Application layout and screen sections
- `css/style.css` — App styling and responsive dashboard design
- `js/script.js` — Core logic, sample data, calculations, and UI rendering

## Run the app

You can use either of the following methods:

### Option 1: Open directly in a browser

Open `index.html` in your browser.

### Option 2: Run a local web server

From the project folder:

```bash
cd mini_acc
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## PayMongo test checkout

For an easy step-by-step local setup, see [PHASYBYPHASE.MD](./PHASYBYPHASE.MD).

Members can receive a private payment link from **Membership** using the ↗ action beside their record. Share it directly with that member; creating another link replaces the prior link. On the payment page, the member continues to PayMongo and chooses GCash, Maya, card, or QRPH. Only a valid signed PayMongo webhook records the collection and creates an in-app notification under **Fees → Online payment notifications**.

This is a local prototype, not a secure public member portal: the staff dashboard and API have no authentication. Do not expose them through a public tunnel or use live keys until server-side staff authentication and access control have been added. Private links are bearer links; anyone who has one can use it.

For a local simulated flow, install `db/schema.sql`, then start PHP with the project folder as its document root. PHP needs `pdo_mysql`, `allow_url_fopen`, and OpenSSL:

```powershell
cd C:\xampp\htdocs\Accounting\mini_acc
$env:PAYMONGO_APP_URL = "http://localhost:8001/index.html"
C:\xampp\php\php.exe -S 127.0.0.1:8001
```

Open `http://localhost:8001/index.html`, add a member, and use the ↗ action to copy a payment link. The page will display that member's balance. Starting checkout requires a PayMongo account and test credentials; without them the payment API rejects checkout and no payment is attempted. A signed local test webhook can verify ledger recording and the treasurer notification without contacting PayMongo.

For a real PayMongo test checkout, set `PAYMONGO_SECRET_KEY` (`sk_test_...`) and `PAYMONGO_WEBHOOK_SECRET` in the same PowerShell window before starting PHP. PayMongo must be able to reach the webhook and return URL over HTTPS, which requires a temporary tunnel and a PayMongo test account. The tunnel makes the entire unauthenticated app publicly reachable; do not use it to expose real member data.

If you have a PayMongo test account, start a temporary tunnel in one PowerShell window:

```powershell
cloudflared tunnel --url http://localhost:8001
```

In another PowerShell window, set the three environment variables using the tunnel URL and your own test secrets, then start the PHP server:

```powershell
cd C:\xampp\htdocs\Accounting\mini_acc
$env:PAYMONGO_SECRET_KEY = "sk_test_your_key"
$env:PAYMONGO_WEBHOOK_SECRET = "your_test_webhook_secret"
$env:PAYMONGO_APP_URL = "https://your-generated-host.trycloudflare.com/index.html"
C:\xampp\php\php.exe -S 127.0.0.1:8001
```

In the PayMongo test dashboard, subscribe the webhook at `https://your-generated-host.trycloudflare.com/api/paymongo.php?action=webhook` to `checkout_session.payment.paid`. Keep both terminals open while testing; stop the tunnel with Ctrl+C afterward.

For an existing database, re-run `db/schema.sql` to add the `member_payment_links` and `payment_notifications` tables. Only signed test-mode `checkout_session.payment.paid` events can create collections and treasurer notifications.

## Notes

- The app can still run as a frontend-only demo; online checkout requires the PHP/MySQL backend.
- Demo data is stored in the browser and can be reset from the UI.
- The workspace does not have authentication; keep this test-mode integration private and do not expose the app through a public tunnel with real data.

## Purpose

This project is intended as a mini accounting system demo for managing financial operations in a simple, user-friendly dashboard.
