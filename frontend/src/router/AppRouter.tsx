import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import SignInPage from "../pages/signin";
import SignUpPage from "../pages/signup";
import ExchangesPage from "../pages/ExchangesPage";
import SummariesPage from "../pages/SummariesPage";
import { ExchangesProvider } from "../context/ExchangeContext";
import { SummaryProvider } from "../context/SummaryContext";

const AuthenticatedRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/exchanges" : "/signin"} replace />
        }
      />

      {/* Auth routes */}
      <Route
        path="/signin"
        element={
          isAuthenticated ? (
            <Navigate to="/exchanges" replace />
          ) : (
            <SignInPage />
          )
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? (
            <Navigate to="/exchanges" replace />
          ) : (
            <SignUpPage />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/exchanges"
        element={
          !isAuthenticated ? (
            <Navigate to="/signin" state={{ from: location }} replace />
          ) : (
            <ExchangesPage />
          )
        }
      />
      <Route
        path="/summaries"
        element={
          !isAuthenticated ? (
            <Navigate to="/signin" state={{ from: location }} replace />
          ) : (
            <SummariesPage />
          )
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/exchanges" : "/signin"} replace />
        }
      />
    </Routes>
  );
};

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <ExchangesProvider>
        <SummaryProvider>
          <AuthenticatedRoutes />
        </SummaryProvider>
      </ExchangesProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default AppRouter;
