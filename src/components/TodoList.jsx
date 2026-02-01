import TodoItem from "./TodoItem";

export default function TodoList({ todos, onEdit, onDelete, onComplete }) {
  if (!todos.length) {
    return (
      <div className="empty-state">
        <p>No todos yet. Add one above.</p>
      </div>
    );
  }

  return (
    <ul className="todo-list" aria-label="Todo list">
      {todos.map((todo) => (
        <TodoItem
          key={todo._id}
          todo={todo}
          onEdit={onEdit}
          onDelete={onDelete}
          onComplete={onComplete}
        />
      ))}
    </ul>
  );
}
