# SQL Performance Dashboard

A full-stack developer tool built with **.NET 8 (C#)** and **React + TypeScript** to execute SQL queries, measure performance, and view execution history. Inspired by database-tool workflows (similar to Oracle / Visual Studio tooling) and designed as a lightweight, cloud-friendly service for SQL performance analysis and logging.

---

## 🚀 Features

- Execute arbitrary SQL queries against a SQLite backend  
- Measure execution time (ms), row count, and success/failure  
- Log every execution with timestamp, query text, results, and error messages  
- Visual dashboard (React) with:
  - Query editor  
  - Last execution summary  
  - Recent executions table  
- Backend built using ASP.NET Core + EF Core  
- Frontend built with React + TypeScript + Vite  
- Modular architecture — backend and frontend are fully decoupled  
- SQLite used locally; easily extendable to Oracle, PostgreSQL, MySQL, etc.

---

## 🧰 Tech Stack

| Layer         | Technology |
|---------------|------------|
| Backend API   | ASP.NET Core (.NET 8), C#, EF Core |
| Database      | SQLite (default) |
| Frontend UI   | React, TypeScript, Vite |
| Communication | REST API (JSON) |
| Dev Tools     | Git, GitHub, VS Code, macOS |

---

## 🏗️ Architecture Overview

[ React + TypeScript UI ] ⇆ [ ASP.NET Core Web API ] ⇆ [ EF Core + SQLite ]


- UI sends SQL queries →  
- API executes SQL, measures performance, logs info →  
- Results returned to UI →  
- UI shows summary + history dashboard  

---

## 📦 Getting Started (Local Setup)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/eghoAditya/sql-performance-dashboard.git
cd sql-performance-dashboard

2️⃣ Start the Backend (.NET API)
cd SqlPerformanceDashboard.Api
dotnet run
The terminal will show something like:
Now listening on: http://localhost:5286
Keep this running.
3️⃣ Start the Frontend (React)
Open a new terminal:
cd ../web
npm install
npm run dev
Open the URL printed by Vite, usually:
http://localhost:5173/
4️⃣ Use the Dashboard
Enter any SQL query in the editor (e.g., SELECT 1;)
Click Execute
See:
Execution time
Rows returned
Success / error
Check the Recent Executions table for history
🔌 API Endpoints
POST /api/sql/execute
Executes a SQL query and logs performance.
Request:
{
  "query": "SELECT 1"
}
Response:
{
  "id": 1,
  "durationMs": 2,
  "rowsReturned": 1,
  "isSuccessful": true,
  "errorMessage": null,
  "executedAtUtc": "2025-01-01T..."
}
GET /api/sql/logs
Returns the latest SQL execution logs.
