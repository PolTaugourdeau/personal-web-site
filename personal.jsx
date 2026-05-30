// personal.jsx — Personal dashboard: calendar, notes, bookmarks, quick links, clock

// ─── Clock ───────────────────────────────────────────────────────────────
function Clock() {
  const [now, setNow] = React.useState(new Date());
  const [weather, setWeather] = React.useState(null);

  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=41.3874&longitude=2.1686&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe%2FMadrid&forecast_days=2";
        const res = await fetch(url);
        const data = await res.json();
        if (cancelled) return;
        setWeather({
          today: Math.round(data.current.temperature_2m),
          tomorrowMax: Math.round(data.daily.temperature_2m_max[1]),
          tomorrowMin: Math.round(data.daily.temperature_2m_min[1]),
          code: data.current.weather_code,
        });
      } catch {
        if (!cancelled) setWeather({ today: 18, tomorrowMax: 20, tomorrowMin: 13, code: 1, mock: true });
      }
    }
    load();
    const t = setInterval(load, 15 * 60 * 1000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  function wxLabel(code) {
    if (code == null) return "";
    if (code === 0) return "Despejado";
    if (code <= 3) return "Parcial";
    if (code <= 48) return "Niebla";
    if (code <= 67) return "Lluvia";
    if (code <= 77) return "Nieve";
    if (code <= 82) return "Chubascos";
    if (code <= 99) return "Tormenta";
    return "—";
  }

  return (
    <div className="card" style={{ minHeight: 0 }}>
      <div className="card-head">
        <div className="card-title"><span className="dot"/> Hora · Barcelona</div>
        <div className="card-meta mono">CET</div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div className="mono tnum" style={{ fontSize: 38, letterSpacing: "-0.02em", lineHeight: 1 }}>{time}</div>
          <div style={{ fontSize: 12, color: "var(--fg-2)", textTransform: "capitalize" }}>{date}</div>
        </div>
        <div style={{
          display: "flex", gap: 14,
        }}>
        <div style={{ flex: 1 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Hoy</div>
          <div className="mono tnum" style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>
            {weather ? `${weather.today}°` : "—"}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>{weather ? wxLabel(weather.code) : "Cargando…"}</div>
        </div>
        <div style={{ flex: 1, borderLeft: "0.5px solid var(--line)", paddingLeft: 14 }}>
          <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Mañana</div>
          <div className="mono tnum" style={{ fontSize: 20, fontWeight: 500, marginTop: 2 }}>
            {weather ? `${weather.tomorrowMax}°` : "—"}
            {weather && <span style={{ fontSize: 12, color: "var(--fg-3)", marginLeft: 4 }}>/ {weather.tomorrowMin}°</span>}
          </div>
          <div style={{ fontSize: 10.5, color: "var(--fg-3)", fontFamily: "var(--font-mono)" }}>máx / mín</div>
        </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar ────────────────────────────────────────────────────────────
// shared events store, keyed by YYYY-MM-DD, persisted to localStorage
function useEvents() {
  const [events, setEvents] = React.useState(() => {
    try {
      const s = localStorage.getItem("pw_events");
      if (s) return JSON.parse(s);
    } catch {}
    // seed sample data relative to today
    const today = new Date();
    const ev = {};
    const mk = (offsetDays, time, title, note) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      const k = d.toISOString().slice(0, 10);
      if (!ev[k]) ev[k] = [];
      ev[k].push({ id: `ev_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, time, title, note: note || "" });
    };
    mk(0, "09:30", "Review semanal", "Repasar tareas pendientes y bloquear el viernes.");
    mk(0, "15:00", "Llamada con A.", "");
    mk(1, "07:30", "Gym", "Pierna + core");
    mk(2, "11:00", "Diseño portfolio", "Mockups de la home");
    mk(3, "21:00", "Cena Marta", "");
    mk(5, "18:40", "Vuelo BCN→LIS", "Vueling VY8456 · Terminal 1");
    mk(7, "10:00", "Reunión Q3", "Agenda en Notas → 'Reunión Q3'");
    mk(-2, "12:00", "Dentista", "");
    mk(10, "", "Cumpleaños Pol", "");
    return ev;
  });

  React.useEffect(() => {
    try { localStorage.setItem("pw_events", JSON.stringify(events)); } catch {}
  }, [events]);

  function addEvent(dateKey, evt) {
    setEvents(prev => {
      const list = prev[dateKey] ? [...prev[dateKey]] : [];
      list.push({ id: `ev_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, ...evt });
      list.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
      return { ...prev, [dateKey]: list };
    });
  }
  function deleteEvent(dateKey, id) {
    setEvents(prev => {
      const list = (prev[dateKey] || []).filter(e => e.id !== id);
      const next = { ...prev };
      if (list.length) next[dateKey] = list; else delete next[dateKey];
      return next;
    });
  }

  return [events, addEvent, deleteEvent];
}

function fmtDateKey(d) { return d.toISOString().slice(0, 10); }
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function Calendar({ events, addEvent, deleteEvent }) {
  const today = new Date();
  const [view, setView] = React.useState("month");
  const [cursor, setCursor] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = React.useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  const monthName = cursor.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const dow = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  function monthGrid() {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const startDow = (first.getDay() + 6) % 7;
    const cells = [];
    for (let i = 0; i < startDow; i++) {
      const d = new Date(first); d.setDate(d.getDate() - (startDow - i));
      cells.push({ d, muted: true });
    }
    for (let i = 1; i <= last.getDate(); i++) {
      cells.push({ d: new Date(cursor.getFullYear(), cursor.getMonth(), i), muted: false });
    }
    while (cells.length % 7 !== 0 || cells.length < 35) {
      const d = new Date(cells[cells.length - 1].d); d.setDate(d.getDate() + 1);
      cells.push({ d, muted: true });
    }
    return cells.slice(0, 42);
  }

  function pickDay(d) {
    setSelected(new Date(d));
    if (d.getMonth() !== cursor.getMonth()) {
      setCursor(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title"><span className="dot"/> Calendario</div>
        <div className="cal-toolbar">
          <button className="icon-btn" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><IconChevL/></button>
          <div className="month" style={{ textTransform: "capitalize" }}>{monthName}</div>
          <button className="icon-btn" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><IconChevR/></button>
          <button className="btn" onClick={() => { const t = new Date(); setCursor(new Date(t.getFullYear(), t.getMonth(), 1)); setSelected(new Date(t.getFullYear(), t.getMonth(), t.getDate())); }}>Hoy</button>
        </div>
      </div>

      {view === "month" && (
        <div className="cal-wrap">
          <div className="cal-grid">
            {dow.map(d => <div key={d} className="cal-dow">{d}</div>)}
            {monthGrid().map(({ d, muted }, i) => {
              const k = fmtDateKey(d);
              const evs = events[k] || [];
              const isToday = isSameDay(d, today);
              const isSel = isSameDay(d, selected);
              return (
                <div
                  key={i}
                  className={`cal-day ${muted ? "muted" : ""} ${isToday ? "today" : ""} ${isSel ? "selected" : ""}`}
                  onClick={() => pickDay(d)}
                >
                  <span>{d.getDate()}</span>
                  {evs.slice(0, 2).map(e => (
                    <div key={e.id} className="ev-pill" title={(e.time ? e.time + " · " : "") + e.title}>
                      {e.time && <span style={{opacity:0.7}}>{e.time} </span>}{e.title}
                    </div>
                  ))}
                  {evs.length > 2 && <div className="ev-more">+{evs.length - 2} más</div>}
                </div>
              );
            })}
          </div>
          <DayPanel
            date={selected}
            events={events[fmtDateKey(selected)] || []}
            onAdd={(evt) => addEvent(fmtDateKey(selected), evt)}
            onDelete={(id) => deleteEvent(fmtDateKey(selected), id)}
          />
        </div>
      )}

      {view === "week" && <WeekView today={today} events={events} />}
    </div>
  );
}

function DayPanel({ date, events, onAdd, onDelete }) {
  const [time, setTime] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [note, setNote] = React.useState("");

  const label = date.toLocaleDateString("es-ES", { weekday: "long", month: "long", year: "numeric" });

  function submit(e) {
    e && e.preventDefault();
    if (!title.trim()) return;
    onAdd({ time: time.trim(), title: title.trim(), note: note.trim() });
    setTime(""); setTitle(""); setNote("");
  }

  return (
    <div className="day-panel">
      <div className="day-panel-head">
        <div className="dnum">{date.getDate()}</div>
        <div className="dlabel">
          {events.length} {events.length === 1 ? "evento" : "eventos"}
          <b>{label}</b>
        </div>
      </div>

      <div className="day-events">
        {events.map(e => (
          <div key={e.id} className="day-event">
            <button className="del" onClick={() => onDelete(e.id)} title="Eliminar">×</button>
            {e.time && <div className="et">{e.time}</div>}
            <div className="en">{e.title}</div>
            {e.note && <div className="enote">{e.note}</div>}
          </div>
        ))}
      </div>

      <form className="day-add" onSubmit={submit}>
        <div className="row">
          <input
            className="time"
            placeholder="HH:MM"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            maxLength={5}
          />
          <input
            className="title"
            placeholder="Título del evento…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <textarea
          placeholder="Nota (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
        <button className="add-btn" type="submit" disabled={!title.trim()}>
          <IconPlus/> Añadir al {date.getDate()} de {date.toLocaleDateString("es-ES", { month: "long" })}
        </button>
      </form>
    </div>
  );
}

function WeekView({ today, events }) {
  // Mon-Sun of current week
  const start = new Date(today);
  const dow = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - dow);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start); d.setDate(d.getDate() + i); return d;
  });
  const dowLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const hours = [8, 10, 12, 14, 16, 18, 20];

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  return (
    <div className="week-grid">
      <div className="week-corner"/>
      {days.map((d, i) => {
        const isToday = isSameDay(d, today);
        return (
          <div key={i} className={`week-h ${isToday ? "today" : ""}`}>
            {dowLabels[i]}<b>{d.getDate()}</b>
          </div>
        );
      })}
      {hours.map((h, ri) => (
        <React.Fragment key={ri}>
          <div className="week-tlabel">{String(h).padStart(2, "0")}:00</div>
          {days.map((d, ci) => {
            const k = d.toISOString().slice(0, 10);
            const evs = (events[k] || []).filter(e => {
              const eh = parseInt((e.time || "0:0").split(":")[0], 10);
              return eh >= h && eh < h + 2;
            });
            return (
              <div key={ci} className="week-tcell">
                {evs.map((e, ei) => (
                  <div key={ei} className="week-event" style={{ top: 4 + ei * 26 }}>
                    {e.title}<small>{e.time}</small>
                  </div>
                ))}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Folder colors ──────────────────────────────────────────────────────
const FOLDER_COLORS = [
  { id: "neutral",   bg: "#2a2a2a", label: "Neutro" },
  { id: "amber",     bg: "#a17b3a", label: "Ámbar" },
  { id: "rose",      bg: "#a85f5f", label: "Rosa" },
  { id: "olive",     bg: "#7a8a52", label: "Oliva" },
  { id: "teal",      bg: "#4f8a82", label: "Verde mar" },
  { id: "indigo",    bg: "#5e6aa3", label: "Índigo" },
  { id: "lilac",     bg: "#8c6aa3", label: "Lila" },
  { id: "stone",     bg: "#6b6660", label: "Piedra" },
];
const colorOf = (id) => (FOLDER_COLORS.find(c => c.id === id) || FOLDER_COLORS[0]).bg;

// ─── Tree primitive ────────────────────────────────────────────────────
function TreeRow({ node, level = 0, expanded, onToggle, onSelect, selectedId, onColor, onRename, onDelete, getCount }) {
  const isFolder = node.type === "folder";
  const isOpen = !!expanded[node.id];
  const isActive = node.id === selectedId;
  const [showColors, setShowColors] = React.useState(false);
  const [renaming, setRenaming] = React.useState(false);
  const [draftName, setDraftName] = React.useState(node.name);
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (renaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [renaming]);

  function commitRename() {
    if (draftName.trim() && draftName !== node.name) onRename(node.id, draftName.trim());
    else setDraftName(node.name);
    setRenaming(false);
  }

  return (
    <>
      <div
        className={`tree-row ${isFolder ? "folder" : "note"} ${isActive ? "active" : ""}`}
        style={{ paddingLeft: 6 + level * 4 }}
        onClick={() => isFolder ? onToggle(node.id) : onSelect(node.id)}
        onDoubleClick={(e) => { e.stopPropagation(); setRenaming(true); }}
      >
        <span className={`twist ${isFolder ? (isOpen ? "open" : "") : "empty"}`}>
          {isFolder ? "›" : ""}
        </span>
        {isFolder
          ? <span className="swatch" style={{ background: colorOf(node.color) }}/>
          : <span className="swatch" style={{ background: "transparent", border: "0.5px solid var(--line-strong)" }}/>
        }
        {renaming ? (
          <input
            ref={inputRef}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") { setDraftName(node.name); setRenaming(false); }
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1, background: "var(--bg-3)", border: "0.5px solid var(--fg-2)",
              borderRadius: 3, padding: "2px 5px", color: "var(--fg-0)",
              fontSize: 12, outline: "none", fontFamily: "inherit",
            }}
          />
        ) : (
          <span className="nm">{node.name}</span>
        )}
        {isFolder && getCount && <span className="count">{getCount(node)}</span>}
        <div className="row-actions" onClick={(e) => e.stopPropagation()}>
          {isFolder && (
            <button title="Color" onClick={() => setShowColors(s => !s)}>●</button>
          )}
          <button title="Renombrar" onClick={() => setRenaming(true)}>✎</button>
          <button title="Eliminar" onClick={() => onDelete(node.id)}>×</button>
        </div>
        {showColors && (
          <div className="color-picker" style={{ left: 24, top: 24 }}>
            {FOLDER_COLORS.map(c => (
              <div
                key={c.id}
                className={`swatch-pick ${node.color === c.id ? "on" : ""}`}
                style={{ background: c.bg }}
                title={c.label}
                onClick={() => { onColor(node.id, c.id); setShowColors(false); }}
              />
            ))}
          </div>
        )}
      </div>
      {isFolder && isOpen && node.children && (
        <div className="tree-children">
          {node.children.map(child => (
            <TreeRow
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedId={selectedId}
              onColor={onColor}
              onRename={onRename}
              onDelete={onDelete}
              getCount={getCount}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ─── Notes (tree-based) ─────────────────────────────────────────────────
const INITIAL_NOTES_TREE = [
  {
    id: "f1", type: "folder", name: "Personal", color: "amber",
    children: [
      { id: "n1", type: "note", name: "Ideas portfolio", body: "Refrescar la home con un grid más editorial.\nProbar tipografía Inter Tight para titulares.\nMover los case studies a un layout más espacioso.\n\nReferencias a revisar:\n— Dieter Rams, less but better\n— Studio Lin, NY\n— Tundra Mag editorial" },
      { id: "n2", type: "note", name: "Reading list", body: "Books to read before summer:\n\n1. The Embedded Entrepreneur — Arvid Kahl\n2. A Philosophy of Software Design\n3. The Order of Time — Carlo Rovelli\n4. Steal Like an Artist (relectura)" },
      { id: "n5", type: "note", name: "Receta pan masa madre", body: "500g harina T80\n350g agua\n100g masa madre activa\n10g sal\n\n— Autólisis 1h\n— Pliegues cada 30min × 4\n— Bulk 4-5h a 24°C\n— Nevera 12h\n— Hornear a 240°C 25 min con vapor + 20 min sin" },
    ],
  },
  {
    id: "f2", type: "folder", name: "Trabajo", color: "indigo",
    children: [
      { id: "n3", type: "note", name: "Reunión Q3", body: "Agenda preliminar:\n- Resumen Q2 (ingresos, churn, runway)\n- Roadmap Q3: 3 prioridades\n- Vacaciones del equipo en agosto\n- Decisión sobre el nuevo lead designer" },
      { id: "n4", type: "note", name: "Tareas semana", body: "Lunes:\n- Review portfolio\n- Llamada con cliente\n\nMartes:\n- Diseño nueva landing\n- Code review\n\nMiércoles:\n- Entrega mockups" },
    ],
  },
  {
    id: "f3", type: "folder", name: "Inversiones", color: "olive",
    children: [
      { id: "n6", type: "note", name: "Tesis NVDA", body: "Tesis de inversión Nvidia:\n\n— Ventaja competitiva en GPUs para IA\n— Crecimiento sostenido en data centers\n— Riesgos: concentración cliente, exportación China\n\nTarget medio plazo: $145" },
    ],
  },
];

function flattenNotes(tree) {
  const out = [];
  const walk = (nodes, parent) => {
    for (const n of nodes) {
      if (n.type === "folder") walk(n.children || [], n);
      else out.push({ ...n, parentId: parent?.id, parentName: parent?.name, parentColor: parent?.color });
    }
  };
  walk(tree, null);
  return out;
}

function findNodeById(tree, id) {
  for (const n of tree) {
    if (n.id === id) return n;
    if (n.type === "folder" && n.children) {
      const f = findNodeById(n.children, id);
      if (f) return f;
    }
  }
  return null;
}
function findParentOfId(tree, id, parent = null) {
  for (const n of tree) {
    if (n.id === id) return parent;
    if (n.type === "folder" && n.children) {
      const f = findParentOfId(n.children, id, n);
      if (f !== null || n.children.some(c => c.id === id)) return f || n;
    }
  }
  return null;
}
function updateTree(tree, id, fn) {
  return tree.map(n => {
    if (n.id === id) return fn(n);
    if (n.type === "folder" && n.children) return { ...n, children: updateTree(n.children, id, fn) };
    return n;
  });
}
function removeFromTree(tree, id) {
  return tree.filter(n => n.id !== id).map(n => {
    if (n.type === "folder" && n.children) return { ...n, children: removeFromTree(n.children, id) };
    return n;
  });
}
function addToFolder(tree, folderId, node) {
  // folderId === null means root
  if (folderId === null) return [...tree, node];
  return tree.map(n => {
    if (n.id === folderId && n.type === "folder") {
      return { ...n, children: [...(n.children || []), node] };
    }
    if (n.type === "folder" && n.children) return { ...n, children: addToFolder(n.children, folderId, node) };
    return n;
  });
}

function Notes() {
  const [tree, setTree] = React.useState(() => {
    try {
      const s = localStorage.getItem("pw_notes_tree");
      if (s) return JSON.parse(s);
    } catch {}
    return INITIAL_NOTES_TREE;
  });
  const [expanded, setExpanded] = React.useState({ f1: true, f2: true, f3: true });
  const [activeId, setActiveId] = React.useState("n1");

  React.useEffect(() => {
    try { localStorage.setItem("pw_notes_tree", JSON.stringify(tree)); } catch {}
  }, [tree]);

  const flat = React.useMemo(() => flattenNotes(tree), [tree]);
  const active = flat.find(n => n.id === activeId) || flat[0];
  const activeParent = active ? findParentOfId(tree, active.id) : null;

  function toggle(id) { setExpanded(e => ({ ...e, [id]: !e[id] })); }
  function update(id, fields) {
    setTree(t => updateTree(t, id, n => ({ ...n, ...fields })));
  }
  function setColor(id, color) { update(id, { color }); }
  function rename(id, name) { update(id, { name }); }
  function del(id) {
    setTree(t => removeFromTree(t, id));
    if (id === activeId) {
      const remaining = flattenNotes(removeFromTree(tree, id));
      setActiveId(remaining[0]?.id);
    }
  }
  function addFolder() {
    const id = "f_" + Date.now();
    const folder = { id, type: "folder", name: "Nueva carpeta", color: "neutral", children: [] };
    setTree(t => [...t, folder]);
    setExpanded(e => ({ ...e, [id]: true }));
  }
  function addNote(folderId = null) {
    // if no folderId, put it in the parent of active note, or first folder, or root
    let target = folderId;
    if (target === null) {
      target = activeParent?.id || (tree.find(n => n.type === "folder")?.id) || null;
    }
    const id = "n_" + Date.now();
    const note = { id, type: "note", name: "Nueva nota", body: "" };
    setTree(t => addToFolder(t, target, note));
    if (target) setExpanded(e => ({ ...e, [target]: true }));
    setActiveId(id);
  }

  function getCount(folder) {
    return (folder.children || []).filter(c => c.type === "note").length;
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title"><span className="dot"/> Notas</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn" onClick={addFolder} title="Nueva carpeta">
            <IconPlus/> Carpeta
          </button>
          <button className="btn solid" onClick={() => addNote()} title="Nueva nota">
            <IconPlus/> Nota
          </button>
        </div>
      </div>
      <div className="notes-wrap">
        <div className="notes-list">
          {tree.map(node => (
            <TreeRow
              key={node.id}
              node={node}
              expanded={expanded}
              onToggle={toggle}
              onSelect={setActiveId}
              selectedId={activeId}
              onColor={setColor}
              onRename={rename}
              onDelete={del}
              getCount={getCount}
            />
          ))}
          {tree.length === 0 && (
            <div className="empty-state">Sin carpetas todavía.<br/>Crea una para empezar.</div>
          )}
        </div>
        {active ? (
          <div className="note-editor">
            <div className="note-toolbar">
              <button className="tb" title="Negrita"><b>B</b></button>
              <button className="tb" title="Cursiva"><i>I</i></button>
              <span className="tb-sep" />
              <button className="tb" title="Título 1">H1</button>
              <button className="tb" title="Título 2">H2</button>
              <span className="tb-sep" />
              <button className="tb" title="Lista">— list</button>
              <button className="tb" title="Código">{ "{ }" }</button>
            </div>
            <input
              className="note-title"
              value={active.name}
              onChange={(e) => update(active.id, { name: e.target.value })}
              placeholder="Sin título"
            />
            <textarea
              className="note-body"
              value={active.body || ""}
              onChange={(e) => update(active.id, { body: e.target.value })}
              placeholder="Empieza a escribir…"
            />
          </div>
        ) : (
          <div className="empty-state" style={{ padding: 60 }}>
            Selecciona o crea una nota para empezar.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bookmarks (organized in colored folders) ───────────────────────────
const BOOKMARK_FOLDERS = [
  {
    id: "bf1", name: "Redes sociales", color: "rose",
    items: [
      { name: "Instagram",  url: "instagram.com",     glyph: "Ig" },
      { name: "LinkedIn",   url: "linkedin.com",      glyph: "Li" },
      { name: "WhatsApp",   url: "web.whatsapp.com",  glyph: "Wa" },
      { name: "X / Twitter",url: "x.com",             glyph: "X"  },
      { name: "ArtStation", url: "artstation.com",    glyph: "As" },
    ],
  },
  {
    id: "bf2", name: "Trabajo", color: "indigo",
    items: [
      { name: "Gmail",     url: "mail.google.com",  glyph: "M" },
      { name: "Notion",    url: "notion.so",        glyph: "N" },
      { name: "Drive",     url: "drive.google.com", glyph: "Gd" },
      { name: "Slack",     url: "slack.com",        glyph: "Sl" },
      { name: "Calendar",  url: "calendar.google.com", glyph: "Ca" },
    ],
  },
];

function Bookmarks() {
  const [folders, setFolders] = React.useState(() => {
    try {
      const s = localStorage.getItem("pw_bookmarks_v2");
      if (s) return JSON.parse(s);
    } catch {}
    return BOOKMARK_FOLDERS;
  });
  const [open, setOpen] = React.useState(() => {
    try {
      const s = localStorage.getItem("pw_bookmarks_open");
      if (s) return JSON.parse(s);
    } catch {}
    const o = {}; folders.forEach(f => { o[f.id] = false; }); return o;
  });

  React.useEffect(() => {
    try { localStorage.setItem("pw_bookmarks_v2", JSON.stringify(folders)); } catch {}
  }, [folders]);

  React.useEffect(() => {
    try { localStorage.setItem("pw_bookmarks_open", JSON.stringify(open)); } catch {}
  }, [open]);

  const allOpen = folders.every(f => open[f.id]);
  function toggleAll() {
    const target = !allOpen;
    const o = {}; folders.forEach(f => { o[f.id] = target; }); setOpen(o);
  }

  function toggle(id) { setOpen(o => ({ ...o, [id]: !o[id] })); }
  function cycleColor(id) {
    setFolders(fs => fs.map(f => {
      if (f.id !== id) return f;
      const idx = FOLDER_COLORS.findIndex(c => c.id === f.color);
      const next = FOLDER_COLORS[(idx + 1) % FOLDER_COLORS.length];
      return { ...f, color: next.id };
    }));
  }

  const [dragging, setDragging] = React.useState(null); // {fromId, name}
  const [overFolder, setOverFolder] = React.useState(null);

  function onDragStart(e, fromId, name) {
    setDragging({ fromId, name });
    e.dataTransfer.effectAllowed = "move";
    try { e.dataTransfer.setData("text/plain", name); } catch {}
  }
  function onDragEnd() { setDragging(null); setOverFolder(null); }
  function onFolderDragOver(e, folderId) {
    if (!dragging) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (overFolder !== folderId) setOverFolder(folderId);
  }
  function onFolderDrop(e, toId) {
    e.preventDefault();
    if (!dragging) return;
    const { fromId, name } = dragging;
    if (fromId === toId) { onDragEnd(); return; }
    setFolders(fs => {
      const item = fs.find(f => f.id === fromId)?.items.find(i => i.name === name);
      if (!item) return fs;
      return fs.map(f => {
        if (f.id === fromId) return { ...f, items: f.items.filter(i => i.name !== name) };
        if (f.id === toId)   return { ...f, items: [...f.items, item] };
        return f;
      });
    });
    if (!open[toId]) setOpen(o => ({ ...o, [toId]: true }));
    onDragEnd();
  }

  // Add bookmark modal
  const [adding, setAdding] = React.useState(null); // null | { folderId, name, url, glyph }
  function startAdd() {
    setAdding({ folderId: folders[0]?.id || "", name: "", url: "", glyph: "" });
  }
  function commitAdd() {
    if (!adding) return;
    const { folderId, name, url, glyph } = adding;
    if (!name.trim() || !url.trim()) return;
    const g = (glyph || name).trim().slice(0, 2).toUpperCase();
    setFolders(fs => fs.map(f => f.id === folderId
      ? { ...f, items: [...f.items, { name: name.trim(), url: url.trim(), glyph: g }] }
      : f
    ));
    if (!open[folderId]) setOpen(o => ({ ...o, [folderId]: true }));
    setAdding(null);
  }

  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title"><span className="dot"/> Marcadores</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn" onClick={toggleAll}>{allOpen ? "Plegar todo" : "Expandir todo"}</button>
          <button className="btn" onClick={startAdd}><IconPlus/> Añadir</button>
        </div>
      </div>
      <div className="bm-folders">
        {folders.map(f => (
          <div
            key={f.id}
            onDragOver={(e) => onFolderDragOver(e, f.id)}
            onDragLeave={() => setOverFolder(o => o === f.id ? null : o)}
            onDrop={(e) => onFolderDrop(e, f.id)}
            className={overFolder === f.id ? "bm-folder-over" : ""}
          >
            <div className={`bm-folder-head ${open[f.id] ? "open" : ""}`} onClick={() => toggle(f.id)}>
              <span
                className="swatch"
                style={{ background: colorOf(f.color), cursor: "pointer" }}
                onClick={(e) => { e.stopPropagation(); cycleColor(f.id); }}
                title="Cambiar color"
              />
              <span className="nm">{f.name}</span>
              <span className="ct">{f.items.length}</span>
            </div>
            {open[f.id] && (
              <div className="bm-grid">
                {f.items.map(b => (
                  <a
                    key={b.name}
                    className="bm-tile"
                    href={b.url.startsWith("http") ? b.url : `https://${b.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={b.url}
                    draggable
                    onDragStart={(e) => onDragStart(e, f.id, b.name)}
                    onDragEnd={onDragEnd}
                    style={{ opacity: dragging?.fromId === f.id && dragging?.name === b.name ? 0.4 : 1 }}
                  >
                    <span className="accent" style={{ background: colorOf(f.color) }}/>
                    <div className="glyph">{b.glyph}</div>
                    <div className="nm">{b.name}</div>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {adding && (
        <div className="bm-modal-backdrop" onClick={() => setAdding(null)}>
          <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bm-modal-head">
              <h3>Añadir marcador</h3>
              <button className="icon-btn" onClick={() => setAdding(null)} title="Cerrar">×</button>
            </div>
            <div className="bm-modal-body">
              <label>
                <span>Carpeta</span>
                <select value={adding.folderId} onChange={(e) => setAdding({ ...adding, folderId: e.target.value })}>
                  {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </label>
              <label>
                <span>Nombre</span>
                <input
                  autoFocus
                  value={adding.name}
                  onChange={(e) => setAdding({ ...adding, name: e.target.value })}
                  placeholder="Ej. GitHub"
                />
              </label>
              <label>
                <span>URL</span>
                <input
                  value={adding.url}
                  onChange={(e) => setAdding({ ...adding, url: e.target.value })}
                  placeholder="github.com"
                  onKeyDown={(e) => { if (e.key === "Enter") commitAdd(); }}
                />
              </label>
              <label>
                <span>Glifo</span>
                <input
                  value={adding.glyph}
                  maxLength={2}
                  onChange={(e) => setAdding({ ...adding, glyph: e.target.value })}
                  placeholder="GH (opcional)"
                />
              </label>
            </div>
            <div className="bm-modal-foot">
              <button className="btn" onClick={() => setAdding(null)}>Cancelar</button>
              <button className="btn solid" onClick={commitAdd} disabled={!adding.name.trim() || !adding.url.trim()}>Añadir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Quick links ────────────────────────────────────────────────────────
const QUICK = [
  { name: "Nuevo proyecto",  k: "⌘ N" },
  { name: "Buscar archivos", k: "⌘ K" },
  { name: "Crear nota",      k: "⌘ ⇧ N" },
  { name: "Abrir mercados",  k: "⌘ M" },
  { name: "Hablar con IA",   k: "⌘ I" },
  { name: "Configuración",   k: "⌘ ," },
];

function QuickLinks() {
  return (
    <div className="card">
      <div className="card-head">
        <div className="card-title"><span className="dot"/> Acceso rápido</div>
        <div className="card-meta mono">6 atajos</div>
      </div>
      <div className="quick-grid">
        {QUICK.map(q => (
          <div key={q.name} className="quick">
            <IconLink/>
            <span>{q.name}</span>
            <span className="k">{q.k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Personal page ──────────────────────────────────────────────────────
function PersonalPage({ username }) {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 6) return "Buena madrugada";
    if (h < 13) return "Buenos días";
    if (h < 20) return "Buenas tardes";
    return "Buenas noches";
  })();

  const [events, addEvent, deleteEvent] = useEvents();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{greeting}, {username}.</h1>
          <p className="lede">Aquí tienes tu día a día. Todo en un sitio.</p>
        </div>
      </div>

      <div style={{ marginBottom: "var(--gap)" }}><Clock/></div>

      <UpcomingStrip events={events} />

      <div className="grid grid-personal">
        <div className="col-12"><Calendar events={events} addEvent={addEvent} deleteEvent={deleteEvent}/></div>
        <div className="col-12"><Notes/></div>
      </div>
    </>
  );
}

function UpcomingStrip({ events }) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const key = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
  const todayEvents = (events[key] || []).slice().sort((a, b) =>
    (a.time || "99:99").localeCompare(b.time || "99:99")
  );

  return (
    <div className="upcoming-strip">
      <div className="upcoming-label">
        <div className="lbl">— Hoy</div>
        <div className="ttl">Para hacer</div>
      </div>
      {todayEvents.length === 0 ? (
        <div className="upcoming-empty">Nada programado para hoy. Día libre.</div>
      ) : todayEvents.map((e, i) => (
        <div key={i} className="upcoming-item">
          <div className="when today">
            <span>Hoy</span>
            {e.time && <span style={{ color: "var(--fg-3)" }}>· {e.time}</span>}
          </div>
          <div className="ttl">{e.title}</div>
          {e.note && <div className="nt">{e.note}</div>}
        </div>
      ))}
    </div>
  );
}

window.PersonalPage = PersonalPage;
