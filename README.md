# Taskspace: Multi-Page Todo Application

Taskspace is a production-ready, feature-rich **Multi-Page Todo Application** designed with a modern React frontend and a robust Express.js backend. Rather than being a Single Page Application (SPA), Taskspace uses distinct, separate page entries served dynamically by the backend, ensuring full-page lifecycle transitions between the dashboard and detailed task workspaces.

All application states and user interactions are synchronized securely with a server-side, file-based JSON database (`todos.json`).

---

## 🎨 Architectural Design & User Experience

The application splits into two core multi-page routes:

1. **Dashboard Home Page (`/` -> `index.html`)**: Focuses on managing, filtering, sorting, and adding todos. It renders beautiful Bento-style dashboard stats, a powerful filter/sort system, and an advanced task creation form.
2. **Task Detail Page (`/todo?id=<id>` -> `todo.html`)**: A dedicated focus workspace for a single selected todo. It enables detailed subtask checking, inline edits of title, description, priority, category, due dates, and an auto-saved notes playground.

### 🌟 Visual System
- **Slate & Charcoal Theme**: Designed with deep slate grays, pristine off-whites, and soft indigo accent lines.
- **Typography Pairing**: Features **Inter** for responsive, readable user interface elements, coupled with **JetBrains Mono** for status flags, creation timestamps, metadata, and analytics counters.
- **Micro-Animations**: Uses gentle color state changes, spinners, and hover scales to direct attention organically.

---

## 🚀 Key Features & Functionalities

### 1. Multi-Dimensional Dashboard Statistics (Bento Layout)
- **Total Tasks**: Overall count of all active and completed tasks.
- **Completed**: Total tasks successfully marked as finished.
- **Pending**: Remaining active tasks requiring action.
- **High Priority**: Prominently highlights critical, uncompleted tasks to prevent oversight.

### 2. Multi-Faceted Query Filters & Search
- **Full-Text Live Search**: Instantly filters titles and descriptions on every keystroke.
- **Lifecycle Filters**: Quickly segment tasks by **All**, **Active**, and **Completed** statuses.
- **Priority Filtering**: Filter list specifically for **High**, **Medium**, or **Low** priority tags.
- **Dynamic Category Filter**: Auto-aggregates actual categories stored in your list to populate an isolated select option.

### 3. Task Sorting Engine
- Sort tasks dynamically by **Created Date** (newest or oldest first), **Due Date** (urgent or long-term first), or **Priority** weight (high to low).
- Toggle sort orders instantly (Ascending ⇄ Descending) with smooth rotating visual states.

### 4. Rich Creation Form (Add Todo)
- **Required Fields**: Input validation for task title.
- **Subtask List Constructor**: Build an interactive, live list of action subtasks *before* submitting the form. Items can be dynamically deleted or added inline.
- **Context Details**: Choose priority levels (🟢 Low, 🟡 Medium, 🔴 High), assign targeted categories (Personal, Work, Shopping, Home, Health, Education), specify clear calendar due dates, and append supplemental description/notes block.

### 5. Interactive Detail Workspace (Single Todo Page)
- **Lifecycle Toggles**: Check/uncheck completion states from both the dashboard and the detail page, updating metadata instantly.
- **Action Step Checklist**: Interactive, tickable checklists where users can check off subtasks, append new subtasks, or delete subtasks. 
- **Auto-Saving Workspace Notes**: A dedicated focus area where you can write supplemental logs. Notes auto-save securely to the Express backend on `onBlur` (focusing out of the textarea).
- **Inline Editing Console**: Toggle "Edit Mode" to modify the core title, description, priority, category, or due date instantly without leaving the workspace.
- **Absolute Page Isolation**: Navigating back via "Back to Dashboard" performs a full page reload, perfectly honoring the multi-page specification.

---

## 💾 Server-Side Data Storage (Database Schema)

Data is saved persistently in `/todos.json` at the root directory of the server. On system launch, the server automatically boots, creates the database file if missing, and gracefully handles reads and writes.

Each **Todo** object conforms strictly to the following TypeScript interface (`/src/types.ts`):

```typescript
export interface SubTask {
  id: string;      // Unique subtask timestamp ID
  title: string;   // Title of the subtask
  completed: boolean; // Completion boolean flag
}

export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;          // Primary key ID (Epoch string)
  title: string;       // Task title
  description: string; // Task descriptive paragraph
  completed: boolean;  // Task completion boolean flag
  priority: Priority;  // Priority string level
  category: string;    // Task group category tag
  dueDate: string;     // Calendar target due date (YYYY-MM-DD)
  createdAt: string;   // ISO-8601 created timestamp
  updatedAt: string;   // ISO-8601 last-modified timestamp
  subtasks: SubTask[]; // Subtasks list
  notes: string;       // Detailed documentation / Markdown notes
}
```

---

## 🛠️ REST API Endpoints (Express.js Backend)

The Express server listens on port `3000` and exposes the following clean CRUD REST interface:

### 1. Get All Todos
* **Endpoint**: `GET /api/todos`
* **Response**: `200 OK` - Array of all Todo objects.

### 2. Get Single Todo
* **Endpoint**: `GET /api/todos/:id`
* **Response**: 
  - `200 OK` - Detailed Todo object.
  - `404 Not Found` - `{ "error": "Todo item not found" }` if the ID is missing.

### 3. Create Todo
* **Endpoint**: `POST /api/todos`
* **Body (JSON)**:
  ```json
  {
    "title": "Build backend",
    "description": "Implement Express server",
    "priority": "high",
    "category": "Work",
    "dueDate": "2026-07-01",
    "notes": "Must support multi-page HTML routing",
    "subtasks": [
      { "title": "Configure bundle script", "completed": false }
    ]
  }
  ```
* **Response**: `201 Created` - Newly formed Todo object including auto-generated `id`, `createdAt`, `updatedAt`, and defaults.

### 4. Update Todo
* **Endpoint**: `PUT /api/todos/:id`
* **Body (JSON)**: Any partial fields of the Todo interface to overwrite (e.g. `{ "completed": true }`).
* **Response**: `200 OK` - Overwritten Todo object with refreshed `updatedAt` field.

### 5. Delete Todo
* **Endpoint**: `DELETE /api/todos/:id`
* **Response**: `200 OK` - `{ "success": true, "message": "Todo item deleted successfully" }`.

### 6. Dashboard Statistics
* **Endpoint**: `GET /api/todos-stats`
* **Response**: `200 OK` - Structured count analytics.

---

## ⚡ Setup & Local Development Commands

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
This boots the full-stack server using `tsx`, mounting the Express backend on port `3000` and attaching the Vite dev server middlewares for hot-reloading client compilation.
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 3. Compile Production Bundle
Vite compiles the separate frontend page entry points into static HTML and JS bundles inside the `/dist` directory. Then, `esbuild` bundles `/server.ts` into a self-contained CommonJS Node script inside `/dist/server.cjs` for ultimate runtime performance and deployment portability.
```bash
npm run build
```

### 4. Run Production Build
Launches the high-performance compiled server.
```bash
npm run start
```

---

## 💾 Exporting to GitHub / Downloading ZIP

To export Taskspace to your personal GitHub repository or download a fully portable ZIP:

1. Click the **Settings (Gear Icon)** in the top right corner of the Google AI Studio page.
2. Select **Export to GitHub** to authorize and push this entire repository with files, code, and documentation directly into a new or existing repository.
3. Alternatively, click **Download ZIP** to save the entire source structure locally on your workstation.
