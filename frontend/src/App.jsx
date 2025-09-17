import { useState, useEffect } from "react";
import { FaClock } from "react-icons/fa";
import confetti from "canvas-confetti";
import "./App.css";

function App() {
  const gradients = [
    "linear-gradient(135deg, #f9f871, #f6d365, #fda085)",
    "linear-gradient(135deg, #a1c4fd, #c2e9fb)",
    "linear-gradient(135deg, #ffecd2, #fcb69f)",
    "linear-gradient(135deg, #ff9a9e, #fecfef)",
    "linear-gradient(135deg, #89f7fe, #66a6ff)",
    "linear-gradient(135deg, #fddb92, #d1fdff)",
  ];

  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [time, setTime] = useState("");
  const [search, setSearch] = useState("");
  const [editingTodo, setEditingTodo] = useState(null);
  const [bg, setBg] = useState(gradients[0]);

  // 🎤 Speak function
  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 1;
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  };

  // 🔊 Play sound
  const playSound = (type) => {
    const audio =
      type === "success"
        ? new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg")
        : new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
    audio.play();
  };

  // ✅ Load todos from localStorage on first render
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // ✅ Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // ✅ Add or Update Todo
  const handleAddOrUpdateTodo = () => {
    if (!newTodo.trim() || !time) return;

    if (editingTodo) {
      setTodos(
        todos.map((t) =>
          t._id === editingTodo._id ? { ...t, task: newTodo, time } : t
        )
      );
      setEditingTodo(null);
      speak("Todo updated!");
      playSound("success");
    } else {
      const newTask = {
        _id: Date.now().toString(),
        task: newTodo,
        time,
        completed: false,
        color: gradients[Math.floor(Math.random() * gradients.length)],
      };
      setTodos([...todos, newTask]);
      speak(`Todo added: ${newTodo}`);
      playSound("success");
    }

    setNewTodo("");
    setTime("");
  };

  // ✅ Delete Todo
  const handleDelete = (id) => {
    const todo = todos.find((t) => t._id === id);
    setTodos(todos.filter((t) => t._id !== id));
    speak(`Deleted ${todo.task}`);
    playSound("delete");
  };

  // ✅ Edit Todo
  const handleEdit = (todo) => {
    setNewTodo(todo.task);
    setTime(todo.time);
    setEditingTodo(todo);
  };

  // ✅ Toggle Complete with confetti + gradient change
  const handleComplete = (id) => {
    setTodos(
      todos.map((t) =>
        t._id === id ? { ...t, completed: !t.completed } : t
      )
    );

    const todo = todos.find((t) => t._id === id);
    if (todo && !todo.completed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setBg(gradients[Math.floor(Math.random() * gradients.length)]);
      speak(`Congratulations! You completed ${todo.task}`);
      playSound("success");
    }
  };

  // ✅ Search Filter
  const filteredTodos = todos.filter((todo) =>
    todo.task.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app-wrapper" style={{ background: bg }}>
      <div className="app-container">
        <h1 className="app-title">
          <FaClock className="clock-icon" /> Todo App
        </h1>

        {/* Search */}
        <input
          className="search"
          type="text"
          placeholder="🔍 Search todo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Add Section */}
        <div className="add-section">
          <input
            className="add-input"
            type="text"
            placeholder="➕ Add a new todo..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
          />
          <input
            className="time-input"
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <button className="add-btn" onClick={handleAddOrUpdateTodo}>
            {editingTodo ? "Update ✏️" : "Add ✅"}
          </button>
        </div>

        {/* Todo List */}
        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <li
              key={todo._id}
              className={`todo-item ${todo.completed ? "completed" : ""}`}
              style={{ background: todo.color || gradients[0] }}
            >
              <div>
                <span className="todo-text">{todo.task}</span>
                {todo.time && (
                  <span className="todo-time">
                    ⏰ {new Date(todo.time).toLocaleString()}
                  </span>
                )}
              </div>
              <div>
                <button className="complete-btn" onClick={() => handleComplete(todo._id)}>
                  {todo.completed ? "✅ Undo" : "✔️ Done"}
                </button>
                <button className="edit-btn" onClick={() => handleEdit(todo)}>
                  ✏️
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(todo._id)}
                >
                  ❌
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
