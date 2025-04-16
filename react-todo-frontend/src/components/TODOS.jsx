import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaWhatsapp } from "react-icons/fa";


// Backend API URL
const API_URL = "http://localhost:8080/todos";

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const phoneNumber = "761234786128"; // Replace with your WhatsApp number
  const message = "Hello, I'd like to chat with you!";

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };
  // Fetch todos when the component mounts
  useEffect(() => {
    fetchTodos();
  }, []);

  // Fetch all todos
  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setTodos(response.data);
    } catch (err) {
      console.error("Error fetching todos:", err);
      setError("Failed to fetch todos. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Add a new todo
  const addTodo = async () => {
    if (!newTask.trim()) return;
    setError(null);
    try {
      const response = await axios.post(API_URL, { task: newTask, done: false });
      setTodos([...todos, response.data]);
      setNewTask("");
    } catch (err) {
      console.error("Error adding todo:", err);
      setError("Failed to add todo. Please try again.");
    }
  };

  // Toggle todo completion
  const toggleTodo = async (id, done) => {
    setError(null);
    try {
      await axios.put(`${API_URL}/${id}`, { done: !done });
      fetchTodos();
    } catch (err) {
      console.error("Error updating todo:", err);
      setError("Failed to update todo. Please try again.");
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTodos();
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("Failed to delete todo. Please try again.");
    }
  };

  return (
    <div style={{ margin: "2rem" }}>
      <h1>Todo List</h1>
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task"
          style={{ marginRight: "0.5rem", padding: "0.5rem", fontSize: "1rem" }}
        />
        <button onClick={addTodo} style={{ padding: "0.5rem 1rem", fontSize: "1rem" }}>
          Add
        </button>
      </div>
      {loading ? (
        <p>Loading todos...</p>
      ) : (
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {todos.map((todo) => (
            <li key={todo.id} style={{ marginBottom: "1rem" }}>
              <span
                style={{
                  textDecoration: todo.done ? "line-through" : "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  marginRight: "1rem",
                }}
                onClick={() => toggleTodo(todo.id, todo.done)}
              >
                {todo.task}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Delete
              </button>
              <button
                onClick={handleClick}
                style={{
                  backgroundColor: "#25D366",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <FaWhatsapp size={24} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TodoApp;
