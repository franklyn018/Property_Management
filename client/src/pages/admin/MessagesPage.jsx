import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MessagesPage() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [repairCosts, setRepairCosts] = useState({});

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/messages", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch messages.");
      }

      setMessages(data);

      const initialCosts = {};
      data.forEach((msg) => {
        initialCosts[msg._id] = msg.repair_cost ?? 0;
      });
      setRepairCosts(initialCosts);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      const payload = { status: newStatus };

      if (newStatus === "resolved") {
        payload.repair_cost = repairCosts[messageId] || 0;
      }

      const res = await fetch(
        `http://localhost:5001/api/messages/${messageId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update message status.");
      }

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                status: data.status,
                repair_cost: data.repair_cost,
              }
            : msg
        )
      );
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "#16a34a";
      case "in_progress":
        return "#ca8a04";
      case "open":
        return "#2563eb";
      default:
        return "#475569";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f8fafc, #e2e8f0)",
        padding: "40px 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "18px",
            padding: "28px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 8px 0",
                fontSize: "30px",
                color: "#0f172a",
              }}
            >
              Tenant Messages
            </h1>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "15px",
              }}
            >
              View and manage all messages sent by tenants.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin")}
            style={{
              padding: "12px 18px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: "#2563eb",
              color: "white",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "18px",
            padding: "24px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          {loading ? (
            <p style={{ color: "#475569" }}>Loading messages...</p>
          ) : error ? (
            <p style={{ color: "#dc2626", fontWeight: "bold" }}>{error}</p>
          ) : messages.length === 0 ? (
            <p style={{ color: "#475569" }}>No messages found.</p>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "18px",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <div style={{ marginBottom: "10px" }}>
                    <h3
                      style={{
                        margin: "0 0 6px 0",
                        fontSize: "18px",
                        color: "#0f172a",
                      }}
                    >
                      {msg.subject || "No Subject"}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "14px",
                        color: "#334155",
                      }}
                    >
                      <strong>Tenant:</strong>{" "}
                      {msg.tenant_user_id?.name || "Unknown"}
                    </p>

                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "14px",
                        color: "#334155",
                      }}
                    >
                      <strong>Email:</strong>{" "}
                      {msg.tenant_user_id?.email || "No email"}
                    </p>

                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: getStatusColor(msg.status || "open"),
                        textTransform: "capitalize",
                      }}
                    >
                      Status: {(msg.status || "open").replace("_", " ")}
                    </p>

                    <p
                      style={{
                        margin: "0 0 4px 0",
                        fontSize: "14px",
                        color: "#334155",
                      }}
                    >
                      <strong>Repair Cost:</strong> $
                      {Number(msg.repair_cost || 0).toFixed(2)}
                    </p>

                    <p
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleString()
                        : "No date"}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      marginBottom: "14px",
                      padding: "14px",
                      backgroundColor: "white",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      lineHeight: "1.6",
                      color: "#1e293b",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.message || "No message content"}
                  </div>

                  <div
                    style={{
                      marginBottom: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "14px",
                        color: "#334155",
                        fontWeight: "bold",
                      }}
                    >
                      Repair Cost:
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={repairCosts[msg._id] ?? ""}
                      onChange={(e) =>
                        setRepairCosts((prev) => ({
                          ...prev,
                          [msg._id]: e.target.value,
                        }))
                      }
                      style={{
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        fontSize: "14px",
                        width: "140px",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {msg.status !== "open" && (
                      <button
                        onClick={() => updateMessageStatus(msg._id, "open")}
                        style={{
                          padding: "10px 14px",
                          border: "none",
                          borderRadius: "8px",
                          backgroundColor: "#2563eb",
                          color: "white",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Mark Open
                      </button>
                    )}

                    {msg.status !== "in_progress" && (
                      <button
                        onClick={() => updateMessageStatus(msg._id, "in_progress")}
                        style={{
                          padding: "10px 14px",
                          border: "none",
                          borderRadius: "8px",
                          backgroundColor: "#ca8a04",
                          color: "white",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Mark In Progress
                      </button>
                    )}

                    {msg.status !== "resolved" && (
                      <button
                        onClick={() => updateMessageStatus(msg._id, "resolved")}
                        style={{
                          padding: "10px 14px",
                          border: "none",
                          borderRadius: "8px",
                          backgroundColor: "#16a34a",
                          color: "white",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;