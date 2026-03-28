#!/usr/bin/python

# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0

import json
import os
import random
import uuid
import logging
import copy

from locust import HttpUser, task, between
from locust_plugins.users.playwright import PlaywrightUser, pw, PageWithRetry, event

from openfeature import api
from openfeature.contrib.provider.ofrep import OFREPProvider

from playwright.async_api import Route, Request

# Configure root logger
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)

# Initialize Flagd provider
base_url = f"http://{os.environ.get('FLAGD_HOST', 'localhost')}:{os.environ.get('FLAGD_OFREP_PORT', 8016)}"
api.set_provider(OFREPProvider(base_url=base_url))

def get_flagd_value(FlagName):
    # Initialize OpenFeature
    client = api.get_client()
    return client.get_integer_value(FlagName, 0)

categories = [
    "apparel",
    "desk",
    "carry",
    "hoodies",
    "tees",
    "bags",
    None,
]

products = [
    "uptime-tee-bone",
    "uptime-tee-washed-black",
    "incident-hoodie-sand",
    "incident-hoodie-charcoal",
    "on-call-mug-white",
    "on-call-mug-black",
    "logs-tote-natural",
    "logs-tote-black",
]

product_category_map = {
    "uptime-tee-bone": ["apparel", "tees"],
    "uptime-tee-washed-black": ["apparel", "tees"],
    "incident-hoodie-sand": ["apparel", "hoodies"],
    "incident-hoodie-charcoal": ["apparel", "hoodies"],
    "on-call-mug-white": ["desk"],
    "on-call-mug-black": ["desk"],
    "logs-tote-natural": ["carry", "bags"],
    "logs-tote-black": ["carry", "bags"],
}

products_by_category = {
    "apparel": [
        "uptime-tee-bone",
        "uptime-tee-washed-black",
        "incident-hoodie-sand",
        "incident-hoodie-charcoal",
    ],
    "desk": [
        "on-call-mug-white",
        "on-call-mug-black",
    ],
    "carry": [
        "logs-tote-natural",
        "logs-tote-black",
    ],
}

journey_stages = [
    "storefront_bounce",
    "product_browse",
    "cart_abandon",
    "checkout_started",
    "order_completed",
]

api_journey_stage_weights = [34, 27, 18, 12, 9]
browser_journey_stage_weights = [24, 22, 18, 14, 22]

# The load generator intentionally excludes James Shoppy.
# He is reserved for manual human-driven frontend sessions during demos.
demo_users = [
    {
        "id": "usr_olivia_hart",
        "email": "olivia.hart@northstar.dev",
        "username": "Olivia Hart",
        "company": "Northstar Dev",
        "role": "Developer Advocate",
        "plan": "starter",
        "preferred_category": "desk",
        "preferred_products": ["on-call-mug-black", "on-call-mug-white"],
        "city": "Austin",
        "state": "TX",
        "country": "United States",
        "zip_code": "78701",
        "street_address": "600 Congress Ave",
        "currency": "USD",
    },
    {
        "id": "usr_mateo_ruiz",
        "email": "mateo.ruiz@signalforge.io",
        "username": "Mateo Ruiz",
        "company": "SignalForge",
        "role": "Site Reliability Engineer",
        "plan": "growth",
        "preferred_category": "apparel",
        "preferred_products": ["incident-hoodie-charcoal", "uptime-tee-washed-black"],
        "city": "Denver",
        "state": "CO",
        "country": "United States",
        "zip_code": "80202",
        "street_address": "1701 Wynkoop St",
        "currency": "USD",
    },
    {
        "id": "usr_priya_shah",
        "email": "priya.shah@vectralabs.com",
        "username": "Priya Shah",
        "company": "Vectra Labs",
        "role": "Engineering Manager",
        "plan": "enterprise",
        "preferred_category": "carry",
        "preferred_products": ["logs-tote-natural", "logs-tote-black"],
        "city": "New York",
        "state": "NY",
        "country": "United States",
        "zip_code": "10010",
        "street_address": "11 Madison Ave",
        "currency": "USD",
    },
    {
        "id": "usr_evan_choi",
        "email": "evan.choi@redlineops.com",
        "username": "Evan Choi",
        "company": "Redline Ops",
        "role": "Incident Commander",
        "plan": "growth",
        "preferred_category": "apparel",
        "preferred_products": ["incident-hoodie-sand", "incident-hoodie-charcoal"],
        "city": "Seattle",
        "state": "WA",
        "country": "United States",
        "zip_code": "98101",
        "street_address": "500 Pine St",
        "currency": "USD",
    },
]

people_file = open('people.json')
people = json.load(people_file)

def choose_session_profile():
    is_identified = random.random() < 0.7
    demo_user = random.choice(demo_users) if is_identified else None
    user_id = demo_user["id"] if demo_user else str(uuid.uuid4())

    return {
        "currency_code": demo_user["currency"] if demo_user else "USD",
        "demo_user": demo_user,
        "user_id": user_id,
    }

