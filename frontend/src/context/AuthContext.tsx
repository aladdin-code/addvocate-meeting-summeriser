import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define types for authentication context
interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; errorMessage?: string }>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; errorMessage?: string }>;
  logout: () => void;
}

// Local storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
  USER_DATA: "userData",
};

// Create the authentication context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
});

// Hook to use the auth context
export const useAuth = (): AuthContextType => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // API base URL
  const API_URL = import.meta.env.VITE_API_URL + "/api";
  // Helper functions for localStorage
  const saveUserToStorage = (userData: User, token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  };

  const clearUserFromStorage = (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  };

  const getUserFromStorage = (): User | null => {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (userData) {
      try {
        return JSON.parse(userData) as User;
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
        return null;
      }
    }
    return null;
  };

  // Check if user is logged in when the component mounts
  useEffect(() => {
    const checkAuthStatus = async (): Promise<void> => {
      try {
        setLoading(true);
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        const storedUser = getUserFromStorage();

        // If we have both token and user data in localStorage, set initial state
        if (token && storedUser) {
          setIsAuthenticated(true);
          setUser(storedUser);

          try {
            // Verify token with API (but we've already set the user as authenticated)
            const response = await fetch(`${API_URL}/auth/verify-token`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (!response.ok) {
              // Token is invalid, clear local storage and state
              clearUserFromStorage();
              setIsAuthenticated(false);
              setUser(null);
            } else {
              // Update user data with fresh data from server
              const userData = await response.json();
              const updatedUser = {
                id: userData.id,
                email: userData.email,
                name: userData.name,
              };
              setUser(updatedUser);
              // Update localStorage with fresh data
              saveUserToStorage(updatedUser, token);
            }
          } catch (error) {
            // Network error - keep the user logged in but log the error
            console.error("Error verifying token (keeping session):", error);
          }
        } else {
          // No token or user data
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Fatal authentication error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Add event listener for storage events (for multi-tab support)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.AUTH_TOKEN) {
        if (!e.newValue) {
          // Token was removed in another tab
          setIsAuthenticated(false);
          setUser(null);
        } else if (
          e.newValue !== localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
        ) {
          // Token was changed in another tab
          checkAuthStatus();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [API_URL]);

  // Login function
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; errorMessage?: string }> => {
    try {
      console.log("sign in url ", `${API_URL}/auth/signin`);
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
        };

        // Update state
        setIsAuthenticated(true);
        setUser(userData);

        // Save to localStorage
        saveUserToStorage(userData, data.token);

        return { success: true };
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        return {
          success: false,
          errorMessage:
            errorData.message ||
            "Authentication failed. Please check your credentials.",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        errorMessage: "A network error occurred. Please try again later.",
      };
    }
  };

  // Signup function
  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; errorMessage?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
        };

        // Update state
        setIsAuthenticated(true);
        setUser(userData);

        // Save to localStorage
        saveUserToStorage(userData, data.token);

        return { success: true };
      } else {
        const errorData = await response.json();
        console.error("Signup failed:", errorData);

        // Handle specific error cases
        if (errorData.statusCode === 409) {
          return {
            success: false,
            errorMessage:
              "User already exists. Please try a different email address.",
          };
        }

        return {
          success: false,
          errorMessage:
            errorData.message || "Registration failed. Please try again.",
        };
      }
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        errorMessage: "A network error occurred. Please try again later.",
      };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        try {
          // Call logout endpoint
          await fetch(`${API_URL}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          // Just log the error but proceed with local logout
          console.error("Logout API error:", error);
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local state and storage
      setIsAuthenticated(false);
      setUser(null);
      clearUserFromStorage();
    }
  };

  // Provide the context value
  const value: AuthContextType = {
    isAuthenticated,
    user,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
