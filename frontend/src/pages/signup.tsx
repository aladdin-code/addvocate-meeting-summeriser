import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/main.css";

// Custom CSS variables for brand colors
const styles = {
  primaryColor: "#9878f7",
  darkColor: "#1a0047",
};

const SignUpPage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await signup(name, email, password);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(
          result.errorMessage || "Registration failed. Please try again."
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
          Create an Account
        </h1>

        {/* Error Message */}
        {error && (
          <div className="auth-error-message rounded-md mb-4">{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-1"
              style={{ color: styles.darkColor }}
            >
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input-field rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-offset-2"
              style={{
                borderColor: "#e5e7eb",
                color: styles.darkColor,
              }}
              placeholder="Enter your full name"
            />
          </div>

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
              placeholder="Enter your email"
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
              placeholder="Create a password"
            />
          </div>

          <div className="auth-form-group">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium mb-1"
              style={{ color: styles.darkColor }}
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input-field rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-offset-2"
              style={{
                borderColor: "#e5e7eb",
                color: styles.darkColor,
              }}
              placeholder="Confirm your password"
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
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Already have an account section */}
        <div className="auth-footer">
          <span style={{ color: styles.darkColor }}>
            Already have an account?{" "}
          </span>
          <Link
            to="/signin"
            className="auth-footer-link hover:underline"
            style={{ color: styles.primaryColor, fontWeight: 500 }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
