# PayMongo Member Payments: Phase-by-Phase Setup

This guide helps you set up the member payment link and treasurer notification flow in Ledgerly.

## What this setup does

1. The treasurer creates a private payment link for a member.
2. The member opens the link and sees their remaining fee balance.
3. The member can continue to PayMongo checkout and choose GCash, Maya, card, or QRPH.
4. After PayMongo confirms a payment, Ledgerly records it and shows an in-app notification under **Fees**.

**Important:** You can run Ledgerly locally without a PayMongo account. A real PayMongo checkout requires a PayMongo account and test credentials. Do not share secret keys with anyone or put them in project files.

---

## Phase 1 — Start XAMPP

1. Open the **XAMPP Control Panel**.
2. Start **Apache**.
3. Start **MySQL**.
4. Confirm both show as running.

If Apache or MySQL will not start, resolve that in XAMPP before continuing.

## Phase 2 — Create the Ledgerly database

The database schema creates the `ledgerly` database and the tables needed by the app.

1. Open **PowerShell**.
2. Run:

   ```powershell
   Get-Content -Raw -Encoding UTF8 "C:\xampp\htdocs\Accounting\mini_acc\db\schema.sql" | & "C:\xampp\mysql\bin\mysql.exe" -u root
   ```

3. If MySQL asks for a password, add `-p` after `-u root` and enter your local MySQL password.

The setup uses the default XAMPP MySQL account (`root`, with no password). If your MySQL account differs, update [config/database.php](./config/database.php) to match.

If the database already exists, you can run the command again; the schema uses `IF NOT EXISTS` for its tables.

## Phase 3 — Start Ledgerly locally

Port `8000` may already be in use on this computer, so this guide uses `8001`.

1. In PowerShell, start the PHP server:

   ```powershell
   cd C:\xampp\htdocs\Accounting\mini_acc
   $env:PAYMONGO_APP_URL = "http://localhost:8001/index.html"
   C:\xampp\php\php.exe -S 127.0.0.1:8001
   ```

