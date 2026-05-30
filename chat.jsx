// chat.jsx — Análisis Mercado

const QUICK_ACTIONS = [
  {
    label: "Analizar una acción",
    desc: "Diagnóstico técnico + fundamental",
    prompt: "Quiero analizar una acción. Pregunta cuál y dame: precio, tendencia, soportes/resistencias, catalizadores y un veredicto corto.",
  },
  {
    label: "Top que más suben",
    desc: "Mayores subidas de la sesión",
    prompt: "Dame las acciones que más suben hoy con %, motivo del movimiento y si la tendencia tiene continuidad.",
  },
  {
    label: "Top que más bajan",
    desc: "Mayores caídas de la sesión",
    prompt: "Dame las acciones que más bajan hoy con %, motivo del movimiento y si el desplome puede continuar.",
  },
  {
    label: "Mayor probabilidad de subir hoy",
    desc: "Setup técnico diario",
    prompt: "¿Qué acciones tienen mayor probabilidad de subir en la sesión de hoy? Dame top 5 con razonamiento corto y probabilidad estimada.",
  },
  {
    label: "Mayor probabilidad semanal",
    desc: "Setup técnico de la semana",
    prompt: "¿Qué acciones tienen mayor probabilidad de subir esta semana? Top 5 con razonamiento y probabilidad estimada.",
  },
];

const SUGGESTIONS = [
  "Resumen de mercados de hoy",
  "¿Qué mueve a Nvidia esta semana?",
  "Análisis técnico de Bitcoin",
  "Riesgos macro para los próximos 30 días",
];

const MOCK_REPLIES = {
  default: "Estoy en modo demo, así que mis respuestas son simuladas. Pero puedo darte un panorama: las bolsas vienen mixtas, con tecnología liderando en EE.UU. mientras Europa cotiza más plana. ¿Te interesa algún sector o activo concreto?",
  "resumen": "Resumen rápido de hoy:\n\n• S&P 500 +0.42% — liderado por tecnología y consumo discrecional.\n• NASDAQ 100 +0.78% — Nvidia y Microsoft tirando del índice.\n• Bitcoin -1.23% — corrección después de tres sesiones al alza.\n• EUR/USD plano en 1.0824, a la espera de la Fed.\n\nTitular del día: la Fed mantiene tipos pero abre la puerta a recortes en septiembre.",
  "nvidia": "Nvidia (NVDA) sube +2.34% hoy y acumula +18% en el último mes. Catalizadores principales:\n\n1. Presentación de la nueva arquitectura Rubin para data centers.\n2. Pedidos confirmados por hyperscalers (MSFT, AMZN, GOOG).\n3. Guidance optimista para Q3 — el mercado descuenta otra sorpresa positiva.\n\nRiesgos: concentración de clientes y posibles restricciones a exportación a China. Soporte clave: $128. Resistencia: $145.",
  "bitcoin": "Bitcoin (BTC) en $71,284 con caída -1.23% en 24h. Análisis técnico simulado:\n\n• Soporte: $68,500 (media móvil 50d).\n• Resistencia: $74,000 (máximos recientes).\n• RSI: 52 — terreno neutro.\n• Volumen 24h: por debajo de la media de 30 días.\n\nLa estructura de medio plazo sigue siendo alcista mientras se mantenga sobre $66k.",
  "riesgo": "Principales riesgos macro a vigilar en los próximos 30 días:\n\n1. Decisión de la Fed (19 de junio) — mercado descuenta primer recorte en septiembre.\n2. Datos de empleo no agrícola en EE.UU. — clave para el path de tipos.\n3. Tensión geopolítica en Oriente Medio y su impacto en el petróleo.\n4. Resultados de Nvidia el día 28 — sesgo del mercado depende de su guidance.\n5. Elecciones presidenciales en LatAm con efecto sobre divisas emergentes.",
};

function pickReply(text) {
  const t = text.toLowerCase();
  if (t.includes("resumen") || t.includes("hoy") || t.includes("mercado")) return MOCK_REPLIES["resumen"];
  if (t.includes("nvidia") || t.includes("nvda")) return MOCK_REPLIES["nvidia"];
  if (t.includes("bitcoin") || t.includes("btc")) return MOCK_REPLIES["bitcoin"];
  if (t.includes("riesgo") || t.includes("macro")) return MOCK_REPLIES["riesgo"];
  return MOCK_REPLIES["default"];
}

function ChatPage({ username }) {
  const [messages, setMessages] = React.useState([
    {
      role: "assistant",
      text: "¿Qué quieres hacer hoy?",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const bodyRef = React.useRef(null);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing]);

  async function send(text) {
    const t = (text ?? input).trim();
    if (!t || typing) return;
    const next = [...messages, { role: "user", text: t }];
    setMessages(next);
    setInput("");
    setTyping(true);

    // Try Claude if available, else mock
    let reply = null;
    try {
      if (window.claude && typeof window.claude.complete === "function") {
        const sys = "Eres un asistente financiero conciso y útil. Respondes en español, con bullets cuando aplique. No inventes precios concretos; si te piden datos en tiempo real, recuerda que estás en una demo.";
        const convo = next.map(m => `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.text}`).join("\n\n");
        const prompt = `${sys}\n\n${convo}\n\nAsistente:`;
        const result = await Promise.race([
          window.claude.complete(prompt),
          new Promise((_, rj) => setTimeout(() => rj(new Error("timeout")), 10000)),
        ]);
        if (result && typeof result === "string") reply = result.trim();
      }
    } catch (e) {
      reply = null;
    }
    if (!reply) {
      await new Promise(r => setTimeout(r, 700 + Math.random() * 600));
      reply = pickReply(t);
    }
    setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    setTyping(false);
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Análisis Mercado</h1>
          <p className="lede">Chat entrenado para analizar acciones, top movers y probabilidades.</p>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => setMessages([{ role: "assistant", text: "¿Qué quieres hacer hoy?" }])}>Limpiar conversación</button>
        </div>
      </div>

      <div className="chat-root">
        <div className="chat-head">
          <div className="ai-avatar">AI</div>
          <div>
            <h3>Análisis Mercado</h3>
            <small><span className="status-dot"/>Online · entrenado para mercados</small>
          </div>
        </div>

        <div className="chat-body" ref={bodyRef}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === "user" ? "user" : ""}`}>
              <div className="av">{m.role === "user" ? (window.initials ? window.initials(username) : username.slice(0,2).toUpperCase()) : "AI"}</div>
              <div className="bubble">
                <div className="who">{m.role === "user" ? "Tú" : "Asistente"}</div>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
              </div>
            </div>
          ))}
          {typing && (
            <div className="msg">
              <div className="av">AI</div>
              <div className="bubble">
                <div className="who">Asistente</div>
                <div className="typing"><span/><span/><span/></div>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <>
            <div className="chat-actions">
              {QUICK_ACTIONS.map(a => (
                <button key={a.label} className="chat-action" onClick={() => send(a.prompt)}>
                  <span className="label">{a.label}</span>
                  <span className="desc">{a.desc}</span>
                </button>
              ))}
            </div>
            <div className="chat-suggest">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </>
        )}

        <div className="chat-input-wrap">
          <textarea
            className="chat-input"
            placeholder="Pregunta sobre mercados, activos o macro…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
          />
          <button className="chat-send" onClick={() => send()} disabled={!input.trim() || typing}>
            <IconSend/>
          </button>
        </div>
      </div>
    </>
  );
}

window.ChatPage = ChatPage;
