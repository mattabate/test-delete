import pandas as pd

# Reference exchange rates: units of currency per 1 USD.
# Snapshot table (illustrative reference rates, not a live feed).
fx_rates = pd.DataFrame([
    {"code": "USD", "name": "US Dollar", "rate_per_usd": 1.0},
    {"code": "EUR", "name": "Euro", "rate_per_usd": 0.92},
    {"code": "GBP", "name": "British Pound", "rate_per_usd": 0.74},
    {"code": "JPY", "name": "Japanese Yen", "rate_per_usd": 149.5},
    {"code": "CHF", "name": "Swiss Franc", "rate_per_usd": 0.88},
    {"code": "CAD", "name": "Canadian Dollar", "rate_per_usd": 1.36},
    {"code": "AUD", "name": "Australian Dollar", "rate_per_usd": 1.52},
    {"code": "CNY", "name": "Chinese Yuan", "rate_per_usd": 7.18},
    {"code": "INR", "name": "Indian Rupee", "rate_per_usd": 83.4},
    {"code": "BRL", "name": "Brazilian Real", "rate_per_usd": 5.05},
    {"code": "MXN", "name": "Mexican Peso", "rate_per_usd": 17.1},
    {"code": "SGD", "name": "Singapore Dollar", "rate_per_usd": 1.34},
    {"code": "ZAR", "name": "South African Rand", "rate_per_usd": 18.9},
    {"code": "KRW", "name": "South Korean Won", "rate_per_usd": 1330.0},
    {"code": "SEK", "name": "Swedish Krona", "rate_per_usd": 10.4},
]).sort_values("code").reset_index(drop=True)
