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

function WatchPoster({ keyId, cls }) {
  const res = window.usePoster ? window.usePoster(keyId) : ["", () => {}];
  const src = Array.isArray(res) ? res[0] : res;
  const onFail = Array.isArray(res) ? res[1] : () => {};
  if (!src) return null;
  return <img className={cls} src={src} alt="" onError={onFail}/>;
}

function WatchNowPage({ request }) {
  const [link, setLink] = React.useState("");
  const [playing, setPlaying] = React.useState("");   // url cargada en el iframe
  const [title, setTitle] = React.useState("");
  const [imdbUrl, setImdbUrl] = React.useState("");
  const [resolving, setResolving] = React.useState(false);
  const [ctxMenu, setCtxMenu] = React.useState(null);  // { x, y, item } | null
  const [toast, setToast] = React.useState("");
  const [history, setHistory] = React.useState(() => {
    try { const s = localStorage.getItem("pw_history"); if (s) return JSON.parse(s); } catch {}
    return [];
  });
  const [histSort, setHistSort] = React.useState("all"); // all | movie | series
  const [confirmClear, setConfirmClear] = React.useState(false);
  const inputRef = React.useRef(null);
  const playerRef = React.useRef(null);

  React.useEffect(() => {
    try { localStorage.setItem("pw_history", JSON.stringify(history)); } catch {}
  }, [history]);

  // corrige tipos de entradas antiguas (p.ej. series guardadas como peli)
  React.useEffect(() => {
    setHistory(prev => {
      let changed = false;
      const next = prev.map(h => {
        const dt = detectType(h.title, h.type);
        if (dt !== h.type) { changed = true; return { ...h, type: dt }; }
        return h;
      });
      return changed ? next : prev;
    });
  }, []);

  // detección de tipo: corrige series/anime conocidas mal etiquetadas
  const KNOWN_SERIES = ["the walking dead","breaking bad","game of thrones","stranger things","the last of us","house of the dragon","succession","severance","peaky blinders","dark","the mandalorian","fallout","the boys","wednesday","loki","the bear","reacher","yellowjackets","euphoria","narcos","the crown","better call saul","ozark","money heist","la casa de papel","squid game","the witcher","arcane","invincible","rick and morty","friends","the office","lost","westworld","true detective","fargo","mr robot","chernobyl","the white lotus","andor","silo","shogun"];
  const KNOWN_ANIME = ["one piece","naruto","attack on titan","jujutsu kaisen","demon slayer","chainsaw man","spy x family","frieren","solo leveling","death note","vinland saga","dragon ball","bleach","hunter x hunter","my hero academia","tokyo revengers","hell mode","prison school","shangri-la frontier"];
  function detectType(title, fallback) {
    const t = (title || "").toLowerCase();
    if (KNOWN_ANIME.some(s => t.includes(s))) return "anime";
    if (KNOWN_SERIES.some(s => t.includes(s))) return "series";
    return fallback || "movie";
  }

  function recordHistory(url, meta = {}) {
    const idm = (url || "").match(/tt\d+/i);
    const key = idm ? idm[0].toLowerCase() : (url || "").trim();
    if (!key) return;
    setHistory(prev => {
      const existing = prev.find(h => h.key === key);
      const ttl = meta.title || (existing && existing.title) || "Enlace directo";
      const entry = {
        key,
        title: ttl,
        type: detectType(ttl, meta.type || (existing && existing.type) || "movie"),
        year: meta.year || (existing && existing.year) || "",
        url,
        episode: existing ? existing.episode : "",
        ts: Date.now(),
      };
      return [entry, ...prev.filter(h => h.key !== key)].slice(0, 40);
    });
  }
  function setSeason(key, val) {
    setHistory(prev => prev.map(h => h.key === key ? { ...h, season: Math.max(1, val) } : h));
  }
  function setEp(key, val) {
    setHistory(prev => prev.map(h => h.key === key ? { ...h, ep: Math.max(1, val) } : h));
  }
  function removeHistory(key) {
    setHistory(prev => prev.filter(h => h.key !== key));
  }
  function renameHistory(key, title) {
    setHistory(prev => prev.map(h => h.key === key ? { ...h, title } : h));
  }
  function startPlay(url, meta) {
    if (!url) return;
    setLink(url);
    setPlaying(url);
    if (meta && meta.title) setTitle(meta.title);
    recordHistory(url, meta || {});
  }

  React.useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    return () => { window.removeEventListener("click", close); window.removeEventListener("scroll", close, true); };
  }, [ctxMenu]);

  function saveToCine(it) {
    try {
      const raw = localStorage.getItem("pw_cine");
      const list = raw ? JSON.parse(raw) : [];
      if (list.some(x => x.title.toLowerCase() === it.title.toLowerCase() && x.year === it.year)) {
        setToast(`"${it.title}" ya está en Cine`);
      } else {
        const entry = {
          id: "c" + Date.now(),
          title: it.title,
          year: it.year,
          type: it.type,
          genre: it.genre,
          platform: (it.on && it.on[0]) || "google",
          url: `https://www.imdb.com/es-es/title/${it.imdb}/`,
          poster: "",
          status: "toWatch",
          fav: false,
          rating: 0,
        };
        localStorage.setItem("pw_cine", JSON.stringify([entry, ...list]));
        setToast(`Guardado en Cine: "${it.title}"`);
      }
    } catch (e) {
      setToast("No se pudo guardar");
    }
    setCtxMenu(null);
    setTimeout(() => setToast(""), 2600);
  }

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
    recordHistory(url, { title: it.title, type: it.type, year: it.year });
  }, [request && request.ts]);

  function playFromImdb() {
    const m = imdbUrl.match(/(tt\d+)/i);
    if (!m) return;
    const url = /imdb\.com/i.test(imdbUrl) ? imdbUrl.replace(/imdb\.com/i, "playimdb.com") : `https://www.playimdb.com/es-es/title/${m[1]}/`;
    startPlay(url, { type: /\/tv|series/i.test(imdbUrl) ? "series" : "movie" });
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
        setTitle(o.title || "");
        // no auto-reproducir: el usuario debe pulsar Reproducir
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
    startPlay(url, {});
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

      {/* Buscador de título → slide de resultados */}
      <div className="watch-hero" style={{ marginTop: "var(--gap)" }}>
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
                    onClick={() => startPlay(embedFor(it), { title: it.title, type: it.type, year: it.year })}
                    onContextMenu={(e) => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, item: it }); }}
                    title={`Reproducir ${it.title} · clic derecho para guardar en Cine`}
                  >
                    <div className="wsc-poster" style={posterStyle(it)}>
                      <span className="wsc-type">{it.type === "movie" ? "Peli" : it.type === "series" ? "Serie" : "Anime"}</span>
                      <WatchPoster cls="wsc-img" keyId={it.imdb || it.title}/>
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

      {/* Barra de enlace embed — debajo del reproductor */}
      <div className="watch-hero" style={{ marginTop: "var(--gap)" }}>
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

      {/* Historial de reproducción — dos filas: pelis y series */}
      {history.length > 0 && (() => {
        const movies = history.filter(h => h.type === "movie");
        const series = history.filter(h => h.type === "series" || h.type === "anime");
        const Tile = (h) => {
          const isSerie = h.type === "series" || h.type === "anime";
          return (
            <div key={h.key} className="hist-tile-wrap">
              <div
                className="hist-tile"
                onClick={() => startPlay(h.url, { title: h.title, type: h.type, year: h.year })}
                title={`Reanudar ${h.title}`}
              >
                <div className="hist-tile-poster" style={posterStyle({ title: h.title, type: h.type })}>
                  <WatchPoster cls="hist-tile-img" keyId={/^tt\d+/i.test(h.key) ? h.key : h.title}/>
                  <span className="hist-tile-mark">{posterInitials(h.title)}</span>
                  <span className={`tile-type type-${h.type}`}>{h.type === "movie" ? "Peli" : h.type === "series" ? "Serie" : "Anime"}</span>
                  <button className="hist-tile-x" onClick={(e) => { e.stopPropagation(); removeHistory(h.key); }} title="Quitar"><IconClose size={11}/></button>
                  <div className="hist-tile-hover">
                    <span className="tile-play-ic"><IconPlay size={16}/></span>
                    <span className="hist-tile-title">{h.title}</span>
                  </div>
                </div>
              </div>
              <div className="hist-tile-foot">
                <input
                  className="hist-tile-name"
                  value={h.title}
                  onChange={(e) => renameHistory(h.key, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  spellCheck={false}
                  title="Editar nombre"
                />
                {isSerie && (
                  <div className="hist-ep">
                    <div className="hist-stepper">
                      <span className="hist-step-label">T</span>
                      <button onClick={() => setSeason(h.key, (h.season || 1) - 1)} disabled={(h.season || 1) <= 1}>−</button>
                      <span className="hist-step-val mono">{h.season || 1}</span>
                      <button onClick={() => setSeason(h.key, (h.season || 1) + 1)}>+</button>
                    </div>
                    <div className="hist-stepper">
                      <span className="hist-step-label">E</span>
                      <button onClick={() => setEp(h.key, (h.ep || 1) - 1)} disabled={(h.ep || 1) <= 1}>−</button>
                      <span className="hist-step-val mono">{h.ep || 1}</span>
                      <button onClick={() => setEp(h.key, (h.ep || 1) + 1)}>+</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        };
        return (
          <div className="card" style={{ marginTop: "var(--gap)" }}>
            <div className="card-head">
              <div className="card-title"><span className="dot"/> Historial <span className="cine-count">{history.length}</span></div>
              <button
                className={`btn ${confirmClear ? "solid" : ""}`}
                onClick={() => {
                  if (confirmClear) { setHistory([]); setConfirmClear(false); }
                  else { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3500); }
                }}
              >{confirmClear ? "¿Seguro? Vaciar" : "Vaciar"}</button>
            </div>

            <div className="hist-section-label">Películas <span className="cine-count">{movies.length}</span></div>
            {movies.length === 0
              ? <div className="hist-empty-row">Nada todavía.</div>
              : <div className="hist-rail">{movies.map(Tile)}</div>}

            <div className="hist-section-label" style={{ marginTop: 16 }}>Series y anime <span className="cine-count">{series.length}</span></div>
            {series.length === 0
              ? <div className="hist-empty-row">Nada todavía.</div>
              : <div className="hist-rail">{series.map(Tile)}</div>}
          </div>
        );
      })()}

      {ctxMenu && (
        <div
          className="watch-ctx"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="watch-ctx-title">{ctxMenu.item.title}</div>
          <button className="watch-ctx-item" onClick={() => saveToCine(ctxMenu.item)}>
            <IconPlus size={12}/> Guardar en Cine
          </button>
          <button className="watch-ctx-item" onClick={() => { const it = ctxMenu.item; startPlay(embedFor(it), { title: it.title, type: it.type, year: it.year }); setCtxMenu(null); }}>
            <IconPlay size={12}/> Reproducir
          </button>
        </div>
      )}

      {toast && <div className="watch-toast">{toast}</div>}
    </>
  );
}

window.WatchNowPage = WatchNowPage;
