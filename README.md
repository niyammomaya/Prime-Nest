# PrimeNest

A simple ecommerce demo for college students with Google sign-in, product browsing, cart, and Stripe Checkout.

## Features
- Google-only auth (JWT cookie); unauthorized users are redirected to Home.
- Store with search, category filter, min/max price, min rating, and sorting.
- Mock products with quick details (manufacturer, use cases); add to cart inline.
- Cart page with totals and removal; checkout page that creates a Stripe Checkout session.
- Basic Stripe success/cancel handling (cancel returns to checkout).
- Minimal solid-color UI, star ratings, and short + expanded product descriptions.

## Project Structure
- `server.js` — HTTP server, routing, auth, product search, cart, orders, Stripe session creation.
- `store.html` — Store UI, filters, sort, add-to-cart.
- `cart.html` — Cart view with totals/removal.
- `checkout.html` — Checkout stub; calls `/create-checkout-session`.
- `index.html` — Home + Google sign-in button, nav.
- `login.html` / `logout.html` — Legacy login/logout pages (Google is primary).
- `populateProducts.js` — Seeds DB from JSON.
- `makeOrder.js` — Order creation helper.
- `style.css` — Shared styling.
- `primenest.sql` — DB schema (if present).
- `cameras.json` etc. — Sample product data.

## Prereqs
- Node.js (v18+ recommended).
- MySQL running locally with a `primenest` database.
- Stripe test keys.
- Google OAuth client ID.

## Env Vars (create a `.env` and do **not** commit)
```
DB_USER=root
DB_PASS=yourpassword
DB_NAME=primenest
DB_HOST=localhost

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
GOOGLE_CLIENT_ID=391687210332-d60o4n8rp92estqtv9ejsugmo2ohpqj0.apps.googleusercontent.com
```
Ensure `server.js` reads these via `process.env`.

## Setup
1) Install deps:
   ```bash
   npm install
   ```
   (from project root; or `npm --prefix Prime-Nest install` if using that folder).

2) Create DB and import schema:
   ```sql
   CREATE DATABASE primenest;
   -- then import primenest.sql if provided
   ```
   Optionally seed products with `node populateProducts.js` (sets DB password at prompt).

3) Run the server:
   ```bash
   npm --prefix Prime-Nest run dev
   ```
   or `node server.js` inside `Prime-Nest`. The app listens on port 8000.

4) Browse:
   - Home: http://localhost:8000/
   - Store: http://localhost:8000/store
   - Cart: http://localhost:8000/cart.html
   - Checkout: http://localhost:8000/checkout.html

## Stripe Test Flow
- Set `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY`.
- Add items to cart, go to checkout, click “Place Order” to be redirected to Stripe.
- Use Stripe test cards (e.g., 4242 4242 4242 4242).

## Auth Notes
- Only Google sign-in is intended; other login/register flows are de-emphasized.
- `/auth-status` returns 200 when logged in; otherwise 401.
- Protected routes redirect to `/` if not authenticated.

## Filters & Sorting (Store)
- Search: name/description/category.
- Filters: category, min price, max price, min rating.
- Sort: price (asc/desc), rating (desc), name (A–Z).

## Mock Data
- Mock products are in `store.html`. They are seeded into DB when added to cart if not present.

## To Do / Next Steps
- Rotate any committed secrets; ensure keys only live in `.env`.
- Harden error handling for DB/Stripe.
- Add real product images; add quantity stock checks; add order history UI.
- Add unit/integration tests.

## Scripts
- `npm run dev` — start server (`node server.js`).
