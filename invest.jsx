// invest.jsx — Mercados: KPIs, gráfico interactivo, watchlist con rangos, top movers, eventos

// ─── deterministic pseudo-random ──────────────────────────────────────
function seeded(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function buildSeries(seed, points = 90, base = 100, drift = 0.0003, vol = 0.018) {
  const r = seeded(seed);
  const out = []; let v = base;
  for (let i = 0; i < points; i++) {
    v = v * (1 + drift + (r() - 0.5) * vol);
    out.push(v);
  }
  return out;
}

// ─── default assets ───────────────────────────────────────────────────
const DEFAULT_ASSETS = [
  { sym: "SPX",    name: "S&P 500",           price: 5862.34,  pct: 0.42,  seed: 11, base: 5500,  cat: "Índices" },
  { sym: "NDX",    name: "NASDAQ 100",        price: 20984.12, pct: 0.78,  seed: 17, base: 19000, cat: "Índices" },
  { sym: "BTC",    name: "Bitcoin",           price: 71284.55, pct: -1.23, seed: 23, base: 65000, cat: "Cripto"  },
  { sym: "ETH",    name: "Ethereum",          price: 3724.10,  pct: 0.55,  seed: 31, base: 3500,  cat: "Cripto"  },
  { sym: "AAPL",   name: "Apple Inc.",        price: 224.18,   pct: 1.12,  seed: 37, base: 210,   cat: "Tech"    },
  { sym: "NVDA",   name: "Nvidia",            price: 138.62,   pct: 2.34,  seed: 41, base: 110,   cat: "Tech"    },
  { sym: "TSLA",   name: "Tesla",             price: 248.94,   pct: -0.87, seed: 43, base: 260,   cat: "Tech"    },
  { sym: "MSFT",   name: "Microsoft",         price: 432.51,   pct: 0.34,  seed: 47, base: 410,   cat: "Tech"    },
  { sym: "AMD",    name: "AMD",               price: 168.40,   pct: 1.83,  seed: 61, base: 150,   cat: "Tech"    },
  { sym: "MU",     name: "Micron Technology", price: 112.55,   pct: 2.18,  seed: 67, base: 95,    cat: "Tech"    },
  { sym: "SNDK",   name: "SanDisk",           price: 64.20,    pct: -0.42, seed: 71, base: 60,    cat: "Tech"    },
  { sym: "LITE",   name: "Lumentum",          price: 78.30,    pct: 1.55,  seed: 73, base: 70,    cat: "Tech"    },
  { sym: "TSM",    name: "TSMC",              price: 198.45,   pct: 1.92,  seed: 79, base: 180,   cat: "Tech"    },
  { sym: "USAR",   name: "USA Rare Earth",    price: 14.80,    pct: 3.42,  seed: 83, base: 12,    cat: "Materias" },
  { sym: "MRVL",   name: "Marvell Tech.",     price: 82.10,    pct: 0.95,  seed: 89, base: 75,    cat: "Tech"    },
  { sym: "AXTI",   name: "AXT Inc.",          price: 2.34,     pct: -1.20, seed: 97, base: 2.5,   cat: "Tech"    },
  { sym: "GLD",    name: "Gold",              price: 2658.40,  pct: 0.18,  seed: 53, base: 2500,  cat: "Materias" },
  { sym: "EURUSD", name: "EUR / USD",         price: 1.0824,   pct: -0.05, seed: 59, base: 1.08,  cat: "Divisas" },
];

// gain by range — deterministic pseudo
function gainFor(asset, range) {
  const r = seeded(asset.seed + range.charCodeAt(0) * 17);
  const map = { "1D": [-2, 2], "1W": [-5, 5], "1M": [-12, 12], "1Y": [-35, 60], "ALL": [-50, 200] };
  const [lo, hi] = map[range] || [-5, 5];
  return lo + r() * (hi - lo);
}

const RANGES = ["1D", "1W", "1M", "1Y", "ALL"];

// ─── persistence hook ─────────────────────────────────────────────────
function usePersisted(key, initial) {
  const [v, setV] = React.useState(() => {
    try { const s = localStorage.getItem(key); if (s != null) return JSON.parse(s); } catch {}
    return initial;
  });
  React.useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

function fmt(p) {
  return p >= 100 ? p.toLocaleString("en-US", { maximumFractionDigits: 2 }) : p.toFixed(4);
}

// ─── Mini sparkline ───────────────────────────────────────────────────
function MiniSpark({ data, w = 80, h = 22, color }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg className="mini-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color || "currentColor"} strokeWidth="1.2"/>
    </svg>
  );
}

// ─── KPIs ─────────────────────────────────────────────────────────────
function KPI({ a }) {
  const series = React.useMemo(() => buildSeries(a.seed, 30, a.base), [a.seed]);
  return (
    <div className="kpi">
      <div className="nm">{a.name}</div>
      <div className="v mono">{fmt(a.price)}</div>
      <div className={`d ${a.pct >= 0 ? "pos" : "neg"}`}>
        {a.pct >= 0 ? "▲" : "▼"} {Math.abs(a.pct).toFixed(2)}% <span style={{color:"var(--fg-3)"}}>· hoy</span>
      </div>
      <div className="spark">
        <MiniSpark data={series} w={60} h={24} color={a.pct >= 0 ? "var(--pos)" : "var(--neg)"} />
      </div>
    </div>
  );
}

// ─── Big interactive chart ────────────────────────────────────────────
function BigChart({ asset, watchlistSymbols, onPickSymbol, allAssets }) {
  const [range, setRange] = React.useState("3M");
  const points = { "1D": 48, "1W": 60, "1M": 60, "3M": 90, "1Y": 180, "ALL": 240 }[range];
  const series = React.useMemo(() => buildSeries(asset.seed, points, asset.base * 0.92), [asset.seed, points]);
  const last = series[series.length - 1];
  const first = series[0];
  const delta = ((last - first) / first) * 100;

  // Trade markers: { assetSym: [{i, type: 'buy'|'sell'}] }
  const [markersAll, setMarkersAll] = usePersisted("pw_chart_markers", {});
  const markers = (markersAll[asset.sym]?.[range]) || [];
  const [tool, setTool] = React.useState("none"); // 'buy' | 'sell' | 'none'
  const [hover, setHover] = React.useState(null); // { i, x, y, v }

  const W = 1000, H = 320, P = 32;
  const min = Math.min(...series), max = Math.max(...series);
  const range_ = max - min || 1;
  const xs = (i) => P + (i / (series.length - 1)) * (W - P * 2);
  const ys = (v) => P + (1 - (v - min) / range_) * (H - P * 2);
  const path = series.map((v, i) => `${i === 0 ? "M" : "L"}${xs(i).toFixed(1)} ${ys(v).toFixed(1)}`).join(" ");
  const area = `${path} L${xs(series.length - 1)} ${H - P} L${xs(0)} ${H - P} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => min + t * range_);
  const xTickCount = 6;
  const isPos = delta >= 0;
  const todayPos = asset.pct >= 0;
  const stroke = todayPos ? "var(--pos)" : "var(--neg)";

  // build buy/sell zone bands between consecutive markers
  const sorted = [...markers].sort((a, b) => a.i - b.i);
  const zones = [];
  for (let k = 0; k < sorted.length - 1; k++) {
    const a = sorted[k], b = sorted[k + 1];
    if (a.type === "buy" && b.type === "sell") zones.push({ from: a.i, to: b.i, type: "win" });
    else if (a.type === "sell" && b.type === "buy") zones.push({ from: a.i, to: b.i, type: "short" });
  }

  function onChartClick(e) {
    if (tool === "none") return;
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    if (x < P || x > W - P) return;
    const i = Math.round(((x - P) / (W - P * 2)) * (series.length - 1));
    const cur = markersAll[asset.sym] || {};
    const list = cur[range] || [];
    setMarkersAll({
      ...markersAll,
      [asset.sym]: { ...cur, [range]: [...list, { i, type: tool }] },
    });
  }

  function onChartMove(e) {
    const svg = e.currentTarget;
    const r = svg.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    if (x < P || x > W - P) { setHover(null); return; }
    const i = Math.round(((x - P) / (W - P * 2)) * (series.length - 1));
    const v = series[i];
    setHover({ i, x: xs(i), y: ys(v), v });
  }

  function clearMarkers() {
    if (tool === "none") return;
    const cur = markersAll[asset.sym] || {};
    const list = cur[range] || [];
    setMarkersAll({
      ...markersAll,
      [asset.sym]: { ...cur, [range]: list.filter(m => m.type !== tool) },
    });
  }

  const watched = allAssets.filter(a => watchlistSymbols.includes(a.sym));

  return (
    <div className="chart-wrap">
      <div className="chart-head">
        <div className="chart-title">
          <span className="sym">{asset.sym}</span>
          <span className="nm">{asset.name}</span>
        </div>
        <div>
          <span className="chart-price">{fmt(last)}</span>
          <span className={`chart-delta ${isPos ? "pos" : "neg"}`}>
            {isPos ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}%
          </span>
        </div>
        <div className="chart-tools">
          <button className={`tool buy ${tool === "buy" ? "on" : ""}`} onClick={() => setTool(t => t === "buy" ? "none" : "buy")} title="Marcar compra">
            <span className="dot pos"/> Compra
          </button>
          <button className={`tool sell ${tool === "sell" ? "on" : ""}`} onClick={() => setTool(t => t === "sell" ? "none" : "sell")} title="Marcar venta">
            <span className="dot neg"/> Venta
          </button>
          <button className="tool" onClick={clearMarkers} disabled={tool === "none" || !markers.some(m => m.type === tool)} title={tool === "none" ? "Selecciona Compra o Venta primero" : `Limpiar ${tool === "buy" ? "compras" : "ventas"}`}>
            Limpiar {tool === "buy" ? "compras" : tool === "sell" ? "ventas" : ""}
          </button>
        </div>
        <div className="chart-tabs">
          {["1D","1W","1M","3M","1Y","ALL"].map(r => (
            <button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>
      <div className={`chart-body ${tool !== "none" ? "marking" : ""}`}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" onClick={onChartClick} onMouseMove={onChartMove} onMouseLeave={() => setHover(null)}>
          <defs>
            <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.18"/>
              <stop offset="100%" stopColor={stroke} stopOpacity="0"/>
            </linearGradient>
          </defs>
          {/* zones (buy→sell green, sell→buy red) */}
          {zones.map((z, k) => (
            <rect
              key={k}
              x={xs(z.from)} y={P}
              width={xs(z.to) - xs(z.from)} height={H - P * 2}
              fill={z.type === "win" ? "var(--pos)" : "var(--neg)"}
              opacity="0.08"
            />
          ))}
          {/* grid */}
          {yTicks.map((v, i) => (
            <g key={i}>
              <line x1={P} x2={W - P} y1={ys(v)} y2={ys(v)} stroke="var(--line)" strokeWidth="1"/>
              <text x={W - P + 6} y={ys(v) + 3} fill="var(--fg-3)" fontSize="10" fontFamily="var(--font-mono)">
                {v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(2)}
              </text>
            </g>
          ))}
          {Array.from({length: xTickCount + 1}).map((_, i) => {
            const x = P + (i / xTickCount) * (W - P * 2);
            return <line key={i} x1={x} x2={x} y1={P} y2={H - P} stroke="var(--line)" strokeWidth="1"/>;
          })}
          <path d={area} fill="url(#grad)"/>
          <path d={path} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round"/>
          <circle cx={xs(series.length - 1)} cy={ys(last)} r="3" fill={stroke}/>

          {/* hover crosshair */}
          {hover && (
            <g style={{ pointerEvents: "none" }}>
              <line x1={hover.x} x2={hover.x} y1={P} y2={H - P} stroke="var(--fg-2)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6"/>
              <circle cx={hover.x} cy={hover.y} r="4" fill="var(--bg-0)" stroke={stroke} strokeWidth="1.5"/>
              {(() => {
                const label = hover.v >= 100 ? Math.round(hover.v).toLocaleString() : hover.v.toFixed(2);
                const tw = Math.max(54, label.length * 8 + 16);
                const th = 22;
                let tx = hover.x + 10;
                if (tx + tw > W - P) tx = hover.x - tw - 10;
                const ty = Math.max(P + 4, Math.min(hover.y - th / 2, H - P - th - 4));
                return (
                  <g>
                    <rect x={tx} y={ty} width={tw} height={th} rx="4" fill="var(--bg-0)" stroke={stroke} strokeWidth="1"/>
                    <text x={tx + tw / 2} y={ty + th / 2 + 4} textAnchor="middle" fill="var(--fg-0)" fontSize="11" fontFamily="var(--font-mono)" fontWeight="600">
                      {label}
                    </text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* trade markers */}
          {markers.map((m, k) => {
            const x = xs(m.i);
            const y = ys(series[m.i]);
            const col = m.type === "buy" ? "var(--pos)" : "var(--neg)";
            return (
              <g key={k}>
                <line x1={x} x2={x} y1={P} y2={H - P} stroke={col} strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5"/>
                <circle cx={x} cy={y} r="5" fill="var(--bg-0)" stroke={col} strokeWidth="1.5"/>
                <text x={x} y={y + 3} fontSize="8" fontWeight="700" textAnchor="middle" fill={col} fontFamily="var(--font-mono)">
                  {m.type === "buy" ? "B" : "S"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {tool !== "none" && (
        <div className="chart-hint">
          Modo {tool === "buy" ? "Compra" : "Venta"} — haz clic en el gráfico para marcar. <a onClick={() => setTool("none")}>Salir</a>
        </div>
      )}
    </div>
  );
}

// ─── Watchlist con rangos ─────────────────────────────────────────────
const WATCH_FILTERS = ["★ Favoritos", "Todas", "Tech", "Cripto", "Índices", "Materias", "Divisas"];

function Watchlist({ assets, setAssets, watchlistSymbols, setWatchlistSymbols, selected, onSelect }) {
  const [range, setRange] = React.useState("1D");
  const [filter, setFilter] = React.useState("★ Favoritos");
  const [adding, setAdding] = React.useState(false);
  const [newSym, setNewSym] = React.useState("");
  const [newName, setNewName] = React.useState("");

  const visibleAssets = assets.filter(a => {
    if (filter === "Todas") return true;
    if (filter === "★ Favoritos") return watchlistSymbols.includes(a.sym);
    return a.cat === filter;
  });

  function toggleStar(sym) {
    setWatchlistSymbols(s => s.includes(sym) ? s.filter(x => x !== sym) : [...s, sym]);
  }
  function removeAsset(sym) {
    setAssets(a => a.filter(x => x.sym !== sym));
    setWatchlistSymbols(s => s.filter(x => x !== sym));
  }
  function commitAdd() {
    const sym = newSym.trim().toUpperCase();
    const name = newName.trim() || sym;
    if (!sym || assets.find(a => a.sym === sym)) return;
    const seed = (sym.charCodeAt(0) + (sym.charCodeAt(1) || 0)) * 13;
    const r = seeded(seed);
    const base = 50 + r() * 400;
    const pct = (r() - 0.5) * 6;
    setAssets(a => [...a, { sym, name, price: base, pct, seed, base }]);
    setWatchlistSymbols(s => [...s, sym]);
    setNewSym(""); setNewName(""); setAdding(false);
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="card-head" style={{ padding: "var(--pad) var(--pad) 8px", flexWrap: "wrap", gap: 8 }}>
        <div className="card-title"><span className="dot"/> Watchlist</div>
        <div className="watch-ranges">
          {RANGES.map(r => (
            <button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
        <button className="btn" onClick={() => setAdding(true)} style={{ marginLeft: "auto" }}><IconPlus/> Añadir</button>
      </div>

      <div className="watch-filters">
        {WATCH_FILTERS.map(f => (
          <button
            key={f}
            className={filter === f ? "on" : ""}
            onClick={() => setFilter(f)}
          >{f}</button>
        ))}
      </div>

      {adding && (
        <div className="watch-add">
          <input
            autoFocus
            placeholder="Ticker (AAPL)"
            value={newSym}
            onChange={(e) => setNewSym(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); if (e.key === "Escape") setAdding(false); }}
            style={{ width: 90 }}
          />
          <input
            placeholder="Nombre (Apple Inc.)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); }}
          />
          <button className="btn solid" onClick={commitAdd} disabled={!newSym.trim()}>Añadir</button>
          <button className="btn" onClick={() => setAdding(false)}>Cancelar</button>
        </div>
      )}

      <table className="watch-table">
        <thead>
          <tr>
            <th style={{ width: 24 }}></th>
            <th>Activo</th>
            <th style={{ textAlign: "right" }}>Precio</th>
            <th style={{ textAlign: "right" }}>{range}</th>
            <th style={{ width: 90 }}>Gráfico</th>
            <th style={{ width: 30 }}></th>
          </tr>
        </thead>
        <tbody>
          {visibleAssets.length === 0 && (
            <tr><td colSpan={6} style={{ padding: "20px var(--pad)", color: "var(--fg-3)", fontSize: 12, textAlign: "center" }}>
              No hay activos en este filtro.
            </td></tr>
          )}
          {visibleAssets.map(a => {
            const points = { "1D": 24, "1W": 30, "1M": 30, "1Y": 60, "ALL": 90 }[range];
            const series = buildSeries(a.seed + range.charCodeAt(0), points, a.base);
            const g = gainFor(a, range);
            const starred = watchlistSymbols.includes(a.sym);
            return (
              <tr key={a.sym} className={selected.sym === a.sym ? "sel" : ""} onClick={() => onSelect(a)}>
                <td>
                  <span
                    className={`star ${starred ? "on" : ""}`}
                    onClick={(e) => { e.stopPropagation(); toggleStar(a.sym); }}
                  ><IconStar size={13}/></span>
                </td>
                <td>
                  <div className="sym">{a.sym}</div>
                  <div className="name-sub">{a.name}</div>
                </td>
                <td className="num" style={{ textAlign: "right" }}>{fmt(a.price)}</td>
                <td className={`num ${g >= 0 ? "pos" : "neg"}`} style={{ textAlign: "right" }}>
                  {g >= 0 ? "+" : ""}{g.toFixed(2)}%
                </td>
                <td>
                  <MiniSpark data={series} w={80} h={22} color={g >= 0 ? "var(--pos)" : "var(--neg)"}/>
                </td>
                <td>
                  <button
                    className="row-del"
                    onClick={(e) => { e.stopPropagation(); removeAsset(a.sym); }}
                    title="Quitar"
                  >×</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Top movers (subidas/bajadas + probabilidad) ──────────────────────
function TopMovers({ assets }) {
  const [tab, setTab] = React.useState("up");
  const sorted = [...assets].sort((a, b) => tab === "up" ? b.pct - a.pct : a.pct - b.pct).slice(0, 5);

  function probability(pct, mode) {
    // pseudo: stronger move + tab alignment → higher probability
    const aligned = (mode === "up" && pct > 0) || (mode === "down" && pct < 0);
    const base = aligned ? 55 : 35;
    return Math.min(92, Math.max(8, Math.round(base + Math.abs(pct) * 4)));
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title"><span className="dot"/> Top movers</div>
        <div className="movers-tabs">
          <button className={tab === "up" ? "on" : ""} onClick={() => setTab("up")}>Suben</button>
          <button className={tab === "down" ? "on" : ""} onClick={() => setTab("down")}>Bajan</button>
        </div>
      </div>
      <div className="movers-list">
        {sorted.map(a => {
          const p = probability(a.pct, tab);
          return (
            <div key={a.sym} className="mover-row">
              <div className="mover-sym">
                <div className="sym">{a.sym}</div>
                <div className="nm">{a.name}</div>
              </div>
              <div className={`mover-pct mono ${a.pct >= 0 ? "pos" : "neg"}`}>
                {a.pct >= 0 ? "+" : ""}{a.pct.toFixed(2)}%
              </div>
              <div className="mover-prob">
                <div className="prob-label">
                  <span>Prob. {tab === "up" ? "subir" : "bajar"}</span>
                  <span className="mono">{p}%</span>
                </div>
                <div className="prob-bar">
                  <div className="fill" style={{ width: `${p}%`, background: tab === "up" ? "var(--pos)" : "var(--neg)" }}/>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Noticias ─────────────────────────────────────────────────────────
const NEWS = [
  {
    time: "08:42",
    title: "La Fed mantiene tipos pero abre la puerta a recortes en septiembre.",
    summary: "Powell confirma que la inflación se acerca al objetivo del 2% y que los próximos datos de empleo serán determinantes. Los futuros descuentan ya dos bajadas antes de fin de año.",
    src: "Reuters", tag: "Macro", sym: "SPX",
  },
  {
    time: "07:15",
    title: "Nvidia presenta su nueva arquitectura Rubin para data centers.",
    summary: "La compañía adelanta a 2026 el lanzamiento de Rubin, sucesora de Blackwell, con un salto del 3× en rendimiento por vatio. Hyperscalers ya han reservado capacidad para todo el primer año.",
    src: "Bloomberg", tag: "Tech", sym: "NVDA",
  },
  {
    time: "06:30",
    title: "Bitcoin recupera los $71k tras tres sesiones a la baja.",
    summary: "Entradas netas en ETFs spot por $312M devuelven el optimismo al mercado. Analistas apuntan al rango $73k–$75k como próxima resistencia técnica.",
    src: "CoinDesk", tag: "Crypto", sym: "BTC",
  },
  {
    time: "Ayer",
    title: "Apple supera previsiones en servicios pero cae en hardware.",
    summary: "Ingresos por servicios crecen un 14% interanual hasta los $26.3B, pero las ventas de iPhone en China decepcionan con un -8%. La acción cae un 2% en el after-hours.",
    src: "FT", tag: "Earnings", sym: "AAPL",
  },
  {
    time: "Ayer",
    title: "Tesla retrasa la entrega del Cybercab al primer trimestre.",
    summary: "Musk justifica el retraso por afinamientos en el software FSD v13. La producción piloto se mantiene en Giga Texas con un objetivo inicial de 5.000 unidades/mes.",
    src: "Wired", tag: "Auto", sym: "TSLA",
  },
  {
    time: "Ayer",
    title: "El Banco de España revisa al alza el crecimiento para 2026.",
    summary: "Eleva la previsión del PIB del 1.9% al 2.3% gracias al consumo interno y el tirón del turismo. Mantiene el escenario de desaceleración suave para la zona euro.",
    src: "Cinco Días", tag: "Macro", sym: "SPX",
  },
];

function News() {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title"><span className="dot"/> Noticias financieras</div>
        <button className="btn">Ver todas <IconArrow/></button>
      </div>
      <div>
        {NEWS.map((n, i) => (
          <div key={i} className="news-row">
            <div className="news-time">{n.time}</div>
            <div>
              <div className="news-title">
                {n.sym && <span className="news-sym mono">{n.sym}</span>}
                {n.title}
              </div>
              {n.summary && <div className="news-summary">{n.summary}</div>}
              <div className="news-src">{n.src}</div>
            </div>
            <div className="news-tag">{n.tag}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Eventos corporativos ─────────────────────────────────────────────
const EVENTS_LIBRARY = [
  { sym: "NVDA", date: "28 May", kind: "Earnings",  label: "Resultados Q1 FY27", impact: "high" },
  { sym: "AAPL", date: "01 Jun", kind: "Dividend",  label: "Pago dividendo $0.25", impact: "low" },
  { sym: "TSLA", date: "06 Jun", kind: "Investor",  label: "Día del inversor", impact: "med" },
  { sym: "MSFT", date: "11 Jun", kind: "Earnings",  label: "Pre-earnings call",  impact: "med" },
  { sym: "BTC",  date: "15 Jun", kind: "Macro",     label: "Decisión Fed",       impact: "high" },
  { sym: "NVDA", date: "20 Jun", kind: "Conference",label: "GTC Europa",         impact: "med" },
  { sym: "ETH",  date: "24 Jun", kind: "Network",   label: "Hard fork Pectra",   impact: "high" },
];

function CorporateEvents({ watchlistSymbols }) {
  const list = EVENTS_LIBRARY.filter(e => watchlistSymbols.includes(e.sym));
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title"><span className="dot"/> Eventos corporativos</div>
        <div className="card-meta mono">{list.length} próximos</div>
      </div>
      {list.length === 0 ? (
        <div className="ev-empty">Marca activos con ★ en la watchlist para ver sus eventos.</div>
      ) : (
        <div className="ev-list">
          <div className="ev-head-row">
            <span>Fecha</span>
            <span>Empresa</span>
            <span>Tipo</span>
            <span>Descripción</span>
            <span style={{ textAlign: "right" }}>Impacto</span>
          </div>
          {list.map((e, i) => (
            <div key={i} className="ev-row">
              <div className="ev-date mono">{e.date}</div>
              <div className="ev-sym mono">{e.sym}</div>
              <div className="ev-kind">{e.kind}</div>
              <div className="ev-label">{e.label}</div>
              <div className={`ev-impact ${e.impact}`}>{e.impact === "high" ? "Alto" : e.impact === "med" ? "Medio" : "Bajo"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Mercados page ────────────────────────────────────────────────────
function InvestmentsPage() {
  const [assets, setAssets] = usePersisted("pw_assets_v2", DEFAULT_ASSETS);
  const [watchlistSymbols, setWatchlistSymbols] = usePersisted("pw_watchlist_v2", ["AAPL", "NVDA", "AMD", "MU", "TSM", "TSLA"]);
  const [selectedSym, setSelectedSym] = usePersisted("pw_selected", "SPX");
  const selected = assets.find(a => a.sym === selectedSym) || assets[0];

  function pickAsset(a) { setSelectedSym(a.sym); }
  function pickSymbol(sym) { setSelectedSym(sym); }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mercados</h1>
          <p className="lede">Gráfico interactivo, watchlist personal y movimientos del día.</p>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr", gap: "var(--gap)" }}>
        <BigChart
          asset={selected}
          watchlistSymbols={watchlistSymbols}
          onPickSymbol={pickSymbol}
          allAssets={assets}
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--gap)", marginTop: "var(--gap)" }}>
        <Watchlist
          assets={assets}
          setAssets={setAssets}
          watchlistSymbols={watchlistSymbols}
          setWatchlistSymbols={setWatchlistSymbols}
          selected={selected}
          onSelect={pickAsset}
        />
        <News/>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--gap)", marginTop: "var(--gap)" }}>
        <CorporateEvents watchlistSymbols={watchlistSymbols}/>
        <TopMovers assets={assets}/>
      </div>
    </>
  );
}

window.InvestmentsPage = InvestmentsPage;
