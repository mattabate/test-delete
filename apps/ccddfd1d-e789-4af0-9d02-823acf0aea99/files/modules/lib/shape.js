export function amountByRegion(rows) {
  const totals = new Map();
  for (const r of rows) {
    const region = r.region;
    const amount = Number(r.amount) || 0;
    totals.set(region, (totals.get(region) || 0) + amount);
  }
  return Array.from(totals.entries())
    .map(([region, amount]) => ({ region, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function uniqueStages(rows) {
  const set = new Set(rows.map((r) => r.stage));
  return Array.from(set).sort();
}

export function repWinRates(rows) {
  const totals = new Map();
  const wins = new Map();
  for (const r of rows) {
    if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
    const rep = r.rep;
    totals.set(rep, (totals.get(rep) || 0) + 1);
    if (r.stage === 'Won') wins.set(rep, (wins.get(rep) || 0) + 1);
  }
  return Array.from(totals.entries())
    .map(([rep, total]) => ({ rep, winRate: (wins.get(rep) || 0) / total }))
    .sort((a, b) => b.winRate - a.winRate);
}

export function dealsWinRateByRep(rows) {
  const totals = new Map();
  const wins = new Map();
  for (const r of rows) {
    if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
    const rep = r.rep;
    totals.set(rep, (totals.get(rep) || 0) + 1);
    if (r.stage === 'Won') wins.set(rep, (wins.get(rep) || 0) + 1);
  }
  return Array.from(totals.entries())
    .map(([rep, total]) => ({ rep, winRate: (wins.get(rep) || 0) / total }))
    .sort((a, b) => b.winRate - a.winRate);
}

export function computeWinRateByRep(rows) {
  const totals = new Map();
  const wins = new Map();
  for (const r of rows) {
    if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
    const rep = r.rep;
    totals.set(rep, (totals.get(rep) || 0) + 1);
    if (r.stage === 'Won') wins.set(rep, (wins.get(rep) || 0) + 1);
  }
  return Array.from(totals.entries())
    .map(([rep, total]) => ({ rep, winRate: (wins.get(rep) || 0) / total }))
    .sort((a, b) => b.winRate - a.winRate);
}

export function winRateByRep(rows) {
  const totals = new Map();
  const wins = new Map();
  for (const r of rows) {
    if (r.stage !== 'Won' && r.stage !== 'Lost') continue;
    const rep = r.rep;
    totals.set(rep, (totals.get(rep) || 0) + 1);
    if (r.stage === 'Won') wins.set(rep, (wins.get(rep) || 0) + 1);
  }
  return Array.from(totals.entries())
    .map(([rep, total]) => ({ rep, winRate: (wins.get(rep) || 0) / total }))
    .sort((a, b) => b.winRate - a.winRate);
}
