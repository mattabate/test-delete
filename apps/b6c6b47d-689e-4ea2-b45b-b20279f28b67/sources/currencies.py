import pandas as pd

# Curated from the BIS Triennial Central Bank Survey of FX turnover, April 2025
# (preliminary results released 2025-09-30). Share = % of trades on one side
# of all global FX transactions (shares sum to 200% since each trade has two sides).
data = [
    {"rank": 1, "code": "USD", "name": "US Dollar", "share_2025": 89.2, "share_2022": 88.4, "region": "United States"},
    {"rank": 2, "code": "EUR", "name": "Euro", "share_2025": 28.9, "share_2022": 30.6, "region": "Eurozone"},
    {"rank": 3, "code": "JPY", "name": "Japanese Yen", "share_2025": 16.8, "share_2022": 16.7, "region": "Japan"},
    {"rank": 4, "code": "GBP", "name": "British Pound", "share_2025": 10.2, "share_2022": 12.9, "region": "United Kingdom"},
    {"rank": 5, "code": "CNY", "name": "Chinese Renminbi", "share_2025": 8.5, "share_2022": 7.0, "region": "China"},
]
currencies = pd.DataFrame(data)
currencies["change_pp"] = (currencies["share_2025"] - currencies["share_2022"]).round(1)
