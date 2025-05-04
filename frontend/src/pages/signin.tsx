import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/main.css";

// Custom CSS variables for brand colors
const styles = {
  primaryColor: "#9878f7",
  darkColor: "#1a0047",
};

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await login(email, password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(
          result.errorMessage ||
            "Invalid credentials. Please check your email and password."
        );
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container bg-background">
      <div
        className="auth-card rounded-md shadow-lg border"
        style={{ borderColor: styles.primaryColor, borderWidth: "1px" }}
      >
        {/* Logo */}
        <div className="auth-logo-container">
          <img
            src="https://addvocate.ai/wp-content/uploads/2024/07/Logo-Addvocate-1.png"
            alt="Addvocate Logo"
            className="auth-logo"
          />
        </div>

        {/* Title */}
        <h1
          className="auth-card-title font-semibold"
          style={{ color: styles.darkColor }}
        >
          Sign in to your Account
        </h1>

        {/* Error Message */}
        {error && (
          <div className="auth-error-message rounded-md mb-4">{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1"
              style={{ color: styles.darkColor }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input-field rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-offset-2"
              style={{
                borderColor: "#e5e7eb",
                color: styles.darkColor,
              }}
              placeholder="Email"
            />
          </div>

          <div className="auth-form-group">
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
              style={{ color: styles.darkColor }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input-field rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-offset-2"
              style={{
                borderColor: "#e5e7eb",
                color: styles.darkColor,
              }}
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="auth-button rounded-md h-10 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              backgroundColor: styles.primaryColor,
              color: "white",
              borderRadius: "0.375rem",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Don't have an account section */}
        <div className="auth-footer">
          <span style={{ color: styles.darkColor }}>
            Don't have an account?{" "}
          </span>
          <Link
            to="/signup"
            className="auth-footer-link hover:underline"
            style={{ color: styles.primaryColor, fontWeight: 500 }}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
