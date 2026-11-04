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
