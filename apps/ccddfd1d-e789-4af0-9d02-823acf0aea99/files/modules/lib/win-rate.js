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
