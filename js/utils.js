// utils.js
export const $ = sel => document.querySelector(sel);

export function formatTime(ts) {
  if (!ts) return '-';
  return new Date(Number(ts) * 1000).toLocaleString();
}

export function renderTradesIntoTable(trades, tbodySel='#tradesTable tbody') {
  const tbody = document.querySelector(tbodySel);
  tbody.innerHTML = '';
  if (!trades || trades.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="muted">No trades</td></tr>';
    return;
  }

  let cumulative = 0;
  trades.forEach((t, i) => {
    cumulative += t.pnl || 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i+1}</td>
      <td>${t.side}</td>
      <td>${formatTime(t.entry_time)}</td>
      <td>${Number(t.entry_price).toFixed(2)}</td>
      <td>${t.exit_time ? formatTime(t.exit_time) : '-'}</td>
      <td>${t.exit_price ? Number(t.exit_price).toFixed(2) : '-'}</td>
      <td>${t.pnl !== undefined ? (t.pnl>=0?'+':'') + t.pnl.toFixed(2) : '-'}</td>
      <td>${cumulative.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}


// Fallback EMA compute for frontend-only plots (mirrors server-side logic)
export function computeAndDrawEMAFromHourly(hourly, period, series) {
  if (!hourly || hourly.length === 0) return;
  const closes = hourly.map(h=>h.close);
  const out = [];
  const n = closes.length;
  const k = 2/(period+1);
  if (n < period) {
    let ema = closes[0];
    out.push({time: hourly[0].time, value: ema});
    for (let i=1;i<n;i++){
      ema = closes[i]*k + ema*(1-k);
      out.push({ time: hourly[i].time, value: ema });
    }
  } else {
    let seed = 0;
    for (let i=0;i<period;i++) seed += closes[i];
    seed = seed/period;
    let ema = seed;
    out.push({ time: hourly[period-1].time, value: ema });
    for (let i=period;i<n;i++){
      ema = closes[i]*k + ema*(1-k);
      out.push({ time: hourly[i].time, value: ema });
    }
  }
  try { series.setData(out); } catch(e){ console.warn('failed to set ema series', e); }
}
