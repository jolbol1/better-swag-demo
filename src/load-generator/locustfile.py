#!/usr/bin/python

# Copyright The OpenTelemetry Authors
# SPDX-License-Identifier: Apache-2.0

import json
import os
import random
import logging
import uuid
import collections

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

product_catalog = {
    "OLJCESPC7Z": {"name": "Incident Hoodie", "category": "hoodies"},
    "66VCHSJNUP": {"name": "Status Hoodie", "category": "hoodies"},
    "1YMWWN1N4O": {"name": "On-Call Tee", "category": "tshirts"},
    "L9ECAV7KIM": {"name": "Signals Tee", "category": "tshirts"},
    "2ZYFJ3GM2N": {"name": "Incident Mug", "category": "drinkware"},
    "0PUK6V6EV0": {"name": "Logs Mug", "category": "drinkware"},
    "LS4PSXUNUM": {"name": "On-Call Tote", "category": "bags"},
    "9SIQT8TOJO": {"name": "Runbook Tote", "category": "bags"},
    "6E92ZMYYFZ": {"name": "Ops Joggers", "category": "bottoms"},
    "HQTGWGPNH4": {"name": "Trace Cap", "category": "accessories"},
}

products_by_category = {}
for product_id, product in product_catalog.items():
    products_by_category.setdefault(product["category"], []).append(product_id)

browser_profiles = [
    {
        "name": "chrome_windows",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "accept_language": "en-US,en;q=0.9",
        "platform": "Win32",
        "navigator_platform": "Win32",
        "viewport": {"width": 1536, "height": 864},
        "brands": [
            {"brand": "Chromium", "version": "133"},
            {"brand": "Google Chrome", "version": "133"},
            {"brand": "Not(A:Brand", "version": "24"},
        ],
        "full_version_list": [
            {"brand": "Chromium", "version": "133.0.6943.142"},
            {"brand": "Google Chrome", "version": "133.0.6943.142"},
            {"brand": "Not(A:Brand", "version": "24.0.0.0"},
        ],
        "ua_platform": "Windows",
        "platform_version": "10.0.0",
        "architecture": "x86",
        "bitness": "64",
    },
    {
        "name": "chrome_macos",
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "accept_language": "en-US,en;q=0.8",
        "platform": "MacIntel",
        "navigator_platform": "MacIntel",
        "viewport": {"width": 1440, "height": 900},
        "brands": [
            {"brand": "Chromium", "version": "133"},
            {"brand": "Google Chrome", "version": "133"},
            {"brand": "Not(A:Brand", "version": "24"},
        ],
        "full_version_list": [
            {"brand": "Chromium", "version": "133.0.6943.142"},
            {"brand": "Google Chrome", "version": "133.0.6943.142"},
            {"brand": "Not(A:Brand", "version": "24.0.0.0"},
        ],
        "ua_platform": "macOS",
        "platform_version": "10.15.7",
        "architecture": "x86",
        "bitness": "64",
    },
    {
        "name": "edge_windows",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.3065.82",
        "accept_language": "en-GB,en-US;q=0.9,en;q=0.8",
        "platform": "Win32",
        "navigator_platform": "Win32",
        "viewport": {"width": 1366, "height": 768},
        "brands": [
            {"brand": "Chromium", "version": "133"},
            {"brand": "Microsoft Edge", "version": "133"},
            {"brand": "Not(A:Brand", "version": "24"},
        ],
        "full_version_list": [
            {"brand": "Chromium", "version": "133.0.6943.142"},
            {"brand": "Microsoft Edge", "version": "133.0.3065.82"},
            {"brand": "Not(A:Brand", "version": "24.0.0.0"},
        ],
        "ua_platform": "Windows",
        "platform_version": "10.0.0",
        "architecture": "x86",
        "bitness": "64",
    },
]

plan_funnel_profiles = {
    "premium": {"product_view_rate": 0.94, "add_to_cart_rate": 0.78, "cart_view_rate": 0.88, "checkout_rate": 0.66},
    "team": {"product_view_rate": 0.89, "add_to_cart_rate": 0.60, "cart_view_rate": 0.82, "checkout_rate": 0.55},
    "free": {"product_view_rate": 0.85, "add_to_cart_rate": 0.46, "cart_view_rate": 0.78, "checkout_rate": 0.495},
    "starter": {"product_view_rate": 0.80, "add_to_cart_rate": 0.36, "cart_view_rate": 0.72, "checkout_rate": 0.396},
    "anonymous": {"product_view_rate": 0.84, "add_to_cart_rate": 0.44, "cart_view_rate": 0.75, "checkout_rate": 0.54},
}

