import streamlit as st
import requests

st.set_page_config(page_title="qa-1118-qa-mirror-q-api-dashboard", layout="wide")
st.title("qa-1118-qa-mirror-q-api-dashboard")
st.caption("Live data from dummyjson.com via qa-1118-qa-mirror-q-api")

if st.button("Refresh"):
    st.cache_data.clear()

@st.cache_data(ttl=60)
def fetch_products():
    url = "https://dummyjson.com/products?limit=3&select=id,title,price"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    return resp.json()["products"]

data = fetch_products()

import pandas as pd
df = pd.DataFrame(data)[["id", "title", "price"]]
df.columns = ["ID", "Title", "Price ($)"]

st.subheader("Products (live, limit=3)")
st.dataframe(df, use_container_width=True, hide_index=True)