def choose_category_for_profile(profile):
    demo_user = profile["demo_user"]
    if demo_user and random.random() < 0.75:
        return demo_user["preferred_category"]

    return random.choice(categories)

def choose_product_for_profile(profile):
    demo_user = profile["demo_user"]
    if demo_user and random.random() < 0.75:
        return random.choice(demo_user["preferred_products"])

    category = choose_category_for_profile(profile)
    if category in products_by_category and random.random() < 0.6:
        return random.choice(products_by_category[category])

    return random.choice(products)

def build_checkout_person(profile):
    template = copy.deepcopy(random.choice(people))
    demo_user = profile["demo_user"]

    if demo_user:
        template["email"] = demo_user["email"]
        template["userCurrency"] = demo_user["currency"]
        template["address"] = {
            "streetAddress": demo_user["street_address"],
            "zipCode": demo_user["zip_code"],
            "city": demo_user["city"],
            "state": demo_user["state"],
            "country": demo_user["country"],
        }

    template["userId"] = profile["user_id"]
    return template

def choose_funnel_stage(audience="api"):
    weights = browser_journey_stage_weights if audience == "browser" else api_journey_stage_weights
    return random.choices(journey_stages, weights=weights, k=1)[0]

def choose_distinct_products(profile, count):
    selected = []

    while len(selected) < count:
        product = choose_product_for_profile(profile)
        if product not in selected:
            selected.append(product)

    return selected

class WebsiteUser(HttpUser):
    weight = 4
    wait_time = between(1, 10)
    
    def on_start(self):
        self.profile = choose_session_profile()
        logging.info("Starting API shopper user_id=%s identified=%s", self.profile["user_id"], bool(self.profile["demo_user"]))
    
    def reset_connection(self):
        """Force a new connection by closing the existing session pool"""
        # Close all adapters in the session to force new connections
        self.client.close()
        # Locust will automatically create a new session on next request

    def index(self):
        self.reset_connection()
        logging.info("User %s accessing storefront", self.profile["user_id"])
        self.client.get("/")

    def browse_product(self, product=None):
        if product is None:
            product = choose_product_for_profile(self.profile)
        self.last_product = product
        logging.info("User %s browsing product: %s", self.profile["user_id"], product)
        self.client.get(
            "/api/products/" + product,
            params={"currencyCode": self.profile["currency_code"]},
        )
        return product

    def get_recommendations(self, product=None):
        if product is None:
            if hasattr(self, "last_product"):
                product = self.last_product
            else:
                product = choose_product_for_profile(self.profile)
        logging.info("User %s getting recommendations for product: %s", self.profile["user_id"], product)
        params = {
            "productIds": [product],
            "sessionId": self.profile["user_id"],
            "currencyCode": self.profile["currency_code"],
        }
        self.client.get("/api/recommendations", params=params)

    def get_ads(self, category=None):
        category = category or choose_category_for_profile(self.profile)
        logging.info("User %s getting ads for category: %s", self.profile["user_id"], category)
        params = {
            "contextKeys": [category],
        }
        self.client.get("/api/data/", params=params)

    def view_cart(self):
        logging.info("User %s viewing cart", self.profile["user_id"])
        self.client.get(
            "/api/cart",
            params={
                "sessionId": self.profile["user_id"],
                "currencyCode": self.profile["currency_code"],
            },
        )

    def add_to_cart(self, user="", product=None, quantity=None):
        # Don't reset connection here since this is called by other tasks
        if user == "":
            user = self.profile["user_id"]
        product = product or choose_product_for_profile(self.profile)
        self.last_product = product
        quantity = quantity or random.choice([1, 1, 1, 2, 2, 3])
        logging.info("User %s adding %s of product %s to cart", user, quantity, product)
        self.client.get(
            "/api/products/" + product,
            params={"currencyCode": self.profile["currency_code"]},
        )
        cart_item = {
            "item": {
                "productId": product,
                "quantity": quantity,
            },
            "userId": user,
        }
        self.client.post("/api/cart", json=cart_item)
        return cart_item["item"]

    def get_shipping_quote(self, items, checkout_person):
        params = {
            "itemList": json.dumps(items),
            "currencyCode": self.profile["currency_code"],
            "address": json.dumps(checkout_person["address"]),
        }
        logging.info("User %s requesting shipping quote for %s items", self.profile["user_id"], len(items))
        self.client.get("/api/shipping", params=params)

    def checkout(self, checkout_person):
        self.client.post("/api/checkout", json=checkout_person)
        logging.info("Checkout completed for user %s", self.profile["user_id"])

    @task(12)
    def run_shopper_journey(self):
        self.reset_connection()
        self.profile = choose_session_profile()
        stage = choose_funnel_stage("api")
        product_count = random.choices([1, 2, 3], weights=[65, 25, 10], k=1)[0]
        products_to_view = choose_distinct_products(self.profile, product_count)

        logging.info(
            "User %s running API journey stage=%s identified=%s products=%s",
            self.profile["user_id"],
            stage,
            bool(self.profile["demo_user"]),
            ",".join(products_to_view),
        )

        self.index()

        if stage == "storefront_bounce":
            return

        for product in products_to_view:
            self.browse_product(product)
            self.get_recommendations(product)
            self.get_ads(random.choice(product_category_map.get(product, [choose_category_for_profile(self.profile)])))

        if stage == "product_browse":
            return

        cart_items = [
            self.add_to_cart(
                user=self.profile["user_id"],
                product=products_to_view[-1],
                quantity=random.choice([1, 1, 2, 2, 3]),
            )
        ]

        if stage in ("checkout_started", "order_completed") and random.random() < 0.35:
            extra_product = choose_distinct_products(self.profile, 1)[0]
            cart_items.append(
                self.add_to_cart(
                    user=self.profile["user_id"],
                    product=extra_product,
                    quantity=random.choice([1, 1, 2]),
                )
            )

        self.view_cart()

        if stage == "cart_abandon":
            return

        checkout_person = build_checkout_person(self.profile)
        self.get_shipping_quote(cart_items, checkout_person)

        if stage == "checkout_started":
            return

        self.checkout(checkout_person)

    @task(5)
    def flood_home(self):
        self.reset_connection()
        flood_count = get_flagd_value("loadGeneratorFloodHomepage")
        if flood_count > 0:
            logging.info(f"User flooding homepage {flood_count} times")
            for _ in range(0, flood_count):
                self.client.get("/")