2. Keep this PowerShell window open while you use the app.
3. Open [http://localhost:8001/index.html](http://localhost:8001/index.html) in your browser.
4. Check the top of the dashboard. It should say **DB: connected**.

If the page says **DB: disconnected**, confirm MySQL is running and check the connection settings in [config/database.php](./config/database.php).

## Phase 4 — Create and open a member payment link

1. In Ledgerly, open **Members**.
2. Add a test member, or use an existing member with an unpaid balance.
3. Find the member in the list and click the **↗** action.
4. Ledgerly copies a private payment link. If the browser does not allow clipboard access, copy the link from the prompt.
5. Open that link in a browser. It should show the member name and outstanding balance.

Creating another link for the same member replaces the old link. Anyone who has a member's private link can use it, so share it only with that member.

## Phase 5 — Try the app without a PayMongo account

Without PayMongo credentials, you can still verify that:

- The member link opens and displays the correct outstanding balance.
- Replacing a link makes the old link stop working.
- Existing manual payment methods, such as cash, can still be recorded by the treasurer.

You **cannot** complete a real online payment without a PayMongo account. The checkout button will report that the PayMongo test key is not configured. Do not treat a manually recorded GCash or bank transfer as a payment verified by PayMongo.

## Phase 6 — Optional: Prepare PayMongo test checkout

Skip this phase if you do not have a PayMongo account.

1. Create or sign in to a PayMongo account and use **Test Mode**.
2. In the PayMongo dashboard, find **Developers → API Keys** and copy a **test secret key** beginning with `sk_test_`.
3. Keep the key private. Do not put it in JavaScript, a source file, or this guide.
4. You also need a **webhook signing secret** from the test webhook you create in Phase 8.

You need both secrets before a completed test payment can be confirmed and shown in the treasurer's notification list.

## Phase 7 — Optional: Open a temporary HTTPS tunnel

PayMongo needs a public HTTPS address to send webhook confirmations. `localhost` is not reachable by PayMongo. A temporary tunnel is **not a deployment**, but it makes your local app reachable over the internet while it is running.

1. Install Cloudflare Tunnel if `cloudflared` is not already installed:

   ```powershell
   winget install --id Cloudflare.cloudflared -e
   ```

   Open a new PowerShell window after installation.
2. Open a **second** PowerShell window and run:

   ```powershell
   cloudflared tunnel --url http://localhost:8001
   ```

3. Leave this window open.
4. Copy the HTTPS address it prints, for example:

   ```text
   https://example-name.trycloudflare.com
   ```

The tunnel address can change when restarted. Use the current address in the next phase.

## Phase 8 — Optional: Configure the PayMongo test webhook

In the PayMongo **test-mode** dashboard:

1. Create a webhook using:

   ```text
   https://YOUR-TUNNEL-ADDRESS/api/paymongo.php?action=webhook
   ```

   Replace `YOUR-TUNNEL-ADDRESS` with the HTTPS address from Phase 7.
2. Subscribe to the `checkout_session.payment.paid` event.
3. Save the webhook.
4. Copy its signing secret. You will set it in the next phase.

## Phase 9 — Optional: Start PHP with PayMongo test settings

Open a **third** PowerShell window. Replace the example values with your own test secrets and the current tunnel address:

```powershell
cd C:\xampp\htdocs\Accounting\mini_acc
$env:PAYMONGO_SECRET_KEY = "sk_test_your_key"
$env:PAYMONGO_WEBHOOK_SECRET = "your_test_webhook_secret"
$env:PAYMONGO_APP_URL = "https://YOUR-TUNNEL-ADDRESS/index.html"
C:\xampp\php\php.exe -S 127.0.0.1:8001
```

Keep the PHP and tunnel windows open during testing. The PHP server must inherit the environment variables, so set them in the same window where you start PHP.

If PHP is already running, stop it with **Ctrl+C** first, then restart it with these settings.

## Phase 10 — Complete a PayMongo test payment

1. Open Ledgerly through the tunnel URL, for example:

   ```text
   https://YOUR-TUNNEL-ADDRESS/index.html
   ```

2. In **Members**, create or replace a member's private payment link.
3. Open the new link and check the member and balance.
4. Enter an amount up to the outstanding balance and continue to checkout.
5. At PayMongo checkout, choose an available test payment method such as GCash.
6. Complete the payment using PayMongo's test instructions.
7. Wait for PayMongo to send its webhook. The member page should show confirmation after the webhook is received.
8. In the treasurer dashboard, open **Fees**. The payment should appear in **Online payment notifications** and in the collection history.

The member balance is reserved while a checkout is pending. Reopening a checkout for the same amount resumes the pending checkout.

## Phase 11 — Stop local testing

1. Press **Ctrl+C** in the PHP server window.
2. Press **Ctrl+C** in the Cloudflare Tunnel window.
3. Close the windows containing test keys when finished.

## Phase 12 — Move Ledgerly to another computer

The app can run on another Windows computer, but each computer needs its own XAMPP setup. Copying the project folder alone does **not** copy the MySQL database or PayMongo settings.

### Move the app and database

1. On the old computer, make a database backup. This includes your member and payment records:

   ```powershell
   & $env:ComSpec /c '"C:\xampp\mysql\bin\mysqldump.exe" -u root ledgerly > "C:\ledgerly-backup.sql"'
   ```

   If your MySQL account has a password, add `-p` after `-u root`; MySQL will prompt for it.

2. Copy the `mini_acc` project folder and `C:\ledgerly-backup.sql` to the new computer. Use a USB drive or another private method. The SQL backup contains financial/member data, so keep it private.
3. Install XAMPP on the new computer, then start **Apache** and **MySQL**.
4. Put the copied `mini_acc` folder under `C:\xampp\htdocs\Accounting\mini_acc`. If you use another folder path, change the commands below to match.
5. In PowerShell, create the database and restore the backup:

   ```powershell
   & "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS ledgerly CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
   Get-Content -Raw -Encoding UTF8 "C:\ledgerly-backup.sql" | & "C:\xampp\mysql\bin\mysql.exe" -u root ledgerly
   ```

   If the new MySQL account has a password, add `-p` after `-u root` in both commands. If MySQL credentials differ, update [config/database.php](./config/database.php).

6. Start PHP as in Phase 3 and open `http://localhost:8001/index.html`. Check that the dashboard says **DB: connected** and that the expected members appear.

If you do **not** need the old member/payment data, skip the backup and restore steps; run the schema-import command from Phase 2 on the new computer instead.

### Set up PayMongo again (optional)

- PHP environment variables do not automatically move between computers. Set `PAYMONGO_SECRET_KEY`, `PAYMONGO_WEBHOOK_SECRET`, and `PAYMONGO_APP_URL` in the PowerShell window that starts PHP.
- Start a new Cloudflare tunnel on the new computer. Its public URL may differ, so update `PAYMONGO_APP_URL` and the webhook URL in the PayMongo dashboard.
- Private payment links contain the previous app/tunnel address. Create fresh links in **Members** and share the new links with members.
- Do not copy secret keys into this guide, the project files, or a shared backup.

## Safety reminders

- Use **test-mode** PayMongo keys only. Test payments do not move real money.
- This app has no staff login or server-side access control. A public tunnel exposes the app and its API while running.
- Do not use real member information or live payment keys with a public tunnel.
- A private payment link is a bearer link: anyone who has it can access that member's payment page.
- In-app notifications appear in the Ledgerly dashboard. This setup does not send email or phone notifications.
- Do not commit or share your PayMongo secrets.
