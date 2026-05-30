// watch.jsx — "Ver ahora": buscador de películas/series con enlaces directos a plataformas

// Reutiliza PLATFORM_MAP y helpers de cine.jsx (posterStyle, posterInitials, cineHash)
// que están en el scope global del bundle Babel.

// ─── Catálogo (dónde ver cada título) ────────────────────────────────
// availability: lista de plataformas donde está disponible
const WATCH_CATALOG = [
  { title: "Dune: Parte Dos",        year: 2024, type: "movie",  genre: "Ciencia ficción · Aventura", on: ["hbo", "prime"], imdb: "tt15239678" },
  { title: "Oppenheimer",            year: 2023, type: "movie",  genre: "Drama · Historia",           on: ["prime", "hbo"], imdb: "tt15398776" },
  { title: "Pobres criaturas",       year: 2023, type: "movie",  genre: "Comedia · Fantasía",         on: ["disney", "hbo"], imdb: "tt14230458" },
  { title: "The Batman",             year: 2022, type: "movie",  genre: "Acción · Crimen",            on: ["hbo"], imdb: "tt1877830" },
  { title: "Top Gun: Maverick",      year: 2022, type: "movie",  genre: "Acción",                     on: ["prime", "netflix"], imdb: "tt1745960" },
  { title: "Interstellar",           year: 2014, type: "movie",  genre: "Ciencia ficción",            on: ["prime", "netflix"], imdb: "tt0816692" },
  { title: "El Padrino",             year: 1972, type: "movie",  genre: "Crimen · Drama",             on: ["prime"], imdb: "tt0068646" },
  { title: "Parásitos",              year: 2019, type: "movie",  genre: "Thriller · Drama",           on: ["filmin", "prime"], imdb: "tt6751668" },
  { title: "Todo a la vez en todas partes", year: 2022, type: "movie", genre: "Ciencia ficción · Comedia", on: ["prime"], imdb: "tt6710474" },
  { title: "Spider-Man: Cruzando el multiverso", year: 2023, type: "movie", genre: "Animación · Acción", on: ["netflix", "prime"], imdb: "tt9362722" },
  { title: "John Wick 4",            year: 2023, type: "movie",  genre: "Acción · Thriller",          on: ["prime"], imdb: "tt10366206" },
  { title: "Barbie",                 year: 2023, type: "movie",  genre: "Comedia · Fantasía",         on: ["hbo"], imdb: "tt1517268" },
  { title: "Gladiator II",           year: 2024, type: "movie",  genre: "Acción · Historia",          on: ["prime"], imdb: "tt9218128" },
  { title: "Anatomía de una caída",  year: 2023, type: "movie",  genre: "Drama · Thriller",           on: ["filmin"], imdb: "tt17009710" },
  { title: "La sociedad de la nieve", year: 2023, type: "movie", genre: "Drama · Supervivencia",      on: ["netflix"], imdb: "tt16277242" },
  { title: "Star Wars: Episodio I",  year: 1999, type: "movie",  genre: "Ciencia ficción · Aventura", on: ["disney"], imdb: "tt0120915", alt: ["The Phantom Menace", "La amenaza fantasma"] },
  { title: "El diablo se viste de Prada", year: 2006, type: "movie", genre: "Comedia · Drama",        on: ["disney", "prime"], imdb: "tt0458352", alt: ["The Devil Wears Prada"] },
  { title: "El club de la lucha",    year: 1999, type: "movie",  genre: "Drama · Thriller",           on: ["prime"], imdb: "tt0137523", alt: ["Fight Club"] },
  { title: "Origen",                 year: 2010, type: "movie",  genre: "Ciencia ficción · Thriller", on: ["netflix", "prime"], imdb: "tt1375666", alt: ["Inception"] },
  { title: "El caballero oscuro",    year: 2008, type: "movie",  genre: "Acción · Crimen",            on: ["hbo", "prime"], imdb: "tt0468569", alt: ["The Dark Knight"] },

  { title: "The Last of Us",         year: 2023, type: "series", genre: "Drama · Post-apocalíptico",  on: ["hbo"], imdb: "tt3581920" },
  { title: "Severance",              year: 2022, type: "series", genre: "Ciencia ficción · Misterio", on: ["prime"], imdb: "tt11280740" },
  { title: "Succession",             year: 2018, type: "series", genre: "Drama",                      on: ["hbo"], imdb: "tt7660850" },
  { title: "Stranger Things",        year: 2016, type: "series", genre: "Ciencia ficción · Terror",   on: ["netflix"], imdb: "tt4574334" },
  { title: "The Bear",               year: 2022, type: "series", genre: "Drama · Comedia",            on: ["disney"], imdb: "tt14452776" },
  { title: "Fallout",                year: 2024, type: "series", genre: "Ciencia ficción · Acción",   on: ["prime"], imdb: "tt12637874" },
  { title: "House of the Dragon",    year: 2022, type: "series", genre: "Fantasía · Drama",           on: ["hbo"], imdb: "tt11198330" },
  { title: "The Mandalorian",        year: 2019, type: "series", genre: "Ciencia ficción · Aventura", on: ["disney"], imdb: "tt8111088" },
  { title: "Andor",                  year: 2022, type: "series", genre: "Ciencia ficción · Drama",    on: ["disney"], imdb: "tt9253284" },
  { title: "Reacher",                year: 2022, type: "series", genre: "Acción · Crimen",            on: ["prime"], imdb: "tt9288030" },

  { title: "Frieren",                year: 2023, type: "anime",  genre: "Fantasía · Aventura",        on: ["netflix"], imdb: "tt22248376" },
  { title: "Jujutsu Kaisen",         year: 2020, type: "anime",  genre: "Acción · Sobrenatural",      on: ["netflix", "animeyt"], imdb: "tt12343534" },
  { title: "Chainsaw Man",           year: 2022, type: "anime",  genre: "Acción · Terror",            on: ["prime", "animeyt"], imdb: "tt13616990" },
  { title: "Spy x Family",           year: 2022, type: "anime",  genre: "Comedia · Acción",           on: ["netflix", "animeyt"], imdb: "tt13706018" },
  { title: "Attack on Titan",        year: 2013, type: "anime",  genre: "Acción · Drama",             on: ["prime", "animeyt"], imdb: "tt2560140" },
  { title: "Demon Slayer",           year: 2019, type: "anime",  genre: "Acción · Fantasía",          on: ["netflix", "animeyt"], imdb: "tt9335498" },
  { title: "One Piece",              year: 1999, type: "anime",  genre: "Aventura · Shōnen",          on: ["netflix", "animeyt"], imdb: "tt0388629" },
  { title: "Vinland Saga",           year: 2019, type: "anime",  genre: "Acción · Drama histórico",   on: ["netflix", "animeyt"], imdb: "tt9335498" },
  { title: "Solo Leveling",          year: 2024, type: "anime",  genre: "Acción · Fantasía",          on: ["prime", "animeyt"], imdb: "tt21209876" },
];

