// hub.jsx — entry hub: 3 big buttons after login

function Hub({ username, onPick, onLogout }) {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return "Buena madrugada";
    if (h < 13) return "Buenos días";
    if (h < 20) return "Buenas tardes";
    return "Buenas noches";
  })();

  const now = new Date();
  const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  // Pseudo-random but stable temperature for the day (seed by date)
  const weather = React.useMemo(() => {
    const seed = now.getDate() * 31 + now.getMonth() * 7;
    const hour = now.getHours();
    const month = now.getMonth();
    // Barcelona base temp by month
    const base = [10, 11, 13, 15, 18, 22, 25, 26, 23, 19, 14, 11][month];
    // Diurnal swing: cooler at night, warmer 14-17h
    const diurnal = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 4;
    const noise = ((seed * 9301 + 49297) % 233280) / 233280;
    const temp = Math.round(base + diurnal + (noise - 0.5) * 3);
    const conds = [
      { ic: "☀", lbl: "Soleado" },
      { ic: "⛅", lbl: "Parcial" },
      { ic: "☁", lbl: "Nublado" },
      { ic: "🌧", lbl: "Lluvia" },
    ];
    const cidx = Math.floor(noise * conds.length);
    return { temp, ...conds[cidx] };
  }, []);

  const cards = [
    {
      id: "personal",
      num: "01",
      title: "Personal",
      icon: <IconHome size={18}/>,
      desc: "Tu día a día. Calendario, notas, bookmarks y accesos rápidos en un solo sitio.",
      chips: ["Calendario", "Notas", "Bookmarks", "Quick links"],
    },
    {
      id: "invest",
      num: "02",
      title: "Mercados",
      icon: <IconChart size={18}/>,
      desc: "Resumen de índices, gráficos, watchlist personal y noticias financieras del día.",
      chips: ["S&P 500", "NASDAQ", "Bitcoin", "Watchlist"],
    },
    {
      id: "cine",
      num: "03",
      title: "Cine",
      icon: <IconFilm size={18}/>,
      desc: "Tus pelis, series y anime. Favoritas, plataformas y enlaces directos para verlas.",
      chips: ["Pelis", "Series", "Anime", "Plataformas"],
    },
    {
      id: "watch",
      num: "04",
      title: "Ver ahora",
      icon: <IconPlay size={18}/>,
      desc: "Busca un título y reprodúcelo al momento pegando su enlace embed.",
      chips: ["Buscador", "Reproductor", "IMDb"],
    },
  ];

  return (
    <div className="hub-root" data-screen-label="Hub">
      <header className="hub-top">
        <div className="brand-line">
          <div className="mark">P</div>
          <span>Personal Workspace</span>
        </div>
        <div className="meta">
          <div>Usuario<b>{username}</b></div>
          <div>Fecha<b style={{ textTransform: "capitalize" }}>{date}</b></div>
          <div>Hora<b className="mono">{time}</b></div>
          <div>Barcelona<b className="mono"><span style={{ marginRight: 4, fontSize: "0.95em" }}>{weather.ic}</span>{weather.temp}°</b></div>
          <button className="icon-btn" onClick={onLogout} title="Cerrar sesión"><IconLogout/></button>
        </div>
      </header>

      <div className="hub-body">
        <div className="hub-inner">
          <div className="hub-greet">
            <div className="eyebrow">— Selecciona un espacio</div>
            <h1>{greeting}, {username}.</h1>
            <p>¿Qué quieres hacer hoy? Elige uno de tus espacios para empezar.</p>
          </div>

          <div className="hub-grid">
            {cards.map(c => (
              <button key={c.id} className="hub-card" onClick={() => onPick(c.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="glyph">{c.icon}</div>
                  <div className="num">{c.num}</div>
                </div>
                <div>
                  <h3>{c.title}</h3>
                  <p className="desc">{c.desc}</p>
                </div>
                <div className="preview">
                  {c.chips.map(ch => <span key={ch} className="chip">{ch}</span>)}
                </div>
                <div className="arr">
                  Abrir espacio <IconArrow/>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <footer className="hub-foot">
        <span>v1.0.0 · build 2026.05</span>
        <span><a onClick={onLogout}>Cerrar sesión</a></span>
      </footer>
    </div>
  );
}

window.Hub = Hub;
