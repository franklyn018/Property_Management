import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function CashFlowPage() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCashFlowData = async () => {
      try {
        const token = localStorage.getItem("token");

        const [paymentsRes, messagesRes] = await Promise.all([
          fetch("http://localhost:5001/api/payments", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5001/api/messages", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const paymentsData = await paymentsRes.json();
        const messagesData = await messagesRes.json();

        if (!paymentsRes.ok) {
          throw new Error(paymentsData.message || "Failed to fetch payments.");
        }

        if (!messagesRes.ok) {
          throw new Error(messagesData.message || "Failed to fetch messages.");
        }

        setPayments(paymentsData);
        setMessages(messagesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlowData();
  }, []);

  const paidPayments = useMemo(() => {
    return payments.filter((payment) => payment.status === "paid");
  }, [payments]);

  const resolvedRepairs = useMemo(() => {
    return messages.filter(
      (msg) => msg.status === "resolved" && Number(msg.repair_cost || 0) > 0
    );
  }, [messages]);

  const totalIncome = useMemo(() => {
    return paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }, [paidPayments]);

  const totalExpenses = useMemo(() => {
    return resolvedRepairs.reduce(
      (sum, msg) => sum + Number(msg.repair_cost || 0),
      0
    );
  }, [resolvedRepairs]);

  const netEarnings = totalIncome - totalExpenses;

  const cashFlowLog = useMemo(() => {
    const paymentEntries = paidPayments.map((payment) => ({
      id: `payment-${payment._id}`,
      type: "income",
      amount: Number(payment.amount || 0),
      title: "Rent Payment",
      subtitle:
        payment.submitted_by_user_id?.name ||
        payment.property_id?.property_name ||
        "Payment",
      date: payment.paid_date || payment.createdAt,
    }));

    const expenseEntries = resolvedRepairs.map((msg) => ({
      id: `expense-${msg._id}`,
      type: "expense",
      amount: Number(msg.repair_cost || 0),
      title: "Maintenance Expense",
      subtitle: msg.subject || "Resolved Repair",
      date: msg.updatedAt || msg.createdAt,
    }));

    return [...paymentEntries, ...expenseEntries].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
  }, [paidPayments, resolvedRepairs]);

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
    });
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
      <div style={{ maxWidth: "1150px", margin: "0 auto" }}>
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
              Cash Flow
            </h1>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "15px",
              }}
            >
              Track total rent income, maintenance expenses, and net earnings.
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

        {loading ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ color: "#475569" }}>Loading cash flow...</p>
          </div>
        ) : error ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "18px",
              padding: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ color: "#dc2626", fontWeight: "bold" }}>{error}</p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <div style={summaryCardStyle}>
                <h3 style={summaryTitleStyle}>Total Income</h3>
                <p style={{ ...summaryValueStyle, color: "#16a34a" }}>
                  {formatMoney(totalIncome)}
                </p>
              </div>

              <div style={summaryCardStyle}>
                <h3 style={summaryTitleStyle}>Total Expenses</h3>
                <p style={{ ...summaryValueStyle, color: "#dc2626" }}>
                  {formatMoney(totalExpenses)}
                </p>
              </div>

              <div style={summaryCardStyle}>
                <h3 style={summaryTitleStyle}>Net Earnings</h3>
                <p
                  style={{
                    ...summaryValueStyle,
                    color: netEarnings >= 0 ? "#0f172a" : "#dc2626",
                  }}
                >
                  {formatMoney(netEarnings)}
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  margin: "0 0 18px 0",
                  fontSize: "24px",
                  color: "#0f172a",
                }}
              >
                Cash Flow Log
              </h2>

              {cashFlowLog.length === 0 ? (
                <p style={{ color: "#475569" }}>No cash flow activity found.</p>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {cashFlowLog.map((entry) => (
                    <div
                      key={entry.id}
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
                          {entry.title}
                        </p>

                        <p
                          style={{
                            margin: "0 0 4px 0",
                            color: "#475569",
                            fontSize: "14px",
                          }}
                        >
                          {entry.subtitle}
                        </p>

                        <p
                          style={{
                            margin: 0,
                            color: "#64748b",
                            fontSize: "13px",
                          }}
                        >
                          {entry.date
                            ? new Date(entry.date).toLocaleString()
                            : "No date"}
                        </p>
                      </div>

                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color:
                            entry.type === "income" ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {entry.type === "income" ? "+" : "-"}
                        {formatMoney(entry.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const summaryCardStyle = {
  backgroundColor: "white",
  borderRadius: "16px",
  padding: "22px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const summaryTitleStyle = {
  margin: "0 0 10px 0",
  fontSize: "16px",
  color: "#475569",
  fontWeight: "normal",
};

const summaryValueStyle = {
  margin: 0,
  fontSize: "28px",
  fontWeight: "bold",
};

export default CashFlowPage;