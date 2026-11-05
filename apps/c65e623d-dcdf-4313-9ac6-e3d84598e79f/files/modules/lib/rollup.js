export function amountByRegion(rows) {
  const totals = new Map();
  for (const r of rows) {
    totals.set(r.region, (totals.get(r.region) || 0) + r.amount);
  }
  return Array.from(totals, ([region, amount]) => ({ region, amount })).sort(
    (a, b) => b.amount - a.amount
  );
}

export function stageOptions(rows) {
  return Array.from(new Set(rows.map((r) => r.stage))).sort();
}

export function winRateByRep(rows) {
  const counts = new Map();
  for (const r of rows) {
    if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
    const entry = counts.get(r.rep) || { rep: r.rep, won: 0, closed: 0 };
    entry.closed += 1;
    if (r.stage === 'Won') entry.won += 1;
    counts.set(r.rep, entry);
  }
  return Array.from(counts.values())
    .map((e) => ({ ...e, winRate: e.closed ? e.won / e.closed : 0 }))
    .sort((a, b) => b.winRate - a.winRate);
}
