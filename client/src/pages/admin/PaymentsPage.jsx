import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PaymentsPage() {
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5001/api/payments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch payments.");
      }

      setPayments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
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

  const markAsPaid = async (paymentId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5001/api/payments/${paymentId}/mark-paid`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to mark payment as paid.");
      }

      fetchPayments();
    } catch (err) {
      alert(err.message);
    }
  };

  const markAsPending = async (paymentId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5001/api/payments/${paymentId}/mark-unpaid`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to mark payment as unpaid.");
      }

      fetchPayments();
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "#16a34a";
      case "unpaid":
        return "#ca8a04";
      case "failed":
        return "#dc2626";
      case "late":
        return "#ea580c";
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
              Payment Logs
            </h1>
            <p
              style={{
                margin: 0,
                color: "#475569",
                fontSize: "15px",
              }}
            >
              View all payment logs and manually mark payments.
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
            <p style={{ color: "#475569" }}>Loading payments...</p>
          ) : error ? (
            <p style={{ color: "#dc2626", fontWeight: "bold" }}>{error}</p>
          ) : payments.length === 0 ? (
            <p style={{ color: "#475569" }}>No payment logs found.</p>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {payments.map((payment) => {
                const displayStatus = getDisplayStatus(payment);

                return (
                  <div
                    key={payment._id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      padding: "18px",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 10px 0",
                        fontSize: "18px",
                        color: "#0f172a",
                      }}
                    >
                      ${payment.amount}
                    </h3>

                    <p style={{ margin: "0 0 6px 0", color: "#334155" }}>
                      <strong>Property:</strong>{" "}
                      {payment.property_id?.address ||
                        payment.property_id?._id ||
                        "No property"}
                    </p>

                    <p style={{ margin: "0 0 6px 0", color: "#334155" }}>
                      <strong>Due Date:</strong>{" "}
                      {payment.due_date
                        ? new Date(payment.due_date).toLocaleDateString()
                        : "No due date"}
                    </p>

                    <p
                      style={{
                        margin: "0 0 14px 0",
                        fontWeight: "bold",
                        color: getStatusColor(displayStatus),
                        textTransform: "capitalize",
                      }}
                    >
                      Status: {displayStatus}
                    </p>

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {displayStatus !== "paid" && (
                        <button
                          onClick={() => markAsPaid(payment._id)}
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
                          Mark as Paid
                        </button>
                      )}

                      {displayStatus === "paid" && (
                        <button
                          onClick={() => markAsPending(payment._id)}
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
                          Mark as Unpaid
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentsPage;