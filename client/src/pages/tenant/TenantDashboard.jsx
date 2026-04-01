import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function TenantDashboard() {
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const fetchTenantData = async () => {
    try {
      const token = localStorage.getItem("token");

      const [propertyRes, paymentsRes, messagesRes] = await Promise.all([
        fetch("http://localhost:5001/api/tenant/property", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5001/api/tenant/payments", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("http://localhost:5001/api/tenant/messages", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const propertyData = await propertyRes.json();
      const paymentsData = await paymentsRes.json();
      const messagesData = await messagesRes.json();

      if (!propertyRes.ok) {
        throw new Error(propertyData.message || "Failed to fetch property.");
      }

      if (!paymentsRes.ok) {
        throw new Error(paymentsData.message || "Failed to fetch payments.");
      }

      if (!messagesRes.ok) {
        throw new Error(messagesData.message || "Failed to fetch messages.");
      }

      setProperty(propertyData);
      setPayments(paymentsData);
      setMessages(messagesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  const isPastDue = (dueDate) => {
    if (!dueDate) return false;

    const today = new Date();
    const due = new Date(dueDate);

    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };

  const getDisplayStatus = (payment) => {
    if (payment.status === "paid") return "paid";
    if (isPastDue(payment.due_date)) return "late";
    return payment.status || "unpaid";
  };

  const currentMonthPayment = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return payments.find((payment) => {
      const dueDate = new Date(payment.due_date);
      return (
        dueDate.getMonth() === currentMonth &&
        dueDate.getFullYear() === currentYear
      );
    });
  }, [payments]);

  const latePaymentCount = useMemo(() => {
    return payments.filter((payment) => {
      if (payment.status === "paid") return false;
      if (!payment.due_date) return false;
      return isPastDue(payment.due_date);
    }).length;
  }, [payments]);

  const sortedPayments = useMemo(() => {
    return [...payments].sort(
      (a, b) => new Date(b.due_date) - new Date(a.due_date)
    );
  }, [payments]);

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "#16a34a";
      case "late":
        return "#dc2626";
      case "unpaid":
        return "#ca8a04";
      default:
        return "#475569";
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!subject.trim() || !messageText.trim()) {
      alert("Please fill out both subject and message.");
      return;
    }

    try {
      setSendingMessage(true);

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/tenant/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          message: messageText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send message.");
      }

      setSubject("");
      setMessageText("");
      fetchTenantData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #dbeafe 0%, #f8fafc 35%, #e2e8f0 100%)",
        padding: "40px 24px 56px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            marginBottom: "28px",
            borderRadius: "28px",
            padding: "34px 32px",
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #334155 100%)",
            color: "white",
            boxShadow: "0 20px 50px rgba(15, 23, 42, 0.22)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ maxWidth: "700px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "999px",
                backgroundColor: "rgba(255,255,255,0.1)",
                fontSize: "13px",
                fontWeight: "bold",
                letterSpacing: "0.3px",
                marginBottom: "16px",
              }}
            >
              Tenant Portal
            </div>

            <h1
              style={{
                margin: "0 0 12px 0",
                fontSize: "38px",
                lineHeight: "1.1",
                fontWeight: "bold",
              }}
            >
              Welcome to your tenant dashboard
            </h1>

            <p
              style={{
                margin: 0,
                fontSize: "16px",
                lineHeight: "1.7",
                color: "rgba(255,255,255,0.8)",
                maxWidth: "620px",
              }}
            >
              View your rent status, check payment history, and send messages to
              the property manager.
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              backdropFilter: "blur(6px)",
            }}
          >
            Logout
          </button>
        </div>

        {loading ? (
          <div style={panelStyle}>
            <p style={{ color: "#475569" }}>Loading tenant dashboard...</p>
          </div>
        ) : error ? (
          <div style={panelStyle}>
            <p style={{ color: "#dc2626", fontWeight: "bold" }}>{error}</p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  ...alertCardStyle,
                  background:
                    latePaymentCount > 0
                      ? "linear-gradient(135deg, #fff1f2 0%, #ffffff 55%, #fee2e2 100%)"
                      : "linear-gradient(135deg, #ecfdf5 0%, #ffffff 55%, #d1fae5 100%)",
                  border:
                    latePaymentCount > 0
                      ? "1px solid #fecaca"
                      : "1px solid #a7f3d0",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    backgroundColor:
                      latePaymentCount > 0 ? "#fee2e2" : "#d1fae5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    marginBottom: "16px",
                  }}
                >
                  {latePaymentCount > 0 ? "⚠️" : "✅"}
                </div>

                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "16px",
                    color: latePaymentCount > 0 ? "#7f1d1d" : "#065f46",
                    fontWeight: "bold",
                  }}
                >
                  Late Payment Alerts
                </h3>

                <p
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "40px",
                    fontWeight: "bold",
                    color: latePaymentCount > 0 ? "#dc2626" : "#059669",
                    lineHeight: 1,
                  }}
                >
                  {latePaymentCount}
                </p>

                <p
                  style={{
                    margin: 0,
                    color: latePaymentCount > 0 ? "#7f1d1d" : "#065f46",
                    fontSize: "14px",
                    lineHeight: "1.5",
                  }}
                >
                  {latePaymentCount > 0
                    ? "You have overdue rent that still needs attention."
                    : "No overdue rent right now."}
                </p>
              </div>

              <div style={glassCardStyle}>
                <h3 style={cardTitleStyle}>Your Property</h3>
                <p style={infoTextStyle}>
                  <strong>Property:</strong>{" "}
                  {property?.property_name || "No property"}
                </p>
                <p style={infoTextStyle}>
                  <strong>Address:</strong> {property?.address || "No address"}
                </p>
              </div>

              <div style={glassCardStyle}>
                <h3 style={cardTitleStyle}>This Month's Rent</h3>
                {currentMonthPayment ? (
                  <>
                    <p style={infoTextStyle}>
                      <strong>Amount:</strong> $
                      {Number(currentMonthPayment.amount || 0).toFixed(2)}
                    </p>
                    <p style={infoTextStyle}>
                      <strong>Due Date:</strong>{" "}
                      {currentMonthPayment.due_date
                        ? new Date(
                            currentMonthPayment.due_date
                          ).toLocaleDateString()
                        : "No due date"}
                    </p>
                    <p
                      style={{
                        ...infoTextStyle,
                        fontWeight: "bold",
                        color: getStatusColor(getDisplayStatus(currentMonthPayment)),
                        textTransform: "capitalize",
                      }}
                    >
                      <strong>Status:</strong>{" "}
                      {getDisplayStatus(currentMonthPayment)}
                    </p>
                  </>
                ) : (
                  <p style={infoTextStyle}>No payment record for this month yet.</p>
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div style={panelStyle}>
                <h2 style={sectionTitleStyle}>Send Message to Admin</h2>

                <form onSubmit={handleSendMessage}>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={labelStyle}>Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Enter a subject"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={labelStyle}>Message</label>
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Describe the issue or message for the admin"
                      rows={6}
                      style={{ ...inputStyle, resize: "vertical" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sendingMessage}
                    style={{
                      padding: "12px 16px",
                      border: "none",
                      borderRadius: "12px",
                      backgroundColor: "#2563eb",
                      color: "white",
                      fontSize: "15px",
                      fontWeight: "bold",
                      cursor: "pointer",
                      boxShadow: "0 10px 20px rgba(37, 99, 235, 0.2)",
                    }}
                  >
                    {sendingMessage ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>

              <div style={panelStyle}>
                <h2 style={sectionTitleStyle}>Your Message History</h2>

                {messages.length === 0 ? (
                  <p style={{ color: "#64748b" }}>No messages yet.</p>
                ) : (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {messages.map((msg) => (
                      <div
                        key={msg._id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "14px",
                          backgroundColor: "#f8fafc",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 6px 0",
                            fontWeight: "bold",
                            color: "#0f172a",
                          }}
                        >
                          {msg.subject}
                        </p>

                        <p
                          style={{
                            margin: "0 0 8px 0",
                            color: "#475569",
                            fontSize: "14px",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {msg.message}
                        </p>

                        <p
                          style={{
                            margin: "0 0 4px 0",
                            fontSize: "13px",
                            fontWeight: "bold",
                            color:
                              msg.status === "resolved"
                                ? "#16a34a"
                                : msg.status === "in_progress"
                                ? "#ca8a04"
                                : "#2563eb",
                            textTransform: "capitalize",
                          }}
                        >
                          Status: {(msg.status || "open").replace("_", " ")}
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b",
                            fontSize: "12px",
                          }}
                        >
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleString()
                            : "No date"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={panelStyle}>
              <h2 style={sectionTitleStyle}>Payment Log</h2>

              {sortedPayments.length === 0 ? (
                <p style={{ color: "#64748b" }}>No payment history found.</p>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {sortedPayments.map((payment) => {
                    const displayStatus = getDisplayStatus(payment);

                    return (
                      <div
                        key={payment._id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          padding: "16px",
                          backgroundColor: "#f8fafc",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: "0 0 6px 0",
                              fontWeight: "bold",
                              color: "#0f172a",
                              fontSize: "16px",
                            }}
                          >
                            ${Number(payment.amount || 0).toFixed(2)}
                          </p>

                          <p
                            style={{
                              margin: "0 0 4px 0",
                              color: "#475569",
                              fontSize: "14px",
                            }}
                          >
                            Due Date:{" "}
                            {payment.due_date
                              ? new Date(payment.due_date).toLocaleDateString()
                              : "No due date"}
                          </p>
                        </div>

                        <div
                          style={{
                            fontWeight: "bold",
                            color: getStatusColor(displayStatus),
                            textTransform: "capitalize",
                          }}
                        >
                          {displayStatus}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const panelStyle = {
  backgroundColor: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(8px)",
  borderRadius: "24px",
  padding: "24px",
  boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
  border: "1px solid rgba(226, 232, 240, 0.9)",
};

const glassCardStyle = {
  backgroundColor: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(8px)",
  borderRadius: "22px",
  padding: "22px",
  boxShadow: "0 14px 34px rgba(15, 23, 42, 0.08)",
  border: "1px solid rgba(226, 232, 240, 0.9)",
};

const alertCardStyle = {
  borderRadius: "22px",
  padding: "24px",
  boxShadow: "0 14px 34px rgba(0,0,0,0.08)",
};

const cardTitleStyle = {
  margin: "0 0 12px 0",
  fontSize: "18px",
  color: "#0f172a",
};

const sectionTitleStyle = {
  margin: "0 0 18px 0",
  fontSize: "24px",
  color: "#0f172a",
};

const infoTextStyle = {
  margin: "0 0 8px 0",
  color: "#475569",
  fontSize: "15px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: "bold",
  color: "#334155",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  fontFamily: "Arial, sans-serif",
  boxSizing: "border-box",
};

export default TenantDashboard;