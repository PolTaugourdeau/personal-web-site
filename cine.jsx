// cine.jsx — Cine: pelis, series y anime con accesos rápidos a plataformas

// ─── Plataformas ─────────────────────────────────────────────────────
const PLATFORMS = [
  { id: "netflix",  name: "Netflix",     glyph: "N",  color: "#e50914", url: "https://netflix.com" },
  { id: "prime",    name: "Prime Video", glyph: "Pv", color: "#00a8e1", url: "https://primevideo.com" },
  { id: "hbo",      name: "HBO Max",     glyph: "H",  color: "#9333ea", url: "https://max.com" },
  { id: "disney",   name: "Disney+",     glyph: "D+", color: "#1c64ee", url: "https://disneyplus.com" },
  { id: "youtube",  name: "YouTube",     glyph: "Yt", color: "#ff0033", url: "https://youtube.com" },
  { id: "filmin",   name: "Filmin",      glyph: "Fi", color: "#0fa3a3", url: "https://filmin.es" },
  { id: "animeyt",  name: "AnimeYT",     glyph: "AY", color: "#f59e0b", url: "https://animeyt.es" },
  { id: "google",   name: "Buscar",      glyph: "G",  color: "#4285f4", url: "https://google.com/search?q=" },
];
const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map(p => [p.id, p]));

