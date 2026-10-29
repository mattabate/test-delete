import os

import pandas as pd
import plotly.express as px
from dash import Dash, dash_table, dcc, html

app = Dash(__name__, url_base_pathname=os.environ.get("DASH_URL_BASE_PATHNAME", "/"))

warehouse = dashboard_warehouse_summary.copy()
warehouse.columns = [str(c).lower() for c in warehouse.columns]
for col in ("n", "amount"):
    if col in warehouse.columns:
        warehouse[col] = pd.to_numeric(warehouse[col], errors="coerce")

if warehouse.empty or "category" not in warehouse.columns or not warehouse["n"].notna().any():
    body = [html.P("No data available")]
else:
    warehouse["category"] = warehouse["category"].astype(str)
    fig = px.bar(warehouse.sort_values("n", ascending=False), x="category", y="n", title="Rows per category")
    body = [
        html.Div([
            html.Div([html.H4("Categories"), html.P(f"{len(warehouse):,}")], style={"display": "inline-block", "marginRight": "48px"}),
            html.Div([html.H4("Total rows"), html.P(f"{int(warehouse['n'].sum()):,}")], style={"display": "inline-block"}),
        ]),
        dcc.Graph(figure=fig),
        dash_table.DataTable(
            data=warehouse.to_dict("records"),
            columns=[{"name": c, "id": c} for c in warehouse.columns],
            page_size=20,
        ),
    ]

app.layout = html.Div([
    html.H2("QA Persistent Dash Dashboard"),
    html.P("[refinery automation test persistent] Regression fixture for the Plotly Dash runtime."),
    *body,
])
