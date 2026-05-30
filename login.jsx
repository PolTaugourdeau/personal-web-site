// login.jsx — split-screen login with grid pattern + credentials demo

function Login({ onLogin }) {
  const [user, setUser] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const VALID_USER = "poltaug";
  const VALID_PASS = "poltaug";

  function submit(e) {
    e && e.preventDefault();
    if (loading) return;
    setErr("");
    setLoading(true);
    setTimeout(() => {
      if (user.trim() === VALID_USER && pass === VALID_PASS) {
        onLogin(user.trim());
      } else {
        setErr("Credenciales incorrectas. Inténtalo de nuevo.");
        setLoading(false);
      }
    }, 450);
  }

  const now = new Date();
  const time = now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="login-root">
      <aside className="login-side">
        <div className="login-brand">
          <div className="mark">P</div>
          <span>Personal Workspace</span>
        </div>

        <div className="login-tagline">
          <h1>Tu día,<br/>tus mercados,<br/>tus ideas.</h1>
          <p>Un espacio personal y privado donde planificar, escribir, seguir tus inversiones y conversar con un asistente que entiende los mercados.</p>
        </div>

        <div className="login-meta">
          <div>{date.charAt(0).toUpperCase() + date.slice(1)}<span>{time}</span></div>
          <div>Build 2026.05<span>v1.0.0</span></div>
          <div>Sesión<span>Local · cifrada</span></div>
        </div>
      </aside>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={submit}>
          <h2>Bienvenido de nuevo</h2>
          <p className="sub">Inicia sesión para continuar en tu workspace.</p>

          <div className="field">
            <label htmlFor="u">Usuario</label>
            <input
              id="u"
              type="text"
              autoComplete="username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="p">Contraseña</label>
            <input
              id="p"
              type="password"
              autoComplete="current-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {err && <div className="login-error">{err}</div>}

          <button className="btn-primary" type="submit" disabled={loading || !user || !pass}>
            {loading ? "Entrando…" : <>Entrar <IconArrow /></>}
          </button>

          <div className="login-hint">
            {/* Demo - usuario: poltaug / contraseña: poltaug */}
          </div>

          <div className="login-footer">© 2026 · Personal Workspace</div>
        </form>
      </div>
    </div>
  );
}

window.Login = Login;