browser_traffic_enabled = os.environ.get("LOCUST_BROWSER_TRAFFIC_ENABLED", "").lower() in ("true", "yes", "on")

if browser_traffic_enabled:
    class WebsiteBrowserUser(PlaywrightUser):
        weight = 1
        headless = True  # to use a headless browser, without a GUI

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)

        async def pause(self, page: PageWithRetry, min_ms=600, max_ms=1800):
            await page.wait_for_timeout(random.randint(min_ms, max_ms))

        async def seed_session(self, page: PageWithRetry):
            profile = choose_session_profile()
            session = {
                "currencyCode": profile["currency_code"],
                "demoUserId": profile["demo_user"]["id"] if profile["demo_user"] else None,
                "userId": profile["user_id"],
            }
            await page.goto("/", wait_until="domcontentloaded")
            await page.evaluate(
                """
                session => {
                    localStorage.setItem('session', JSON.stringify(session));
                }
                """,
                session,
            )
            await page.goto("/", wait_until="domcontentloaded")
            return profile

        @task
        @pw
        async def run_weighted_store_journey(self, page: PageWithRetry):
            try:
                page.on("console", lambda msg: print(msg.text))
                await page.route('**/*', add_baggage_header)
                profile = await self.seed_session(page)
                stage = choose_funnel_stage("browser")
                products_to_view = choose_distinct_products(
                    profile,
                    random.choices([1, 2, 3], weights=[70, 22, 8], k=1)[0],
                )

                logging.info(
                    "Browser user %s running browser journey stage=%s identified=%s products=%s",
                    profile["user_id"],
                    stage,
                    bool(profile["demo_user"]),
                    ",".join(products_to_view),
                )

                await self.pause(page)

                if stage == "storefront_bounce":
                    await self.pause(page, 1200, 2400)
                    return

                for product in products_to_view:
                    await page.goto(f"/product/{product}", wait_until="domcontentloaded")
                    await self.pause(page, 900, 2200)

                if stage == "product_browse":
                    return

                if random.random() < 0.35:
                    quantity = random.choice(["2", "3"])
                    await page.get_by_role("button", name=quantity, exact=True).click()
                    await self.pause(page, 300, 700)

                await page.get_by_role("button", name="Add to cart").click()
                await self.pause(page, 900, 1800)
                await page.goto("/cart", wait_until="domcontentloaded")
                await self.pause(page, 1200, 2200)

                if stage == "cart_abandon":
                    return

                if random.random() < 0.4:
                    await page.fill("#email", profile["demo_user"]["email"] if profile["demo_user"] else f"{profile['user_id'][:8]}@example.com")
                    await self.pause(page, 250, 600)

                if stage == "checkout_started":
                    return

                await page.get_by_role("button", name="Place order").click()
                await page.wait_for_load_state("domcontentloaded")
                await self.pause(page, 1800, 3200)
                logging.info("Browser user %s completed checkout journey", profile["user_id"])
            except Exception as e:
                logging.error(f"Error in browser journey task: {str(e)}")

async def add_baggage_header(route: Route, request: Request):
    existing_baggage = request.headers.get('baggage', '')
    headers = {
        **request.headers,
        'baggage': ', '.join(filter(None, (existing_baggage, 'synthetic_request=true')))
    }
    await route.continue_(headers=headers)