entry_modes = ("sign_in", "remembered", "anonymous")


def pick_funnel_target():
    category = random.choice(list(products_by_category.keys()))
    product = random.choice(products_by_category[category])
    return category, product


def get_plan_funnel_profile(plan):
    return plan_funnel_profiles.get(plan, plan_funnel_profiles["starter"])


def should_advance(rate):
    return random.random() <= rate


def choose_quantity():
    return random.choices([1, 2, 3], weights=[0.74, 0.2, 0.06], k=1)[0]


def pick_browser_profile():
    return random.choice(browser_profiles)


plan_outcome_offsets = {
    "premium": 0.11,
    "team": 0.29,
    "free": 0.47,
    "starter": 0.63,
    "anonymous": 0.79,
}
plan_outcome_counters = collections.defaultdict(int)


def choose_funnel_outcome(plan):
    profile = get_plan_funnel_profile(plan)
    home_drop_probability = 1 - profile["product_view_rate"]
    product_drop_probability = profile["product_view_rate"] * (1 - profile["add_to_cart_rate"])
    post_add_drop_probability = profile["product_view_rate"] * profile["add_to_cart_rate"] * (1 - profile["cart_view_rate"])
    cart_drop_probability = (
        profile["product_view_rate"]
        * profile["add_to_cart_rate"]
        * profile["cart_view_rate"]
        * (1 - profile["checkout_rate"])
    )
    plan_outcome_counters[plan] += 1
    sequence_index = plan_outcome_counters[plan]
    quasi_random = (sequence_index * 0.6180339887498949 + plan_outcome_offsets.get(plan, 0.07)) % 1

    if quasi_random < home_drop_probability:
        return "home"
    if quasi_random < home_drop_probability + product_drop_probability:
        return "product"
    if quasi_random < home_drop_probability + product_drop_probability + post_add_drop_probability:
        return "post_add"
    if quasi_random < home_drop_probability + product_drop_probability + post_add_drop_probability + cart_drop_probability:
        return "cart"
    return "checkout"

people_file = open('people.json')
people = json.load(people_file)
fake_users_file = open('fake_users.json')
fake_users = json.load(fake_users_file)

def get_fake_user():
    return random.choice(fake_users)

