import { useState } from "react";

export default function Auth({ onLogin, onRegister, error, clearError }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError?.();
    setSubmitting(true);
    try {
      if (mode === "login") {
        await onLogin({ email, password });
      } else {
        await onRegister({ email, password, name });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setEmail("");
    setPassword("");
    setName("");
    clearError?.();
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass">
        <h2 className="auth-title">
          {mode === "login" ? "Sign in" : "Create account"}
        </h2>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Sign in to manage your todos"
            : "Register to get started"}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-banner" role="alert">
              {error}
            </div>
          )}
          {mode === "register" && (
            <input
              type="text"
              className="auth-input"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              aria-label="Name"
            />
          )}
          <input
            type="email"
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            aria-label="Email"
          />
          <input
            type="password"
            className="auth-input"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            aria-label="Password"
          />
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting
              ? "Please wait…"
              : mode === "login"
              ? "Sign in"
              : "Register"}
          </button>
        </form>
        <button
          type="button"
          className="auth-switch"
          onClick={switchMode}
          aria-label={
            mode === "login" ? "Switch to register" : "Switch to sign in"
          }
        >
          {mode === "login"
            ? "Don’t have an account? Register"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
