# PrimeNest

PrimeNest is a mini ecommerce site we built for class. It runs on a vanilla Node.js HTTP server plus MySQL, handles Google sign-in, products/search, carts, orders, reviews, and Stripe Checkout, and serves simple HTML pages that call the API with fetch.

## What you can do
- Log in with Google (JWT cookie) or use the email/password endpoints (register, change password, forgot password with a temp code emailed via Nodemailer).
- Browse products stored in MySQL with search (MiniSearch), filters (category, price range, rating, weight), sorting, discounts, and average ratings.
- Add to a user-bound cart, edit quantities, and keep totals in sync with discounts and availability checks.
- Validate shipping addresses (SmartyStreets), apply discounts, and create orders. Stripe Checkout runs in test mode for payments.
- View orders, search past orders, cancel or return them, and review products (plus helpfulness votes) when you have purchased them.
- Use the static UI: `index.html`, `store.html`, `cart.html`, `checkout.html`; mock products show up if the DB is empty.

## Stack
- Node.js 18+ with the native `http` module in `server.js`
- MySQL 8; schema and seed data live in `primenest.sql`
- Stripe SDK for checkout, Google Identity Services for OAuth, SmartyStreets for address validation, MiniSearch for local search, Nodemailer for reset emails
- Plain HTML and `style.css` for the frontend

## Project map
- `server.js`: all routes (auth, catalog, cart, orders, reviews, checkout session), JWT cookie handling, discount logic.
- `store.html`, `cart.html`, `checkout.html`, `index.html`, `login.html`: client pages that talk to the API.
- `makeOrder.js`, `stripeServer.js`, `validateAddress.js`: order creation, hosted checkout helper (port 8001), optional address validation.
- `populateProducts.js`: seeds MySQL from `tablets.json` and `cameras.json` (prompts for the DB password).
- `primenest.sql`: tables for products, carts, orders, discounts, reviews, helpfulness votes, and sample data.
- `style.css`: shared styling.

## Setup (local dev)
1) Prereqs: Node 18+, MySQL running locally, Stripe test keys, Google OAuth client ID. Optional: SmartyStreets creds for address validation and SMTP creds if you want real emails instead of the built-in Ethereal test account.
2) Install deps:
```
npm install
```
3) Configure `.env` (keep it out of git):
```
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=primenest
DB_HOST=localhost
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
SMARTY_AUTH_ID=...
SMARTY_AUTH_TOKEN=...
```
4) Create the database and load schema/seed data:
```
mysql -u root -p -e "CREATE DATABASE primenest"
mysql -u root -p primenest < primenest.sql
# optional: bulk-load extra products
node populateProducts.js
```
5) Run the server (prompts for DB password if `DB_PASS` is unset):
```
npm run dev
# or
node server.js
```
6) Visit `http://localhost:8000` to sign in with Google, browse `/store`, manage your cart, and check out.

## How to use the app
- Sign in: use the Google button on `/`; logout hits `/logout`. Email/password endpoints (`/user/register`, `/user/login`, `/user/forgot-password`, `/user/change-password`) exist for testing too.
- Browse: `/store` supports text search, category/price/rating filters, and sorting. Click a card for details and reviews; add to cart with a quantity selector. Mock items appear if the DB has no products.
- Cart: `/cart.html` lists items, totals, and remove buttons; quantities can also be edited via the cart API.
- Checkout: `/checkout.html` builds a Stripe Checkout session from your cart; try Stripe test cards like `4242 4242 4242 4242`.
- Orders and reviews: `/orders` returns your history; `/orders/create` places an order (used by the UI), and `/orders/cancel` or `/orders/return` undo it. Reviews live at `/product-reviews/{product_ID}`; voting on helpfulness uses `/product-reviews/{product_ID}/rate-helpful` and delete goes to `/product-reviews/delete`.

## API quick notes
- Auth cookie: `user_ID` holds a JWT or Google ID token; `/auth-status` reports login state. Unauthed users get redirected to `/`.
- Products: `GET /product-catalog/search?key=...` (filters in JSON body), `GET /product-catalog/{id}` for detail.
- Cart: `GET /shopping-cart`, `POST /shopping-cart/products` to add, `PUT /shopping-cart/products/{id}` to change qty, `DELETE /shopping-cart/products/{id}` to remove, `DELETE /shopping-cart/items` to clear.
- Orders: `POST /orders/create` (shipping + payment), `POST /orders/cancel`, `POST /orders/return`, `GET /orders` for history, `GET /orders/search?key=...` to filter by product keyword.

## Notes and tips
- `stripeServer.js` spins up a tiny helper on port 8001 for hosted checkout; the main app runs on port 8000.
- Address validation is skipped (with a warning) if SmartyStreets keys are missing, so you can still demo the flow.
- Nodemailer is preset with an Ethereal test inbox; swap in your SMTP creds for real emails.
- Keep all secrets in `.env` and rotate any hardcoded keys before sharing or deploying beyond class demos.