// enlace embed reproducible a partir del id de IMDb
function embedFor(item) {
  const kind = item.type === "movie" ? "movie" : "tv";
  return `https://streamimdb.ru/embed/${kind}/${item.imdb}`;
}
function imdbTitleUrl(item) {
  return `https://www.imdb.com/es-es/title/${item.imdb}/`;
}

// URLs de búsqueda por plataforma (si q está vacío → home de la plataforma)
const SEARCH_URLS = {
  imdb:    (q) => q ? `https://www.imdb.com/es-es/find/?q=${encodeURIComponent(q)}` : `https://www.imdb.com/es-es/`,
  netflix: (q) => q ? `https://www.netflix.com/search?q=${encodeURIComponent(q)}` : `https://www.netflix.com/`,
  prime:   (q) => q ? `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(q)}` : `https://www.primevideo.com/`,
  hbo:     (q) => q ? `https://play.max.com/search?q=${encodeURIComponent(q)}` : `https://play.max.com/`,
  disney:  (q) => q ? `https://www.disneyplus.com/es-es/search?q=${encodeURIComponent(q)}` : `https://www.disneyplus.com/es-es`,
  youtube: (q) => q ? `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` : `https://www.youtube.com/`,
  filmin:  (q) => q ? `https://www.filmin.es/buscar?query=${encodeURIComponent(q)}` : `https://www.filmin.es/`,  animeyt: (q) => q ? `https://www3.animeflv.net/browse?q=${encodeURIComponent(q)}` : `https://www3.animeflv.net/`,
  google:  (q) => `https://www.google.com/search?q=${encodeURIComponent((q || "") + " ver online")}`,
};
function searchUrl(pid, q) { return (SEARCH_URLS[pid] || SEARCH_URLS.google)((q || "").trim()); }

