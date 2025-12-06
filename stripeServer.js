// This file runs the stripe hosted checkout, and directs users to appropriate html pages
require('dotenv').config(); // load env from .env if present
const http = require('http');
const url = require('url');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Prefer env var for security; gracefully handle missing key so the app doesn't crash.
const stripeApiKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_API_KEY;
const stripe = stripeApiKey ? require('stripe')(stripeApiKey) : null;
let body = {};
const YOUR_DOMAIN = 'http://localhost:8001';

let checkoutServer;

async function stripeServer(order, cart) {
  if (checkoutServer) {
    return order; // server already running
  }

  checkoutServer = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url, true);

    if (pathname === '/create-checkout-session' && req.method === 'POST') {
      if (!stripe) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Stripe API key not configured');
        return;
      }
      stripe.checkout.sessions.create({
          shipping_address_collection: {
              allowed_countries: ['US'],
            },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: {
                    amount: 0,
                    currency: 'usd',
                  },
                  display_name: 'Free shipping',
                  tax_behavior: 'exclusive',
                  tax_code: 'txcd_10000000',
                  delivery_estimate: {
                    minimum: {
                      unit: 'business_day',
                      value: 5,
                    },
                    maximum: {
                      unit: 'business_day',
                      value: 7,
                    },
                  },
                },
              },
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: {
                    amount: 1500,
                    currency: 'usd',
                  },
                  display_name: 'Next day air',
                  delivery_estimate: {
                    minimum: {
                      unit: 'business_day',
                      value: 1,
                    },
                    maximum: {
                      unit: 'business_day',
                      value: 1,
                    },
                  },
                },
              },
            ],
          line_items: [
              {
                  price_data: {
                      currency: 'usd',
                      product_data: {
                          name: 'Tablet',
                          // Add other product data as needed
                      },
                      unit_amount: order.total_cost * 100, // Price in cents (e.g., $20.00)
                  },
                  quantity: 1,
              },
          ],
          //discounts
          /*
          discounts: [
            {
              coupon: coupon.id,
            },
          ],
          */
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/success.html`,
        cancel_url: `${YOUR_DOMAIN}/cancel.html`,
      }).then(session => {
        res.writeHead(303, { 'Location': session.url });
        body = session;
        res.end();
      }).catch(error => {
        console.error('Error creating checkout session:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      });
      
    } else {
      const filePath = './public' + (pathname === '/' ? '/index.html' : pathname);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200);
          res.end(data);
        }
      });
    }
  });

  const PORT = 8001;
  checkoutServer.listen(PORT, () => {
    console.log(`Checkout server running at http://localhost:${PORT}`);
  });

  return order;
}


module.exports = { stripeServer };



