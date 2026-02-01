import { useState } from "react";

export default function TodoItem({ todo, onEdit, onDelete, onComplete }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSaveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== todo.text) {
      onEdit(todo._id, { text: trimmed });
    } else {
      setEditText(todo.text);
    }
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSaveEdit();
    if (e.key === "Escape") {
      setEditText(todo.text);
      setEditing(false);
    }
  };

  return (
    <li className={`todo-item glass ${todo.completed ? "completed" : ""}`}>
      <button
        type="button"
        className="complete-btn"
        onClick={() => onComplete(todo._id)}
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
        title={todo.completed ? "Mark incomplete" : "Mark complete"}
      >
        {todo.completed ? "✓" : "○"}
      </button>
      {editing ? (
        <input
          type="text"
          className="todo-edit-input"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          autoFocus
          aria-label="Edit todo"
        />
      ) : (
        <span
          className="todo-text"
          onClick={() => setEditing(true)}
          onFocus={() => setEditing(true)}
          tabIndex={0}
          role="button"
        >
          {todo.text}
        </span>
      )}
      <div className="todo-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setEditing(true)}
          aria-label="Edit todo"
        >
          Edit
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-danger"
          onClick={() => onDelete(todo._id)}
          aria-label="Delete todo"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
