import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
        <div
            style={{
                textAlign: "center",
                maxWidth: "700px",
                width: "100%",
                padding: "20px",
            }}
        >
        <h1
          style={{
            fontSize: "3rem",
            marginBottom: "20px",
            lineHeight: "1.1",
          }}
        >
          Property Manager Portal
        </h1>

        <p
          style={{
            fontSize: "1.15rem",
            marginBottom: "35px",
            opacity: 0.85,
            lineHeight: "1.6",
          }}
        >
          Manage rent payments, maintenance requests, and tenant communication
          all in one place.
        </p>

        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "14px 28px",
            fontSize: "1rem",
            borderRadius: "12px",
            border: "none",
            background: "#3b82f6",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.background = "#2563eb")}
          onMouseOut={(e) => (e.target.style.background = "#3b82f6")}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Home;