#!/usr/bin/python

# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0

import json
import os
import random
import uuid
import logging

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
    "hoodies",
    "tshirts",
    "drinkware",
    "accessories",
    "bags",
    "bottoms",
    None,
]

products = [
    "0PUK6V6EV0",
    "1YMWWN1N4O",
    "2ZYFJ3GM2N",
    "66VCHSJNUP",
    "6E92ZMYYFZ",
    "9SIQT8TOJO",
    "L9ECAV7KIM",
    "LS4PSXUNUM",
    "OLJCESPC7Z",
    "HQTGWGPNH4",
]

people_file = open('people.json')
people = json.load(people_file)
fake_users_file = open('fake_users.json')
fake_users = json.load(fake_users_file)

def get_fake_user():
    return random.choice(fake_users)

def build_session(fake_user):
    return {
        "userId": fake_user["id"],
        "currencyCode": fake_user.get("currencyCode", "USD"),
        "selectedUserId": fake_user["id"],
    }

def build_checkout_payload(fake_user):
    return {
        "userId": fake_user["id"],
        "email": fake_user["email"],
        "address": fake_user["address"],
        "creditCard": fake_user["creditCard"],
    }

class WebsiteUser(HttpUser):
    wait_time = between(1, 10)
    
    def on_start(self):
        self.fake_user = get_fake_user()
        logging.info(f"Starting user session for {self.fake_user['username']} ({self.fake_user['id']})")
        self.index()
    
    def reset_connection(self):
        """Force a new connection by closing the existing session pool"""
        # Close all adapters in the session to force new connections
        self.client.close()
        # Locust will automatically create a new session on next request

    @task(1)
    def index(self):
        self.reset_connection()
        logging.info(f"{self.fake_user['username']} accessing index page")
        self.client.get("/")

    @task(10)
    def browse_product(self):
        self.reset_connection()
        product = random.choice(products)
        logging.info(f"{self.fake_user['username']} browsing product: {product}")
        self.client.get("/api/products/" + product, params={"currencyCode": self.fake_user.get("currencyCode", "USD")})

    @task(3)
    def get_recommendations(self):
        self.reset_connection()
        product = random.choice(products)
        logging.info(f"{self.fake_user['username']} getting recommendations for product: {product}")
        params = {
            "productIds": [product],
            "sessionId": self.fake_user["id"],
            "currencyCode": self.fake_user.get("currencyCode", "USD"),
        }
        self.client.get("/api/recommendations", params=params)

    @task(3)
    def get_ads(self):
        self.reset_connection()
        category = random.choice(categories)
        logging.info(f"{self.fake_user['username']} getting ads for category: {category}")
        params = {
            "contextKeys": [category],
        }
        self.client.get("/api/data/", params=params)

    @task(3)
    def view_cart(self):
        self.reset_connection()
        logging.info(f"{self.fake_user['username']} viewing cart")
        self.client.get("/api/cart", params={
            "sessionId": self.fake_user["id"],
            "currencyCode": self.fake_user.get("currencyCode", "USD"),
        })

    @task(1)
    def switch_fake_user(self):
        self.fake_user = get_fake_user()
        logging.info(f"Switching active fake user to {self.fake_user['username']} ({self.fake_user['id']})")

    @task(2)
    def add_to_cart(self, fake_user=None):
        # Don't reset connection here since this is called by other tasks
        if fake_user is None:
            fake_user = self.fake_user
        product = random.choice(products)
        quantity = random.choice([1, 2, 3, 4, 5, 10])
        logging.info(f"{fake_user['username']} adding {quantity} of product {product} to cart")
        self.client.get("/api/products/" + product, params={"currencyCode": fake_user.get("currencyCode", "USD")})
        cart_item = {
            "item": {
                "productId": product,
                "quantity": quantity,
            },
            "userId": fake_user["id"],
        }
        self.client.post("/api/cart", json=cart_item, params={"currencyCode": fake_user.get("currencyCode", "USD")})

    @task(1)
    def checkout(self):
        self.reset_connection()
        self.add_to_cart(fake_user=self.fake_user)
        self.client.post(
            "/api/checkout",
            json=build_checkout_payload(self.fake_user),
            params={"currencyCode": self.fake_user.get("currencyCode", "USD")},
        )
        logging.info(f"Checkout completed for fake user {self.fake_user['id']}")

    @task(1)
    def checkout_multi(self):
        self.reset_connection()
        fake_user = self.fake_user
        item_count = random.choice([2, 3, 4])
        for i in range(item_count):
            self.add_to_cart(fake_user=fake_user)
        self.client.post(
            "/api/checkout",
            json=build_checkout_payload(fake_user),
            params={"currencyCode": fake_user.get("currencyCode", "USD")},
        )
        logging.info(f"Multi-item checkout completed for fake user {fake_user['id']}")

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

        async def set_fake_user_session(self, page: PageWithRetry, fake_user):
            await page.goto("/", wait_until="domcontentloaded")
            await page.evaluate(
                "(session) => window.localStorage.setItem('session', JSON.stringify(session))",
                build_session(fake_user),
            )

        @task
        @pw
        async def sign_in_fake_user_and_browse(self, page: PageWithRetry):
            try:
                fake_user = get_fake_user()
                product = random.choice(products)
                page.on("console", lambda msg: print(msg.text))
                await page.route('**/*', add_baggage_header)
                await page.goto("/sign-in", wait_until="domcontentloaded")
                await page.click(f'button[data-user-id="{fake_user["id"]}"]')
                await page.wait_for_load_state("domcontentloaded")
                await page.goto(f"/product/{product}", wait_until="domcontentloaded")
                await page.wait_for_timeout(2000)  # giving the browser time to export the traces
                logging.info(f"Signed in via UI as fake user {fake_user['id']} and browsed {product}")
            except Exception as e:
                logging.error(f"Error in sign-in browser task: {str(e)}")

        @task
        @pw
        async def revisit_with_preloaded_fake_user(self, page: PageWithRetry):
            try:
                fake_user = get_fake_user()
                product = random.choice(products)
                page.on("console", lambda msg: print(msg.text))
                await page.route('**/*', add_baggage_header)
                await self.set_fake_user_session(page, fake_user)
                await page.goto("/cart", wait_until="domcontentloaded")
                await page.wait_for_load_state("domcontentloaded")
                await page.goto(f"/product/{product}", wait_until="domcontentloaded")
                await page.wait_for_load_state("domcontentloaded")
                await page.wait_for_selector('button:has-text("Add To Cart")')
                await page.click('button:has-text("Add To Cart")')
                await page.wait_for_load_state("domcontentloaded")
                await page.wait_for_timeout(2000)  # giving the browser time to export the traces
                logging.info(f"Visited with preloaded fake user {fake_user['id']} and added {product} to cart")
            except Exception as e:
                logging.error(f"Error in preloaded fake-user task: {str(e)}")

async def add_baggage_header(route: Route, request: Request):
    existing_baggage = request.headers.get('baggage', '')
    headers = {
        **request.headers,
        'baggage': ', '.join(filter(None, (existing_baggage, 'synthetic_request=true')))
    }
    await route.continue_(headers=headers)
