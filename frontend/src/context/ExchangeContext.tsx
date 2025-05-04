import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";

// Define types for messages and summaries
interface Message {
  id: string;
  text: string;
  speaker: string;
  speakerId: number;
  createdAt: string;
  updatedAt: string;
  exchangeId: string;
}

interface SummaryContent {
  Notes?: Array<{
    Theme?: string;
    Details?: string;
  }>;
  Overview?: {
    Purpose?: string;
    KeyTopics?: string[];
    Conclusions?: string;
  };
  ActionItems?: Array<{
    Name?: string;
    Responsibility?: string;
  }>;
  FollowUpEmail?: {
    To?: string;
    Body?: string;
  };
}

interface Summary {
  id: string;
  content: SummaryContent;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Define types for exchanges
interface Exchange {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  summaries?: Summary[];
}

// Define pagination data structure
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Define the context type
interface ExchangesContextType {
  exchanges: Exchange[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  loading: boolean;
  error: string | null;
  fetchExchanges: (page?: number, limit?: number) => Promise<void>;
  getExchange: (id: string) => Exchange | undefined;
  fetchExchange: (exchangeId: string) => Promise<Exchange>;
}

// Create context with default values
const ExchangesContext = createContext<ExchangesContextType>({
  exchanges: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  },
  loading: false,
  error: null,
  fetchExchanges: async () => {},
  getExchange: () => undefined,
  fetchExchange: async () => {
    throw new Error("fetchExchange not implemented");
  },
});

// Hook to use the exchanges context
export const useExchanges = () => useContext(ExchangesContext);

interface ExchangesProviderProps {
  children: ReactNode;
}

export const ExchangesProvider: React.FC<ExchangesProviderProps> = ({
  children,
}) => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // API URL
  const API_URL = import.meta.env.VITE_API_URL + "/api";

  // Use a ref to track if initial fetch has been done
  const initialFetchDone = useRef(false);

  // Add a ref to track ongoing fetches to prevent duplicates
  const isFetching = useRef(false);

  // Fetch exchanges with pagination - Using useCallback to memoize the function
  const fetchExchanges = useCallback(
    async (page: number = 1, limit: number = 10): Promise<void> => {
      if (!isAuthenticated) return;

      // Check if we're already fetching - if so, don't start another fetch
      if (isFetching.current) {
        console.log("Fetch already in progress, skipping duplicate request");
        return;
      }

      try {
        // Mark that we're fetching
        isFetching.current = true;

        setLoading(true);
        setError(null);
        console.log("Fetching exchanges, page:", page, "limit:", limit);
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `${API_URL}/exchanges?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Response from exchanges API:", response);

        if (!response.ok) {
          throw new Error(`Failed to fetch exchanges: ${response.status}`);
        }

        const data: PaginatedResponse<Exchange> = await response.json();
        console.log("Exchanges data received:", data);
        setExchanges(data.items);
        setPagination({
          total: data.total,
          page: data.page,
          limit: data.limit,
          totalPages: data.totalPages,
          hasNext: data.hasNext,
          hasPrevious: data.hasPrevious,
        });

        // Mark that the initial fetch has been done
        initialFetchDone.current = true;
      } catch (err) {
        console.error("Error fetching exchanges:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
        // Reset the fetching flag
        isFetching.current = false;
      }
    },
    [isAuthenticated]
  );

  // Fetch single exchange by ID
  const fetchExchange = useCallback(
    async (exchangeId: string): Promise<Exchange> => {
      if (!isAuthenticated) {
        throw new Error("User not authenticated");
      }

      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${API_URL}/exchanges/${exchangeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch exchange: ${response.status}`);
        }

        const exchange: Exchange = await response.json();
        console.log("Fetched exchange:", exchange);
        return exchange;
      } catch (err) {
        console.error("Error fetching exchange:", err);
        throw err instanceof Error
          ? err
          : new Error("An unknown error occurred");
      }
    },
    [isAuthenticated]
  );

  // Get exchange by ID from local state - Also memoize this function
  const getExchange = useCallback(
    (id: string): Exchange | undefined => {
      return exchanges.find((exchange) => exchange.id === id);
    },
    [exchanges]
  );

  // Fetch exchanges when authentication state changes, but ONLY ONCE
  useEffect(() => {
    console.log("Auth state changed, isAuthenticated:", isAuthenticated);
    // Only fetch if authenticated and we haven't already done the initial fetch
    if (isAuthenticated && !initialFetchDone.current) {
      console.log("User is authenticated, will fetch exchanges (INITIAL)");
      fetchExchanges();
    } else if (!isAuthenticated) {
      console.log("User is not authenticated, clearing exchanges");
      setExchanges([]);
      // Reset the initialFetchDone flag when user logs out
      initialFetchDone.current = false;
    }
  }, [isAuthenticated, fetchExchanges]);

  // Context value
  const value: ExchangesContextType = {
    exchanges,
    pagination,
    loading,
    error,
    fetchExchanges,
    getExchange,
    fetchExchange,
  };

  return (
    <ExchangesContext.Provider value={value}>
      {children}
    </ExchangesContext.Provider>
  );
};

export default ExchangesContext;
