import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;
  const DATA_FILE = path.resolve(process.cwd(), "todos.json");

  // Ensure database file exists
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }

  app.use(express.json());

  // Helper functions for file-based database
  const readTodos = () => {
    try {
      const data = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading todos database", e);
      return [];
    }
  };

  const writeTodos = (todos: any[]) => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
      return true;
    } catch (e) {
      console.error("Error writing todos database", e);
      return false;
    }
  };

  // API ROUTE: Get all todos (with optional filtering)
  app.get("/api/todos", (req, res) => {
    const todos = readTodos();
    res.json(todos);
  });

  // API ROUTE: Get a single todo by ID
  app.get("/api/todos/:id", (req, res) => {
    const todos = readTodos();
    const todo = todos.find((t: any) => t.id === req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo item not found" });
    }
    res.json(todo);
  });

  // API ROUTE: Create a new todo item
  app.post("/api/todos", (req, res) => {
    const { title, description, priority, category, dueDate, subtasks, notes } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const todos = readTodos();
    const newTodo = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description || "",
      completed: false,
      priority: priority || "medium",
      category: category || "General",
      dueDate: dueDate || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: subtasks || [],
      notes: notes || "",
    };

    todos.push(newTodo);
    writeTodos(todos);
    res.status(201).json(newTodo);
  });

  // API ROUTE: Update a todo item
  app.put("/api/todos/:id", (req, res) => {
    const todos = readTodos();
    const index = todos.findIndex((t: any) => t.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: "Todo item not found" });
    }

    const existing = todos[index];
    const { title, description, completed, priority, category, dueDate, subtasks, notes } = req.body;

    const updatedTodo = {
      ...existing,
      title: title !== undefined ? title.trim() : existing.title,
      description: description !== undefined ? description : existing.description,
      completed: completed !== undefined ? !!completed : existing.completed,
      priority: priority !== undefined ? priority : existing.priority,
      category: category !== undefined ? category : existing.category,
      dueDate: dueDate !== undefined ? dueDate : existing.dueDate,
      subtasks: subtasks !== undefined ? subtasks : existing.subtasks,
      notes: notes !== undefined ? notes : existing.notes,
      updatedAt: new Date().toISOString(),
    };

    todos[index] = updatedTodo;
    writeTodos(todos);
    res.json(updatedTodo);
  });

  // API ROUTE: Delete a todo item
  app.delete("/api/todos/:id", (req, res) => {
    const todos = readTodos();
    const filteredTodos = todos.filter((t: any) => t.id !== req.params.id);
    if (filteredTodos.length === todos.length) {
      return res.status(404).json({ error: "Todo item not found" });
    }

    writeTodos(filteredTodos);
    res.json({ success: true, message: "Todo item deleted successfully" });
  });

  // API ROUTE: Get dashboard stats
  app.get("/api/todos-stats", (req, res) => {
    const todos = readTodos();
    const total = todos.length;
    const completed = todos.filter((t: any) => t.completed).length;
    const pending = total - completed;
    const highPriority = todos.filter((t: any) => !t.completed && t.priority === "high").length;
    
    const byCategory: Record<string, number> = {};
    todos.forEach((t: any) => {
      const cat = t.category || "General";
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    res.json({
      total,
      completed,
      pending,
      highPriority,
      byCategory,
    });
  });

  // VITE OR STATIC FILE SERVING
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    // Dev endpoints for multi-page routing
    app.get("/", async (req, res, next) => {
      try {
        let html = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        html = await vite.transformIndexHtml("/", html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        next(e);
      }
    });

    app.get("/todo", async (req, res, next) => {
      try {
        let html = fs.readFileSync(path.resolve(process.cwd(), "todo.html"), "utf-8");
        html = await vite.transformIndexHtml("/todo.html", html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        next(e);
      }
    });

    // Let Vite serve everything else (client assets, HMR, etc.)
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");

    // Serve pre-built production HTML pages
    app.get("/", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });

    app.get("/todo", (req, res) => {
      res.sendFile(path.join(distPath, "todo.html"));
    });

    // Static asset serving for CSS, JS bundles
    app.use(express.static(distPath));

    // Wildcard fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}/`);
  });
}

startServer();
