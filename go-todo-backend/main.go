package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"
)

type Todo struct {
	ID   int    `json:"id"`
	Task string `json:"task"`
	Done bool   `json:"done"`
}

var (
	todos   = []Todo{}
	nextID  = 1
	todoMux = &sync.Mutex{}
)

func main() {
	http.HandleFunc("/todos", handleTodos)
	http.HandleFunc("/todos/", handleTodoByID)
	
	fmt.Println("Server is running on port 8080...")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("Error starting server:", err)
	}
}

// Add CORS headers for all responses
func addCORSHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func handleTodos(w http.ResponseWriter, r *http.Request) {
	addCORSHeaders(w)

	switch r.Method {
	case http.MethodGet:
		getTodos(w)
	case http.MethodPost:
		addTodo(w, r)
	case http.MethodOptions:
		// Preflight request for CORS
		w.WriteHeader(http.StatusOK)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleTodoByID(w http.ResponseWriter, r *http.Request) {
	addCORSHeaders(w)

	idStr := r.URL.Path[len("/todos/"):]
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodPut:
		updateTodo(w, r, id)
	case http.MethodDelete:
		deleteTodo(w, id)
	case http.MethodOptions:
		// Preflight request for CORS
		w.WriteHeader(http.StatusOK)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func getTodos(w http.ResponseWriter) {
	todoMux.Lock()
	defer todoMux.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todos)
}

func addTodo(w http.ResponseWriter, r *http.Request) {
	todoMux.Lock()
	defer todoMux.Unlock()

	var todo Todo
	err := json.NewDecoder(r.Body).Decode(&todo)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	todo.ID = nextID
	nextID++
	todos = append(todos, todo)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todo)
}

func updateTodo(w http.ResponseWriter, r *http.Request, id int) {
	todoMux.Lock()
	defer todoMux.Unlock()

	var updatedTodo Todo
	err := json.NewDecoder(r.Body).Decode(&updatedTodo)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	for i := range todos {
		if todos[i].ID == id {
			todos[i].Task = updatedTodo.Task
			todos[i].Done = updatedTodo.Done
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(todos[i])
			return
		}
	}

	http.Error(w, "Todo not found", http.StatusNotFound)
}

func deleteTodo(w http.ResponseWriter, id int) {
	todoMux.Lock()
	defer todoMux.Unlock()

	for i := range todos {
		if todos[i].ID == id {
			todos = append(todos[:i], todos[i+1:]...)
			w.WriteHeader(http.StatusOK)
			return
		}
	}

	http.Error(w, "Todo not found", http.StatusNotFound)
}
