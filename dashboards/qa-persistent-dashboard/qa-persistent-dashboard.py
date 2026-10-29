import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="QA Persistent Dashboard", layout="wide")
st.title("QA Persistent Dashboard")
st.caption("[refinery automation test persistent] Regression fixture: snapshot SQL on the warehouse and on "
           "TextQL Usage, a live parameterized query, and a Python data source.")


def lower_cols(df):
    out = df.copy()
    out.columns = [str(c).lower() for c in out.columns]
    return out


def to_numeric(df, cols):
    out = df.copy()
    for c in cols:
        if c in out.columns:
            out[c] = pd.to_numeric(out[c], errors="coerce")
    return out


@st.cache_data
def weekly_usage(df):
    if df.empty or "day" not in df.columns:
        return pd.DataFrame(columns=["week", "chats", "cells"])
    d = df.copy()
    d["day"] = pd.to_datetime(d["day"], errors="coerce")
    d = d.dropna(subset=["day"])
    if d.empty:
        return pd.DataFrame(columns=["week", "chats", "cells"])
    d["week"] = d["day"].dt.to_period("W").dt.start_time
    return d.groupby("week", as_index=False)[["chats", "cells"]].sum()


usage = to_numeric(lower_cols(dashboard_usage_daily), ["chats", "cells"])
warehouse = to_numeric(lower_cols(dashboard_warehouse_summary), ["n", "amount"])
reference = to_numeric(lower_cols(dashboard_reference_calc), ["k", "square"])

total_chats = usage["chats"].sum() if "chats" in usage.columns and usage["chats"].notna().any() else 0
total_cells = usage["cells"].sum() if "cells" in usage.columns and usage["cells"].notna().any() else 0
reference_total = reference["square"].sum() if "square" in reference.columns and reference["square"].notna().any() else 0

k1, k2, k3, k4 = st.columns(4)
k1.metric("Chats, last 30 days", f"{int(total_chats):,}")
k2.metric("Cells, last 30 days", f"{int(total_cells):,}")
k3.metric("Warehouse categories", f"{len(warehouse):,}")
k4.metric("Reference check (sum of squares)", f"{int(reference_total):,}")

st.subheader("Daily activity")
if usage.empty or not usage["chats"].notna().any():
    st.info("No data available")
else:
    daily = usage.copy()
    daily["day"] = pd.to_datetime(daily["day"], errors="coerce")
    daily = daily.dropna(subset=["day"])
    st.plotly_chart(px.bar(daily, x="day", y=["chats", "cells"], barmode="group"), use_container_width=True)

st.subheader("Weekly totals")
weekly = weekly_usage(usage)
if weekly.empty:
    st.info("No data available")
else:
    st.dataframe(weekly, use_container_width=True, hide_index=True)

st.subheader("Warehouse summary")
if warehouse.empty:
    st.info("No data available")
else:
    st.dataframe(
        warehouse.sort_values("n", ascending=False) if "n" in warehouse.columns else warehouse,
        use_container_width=True,
        hide_index=True,
        column_config={"n": st.column_config.NumberColumn("Rows", format="%d"),
                       "amount": st.column_config.NumberColumn("Amount", format="%,.0f")},
    )

st.subheader("Live query")
days = st.selectbox("Window (days)", [7, 14, 30], index=2)
live = lower_cols(ana.query("usage_live", days=str(days)))
live = to_numeric(live, ["chats"])
if live.empty or not live["chats"].notna().any():
    st.info("No data available")
else:
    st.metric(f"Chats in the last {days} days", f"{int(live['chats'].sum()):,}")
    st.line_chart(live.set_index("day")["chats"])

st.subheader("Reference calculation")
if reference.empty:
    st.info("No data available")
else:
    st.dataframe(reference, use_container_width=True, hide_index=True)
