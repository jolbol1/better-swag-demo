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

class WebsiteUser(HttpUser):
    wait_time = between(1, 10)
    
    def on_start(self):
        self.profile = choose_session_profile()
        logging.info(
            "Starting user session user_id=%s identified=%s preferred_category=%s",
            self.profile["user_id"],
            bool(self.profile["demo_user"]),
            self.profile["demo_user"]["preferred_category"] if self.profile["demo_user"] else "mixed",
        )
        self.index()
    
    def reset_connection(self):
        """Force a new connection by closing the existing session pool"""
        # Close all adapters in the session to force new connections
        self.client.close()
        # Locust will automatically create a new session on next request

    @task(1)
    def index(self):
        self.reset_connection()
        logging.info("User accessing index page")
        self.client.get("/")

    @task(10)
    def browse_product(self):
        self.reset_connection()
        product = choose_product_for_profile(self.profile)
        self.last_product = product
        logging.info("User %s browsing product: %s", self.profile["user_id"], product)
        self.client.get(
            "/api/products/" + product,
            params={"currencyCode": self.profile["currency_code"]},
        )

    @task(3)
    def get_recommendations(self):
        self.reset_connection()
        product = self.last_product if hasattr(self, "last_product") else choose_product_for_profile(self.profile)
        logging.info("User %s getting recommendations for product: %s", self.profile["user_id"], product)
        params = {
            "productIds": [product],
            "sessionId": self.profile["user_id"],
            "currencyCode": self.profile["currency_code"],
        }
        self.client.get("/api/recommendations", params=params)

    @task(3)
    def get_ads(self):
        self.reset_connection()
        category = choose_category_for_profile(self.profile)
        logging.info("User %s getting ads for category: %s", self.profile["user_id"], category)
        params = {
            "contextKeys": [category],
        }
        self.client.get("/api/data/", params=params)

    @task(3)
    def view_cart(self):
        self.reset_connection()
        logging.info("User %s viewing cart", self.profile["user_id"])
        self.client.get(
            "/api/cart",
            params={
                "sessionId": self.profile["user_id"],
                "currencyCode": self.profile["currency_code"],
            },
        )

    @task(2)
    def add_to_cart(self, user=""):
        # Don't reset connection here since this is called by other tasks
        if user == "":
            user = self.profile["user_id"]
        product = choose_product_for_profile(self.profile)
        self.last_product = product
        quantity = random.choice([1, 1, 1, 2, 2, 3])
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

    @task(1)
    def checkout(self):
        self.reset_connection()
        user = self.profile["user_id"]
        self.add_to_cart(user=user)
        checkout_person = build_checkout_person(self.profile)
        self.client.post("/api/checkout", json=checkout_person)
        logging.info("Checkout completed for user %s", user)
        self.profile = choose_session_profile()

    @task(1)
    def checkout_multi(self):
        self.reset_connection()
        user = self.profile["user_id"]
        item_count = random.choice([2, 3, 4])
        for i in range(item_count):
            self.add_to_cart(user=user)
        checkout_person = build_checkout_person(self.profile)
        self.client.post("/api/checkout", json=checkout_person)
        logging.info("Multi-item checkout completed for user %s", user)
        self.profile = choose_session_profile()

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
        headless = True  # to use a headless browser, without a GUI

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)

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
            return profile

        @task
        @pw
        async def open_cart_page_and_change_currency(self, page: PageWithRetry):
            try:
                page.on("console", lambda msg: print(msg.text))
                await page.route('**/*', add_baggage_header)
                profile = await self.seed_session(page)
                await page.goto("/cart", wait_until="domcontentloaded")
                target_currency = "USD" if profile["demo_user"] else random.choice(["USD", "EUR", "GBP", "CHF"])
                await page.select_option('[name="currency_code"]', target_currency)
                await page.wait_for_timeout(2000)  # giving the browser time to export the traces
                logging.info("Browser user %s changed currency to %s", profile["user_id"], target_currency)
            except Exception as e:
                logging.error(f"Error in change currency task: {str(e)}")

        @task
        @pw
        async def add_product_to_cart(self, page: PageWithRetry):
            try:
                page.on("console", lambda msg: print(msg.text))
                await page.route('**/*', add_baggage_header)
                profile = await self.seed_session(page)
                product = choose_product_for_profile(profile)
                await page.goto(f"/product/{product}", wait_until="domcontentloaded")
                await page.wait_for_load_state("domcontentloaded")
                await page.click('button:has-text("Add to cart")')
                await page.wait_for_load_state("domcontentloaded")
                await page.wait_for_timeout(2000)  # giving the browser time to export the traces
                logging.info("Browser user %s added product %s to cart", profile["user_id"], product)
            except Exception as e:
                logging.error(f"Error in add to cart task: {str(e)}")

async def add_baggage_header(route: Route, request: Request):
    existing_baggage = request.headers.get('baggage', '')
    headers = {
        **request.headers,
        'baggage': ', '.join(filter(None, (existing_baggage, 'synthetic_request=true')))
    }
    await route.continue_(headers=headers)
