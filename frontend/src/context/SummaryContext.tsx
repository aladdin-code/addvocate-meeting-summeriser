import React, { createContext, ReactNode, useContext, useState } from "react";
import { useAuth } from "./AuthContext"; // Assuming you have an AuthContext

// Define the interfaces for the summary content structure
interface ActionItem {
  Name: string;
  Responsibility: string;
}

interface FollowUpEmail {
  To: string;
  Body: string;
}

interface Overview {
  Purpose: string;
  KeyTopics?: string[]; // Added KeyTopics as optional
  Conclusions: string;
}

// Added Notes interface based on the API response
interface Note {
  Theme: string;
  Details: string;
}

// Define the structure of the summary content
export interface SummaryContent {
  Overview: Overview;
  Notes?: Note[]; // Added Notes as optional
  ActionItems: ActionItem[];
  FollowUpEmail: FollowUpEmail;
}

// Define the structure of an exchange summary
export interface ExchangeSummary {
  id: string;
  exchangeId?: string;
  userId?: string; // Made userId optional
  createdAt?: string; // Made createdAt optional
  updatedAt?: string; // Made updatedAt optional
  // Added direct properties to match API response format
  Overview?: Overview;
  Notes?: Note[];
  ActionItems?: ActionItem[];
  FollowUpEmail?: FollowUpEmail;
  // Keep content property for backward compatibility
  content?: SummaryContent;
}

// Define the context type
export interface SummaryContextType {
  summarizing: boolean;
  error: string | null;
  summaries: ExchangeSummary[];
  summarizeExchange: (exchangeId: string) => Promise<ExchangeSummary | null>;
  getSummaries: () => Promise<ExchangeSummary[]>; // Changed return type to ExchangeSummary[]
  updateSummary: (
    id: string,
    content: Partial<SummaryContent>
  ) => Promise<ExchangeSummary>;
}

// Create context with default values
const SummaryContext = createContext<SummaryContextType>({
  summarizing: false,
  error: null,
  summaries: [],
  summarizeExchange: async () => null,
  getSummaries: async () => [],
  updateSummary: async () => ({
    id: "",
    content: {
      Overview: { Purpose: "", Conclusions: "" },
      ActionItems: [],
      FollowUpEmail: { To: "", Body: "" },
    },
  }),
});

// Hook to use the summary context
export const useSummary = () => useContext(SummaryContext);

interface SummaryProviderProps {
  children: ReactNode;
}

export const SummaryProvider: React.FC<SummaryProviderProps> = ({
  children,
}) => {
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<ExchangeSummary[]>([]);
  const { isAuthenticated } = useAuth();

  // API URL - Using the specific localhost URL you provided
  const API_URL = import.meta.env.VITE_API_URL + "/api";

  // Normalize summary data to ensure consistent format
  const normalizeSummary = (summaryData: any): ExchangeSummary => {
    // If the data already has a content property, return as is
    if (summaryData.content) {
      return summaryData;
    }

    // Otherwise, create a properly formatted ExchangeSummary
    const { id, exchangeId, userId, createdAt, updatedAt, ...contentFields } =
      summaryData;

    return {
      id,
      exchangeId,
      userId,
      createdAt,
      updatedAt,
      // Keep the original fields at root level
      ...contentFields,
      // Also create a content object for backward compatibility
      content: {
        Overview: contentFields.Overview || { Purpose: "", Conclusions: "" },
        Notes: contentFields.Notes || [],
        ActionItems: contentFields.ActionItems || [],
        FollowUpEmail: contentFields.FollowUpEmail || { To: "", Body: "" },
      },
    };
  };

  // Trigger summarization of an exchange
  const summarizeExchange = async (
    exchangeId: string
  ): Promise<ExchangeSummary | null> => {
    if (!isAuthenticated) {
      throw new Error("You must be authenticated to summarize an exchange");
    }

    try {
      setSummarizing(true);
      setError(null);

      const token = localStorage.getItem("authToken");

      // Use the specific generate endpoint provided
      const response = await fetch(
        `${API_URL}/summaries/${exchangeId}/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.log("Response not OK:", response.status, response.statusText);
        throw new Error(`Failed to generate summary: ${response.status}`);
      }

      const newSummaryData = await response.json();
      console.log("Generated summary context:", newSummaryData);

      // Normalize the summary data
      const newSummary = normalizeSummary(newSummaryData);

      // Update local state with the new summary
      setSummaries((prevSummaries) => [...prevSummaries, newSummary]);

      return newSummary;
    } catch (err) {
      console.error("Error summarizing exchange:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      return null;
    } finally {
      setSummarizing(false);
    }
  };

  // Get summaries for a specific user
  const getSummaries = async (): Promise<ExchangeSummary[]> => {
    if (!isAuthenticated) {
      throw new Error("You must be authenticated to get summaries");
    }

    try {
      setError(null);

      const token = localStorage.getItem("authToken");

      // Request summaries for the exchange
      const response = await fetch(`${API_URL}/summaries`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch summaries: ${response.status}`);
      }

      const fetchedSummariesData = await response.json();
      console.log("Fetched summaries in context:", fetchedSummariesData);

      // Normalize each summary to ensure consistent format
      const normalizedSummaries = fetchedSummariesData.map(normalizeSummary);

      // Update the context state with the normalized summaries
      setSummaries(normalizedSummaries);

      return normalizedSummaries;
    } catch (err) {
      console.error("Error fetching exchange summaries:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      return [];
    }
  };

  // Update a summary
  const updateSummary = async (
    id: string,
    contentData: Partial<SummaryContent>
  ): Promise<ExchangeSummary> => {
    if (!isAuthenticated) {
      throw new Error("You must be authenticated to update a summary");
    }

    try {
      setError(null);

      const token = localStorage.getItem("authToken");

      // Based on the curl example, the API expects the data directly (not wrapped in a content object)
      // Extract the fields from contentData
      const requestBody = {
        Overview: contentData.Overview,
        Notes: contentData.Notes,
        ActionItems: contentData.ActionItems,
        FollowUpEmail: contentData.FollowUpEmail,
      };

      console.log(
        `Sending PUT update to ${API_URL}/summaries/${id} with:`,
        requestBody
      );

      // Use the specific summary update endpoint provided with PUT method
      const response = await fetch(`${API_URL}/summaries/${id}`, {
        method: "PUT", // Changed from PATCH to PUT
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody), // Send the direct object structure
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "No error details");
        console.error(`API Error: ${response.status} - ${errorText}`);
        throw new Error(`Failed to update summary: ${response.status}`);
      }

      const updatedSummaryData = await response.json();
      console.log("API returned updated summary:", updatedSummaryData);

      // Normalize the updated summary
      const updatedSummary = normalizeSummary(updatedSummaryData);

      // Force update state by creating a new array
      setSummaries((prevSummaries) => {
        // Create a completely new array to ensure React detects the change
        return prevSummaries.map((summary) =>
          summary.id === id
            ? {
                ...summary, // Preserve all existing properties
                ...updatedSummary, // Overwrite with updated properties
              }
            : summary
        );
      });

      // Return a completely new object to ensure no references to old state
      return { ...updatedSummary };
    } catch (err) {
      console.error("Error updating summary:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      throw err;
    }
  };

  // Context value
  const value: SummaryContextType = {
    summarizing,
    error,
    summaries,
    summarizeExchange,
    getSummaries,
    updateSummary,
  };

  return (
    <SummaryContext.Provider value={value}>{children}</SummaryContext.Provider>
  );
};

export default SummaryContext;
