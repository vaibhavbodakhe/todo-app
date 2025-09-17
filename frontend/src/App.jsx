import { useState, useEffect } from "react";
import { FaClock } from "react-icons/fa";
import confetti from "canvas-confetti";
import "./App.css";

const API_URL = "https://todo-app-xj50.onrender.com"; // ✅ Your backend URL

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

  // ✅ Load todos from backend
  useEffect(() => {
    fetch(`${API_URL}/todos`)
      .then(res => res.json())
      .then(data => setTodos(data))
      .catch(err => console.error("❌ Failed to fetch todos:", err));
  }, []);

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

  // ✅ Add or Update Todo via backend
  const handleAddOrUpdateTodo = async () => {
    if (!newTodo.trim() || !time) return;

    if (editingTodo) {
      const res = await fetch(`${API_URL}/todos/${editingTodo._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTodo, time }),
      });
      const updatedTodo = await res.json();
      setTodos(todos.map(t => t._id === updatedTodo._id ? updatedTodo : t));
      setEditingTodo(null);
      speak("Todo updated!");
      playSound("success");
    } else {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: newTodo, time }),
      });
      const newTask = await res.json();
      setTodos([...todos, newTask]);
      speak(`Todo added: ${newTodo}`);
      playSound("success");
    }

    setNewTodo("");
    setTime("");
  };

  // ✅ Delete Todo via backend
  const handleDelete = async (id) => {
    await fetch(`${API_URL}/todos/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t._id !== id));
    speak("Todo deleted");
    playSound("delete");
  };

  // ✅ Edit Todo
  const handleEdit = (todo) => {
    setNewTodo(todo.task);
    setTime(todo.time ? new Date(todo.time).toISOString().slice(0, 16) : "");
    setEditingTodo(todo);
  };

  // ✅ Toggle Complete
  const handleComplete = async (id) => {
    const todo = todos.find((t) => t._id === id);
    const res = await fetch(`${API_URL}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    const updatedTodo = await res.json();
    setTodos(todos.map((t) => (t._id === id ? updatedTodo : t)));

    if (!todo.completed) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
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
                <button className="edit-btn" onClick={() => handleEdit(todo)}>✏️</button>
                <button className="delete-btn" onClick={() => handleDelete(todo._id)}>❌</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
