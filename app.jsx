// app.jsx — Main app: shell, routing, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "obsidian",
  "density": "regular",
  "font": "inter-tight",
  "accentMono": true,
  "showSeconds": true
} /*EDITMODE-END*/;

const FONT_STACKS = {
  "inter-tight": '"Inter Tight", "Inter", ui-sans-serif, system-ui, sans-serif',
  "ibm-plex": '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
  "geist": '"Geist", "Inter Tight", ui-sans-serif, system-ui, sans-serif'
};

function initials(name) {
  if (!name) return "··";
  const first = name[0].toUpperCase();
  const caps = name.slice(1).split("").filter((c) => c >= "A" && c <= "Z");
  let result = first + caps.join("");
  if (result.length < 3) result = result + first;
  return result.slice(0, 3);
}

function Sidebar({ page, onPage, username, onLogout, collapsed, onToggle }) {
  const items = [
  { id: "personal", label: "Personal", icon: <IconHome />, kbd: "1" },
  { id: "invest", label: "Mercados", icon: <IconChart />, kbd: "2" },
  { id: "cine", label: "Cine", icon: <IconFilm />, kbd: "3" },
  { id: "watch", label: "Ver ahora", icon: <IconPlay />, kbd: "4" }];

  return (
    <aside className="sidebar">
      <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? "Expandir" : "Plegar"}>‹</button>
      <div className="brand">
        <div className="mark">P</div>
        <div className="name">Personal Workspace<small>v1.0 · build 2026.05</small></div>
      </div>

      <div className="nav-section">
        <div className="nav-title">Workspace</div>
        {items.map((it) =>
        <button
          key={it.id}
          className={`nav-item ${page === it.id ? "active" : ""}`}
          onClick={() => onPage(it.id)}
          title={collapsed ? it.label : undefined}>
          
            <span className="ico">{it.icon}</span>
            <span className="label">{it.label}</span>
            {it.kbd && <span className="kbd-hint">{it.kbd}</span>}
          </button>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-chip" onClick={onLogout} title="Cerrar sesión">
          <div className="avatar">{initials(username)}</div>
          <div className="who">{username}<small>Cerrar sesión</small></div>
          <span className="logout-icon" style={{ marginLeft: "auto", color: "var(--fg-2)" }}><IconLogout /></span>
        </div>
      </div>
    </aside>);

}

function Topbar({ page, onChat, onHome }) {
  const crumbs = {
    personal: "Personal",
    invest: "Mercados",
    cine: "Cine",
    watch: "Ver ahora"
  };
  return (
    <div className="topbar">
      <div className="crumb">
        <a onClick={onHome} style={{ cursor: "pointer", color: "var(--fg-1)" }}>Workspace</a> · <b>{crumbs[page]}</b>
      </div>
      <div style={{ flex: 1 }} />
      <button className="icon-btn" title="Volver al hub" onClick={onHome}><IconHome /></button>
      <button className="icon-btn" title="Notificaciones"><IconBell /></button>
    </div>);

}

function App() {
  const [authed, setAuthed] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [page, setPage] = React.useState("hub");
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => {
    try {return localStorage.getItem("pw_sidebar_collapsed") === "1";} catch {return false;}
  });
  React.useEffect(() => {
    try {localStorage.setItem("pw_sidebar_collapsed", sidebarCollapsed ? "1" : "0");} catch {}
  }, [sidebarCollapsed]);

  // Keyboard shortcuts 1/2/3 → personal / invest / chat
  React.useEffect(() => {
    if (!authed || page === "hub") return;
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target.isContentEditable) return;
      if (e.key === "1") {setPage("personal");e.preventDefault();} else
      if (e.key === "2") {setPage("invest");e.preventDefault();} else
      if (e.key === "3") {setPage("cine");e.preventDefault();} else
      if (e.key === "4") {setPage("watch");e.preventDefault();}
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authed, page]);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [watchRequest, setWatchRequest] = React.useState(null);
  function playInWatch(item) {
    setWatchRequest({ item, ts: Date.now() });
    setPage("watch");
  }

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.theme);
    root.setAttribute("data-density", t.density);
    document.body.style.fontFamily = FONT_STACKS[t.font] || FONT_STACKS["inter-tight"];
  }, [t.theme, t.density, t.font]);

  // restore session
  React.useEffect(() => {
    try {
      const u = sessionStorage.getItem("pw_user");
      if (u) {setUsername(u);setAuthed(true);}
    } catch {}
  }, []);

  function handleLogin(u) {
    setUsername(u);
    setAuthed(true);
    setPage("hub");
    try {sessionStorage.setItem("pw_user", u);} catch {}
  }
  function handleLogout() {
    setAuthed(false);
    setUsername("");
    setPage("hub");
    try {sessionStorage.removeItem("pw_user");} catch {}
  }

  if (!authed) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <TweaksUI t={t} setTweak={setTweak} />
      </>);

  }

  if (page === "hub") {
    return (
      <>
        <Hub username={username} onPick={setPage} onLogout={handleLogout} />
        <TweaksUI t={t} setTweak={setTweak} />
      </>);

  }

  return (
    <div className="app" data-screen-label="Dashboard" data-sidebar={sidebarCollapsed ? "collapsed" : "expanded"}>
      <Sidebar
        page={page}
        onPage={setPage}
        username={username}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)} />
      
      <Topbar page={page} onHome={() => setPage("hub")} />
      <main className="main" data-screen-label={page}>
        {page === "personal" && <PersonalPage username={username} />}
        {page === "invest" && <InvestmentsPage />}
        {page === "cine" && <CinePage onWatch={playInWatch} />}
        {page === "watch" && <WatchNowPage request={watchRequest} />}
      </main>
      <TweaksUI t={t} setTweak={setTweak} />
    </div>);

}

function TweaksUI({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Tema" />
      <TweakSelect
        label="Paleta"
        value={t.theme}
        options={[
        { value: "graphite", label: "Grafito" },
        { value: "slate", label: "Slate" },
        { value: "obsidian", label: "Obsidian" },
        { value: "emerald", label: "Emerald" }]
        }
        onChange={(v) => setTweak("theme", v)} />
      
      <TweakRadio
        label="Densidad"
        value={t.density}
        options={[
        { value: "compact", label: "Compact" },
        { value: "regular", label: "Regular" },
        { value: "cozy", label: "Cozy" }]
        }
        onChange={(v) => setTweak("density", v)} />
      
      <TweakSection label="Tipografía" />
      <TweakSelect
        label="Familia"
        value={t.font}
        options={[
        { value: "inter-tight", label: "Inter Tight" },
        { value: "ibm-plex", label: "IBM Plex Sans" },
        { value: "geist", label: "Geist" }]
        }
        onChange={(v) => setTweak("font", v)} />
      
    </TweaksPanel>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
window.initials = initials;