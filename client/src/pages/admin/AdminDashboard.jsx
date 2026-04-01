import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();
  const [latePaymentCount, setLatePaymentCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  useEffect(() => {
    const fetchLatePayments = async () => {
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const latePayments = data.filter((payment) => {
          if (payment.status === "paid") return false;
          if (!payment.due_date) return false;

          const dueDate = new Date(payment.due_date);
          dueDate.setHours(0, 0, 0, 0);

          return dueDate < today;
        });

        setLatePaymentCount(latePayments.length);
      } catch (error) {
        console.error("Failed to fetch late payments:", error);
        setLatePaymentCount(0);
      }
    };

    fetchLatePayments();
  }, []);

  const cards = [
    {
      title: "Payment Logs",
      description:
        "Review rent history, update statuses, and manage payment tracking.",
      buttonText: "Open Payments",
      path: "/admin/payments",
      icon: "💳",
      accent: "#2563eb",
    },
    {
      title: "Tenant Messages",
      description:
        "Read tenant requests, resolve issues, and track repair costs.",
      buttonText: "Open Messages",
      path: "/admin/messages",
      icon: "✉️",
      accent: "#7c3aed",
    },
    {
      title: "Cash Flow",
      description:
        "Monitor income, maintenance expenses, and your total net earnings.",
      buttonText: "Open Cash Flow",
      path: "/admin/cashflow",
      icon: "📈",
      accent: "#059669",
    },
  ];

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
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
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
              Property Manager Admin
            </div>

            <h1
              style={{
                margin: "0 0 12px 0",
                fontSize: "38px",
                lineHeight: "1.1",
                fontWeight: "bold",
              }}
            >
              Welcome back to your dashboard
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
              Keep track of rent payments, tenant issues, and property cash flow
              from one clean workspace.
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            onClick={() => navigate("/admin/payments")}
            style={{
              background:
                latePaymentCount > 0
                  ? "linear-gradient(135deg, #fff1f2 0%, #ffffff 55%, #fee2e2 100%)"
                  : "linear-gradient(135deg, #ecfdf5 0%, #ffffff 55%, #d1fae5 100%)",
              borderRadius: "22px",
              padding: "24px",
              boxShadow: "0 14px 34px rgba(0,0,0,0.08)",
              border:
                latePaymentCount > 0
                  ? "1px solid #fecaca"
                  : "1px solid #a7f3d0",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow =
                "0 18px 38px rgba(0,0,0,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 14px 34px rgba(0,0,0,0.08)";
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "14px",
                backgroundColor: latePaymentCount > 0 ? "#fee2e2" : "#d1fae5",
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
                ? "Click to review overdue rent payments."
                : "No overdue payments right now."}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "rgba(255,255,255,0.82)",
                backdropFilter: "blur(8px)",
                borderRadius: "24px",
                padding: "26px",
                boxShadow: "0 16px 36px rgba(15, 23, 42, 0.08)",
                border: "1px solid rgba(226, 232, 240, 0.9)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: "240px",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow =
                  "0 22px 44px rgba(15, 23, 42, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 16px 36px rgba(15, 23, 42, 0.08)";
              }}
            >
              <div>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    backgroundColor: `${card.accent}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    marginBottom: "18px",
                  }}
                >
                  {card.icon}
                </div>

                <h2
                  style={{
                    margin: "0 0 10px 0",
                    fontSize: "24px",
                    color: "#0f172a",
                  }}
                >
                  {card.title}
                </h2>

                <p
                  style={{
                    margin: 0,
                    fontSize: "15px",
                    lineHeight: "1.7",
                    color: "#475569",
                  }}
                >
                  {card.description}
                </p>
              </div>

              <button
                onClick={() => navigate(card.path)}
                style={{
                  marginTop: "26px",
                  padding: "13px 16px",
                  border: "none",
                  borderRadius: "12px",
                  backgroundColor: card.accent,
                  color: "white",
                  fontSize: "15px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: `0 10px 20px ${card.accent}33`,
                }}
              >
                {card.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;