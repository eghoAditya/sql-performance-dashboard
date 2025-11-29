import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5286"; // 🔴 IMPORTANT: change 5286 to the port your API printed if different

interface ExecuteResponse {
  id: number;
  durationMs: number;
  rowsReturned: number;
  isSuccessful: boolean;
  errorMessage: string | null;
  executedAtUtc: string;
}

interface LogEntry extends ExecuteResponse {
  queryText: string;
}

function App() {
  const [query, setQuery] = useState("SELECT 1;");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeResult, setExecuteResult] = useState<ExecuteResponse | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sql/logs`);
      if (!res.ok) {
        throw new Error(`Failed to load logs: ${res.status}`);
      }
      const data = await res.json();
      setLogs(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Failed to load logs");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExecute = async () => {
    setIsExecuting(true);
    setError(null);
    setExecuteResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/sql/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        throw new Error(`Execute failed: ${res.status}`);
      }

      const data: ExecuteResponse = await res.json();
      setExecuteResult(data);
      await fetchLogs();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e5e7eb", padding: "2rem" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          SQL Performance Dashboard
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#9ca3af" }}>
          Execute SQL against a local SQLite database and inspect execution time, row count, and history.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.5fr",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Left: query editor */}
          <div
            style={{
              background: "#020617",
              borderRadius: "0.75rem",
              padding: "1rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              SQL Query
            </h2>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%",
                minHeight: "140px",
                background: "#020617",
                color: "#e5e7eb",
                borderRadius: "0.5rem",
                border: "1px solid #1f2937",
                padding: "0.75rem",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                fontSize: "0.9rem",
                resize: "vertical",
              }}
            />

            <div
              style={{
                marginTop: "0.75rem",
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
              }}
            >
              <button
                onClick={handleExecute}
                disabled={isExecuting || !query.trim()}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "9999px",
                  border: "none",
                  cursor: isExecuting || !query.trim() ? "not-allowed" : "pointer",
                  background: isExecuting || !query.trim() ? "#4b5563" : "#22c55e",
                  color: "#020617",
                  fontWeight: 600,
                }}
              >
                {isExecuting ? "Executing..." : "Execute"}
              </button>
              {executeResult && (
                <span style={{ fontSize: "0.8rem", color: "#a5b4fc" }}>
                  Last run: {executeResult.durationMs} ms • Rows: {executeResult.rowsReturned} •{" "}
                  {executeResult.isSuccessful ? "Success" : "Failed"}
                </span>
              )}
            </div>

            {error && (
              <div
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.85rem",
                  color: "#fecaca",
                  background: "#450a0a",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                }}
              >
                {error}
              </div>
            )}

            {executeResult && executeResult.errorMessage && (
              <div
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.85rem",
                  color: "#fecaca",
                  background: "#450a0a",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                }}
              >
                Error: {executeResult.errorMessage}
              </div>
            )}
          </div>

          {/* Right: last execution details */}
          <div
            style={{
              background: "#020617",
              borderRadius: "0.75rem",
              padding: "1rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.75rem" }}>
              Last Execution
            </h2>
            {!executeResult ? (
              <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                Run a query to see performance details here.
              </p>
            ) : (
              <div style={{ fontSize: "0.9rem" }}>
                <p>
                  <strong>Status:</strong>{" "}
                  <span style={{ color: executeResult.isSuccessful ? "#4ade80" : "#f97373" }}>
                    {executeResult.isSuccessful ? "Success" : "Failed"}
                  </span>
                </p>
                <p>
                  <strong>Duration:</strong> {executeResult.durationMs} ms
                </p>
                <p>
                  <strong>Rows returned:</strong> {executeResult.rowsReturned}
                </p>
                <p>
                  <strong>Executed at (UTC):</strong>{" "}
                  {new Date(executeResult.executedAtUtc).toLocaleString()}
                </p>
                {executeResult.errorMessage && (
                  <p style={{ marginTop: "0.5rem", color: "#fecaca" }}>
                    <strong>Error:</strong> {executeResult.errorMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Logs table */}
        <div
          style={{
            background: "#020617",
            borderRadius: "0.75rem",
            padding: "1rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              marginBottom: "0.75rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>Recent Executions</h2>
            <button
              onClick={fetchLogs}
              style={{
                padding: "0.35rem 0.8rem",
                borderRadius: "9999px",
                border: "1px solid #4b5563",
                background: "transparent",
                color: "#e5e7eb",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>
          {logs.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              No logs yet. Execute a query to populate history.
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead>
                  <tr>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      ID
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      Query
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      Duration (ms)
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      Rows
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      Status
                    </th>
                    <th
                      style={{
                        textAlign: "left",
                        padding: "0.5rem",
                        borderBottom: "1px solid #1f2937",
                      }}
                    >
                      Executed At
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td
                        style={{
                          padding: "0.4rem",
                          borderBottom: "1px solid #111827",
                        }}
                      >
                        {log.id}
                      </td>
                      <td
                        style={{
                          padding: "0.4rem",
                          borderBottom: "1px solid #111827",
                          maxWidth: "260px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontFamily:
                            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                        }}
                        title={log.queryText}
                      >
                        {log.queryText}
                      </td>
                      <td
                        style={{
                          padding: "0.4rem",
                          borderBottom: "1px solid #111827",
                        }}
                      >
                        {log.durationMs}
                      </td>
                      <td
                        style={{
                          padding: "0.4rem",
                          borderBottom: "1px solid #111827",
                        }}
                      >
                        {log.rowsReturned}
                      </td>
                      <td
                        style={{
                          padding: "0.4rem",
                          borderBottom: "1px solid #111827",
                        }}
                      >
                        <span
                          style={{
                            padding: "0.15rem 0.5rem",
                            borderRadius: "9999px",
                            background: log.isSuccessful ? "#14532d" : "#7f1d1d",
                            color: log.isSuccessful ? "#bbf7d0" : "#fecaca",
                          }}
                        >
                          {log.isSuccessful ? "Success" : "Failed"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "0.4rem",
                          borderBottom: "1px solid #111827",
                        }}
                      >
                        {new Date(log.executedAtUtc).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