// ─── OMDb: portadas e info reales por título / id de IMDb ────────────
const OMDB_KEY = "d487aefc";
const _posterCache = (() => { try { return JSON.parse(localStorage.getItem("pw_poster_cache") || "{}"); } catch { return {}; } })();
async function omdbFetch(params) {
  try {
    const r = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&${params}`);
    const d = await r.json();
    return d && d.Response !== "False" ? d : null;
  } catch { return null; }
}
async function fetchPoster(key) {
  if (!key) return "";
  if (_posterCache[key] !== undefined) return _posterCache[key];
  const isId = /^tt\d+/i.test(key);
  const d = await omdbFetch(isId ? `i=${key}` : `t=${encodeURIComponent(key)}`);
  const p = d && d.Poster && d.Poster !== "N/A" ? d.Poster : "";
  _posterCache[key] = p;
  try { localStorage.setItem("pw_poster_cache", JSON.stringify(_posterCache)); } catch {}
  return p;
}
function imdbIdOf(item) {
  const m = (item && item.url || "").match(/tt\d+/i);
  return m ? m[0] : "";
}
function usePoster(key, existing) {
  const [src, setSrc] = React.useState(existing || (key && _posterCache[key]) || "");
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => {
    // si no hay imagen útil (o la guardada falló), pide a OMDb
    if (existing && !failed) { setSrc(existing); return; }
    if (!key) return;
    if (_posterCache[key]) { setSrc(_posterCache[key]); return; }
    let on = true;
    fetchPoster(key).then(p => { if (on && p) setSrc(p); });
    return () => { on = false; };
  }, [key, existing, failed]);
  return [src, () => setFailed(true)];
}

const TYPES = [
  { id: "movie",  label: "Películas" },
  { id: "series", label: "Series" },
  { id: "anime",  label: "Anime" },
];

const POPULAR_SUGGEST = [
  { t: "Dune: Parte Dos", y: 2024, k: "movie" },
  { t: "Oppenheimer", y: 2023, k: "movie" },
  { t: "Interstellar", y: 2014, k: "movie" },
  { t: "Origen", y: 2010, k: "movie" },
  { t: "El caballero oscuro", y: 2008, k: "movie" },
  { t: "Gladiator II", y: 2024, k: "movie" },
  { t: "Joker", y: 2019, k: "movie" },
  { t: "Parásitos", y: 2019, k: "movie" },
  { t: "Matrix", y: 1999, k: "movie" },
  { t: "Top Gun: Maverick", y: 2022, k: "movie" },
  { t: "John Wick 4", y: 2023, k: "movie" },
  { t: "The Last of Us", y: 2023, k: "series" },
  { t: "Breaking Bad", y: 2008, k: "series" },
  { t: "Game of Thrones", y: 2011, k: "series" },
  { t: "Stranger Things", y: 2016, k: "series" },
  { t: "The Walking Dead", y: 2010, k: "series" },
  { t: "Severance", y: 2022, k: "series" },
  { t: "House of the Dragon", y: 2022, k: "series" },
  { t: "Peaky Blinders", y: 2013, k: "series" },
  { t: "Frieren", y: 2023, k: "anime" },
  { t: "Attack on Titan", y: 2013, k: "anime" },
  { t: "Jujutsu Kaisen", y: 2020, k: "anime" },
  { t: "Chainsaw Man", y: 2022, k: "anime" },
  { t: "Demon Slayer", y: 2019, k: "anime" },
  { t: "One Piece", y: 1999, k: "anime" },
  { t: "Death Note", y: 2006, k: "anime" },
  { t: "Solo Leveling", y: 2024, k: "anime" },
  { t: "Spy x Family", y: 2022, k: "anime" },
];

const GENRES = [
  "Acción", "Aventura", "Fantasía", "Ciencia ficción", "Drama", "Comedia",
  "Thriller", "Terror", "Misterio", "Animación", "Romance", "Documental",
  "Crimen", "Bélico", "Western", "Familiar",
];

// ─── Datos iniciales (de la lista del usuario) ────────────────────────
const INITIAL_CINE = [
  // Anime
  { id: "c01", title: "Shangri-La Frontier: Kusoge Hunter", year: 2024, type: "anime",  genre: "Aventura · Fantasía",      status: "toWatch", fav: false, rating: 0, platform: "animeyt", url: "https://animeyt.es/anime/shangri-la-frontier" },
  { id: "c02", title: "One Piece — Episodio 1116",          year: 2024, type: "anime",  genre: "Aventura · Shōnen",        status: "toWatch", fav: false, rating: 0, platform: "animeyt", url: "https://animeyt.es/ver/one-piece-1116" },
  { id: "c03", title: "Hell Mode",                          year: 2023, type: "anime",  genre: "Fantasía · Isekai",        status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=hell+mode+anime" },
  { id: "c04", title: "Prison School",                      year: 2015, type: "anime",  genre: "Comedia · Ecchi",          status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=prison+school+anime" },

  // Series
  { id: "c05", title: "Servant",                            year: 2020, type: "series", genre: "Terror · Misterio",        status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=servant+serie" },
  { id: "c06", title: "Yellowjackets 2×01",                 year: 2023, type: "series", genre: "Drama · Thriller",         status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=yellowjackets+2x01" },
  { id: "c07", title: "Superwho",                           year: 2024, type: "series", genre: "Comedia · Misterio",       status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=superwho+serie" },
  { id: "c08", title: "The Fix",                            year: 2024, type: "series", genre: "Drama · Crimen",           status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=the+fix+2024" },
  { id: "c09", title: "Last Frontier",                      year: 2024, type: "series", genre: "Drama · Aventura",         status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=last+frontier+serie" },
  { id: "c10", title: "El final de Oak Street",             year: 2024, type: "series", genre: "Drama · Misterio",         status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=el+final+de+oak+street" },

  // Pelis
  { id: "c11", title: "Ídolos",                             year: 2024, type: "movie",  genre: "Drama",                    status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=idolos+pelicula" },
  { id: "c12", title: "Greenland 2",                        year: 2025, type: "movie",  genre: "Acción · Catástrofe",      status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=greenland+2" },
  { id: "c13", title: "Torrente: Presidente",               year: 2025, type: "movie",  genre: "Comedia",                  status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=torrente+presidente" },
  { id: "c14", title: "Daemons of the Shadow Realm",        year: 2024, type: "movie",  genre: "Fantasía · Aventura",      status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=daemons+of+the+shadow" },
  { id: "c15", title: "Land of the Sons",                   year: 2024, type: "movie",  genre: "Drama · Post-apocalíptico", status: "toWatch", fav: false, rating: 0, platform: "google",  url: "https://google.com/search?q=land+of+the+sons" },
  { id: "c16", title: "Proyecto Salvación (Project Hail Mary)", year: 2026, type: "movie", genre: "Ciencia ficción",       status: "toWatch", fav: true,  rating: 0, platform: "google",  url: "https://google.com/search?q=project+hail+mary+pelicula" },
];

// ─── Helpers ─────────────────────────────────────────────────────────
function cineHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// poster colors per type (so anime/series/movie feel different)
const POSTER_PALETTES = {
  movie:  [["#5b2d2d","#a13c3c"], ["#2f3b6b","#4b6cb7"], ["#4a3b1d","#a3812d"], ["#3a2740","#7a3e9a"], ["#1d3a3a","#3da3a3"]],
  series: [["#1d2b3a","#3d6fa3"], ["#2a1f3d","#5b3a7a"], ["#2d3a1d","#6fa33d"], ["#1d3a32","#3da387"], ["#3a1d2b","#a33d6f"]],
  anime:  [["#3a1d3a","#a33da3"], ["#3a2d1d","#a37a3d"], ["#1d3a3a","#3da3a3"], ["#3a1d1d","#a33d3d"], ["#1d3a1d","#3da33d"]],
};

function posterStyle(item) {
  const palettes = POSTER_PALETTES[item.type] || POSTER_PALETTES.movie;
  const h = cineHash(item.title);
  const [a, b] = palettes[h % palettes.length];
  const angle = (h % 60) + 110;
  return {
    background: `linear-gradient(${angle}deg, ${a} 0%, ${b} 100%)`,
  };
}

function posterInitials(title) {
  const clean = title.replace(/[^a-záéíóúñÑA-ZÁÉÍÓÚ0-9 ]/gi, "").trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "··";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

// ─── Star rating ─────────────────────────────────────────────────────
function StarRating({ value, onChange, size = 12 }) {
  return (
    <div className="cine-stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          className={`star ${n <= value ? "on" : ""}`}
          onClick={(e) => { e.stopPropagation(); onChange(n === value ? 0 : n); }}
          title={`${n} estrellas`}
        >★</button>
      ))}
    </div>
  );
}

// ─── Platform pill ───────────────────────────────────────────────────
function PlatformPill({ id, size = "sm" }) {
  const p = PLATFORM_MAP[id] || PLATFORM_MAP.google;
  return (
    <span className={`pf-pill pf-pill-${size}`} title={p.name}>
      <span className="pf-glyph" style={{ background: p.color }}>{p.glyph}</span>
      <span className="pf-name">{p.name}</span>
    </span>
  );
}

// ─── Quick access strip (plataformas) ────────────────────────────────
function PlatformStrip() {
  return (
    <div className="card cine-platforms">
      <div className="card-head">
        <div className="card-title"><span className="dot"/> Acceso rápido</div>
        <span className="cine-count">{PLATFORMS.length} plataformas</span>
      </div>
      <div className="pf-grid">
        {PLATFORMS.map(p => (
          <a key={p.id} className="pf-tile" href={p.url} target="_blank" rel="noopener noreferrer">
            <span className="pf-tile-glyph" style={{ background: p.color }}>{p.glyph}</span>
            <span className="pf-tile-name">{p.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Poster card (favoritas) ─────────────────────────────────────────
function PosterCard({ item, onToggleFav, onToggleStatus, onRate, onDelete, onEdit, onWatch }) {
  const [poster, onPosterFail] = usePoster(imdbIdOf(item) || item.title, item.poster);
  return (
    <div className="poster-card" style={posterStyle(item)}>
      <div className="poster-top">
        <span className={`poster-type type-${item.type}`}>
          {item.type === "movie" ? "Peli" : item.type === "series" ? "Serie" : "Anime"}
        </span>
        <button
          className={`poster-fav ${item.fav ? "on" : ""}`}
          onClick={() => onToggleFav(item.id)}
          title={item.fav ? "Quitar de favoritas" : "Marcar como favorita"}
        >★</button>
      </div>
      <div className="poster-mark">
        {poster && <img className="poster-img" src={poster} alt="" onError={onPosterFail}/>}
        {posterInitials(item.title)}
      </div>
      <div className="poster-bottom">
        <div className="poster-title">{item.title}</div>
        <div className="poster-meta mono">{item.year} · {item.genre}</div>
        <div className="poster-actions">
          <button className="poster-btn primary big" onClick={() => onWatch && onWatch(item)}>
            <IconPlay size={13}/>
            <span>Ver ahora</span>
          </button>
          <button
            className={`poster-btn ${item.status === "watched" ? "watched" : ""}`}
            onClick={() => onToggleStatus(item.id)}
            title={item.status === "watched" ? "Marcar como pendiente" : "Marcar como vista"}
          >
            {item.status === "watched" ? "✓ Vista" : "Pendiente"}
          </button>
          <button className="poster-btn icon" onClick={() => onEdit(item.id)} title="Editar"><IconEdit size={11}/></button>
          <button className="poster-btn icon" onClick={() => onDelete(item.id)} title="Eliminar"><IconTrash size={11}/></button>
        </div>
        <StarRating value={item.rating} onChange={(v) => onRate(item.id, v)} size={11}/>
      </div>
    </div>
  );
}

// ─── Row (lista compacta) ────────────────────────────────────────────
function CineRow({ item, onToggleFav, onToggleStatus, onRate, onDelete, onEdit, onWatch }) {
  return (
    <tr className={`cine-row ${item.status === "watched" ? "watched" : ""}`}>
      <td className="c-fav">
        <button
          className={`star-btn ${item.fav ? "on" : ""}`}
          onClick={() => onToggleFav(item.id)}
          title={item.fav ? "Quitar de favoritas" : "Marcar como favorita"}
        >★</button>
      </td>
      <td className="c-poster">
        <div className="mini-poster" style={posterStyle(item)}>
          {item.poster && <img className="mini-poster-img" src={item.poster} alt="" onError={(e) => { e.target.style.display = "none"; }}/>}
          <span>{posterInitials(item.title)}</span>
        </div>
      </td>
      <td className="c-title">
        <div className="ct-name">{item.title}</div>
        <div className="ct-meta mono">{item.year} · {item.genre}</div>
      </td>
      <td className="c-type">
        <span className={`type-chip type-${item.type}`}>
          {item.type === "movie" ? "Peli" : item.type === "series" ? "Serie" : "Anime"}
        </span>
      </td>
      <td className="c-rating">
        <StarRating value={item.rating} onChange={(v) => onRate(item.id, v)} size={11}/>
      </td>
      <td className="c-status">
        <button
          className={`status-btn ${item.status === "watched" ? "watched" : "pending"}`}
          onClick={() => onToggleStatus(item.id)}
        >
          {item.status === "watched" ? "✓ Vista" : "Por ver"}
        </button>
      </td>
      <td className="c-actions">
        <button className="action-btn ver-btn" onClick={() => onWatch && onWatch(item)} title="Ver ahora">
          Play
        </button>
        <button className="action-btn edit-btn" onClick={() => onEdit(item.id)} title="Editar"><IconEdit size={12}/></button>
        <button className="action-btn danger" onClick={() => onDelete(item.id)} title="Eliminar"><IconTrash size={12}/></button>
      </td>
    </tr>
  );
}

// ─── Modal añadir/editar ─────────────────────────────────────────────
function CineModal({ item, onSave, onClose }) {
  const isEdit = !!item.id;
  const [draft, setDraft] = React.useState({
    id: item.id || `c${Date.now()}`,
    title: item.title || "",
    year: item.year || new Date().getFullYear(),
    type: item.type || "movie",
    genre: item.genre || "",
    platform: item.platform || "google",
    url: item.url || "",
    poster: item.poster || "",
    status: item.status || "toWatch",
    fav: item.fav || false,
    rating: item.rating || 0,
  });

  function set(k, v) { setDraft(d => ({ ...d, [k]: v })); }

  function submit() {
    if (!draft.title.trim()) return;
    let url = draft.url.trim();
    if (!url) {
      url = `https://google.com/search?q=${encodeURIComponent(draft.title)}`;
    } else if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    onSave({ ...draft, title: draft.title.trim(), url });
  }

  return (
    <div className="cine-modal-pop" onClick={(e) => e.stopPropagation()}>
      <div className="bm-modal-head">
        <h3>{isEdit ? "Editar" : "Añadir"}</h3>
        <button className="icon-btn" onClick={onClose} title="Cerrar"><IconClose/></button>
      </div>
        <div className="bm-modal-body">
          <label>
            <span>Título</span>
            <input
              autoFocus
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Ej. Project Hail Mary"
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
          </label>
          <div className="form-row">
            <label>
              <span>Tipo</span>
              <select value={draft.type} onChange={(e) => set("type", e.target.value)}>
                {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </label>
            <label>
              <span>Año</span>
              <input
                type="number" min="1900" max="2099"
                value={draft.year}
                onChange={(e) => set("year", parseInt(e.target.value) || new Date().getFullYear())}
              />
            </label>
          </div>
          <label>
            <span>Género</span>
            <input
              value={draft.genre}
              onChange={(e) => set("genre", e.target.value)}
              placeholder="Acción · Aventura"
              list="cine-genres"
            />
            <datalist id="cine-genres">
              {GENRES.map(g => <option key={g} value={g}/>)}
            </datalist>
          </label>
          <div className="form-row">
            <label>
              <span>Plataforma</span>
              <select value={draft.platform} onChange={(e) => set("platform", e.target.value)}>
                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>
              <span>Estado</span>
              <select value={draft.status} onChange={(e) => set("status", e.target.value)}>
                <option value="toWatch">Por ver</option>
                <option value="watched">Vista</option>
              </select>
            </label>
          </div>
          <label>
            <span>Enlace directo de la plataforma</span>
            <input
              value={draft.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="Ej. https://www.netflix.com/title/81234567"
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
            <small style={{ color: "var(--fg-3)", fontSize: 10.5, marginTop: 2 }}>El botón "Ver" abrirá este enlace directamente en la plataforma.</small>
          </label>
          <label>
            <span>Portada (URL de imagen)</span>
            <input
              value={draft.poster}
              onChange={(e) => set("poster", e.target.value)}
              placeholder="https://…/portada.jpg (opcional)"
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            />
          </label>
          <div className="form-row" style={{ alignItems: "center" }}>
            <label className="checkbox-label">
              <input type="checkbox" checked={draft.fav} onChange={(e) => set("fav", e.target.checked)}/>
              <span>Favorita</span>
            </label>
            <label>
              <span>Valoración</span>
              <StarRating value={draft.rating} onChange={(v) => set("rating", v)} size={14}/>
            </label>
          </div>
        </div>
        <div className="bm-modal-foot">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn solid" onClick={submit} disabled={!draft.title.trim()}>
            {isEdit ? "Guardar" : "Añadir"}
          </button>
        </div>
    </div>
  );
}

// ─── Tile (Netflix-style) ────────────────────────────────────────────
function TileCard({ item, onWatch, onCtx, onDelete }) {
  const isSerie = item.type === "series" || item.type === "anime";
  const [poster, onPosterFail] = usePoster(imdbIdOf(item) || item.title, item.poster);
  return (
    <div
      className="tile-card"
      onClick={() => onWatch && onWatch(item)}
      onContextMenu={onCtx}
      title={`${item.title} · clic para reproducir · clic derecho para opciones`}
    >
      <div className="tile-poster" style={posterStyle(item)}>
        {poster && <img className="tile-img" src={poster} alt="" onError={onPosterFail}/>}
        <span className="tile-mark">{posterInitials(item.title)}</span>
        <span className={`tile-type type-${item.type}`}>{item.type === "movie" ? "Peli" : item.type === "series" ? "Serie" : "Anime"}</span>
        <button className="tile-x" onClick={(e) => { e.stopPropagation(); onDelete && onDelete(item.id); }} title="Eliminar"><IconClose size={12}/></button>
        {item.fav && <span className="tile-fav">★</span>}
        {item.status === "watched" && <span className="tile-watched">✓ Vista</span>}
        <div className="tile-hover">
          <div className="tile-hover-top">
            <span className="tile-play-ic"><IconPlay size={18}/></span>
            <span className="tile-hover-title">{item.title}</span>
          </div>
          <div className="tile-hover-meta">
            <span className="mono">{item.year}</span>
            {item.rating > 0 && <span className="tile-stars">{"★".repeat(item.rating)}</span>}
          </div>
          <div className="tile-hover-genre">{item.genre}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────
function CineSuggestCard({ s, onPick }) {
  const [poster] = usePoster(s.t);
  return (
    <button
      className="cine-sg-card"
      onMouseDown={(e) => { e.preventDefault(); onPick(); }}
    >
      <div className="cine-sg-poster" style={posterStyle({ title: s.t, type: s.k })}>
        {poster && <img src={poster} alt="" onError={(e) => { e.target.style.display = "none"; }}/>}
        <span className="cine-sg-mark">{posterInitials(s.t)}</span>
      </div>
      <div className="cine-sg-title">{s.t}</div>
      <div className="cine-sg-year mono">{s.y}</div>
    </button>
  );
}

function CinePage({ onWatch }) {
  const [items, setItems] = React.useState(() => {
    try {
      const s = localStorage.getItem("pw_cine");
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_CINE;
  });
  const [type, setType] = React.useState("all");           // all | movie | series | anime
  const [status, setStatus] = React.useState("all");       // all | toWatch | watched | fav
  const [platform, setPlatform] = React.useState("all");   // all | <pid>
  const [genreQ, setGenreQ] = React.useState("");          // text filter on genre
  const [search, setSearch] = React.useState("");
  const [addQuery, setAddQuery] = React.useState("");
  const [showSuggest, setShowSuggest] = React.useState(false);
  const [enriching, setEnriching] = React.useState(false);
  const [editing, setEditing] = React.useState(null);      // item or null
  const [tileCtx, setTileCtx] = React.useState(null);      // { x, y, item }

  React.useEffect(() => {
    if (!tileCtx) return;
    const close = () => setTileCtx(null);
    window.addEventListener("click", close);
    window.addEventListener("scroll", close, true);
    return () => { window.removeEventListener("click", close); window.removeEventListener("scroll", close, true); };
  }, [tileCtx]);

  async function addWithLookup(forced) {
    const q = (typeof forced === "string" ? forced : addQuery).trim();
    if (!q || enriching) return;
    setEnriching(true);
    let draft = { title: q };

    // 1) OMDb — fuente fiable de info + portada real de IMDb
    try {
      const d = await omdbFetch(`t=${encodeURIComponent(q)}`);
      if (d) {
        const isAnime = /animation/i.test(d.Genre || "") && /japan/i.test((d.Country || "") + (d.Language || ""));
        draft = {
          title: d.Title || q,
          type: isAnime ? "anime" : (d.Type === "series" ? "series" : "movie"),
          year: parseInt(d.Year) || new Date().getFullYear(),
          genre: (d.Genre || "").split(", ").join(" · "),
          platform: "google",
          url: d.imdbID ? `https://www.imdb.com/es-es/title/${d.imdbID}/` : "",
          poster: d.Poster && d.Poster !== "N/A" ? d.Poster : "",
        };
        if (d.imdbID && draft.poster) { _posterCache[d.imdbID] = draft.poster; try { localStorage.setItem("pw_poster_cache", JSON.stringify(_posterCache)); } catch {} }
        setEnriching(false); setAddQuery(""); setEditing(draft);
        return;
      }
    } catch (e) { /* sigue al fallback */ }

    // 2) Fallback IA si OMDb no encuentra nada
    try {
      if (window.claude && typeof window.claude.complete === "function") {
        const prompt = `Eres una base de datos de cine experta. Para el título "${q}", devuelve SOLO un objeto JSON válido (sin texto extra, sin markdown):
{"title": "título oficial en español", "type": "movie|series|anime", "year": 2024, "genre": "Género1 · Género2", "platform": "netflix|prime|hbo|disney|youtube|google", "imdbId": "tt1160419"}
Respeta el año y el número de secuela en el imdbId. No dejes campos vacíos.`;
        const res = await Promise.race([
          window.claude.complete(prompt),
          new Promise((_, rj) => setTimeout(() => rj(new Error("timeout")), 12000)),
        ]);
        if (res && typeof res === "string") {
          const m = res.match(/\{[\s\S]*\}/);
          if (m) {
            const o = JSON.parse(m[0]);
            const idMatch = (o.imdbId || o.url || "").match(/tt\d+/i);
            let poster = "";
            if (idMatch) poster = await fetchPoster(idMatch[0]);
            draft = {
              title: o.title || q,
              type: ["movie","series","anime"].includes(o.type) ? o.type : "movie",
              year: parseInt(o.year) || new Date().getFullYear(),
              genre: o.genre || "",
              platform: o.platform || "google",
              url: idMatch ? `https://www.imdb.com/es-es/title/${idMatch[0]}/` : "",
              poster,
            };
          }
        }
      }
    } catch (e) { /* fallback al draft simple */ }
    setEnriching(false);
    setAddQuery("");
    setEditing(draft);
  }

  React.useEffect(() => {
    try { localStorage.setItem("pw_cine", JSON.stringify(items)); } catch {}
  }, [items]);

  function toggleFav(id) {
    setItems(arr => arr.map(it => it.id === id ? { ...it, fav: !it.fav } : it));
  }
  function toggleStatus(id) {
    setItems(arr => arr.map(it => it.id === id ? { ...it, status: it.status === "watched" ? "toWatch" : "watched" } : it));
  }
  function rate(id, rating) {
    setItems(arr => arr.map(it => it.id === id ? { ...it, rating } : it));
  }
  function del(id) {
    setItems(arr => arr.filter(it => it.id !== id));
  }
  function save(item) {
    setItems(arr => {
      const exists = arr.find(x => x.id === item.id);
      return exists ? arr.map(x => x.id === item.id ? item : x) : [item, ...arr];
    });
    setEditing(null);
  }

  // Filtered list
  const filtered = items.filter(it => {
    if (type !== "all" && it.type !== type) return false;
    if (status === "toWatch" && it.status !== "toWatch") return false;
    if (status === "watched" && it.status !== "watched") return false;
    if (status === "fav" && !it.fav) return false;
    if (platform !== "all" && it.platform !== platform) return false;
    if (genreQ && !it.genre.toLowerCase().includes(genreQ.toLowerCase())) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!it.title.toLowerCase().includes(q) && !it.genre.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const favorites = filtered.filter(it => it.fav);
  const rest = filtered.filter(it => !it.fav);

  // Counters per type
  const counts = {
    all:    items.length,
    movie:  items.filter(i => i.type === "movie").length,
    series: items.filter(i => i.type === "series").length,
    anime:  items.filter(i => i.type === "anime").length,
  };

  // Unique genres present
  const genrePresent = [...new Set(items.map(i => i.genre).filter(Boolean))];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Cine</h1>
          <p className="lede">Tus pelis, series y anime. Marca favoritas, valora y abre el enlace para verlas.</p>
        </div>
      </div>

      <div className="watch-hero">
        <div className="cine-add-search watch-searchbar">
            <IconSearch size={18}/>
            <input
              value={addQuery}
              onChange={(e) => { setAddQuery(e.target.value); setShowSuggest(true); }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              onKeyDown={(e) => { if (e.key === "Enter") { setShowSuggest(false); addWithLookup(); } if (e.key === "Escape") setShowSuggest(false); }}
              placeholder="Busca una peli, serie o anime para añadir…"
              disabled={enriching}
            />
            {enriching && <span className="caa-loading">Buscando…</span>}
            {showSuggest && addQuery.trim() && !enriching && (() => {
              const q = addQuery.trim().toLowerCase();
              const matches = POPULAR_SUGGEST.filter(s => s.t.toLowerCase().includes(q)).slice(0, 8);
              return (
                <div className="cine-suggest">
                  {matches.length > 0 && (
                    <div className="cine-suggest-grid">
                      {matches.map(s => (
                        <CineSuggestCard
                          key={s.t}
                          s={s}
                          onPick={() => { setShowSuggest(false); addWithLookup(s.t); }}
                        />
                      ))}
                    </div>
                  )}
                  <button
                    className="cine-suggest-row add"
                    onMouseDown={(e) => { e.preventDefault(); setShowSuggest(false); addWithLookup(); }}
                  >
                    <IconSparkles size={12}/>
                    <span className="cs-title">Añadir «{addQuery.trim()}»</span>
                    <span className="cs-hint">buscar info</span>
                  </button>
                </div>
              );
            })()}
            {editing !== null && (
              <CineModal
                item={editing}
                onSave={save}
                onClose={() => setEditing(null)}
              />
            )}
          </div>
      </div>

      {/* Filtros y tabs */}
      <div className="card cine-filters" style={{ marginTop: "var(--gap)" }}>
        <div className="cine-tabs-row">
          <div className="cine-tabs">
            <button className={`cine-tab ${type === "all" ? "on" : ""}`} onClick={() => setType("all")}>
              Todo <span className="cnt">{counts.all}</span>
            </button>
            {TYPES.map(t => (
              <button key={t.id} className={`cine-tab ${type === t.id ? "on" : ""}`} onClick={() => setType(t.id)}>
                {t.label} <span className="cnt">{counts[t.id]}</span>
              </button>
            ))}
          </div>
          <div className="cine-search">
            <IconSearch size={12}/>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título o género…"
            />
          </div>
        </div>

        <div className="cine-filter-row">
          <div className="filter-group">
            <span className="filter-label">Estado</span>
            <div className="filter-chips">
              {[
                { id: "all",     lbl: "Todas" },
                { id: "toWatch", lbl: "Por ver" },
                { id: "watched", lbl: "Vistas" },
                { id: "fav",     lbl: "★ Favoritas" },
              ].map(s => (
                <button
                  key={s.id}
                  className={`f-chip ${status === s.id ? "on" : ""}`}
                  onClick={() => setStatus(s.id)}
                >{s.lbl}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <span className="filter-label">Género</span>
            <select className="filter-select" value={genreQ} onChange={(e) => setGenreQ(e.target.value)}>
              <option value="">Todos</option>
              {genrePresent.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Favoritas (pósters grandes) */}
      {favorites.length > 0 && (
        <div className="card" style={{ marginTop: "var(--gap)" }}>
          <div className="card-head">
            <div className="card-title"><span className="dot"/> Favoritas <span className="cine-count">{favorites.length}</span></div>
          </div>
          <div className="poster-grid">
            {favorites.map(it => (
              <PosterCard
                key={it.id}
                item={it}
                onToggleFav={toggleFav}
                onToggleStatus={toggleStatus}
                onRate={rate}
                onDelete={del}
                onEdit={(id) => setEditing(items.find(x => x.id === id))}
                onWatch={onWatch}
              />
            ))}
          </div>
        </div>
      )}

      {/* Resto (lista) */}
      <div className="card" style={{ marginTop: "var(--gap)" }}>
        <div className="card-head">
          <div className="card-title">
            <span className="dot"/>
            {favorites.length > 0 ? "Resto" : "Todas"} <span className="cine-count">{rest.length}</span>
          </div>
        </div>
        {rest.length === 0 ? (
          <div className="cine-empty">
            {filtered.length === 0
              ? "No hay nada con esos filtros."
              : "Todo lo que coincide con los filtros está en favoritas."}
          </div>
        ) : (
          <div className="tile-grid">
            {rest.map(it => (
              <TileCard
                key={it.id}
                item={it}
                onWatch={onWatch}
                onDelete={del}
                onCtx={(e) => { e.preventDefault(); setTileCtx({ x: e.clientX, y: e.clientY, item: it }); }}
              />
            ))}
          </div>
        )}
      </div>

      {tileCtx && (
        <div
          className="watch-ctx"
          style={{ left: Math.min(tileCtx.x, window.innerWidth - 210), top: Math.min(tileCtx.y, window.innerHeight - 220) }}
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className="watch-ctx-title">{tileCtx.item.title}</div>
          <button className="watch-ctx-item" onClick={() => { onWatch && onWatch(tileCtx.item); setTileCtx(null); }}><IconPlay size={12}/> Play</button>
          <button className="watch-ctx-item" onClick={() => { toggleFav(tileCtx.item.id); setTileCtx(null); }}>★ {tileCtx.item.fav ? "Quitar de favoritas" : "Favorita"}</button>
          <button className="watch-ctx-item" onClick={() => { toggleStatus(tileCtx.item.id); setTileCtx(null); }}>✓ {tileCtx.item.status === "watched" ? "Marcar por ver" : "Marcar vista"}</button>
          <button className="watch-ctx-item" onClick={() => { setEditing(items.find(x => x.id === tileCtx.item.id)); setTileCtx(null); }}><IconEdit size={12}/> Editar</button>
          <button className="watch-ctx-item danger" onClick={() => { del(tileCtx.item.id); setTileCtx(null); }}><IconTrash size={12}/> Eliminar</button>
        </div>
      )}
    </>
  );
}

window.CinePage = CinePage;
Object.assign(window, { PLATFORM_MAP, posterStyle, posterInitials, fetchPoster, usePoster, OMDB_KEY, omdbFetch });
