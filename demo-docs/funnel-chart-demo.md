# Better Stack Funnel Chart Demo

This demo uses frontend custom events sent through the Better Stack browser tag.

## Recommended Funnel

Build the funnel in this exact order:

1. `funnel_storefront_viewed`
2. `funnel_product_viewed`
3. `funnel_cart_started`
4. `funnel_checkout_started`
5. `funnel_order_completed`

These steps map to a realistic ecommerce journey:

- `funnel_storefront_viewed`
  The visitor lands on the Better Swag homepage.
- `funnel_product_viewed`
  The visitor opens a product detail page.
- `funnel_cart_started`
  The visitor adds the first item to cart.
- `funnel_checkout_started`
  The visitor reaches the checkout page with a non-empty cart.
- `funnel_order_completed`
  The visitor reaches the order confirmation page.

## Why These Events Work Well

- The names are simple and chart-friendly.
- The steps are broad enough to explain to a non-technical audience.
- Each step is only tracked once per browser tab session, so repeat clicks do not inflate the funnel.
- The payloads still contain useful detail such as `product_id`, `product_family`, `category`, `price`, `item_count`, `subtotal`, and `user_id`.

## Suggested Demo Narrative

Use this talk track during the demo:

1. Show the homepage and explain that the session has entered the funnel at `funnel_storefront_viewed`.
2. Open a product and explain that the visitor has moved to `funnel_product_viewed`.
3. Add the item to cart and call out `funnel_cart_started`.
4. Open checkout and call out `funnel_checkout_started`.
5. Show the order confirmation screen and call out `funnel_order_completed`.

## Suggested Filters

If you want to narrow the chart for the demo, filter on one or more of:

- `page`
- `product_family`
- `category`
- `identified_user`
- `user_id`

Useful examples:

- Only hoodie traffic:
  `product_family = "Incident Hoodie"`
- Only anonymous sessions:
  `identified_user = false`
- Only identified demo users:
  `identified_user = true`

## Important Caveat

The live demo backend currently returns `500 Internal Server Error` on the real `/api/checkout` path in some flows. Because of that:

- `funnel_storefront_viewed`
- `funnel_product_viewed`
- `funnel_cart_started`
- `funnel_checkout_started`

are reliable to demonstrate live.

For `funnel_order_completed`, use the confirmation page route directly if you need to guarantee the last funnel step during a presentation.

## Live Frontend

Current demo URL:

[http://ac202b026415a4c188879dd10619ca27-1306655333.eu-west-2.elb.amazonaws.com:8080/](http://ac202b026415a4c188879dd10619ca27-1306655333.eu-west-2.elb.amazonaws.com:8080/)

Current frontend console marker:

- `[frontend] version 7`