const PLATFORM_HOME = {
  imdb:    "https://www.imdb.com/es-es/",
  netflix: "https://www.netflix.com/",
  prime:   "https://www.primevideo.com/",
  hbo:     "https://play.max.com/",
  disney:  "https://www.disneyplus.com/es-es",
  youtube: "https://www.youtube.com/",
};

const WATCH_PLATFORMS = ["imdb", "netflix", "prime", "hbo", "disney", "youtube"];
const WATCH_PF_MAP = { imdb: { name: "IMDb", glyph: "Im", color: "#f5c518" }, ...PLATFORM_MAP };

// ─── Result card ─────────────────────────────────────────────────────
function WatchCard({ item }) {
  return (
    <div className="watch-card">
      <div className="watch-poster" style={posterStyle(item)}>
        <span className="wp-type">{item.type === "movie" ? "Peli" : item.type === "series" ? "Serie" : "Anime"}</span>
        <span className="wp-mark">{posterInitials(item.title)}</span>
      </div>
      <div className="watch-info">
        <div className="watch-title">{item.title}</div>
        <div className="watch-meta mono">{item.year} · {item.genre}</div>
        <div className="watch-on">
          <span className="watch-on-label">Disponible en</span>
          <div className="watch-on-pills">
            {item.on.map(pid => {
              const p = PLATFORM_MAP[pid];
              if (!p) return null;
              return (
                <a
                  key={pid}
                  className="watch-on-pill"
                  href={searchUrl(pid, item.title)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Buscar en ${p.name}`}
                >
                  <span className="wop-glyph" style={{ background: p.color }}>{p.glyph}</span>
                  {p.name}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reproductor ─────────────────────────────────────────────────────
const PLAYER_EXAMPLE = "https://www.playimdb.com/es-es/title/tt0120915/";

function WatchNowPage({ request }) {
  const [link, setLink] = React.useState("");
  const [playing, setPlaying] = React.useState("");   // url cargada en el iframe
  const [title, setTitle] = React.useState("");
  const [imdbUrl, setImdbUrl] = React.useState("");
  const [resolving, setResolving] = React.useState(false);
  const inputRef = React.useRef(null);
  const playerRef = React.useRef(null);

  // petición de reproducción desde otra sección (ej. Cine → Ver)
  React.useEffect(() => {
    if (!request || !request.item) return;
    const it = request.item;
    let url = (it.url || "").trim();
    if (!url) return;
    // si es una ficha de IMDb, conviértela a enlace embed reproducible
    const m = url.match(/(tt\d+)/i);
    if (m) {
      url = /imdb\.com/i.test(url) ? url.replace(/imdb\.com/i, "playimdb.com") : `https://www.playimdb.com/es-es/title/${m[1]}/`;
    } else if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    setLink(url);
    setPlaying(url);
    setImdbUrl((it.url || "").trim());
    setTitle(it.title || "");
  }, [request && request.ts]);

  function playFromImdb() {
    const m = imdbUrl.match(/(tt\d+)/i);
    if (!m) return;
    const url = /imdb\.com/i.test(imdbUrl) ? imdbUrl.replace(/imdb\.com/i, "playimdb.com") : `https://www.playimdb.com/es-es/title/${m[1]}/`;
    setLink(url);
    setPlaying(url);
  }

  function goFullscreen() {
    const el = playerRef.current;
    if (!el) return;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (req) req.call(el);
  }

  // recordar última reproducción
  React.useEffect(() => {
    try {
      const s = localStorage.getItem("pw_player");
      if (s) {
        const o = JSON.parse(s);
        setLink(o.link || "");
        setPlaying(o.playing || "");
        setTitle(o.title || "");
      }
    } catch {}
  }, []);
  React.useEffect(() => {
    try { localStorage.setItem("pw_player", JSON.stringify({ link, playing, title })); } catch {}
  }, [link, playing, title]);

  function toPlayImdb(u) {
    // convierte un enlace de IMDb en uno reproducible de playimdb (play + imdb)
    let url = (u || "").trim();
    if (/tt\d+/i.test(url) && !/playimdb/i.test(url)) {
      if (/imdb\.com/i.test(url)) return url.replace(/imdb\.com/i, "playimdb.com");
      const m = url.match(/tt\d+/i);
      if (/^tt\d+$/i.test(url)) return `https://www.playimdb.com/es-es/title/${m[0]}/`;
    }
    return url;
  }

  function normalize(u) {
    let url = (u ?? "").trim();
    if (!url) return "";
    const conv = toPlayImdb(url);
    if (conv !== url) return conv;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    return url;
  }
  function play(u) {
    const url = normalize(u ?? link);
    if (!url) return;
    setLink(url);
    setPlaying(url);
  }
  function clear() {
    setPlaying(""); setTitle("");
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Ver ahora</h1>
          <p className="lede">Pega un enlace de vídeo (embed) y reprodúcelo aquí mismo.</p>
        </div>
      </div>

      {/* Buscador de título → slide de resultados */}
      <div className="watch-hero">
        <div className="watch-imdb-search">
          <IconSearch size={16}/>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Busca el título. Ej. Star Wars, Dune, The Last of Us…"
          />
          {title && <button className="watch-clear" onClick={() => setTitle("")} title="Limpiar"><IconClose size={14}/></button>}
        </div>

        {title.trim() && (
          (() => {
            const q = title.trim().toLowerCase();
            const hits = WATCH_CATALOG.filter(it =>
              it.title.toLowerCase().includes(q) ||
              it.genre.toLowerCase().includes(q) ||
              (it.alt || []).some(a => a.toLowerCase().includes(q))
            );
            if (hits.length === 0) {
              return (
                <div className="watch-slide-empty">
                  No tengo <b>"{title}"</b> en el catálogo.
                  <a href={searchUrl("imdb", title.trim())} target="_blank" rel="noopener noreferrer">Buscar en IMDb ↗</a>
                </div>
              );
            }
            return (
              <div className="watch-slide">
                {hits.map((it, i) => (
                  <button
                    key={i}
                    className="watch-slide-card"
                    onClick={() => { setLink(embedFor(it)); setPlaying(embedFor(it)); }}
                    title={`Reproducir ${it.title}`}
                  >
                    <div className="wsc-poster" style={posterStyle(it)}>
                      <span className="wsc-type">{it.type === "movie" ? "Peli" : it.type === "series" ? "Serie" : "Anime"}</span>
                      <span className="wsc-mark">{posterInitials(it.title)}</span>
                      <span className="wsc-play"><IconPlay size={18}/></span>
                    </div>
                    <div className="wsc-title">{it.title}</div>
                    <div className="wsc-meta mono">{it.year}</div>
                  </button>
                ))}
              </div>
            );
          })()
        )}
      </div>

      {/* Barra de enlace */}
      <div className="watch-hero" style={{ marginTop: "var(--gap)" }}>
        <div className="watch-imdb-search">
          <span className="wfb-glyph" style={{ background: "#f5c518", flexShrink: 0 }}>Im</span>
          <input
            value={imdbUrl}
            onChange={(e) => setImdbUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") playFromImdb(); }}
            placeholder="Pega el enlace de IMDb. Ej. https://www.imdb.com/es-es/title/tt0120915/"
          />
          {imdbUrl && <button className="watch-clear" onClick={() => setImdbUrl("")} title="Borrar"><IconClose size={14}/></button>}
          <button className="watch-play-btn" onClick={playFromImdb} disabled={!imdbUrl.trim()}>
            <IconPlay size={13}/> Reproducir
          </button>
        </div>
        <div className="watch-searchbar">
          <IconPlay size={18}/>
          <input
            ref={inputRef}
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") play(); }}
            placeholder="Pega el enlace embed. Ej. https://streamimdb.ru/embed/movie/tt0120915"
          />
          {link && <button className="watch-clear" onClick={() => setLink("")} title="Borrar"><IconClose size={14}/></button>}
          <button className="watch-play-btn" onClick={() => play()} disabled={!link.trim()}>
            <IconPlay size={13}/> Reproducir
          </button>
        </div>
        <div className="watch-hint-row">
          <span>¿No tienes enlace?</span>
          <button className="watch-example" onClick={() => { setLink(PLAYER_EXAMPLE); play(PLAYER_EXAMPLE); }}>
            Probar con un ejemplo
          </button>
        </div>
      </div>

      {/* Reproductor */}
      <div className="card watch-player-card" style={{ marginTop: "var(--gap)" }}>
        <div className="card-head">
          <div className="card-title">
            <span className="dot"/> Reproductor
          </div>
          {playing && (
            <div style={{ display: "flex", gap: 6 }}>
              <a className="btn" href={playing} target="_blank" rel="noopener noreferrer">Abrir en pestaña</a>
              <button className="btn" onClick={clear}>Cerrar</button>
            </div>
          )}
        </div>

        {playing ? (
          <div className="watch-player" ref={playerRef}>
            <iframe
              src={playing}
              title="Reproductor"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              referrerPolicy="no-referrer"
            />
          </div>
        ) : resolving ? (
          <div className="watch-player-empty">
            <div className="wpe-icon" style={{ animation: "caa-spin 0.8s linear infinite" }}><IconPlay size={26}/></div>
            <p>Buscando el enlace de <b>{title}</b>…</p>
          </div>
        ) : (
          <div className="watch-player-empty">
            <div className="wpe-icon"><IconPlay size={28}/></div>
            <p>Pega un enlace arriba y pulsa <b>Reproducir</b>.</p>
            <span className="wpe-note">Funciona con enlaces de tipo <code>embed</code> (iframe). Algunas webs bloquean la inserción; si pasa, usa "Abrir en pestaña".</span>
          </div>
        )}
      </div>

      {/* Marcadores de plataformas */}
      <div className="card" style={{ marginTop: "var(--gap)" }}>
        <div className="card-head">
          <div className="card-title"><span className="dot"/> Plataformas</div>
        </div>
        <div className="watch-fallback" style={{ justifyContent: "flex-start", maxWidth: "none" }}>
          {WATCH_PLATFORMS.map(pid => {
            const p = WATCH_PF_MAP[pid];
            return (
              <a
                key={pid}
                className="watch-fb-btn"
                href={PLATFORM_HOME[pid]}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="wfb-glyph" style={{ background: p.color }}>{p.glyph}</span>
                {p.name}
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}

window.WatchNowPage = WatchNowPage;