def build_session(fake_user):
    return {
        "userId": f"session_{uuid.uuid4()}",
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


def build_anonymous_session(currency_code="USD"):
    return {
        "userId": f"guest_{uuid.uuid4()}",
        "currencyCode": currency_code,
        "selectedUserId": None,
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

        async def reset_browser_session(self, page: PageWithRetry):
            await page.context.clear_cookies()
            await page.goto("/", wait_until="commit")
            await page.evaluate(
                "() => { window.localStorage.clear(); window.sessionStorage.clear(); }"
            )
            await page.goto("about:blank", wait_until="commit")

        async def pause_for_stage(self, page: PageWithRetry, stage):
            timing_ranges = {
                "home": (700, 3600, 1500),
                "product": (1200, 5200, 2400),
                "post_add": (500, 2600, 1200),
                "cart": (900, 4200, 1800),
                "checkout": (1300, 6000, 2600),
                "post_checkout": (1200, 3600, 1900),
                "micro": (180, 850, 350),
            }
            minimum, maximum, mode = timing_ranges[stage]
            delay_ms = int(random.triangular(minimum, maximum, mode))
            await page.wait_for_timeout(delay_ms)

        async def apply_browser_profile(self, page: PageWithRetry, profile):
            profile_payload = json.dumps(
                {
                    "userAgent": profile["user_agent"],
                    "navigatorPlatform": profile["navigator_platform"],
                    "language": profile["accept_language"].split(",")[0],
                    "languages": [lang.split(";")[0] for lang in profile["accept_language"].split(",")],
                    "brands": profile["brands"],
                    "fullVersionList": profile["full_version_list"],
                    "uaPlatform": profile["ua_platform"],
                    "platformVersion": profile["platform_version"],
                    "architecture": profile["architecture"],
                    "bitness": profile["bitness"],
                }
            )
            cdp_session = await page.context.new_cdp_session(page)
            await cdp_session.send(
                "Network.setUserAgentOverride",
                {
                    "userAgent": profile["user_agent"],
                    "acceptLanguage": profile["accept_language"],
                    "platform": profile["ua_platform"],
                    "userAgentMetadata": {
                        "brands": profile["brands"],
                        "fullVersionList": profile["full_version_list"],
                        "fullVersion": profile["full_version_list"][0]["version"],
                        "platform": profile["ua_platform"],
                        "platformVersion": profile["platform_version"],
                        "architecture": profile["architecture"],
                        "model": "",
                        "mobile": False,
                        "bitness": profile["bitness"],
                        "wow64": False,
                    },
                },
            )
            await page.context.set_extra_http_headers({"Accept-Language": profile["accept_language"]})
            await page.set_viewport_size(profile["viewport"])
            init_script = """
                (() => {
                  const profile = PROFILE_PAYLOAD;
                  Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                  Object.defineProperty(navigator, 'platform', { get: () => profile.navigatorPlatform });
                  Object.defineProperty(navigator, 'userAgent', { get: () => profile.userAgent });
                  Object.defineProperty(navigator, 'appVersion', { get: () => profile.userAgent });
                  Object.defineProperty(navigator, 'language', { get: () => profile.language });
                  Object.defineProperty(navigator, 'languages', { get: () => profile.languages });
                  Object.defineProperty(navigator, 'vendor', { get: () => 'Google Inc.' });
                  Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
                  Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
                  Object.defineProperty(navigator, 'maxTouchPoints', { get: () => 0 });
                  window.chrome = window.chrome || { runtime: {} };
                  if (navigator.userAgentData) {
                    Object.defineProperty(navigator, 'userAgentData', {
                      get: () => ({
                        brands: profile.brands,
                        mobile: false,
                        platform: profile.uaPlatform,
                        getHighEntropyValues: async () => ({
                          architecture: profile.architecture,
                          bitness: profile.bitness,
                          brands: profile.brands,
                          fullVersionList: profile.fullVersionList,
                          mobile: false,
                          model: '',
                          platform: profile.uaPlatform,
                          platformVersion: profile.platformVersion,
                          uaFullVersion: profile.fullVersionList[0].version,
                        }),
                        toJSON: () => ({
                          brands: profile.brands,
                          mobile: false,
                          platform: profile.uaPlatform,
                        }),
                      }),
                    });
                  }
                })();
            """.replace("PROFILE_PAYLOAD", profile_payload)
            await page.add_init_script(init_script)

        async def start_funnel_session(self, page: PageWithRetry, session_payload, fake_user, entry_mode):
            if entry_mode == "sign_in":
                await page.goto("/sign-in", wait_until="commit")
                await page.wait_for_selector(f'button[data-user-id="{fake_user["id"]}"]')
                await page.click(f'button[data-user-id="{fake_user["id"]}"]')
                return

            await page.goto("/", wait_until="commit")
            await page.evaluate(
                "(session) => window.localStorage.setItem('session', JSON.stringify(session))",
                session_payload,
            )
            await page.reload(wait_until="commit")

        @task
        @pw
        async def browse_funnel(self, page: PageWithRetry):
            route_attached = False

            try:
                fake_user = get_fake_user()
                browser_profile = pick_browser_profile()
                entry_mode = random.choices(entry_modes, weights=[0.35, 0.45, 0.20], k=1)[0]
                category, product = pick_funnel_target()
                session_payload = build_session(fake_user)
                session_user_id = fake_user["id"]
                plan = fake_user.get("plan", "starter")
                if entry_mode == "anonymous":
                    session_payload = build_anonymous_session()
                    session_user_id = session_payload["userId"]
                    plan = "anonymous"
                funnel_profile = get_plan_funnel_profile(plan)
                planned_outcome = choose_funnel_outcome(plan)
                quantity = choose_quantity()
                expected_total = (
                    funnel_profile["product_view_rate"]
                    * funnel_profile["add_to_cart_rate"]
                    * funnel_profile["cart_view_rate"]
                    * funnel_profile["checkout_rate"]
                )

                logging.info(
                    "Funnel task boot user=%s plan=%s entry=%s category=%s product=%s",
                    session_user_id,
                    plan,
                    entry_mode,
                    category,
                    product,
                )

                await self.apply_browser_profile(page, browser_profile)
                logging.info("Funnel browser profile user=%s profile=%s", session_user_id, browser_profile["name"])

                async def add_funnel_baggage(route: Route, request: Request):
                    await add_baggage_header(
                        route,
                        request,
                        {
                            "synthetic_request": "true",
                            "synthetic_funnel": "better-swag-browser",
                            "synthetic_plan": plan,
                            "synthetic_category": category,
                            "synthetic_product": product,
                            "synthetic_entry_mode": entry_mode,
                        },
                    )

                await self.reset_browser_session(page)
                await self.start_funnel_session(page, session_payload, fake_user, entry_mode)
                logging.info("Funnel session ready user=%s entry=%s product=%s", session_user_id, entry_mode, product)
                await page.wait_for_selector('[data-cy="home-page"]')
                await page.route('**/*', add_funnel_baggage)
                route_attached = True
                logging.info("Funnel route attached user=%s product=%s", session_user_id, product)
                await page.select_option('[data-cy="currency-switcher"]', "USD")
                logging.info("Funnel currency normalized user=%s currency=USD", session_user_id)

                logging.info(
                    "Funnel session started user=%s plan=%s entry=%s category=%s product=%s expected_total=%.1f%% planned_outcome=%s",
                    session_user_id,
                    plan,
                    entry_mode,
                    category,
                    product,
                    expected_total * 100,
                    planned_outcome,
                )

                await self.pause_for_stage(page, "home")

                if planned_outcome == "home":
                    logging.info(
                        "Funnel drop-off stage=home user=%s plan=%s category=%s product=%s",
                        session_user_id,
                        plan,
                        category,
                        product,
                    )
                    return

                await page.wait_for_selector(f'a[href="/product/{product}"]')
                await page.click(f'a[href="/product/{product}"]')
                await page.wait_for_selector('[data-cy="product-detail"]')
                await self.pause_for_stage(page, "product")

                if planned_outcome == "product":
                    logging.info(
                        "Funnel drop-off stage=product user=%s plan=%s category=%s product=%s",
                        session_user_id,
                        plan,
                        category,
                        product,
                    )
                    return

                await page.select_option('[data-cy="product-quantity"]', str(quantity))
                await self.pause_for_stage(page, "micro")
                async with page.expect_response(
                    lambda response: "/api/cart" in response.url and response.request.method == "POST"
                ) as add_to_cart_response_info:
                    await page.click('[data-cy="product-add-to-cart"]')
                add_to_cart_response = await add_to_cart_response_info.value
                if not add_to_cart_response.ok:
                    raise RuntimeError(f"Add to cart request failed with status {add_to_cart_response.status}")
                await page.wait_for_selector('[data-cy="product-cart-notice"]')
                await self.pause_for_stage(page, "post_add")
                logging.info(
                    "Funnel add-to-cart user=%s plan=%s category=%s product=%s quantity=%s",
                    session_user_id,
                    plan,
                    category,
                    product,
                    quantity,
                )

                if planned_outcome == "post_add":
                    logging.info(
                        "Funnel drop-off stage=post_add user=%s plan=%s category=%s product=%s",
                        session_user_id,
                        plan,
                        category,
                        product,
                    )
                    return

                await page.goto("/cart", wait_until="domcontentloaded")
                await page.wait_for_selector('[data-cy="checkout-place-order"]')
                await self.pause_for_stage(page, "cart")

                if planned_outcome == "cart":
                    logging.info(
                        "Funnel drop-off stage=cart user=%s plan=%s category=%s product=%s",
                        session_user_id,
                        plan,
                        category,
                        product,
                    )
                    return

                await self.pause_for_stage(page, "micro")
                await self.pause_for_stage(page, "checkout")
                async with page.expect_response(
                    lambda response: "/api/checkout" in response.url and response.request.method == "POST"
                ) as checkout_response_info:
                    await page.click('[data-cy="checkout-place-order"]')
                checkout_response = await checkout_response_info.value
                if not checkout_response.ok:
                    raise RuntimeError(f"Checkout request failed with status {checkout_response.status}")
                await page.wait_for_function("() => window.location.pathname.startsWith('/cart/checkout/')")
                await page.wait_for_selector("text=Your Better Swag order is confirmed.")
                await self.pause_for_stage(page, "post_checkout")
                logging.info(
                    "Funnel checkout-complete user=%s plan=%s entry=%s category=%s product=%s quantity=%s",
                    session_user_id,
                    plan,
                    entry_mode,
                    category,
                    product,
                    quantity,
                )
            except Exception as e:
                logging.error(f"Error in browser funnel task: {str(e)}")
            finally:
                if route_attached:
                    await page.unroute('**/*', add_funnel_baggage)

async def add_baggage_header(route: Route, request: Request, baggage_items=None):
    existing_baggage = request.headers.get('baggage', '')
    baggage_items = baggage_items or {"synthetic_request": "true"}
    new_baggage = [f"{key}={value}" for key, value in baggage_items.items() if value is not None]
    headers = {
        **request.headers,
        'baggage': ', '.join(filter(None, [existing_baggage, *new_baggage]))
    }
    await route.continue_(headers=headers)
