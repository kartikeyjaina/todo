import { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Auth from "./components/Auth";
import TodoList from "./components/TodoList";
import TodoForm from "./components/TodoForm";
import { api } from "./api";

function TodoApp() {
  const { token, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodos = useCallback(async () => {
    if (!token) return;
    try {
      setError(null);
      const data = await api("/todos");
      setTodos(data);
    } catch (err) {
      setError(err.message);
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const addTodo = async (text) => {
    try {
      const todo = await api("/todos", {
        method: "POST",
        body: JSON.stringify({ text }),
      });
      setTodos((prev) => [todo, ...prev]);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTodo = async (id, updates) => {
    try {
      const updated = await api(`/todos/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api(`/todos/${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;
    await updateTodo(id, { completed: !todo.completed });
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div>
            <h1 className="title">Todo</h1>
            <p className="subtitle">Keep your tasks in one place</p>
          </div>
          <button
            type="button"
            className="btn btn-ghost logout-btn"
            onClick={logout}
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="main">
        <TodoForm onAdd={addTodo} />
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        {loading ? (
          <div className="loading">Loading todos…</div>
        ) : (
          <TodoList
            todos={todos}
            onEdit={updateTodo}
            onDelete={deleteTodo}
            onComplete={toggleComplete}
          />
        )}
      </main>
    </div>
  );
}

function AppContent() {
  const { user, token, loading, login, logout } = useAuth();
  const [authError, setAuthError] = useState(null);

  const handleLogin = async ({ email, password }) => {
    setAuthError(null);
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }).catch((err) => {
      setAuthError(err.message);
      throw err;
    });
    login(data.user, data.token);
  };

  const handleRegister = async ({ email, password, name }) => {
    setAuthError(null);
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }).catch((err) => {
      setAuthError(err.message);
      throw err;
    });
    login(data.user, data.token);
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading…</div>
      </div>
    );
  }

  if (!token) {
    return (
      <Auth
        onLogin={handleLogin}
        onRegister={handleRegister}
        error={authError}
        clearError={() => setAuthError(null)}
      />
    );
  }

  return <TodoApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
