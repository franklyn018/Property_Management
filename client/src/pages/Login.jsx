import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const data = await login(email, password);

      const role = (data.user.role || "").toLowerCase();

      loginUser(data.user, data.token);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", role);

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "tenant") {
        navigate("/tenant");
      } else {
        setErrorMessage("Unknown user role. Please contact support.");
      }
    } catch (error) {
      setErrorMessage(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

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
      <form
        onSubmit={handleSubmit}
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "40px 30px",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "380px",
          backdropFilter: "blur(10px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        }}
      >
        <h2
          style={{
            marginBottom: "25px",
            textAlign: "center",
            fontSize: "2rem",
          }}
        >
          Login
        </h2>

        {errorMessage && (
          <p
            style={{
              color: "#f87171",
              marginBottom: "15px",
              textAlign: "center",
            }}
          >
            {errorMessage}
          </p>
        )}

        <div style={{ marginBottom: "18px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "22px" }}>
          <label style={{ display: "block", marginBottom: "8px" }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: "12px",
            border: "none",
            background: "#3b82f6",
            color: "white",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent",
            color: "white",
            fontSize: "0.95rem",
            cursor: "pointer",
          }}
        >
          Back to Home
        </button>
      </form>
    </div>
  );
}

export default Login;