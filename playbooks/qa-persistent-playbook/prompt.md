[refinery automation test persistent] Weekly QA report. Run exactly these two SQL queries and nothing else:
1. Connector 37 (redshift), run exactly: select left(close_date, 4) as category, count(*) as n, count(distinct account_id) as amount from public.opportunity group by 1 order by 1
2. Connector 1 (TextQL Usage, Postgres), run exactly: select count(*) filter (where created_at > now() - interval '1 day') as chats_1d, count(*) filter (where created_at > now() - interval '7 days') as chats_7d from ana_usage.chats
Report: a short list of every category with its n and amount from query 1, then chats_1d and chats_7d from query 2, then one sentence summary. Write the numbers as digits. No charts, no files.
