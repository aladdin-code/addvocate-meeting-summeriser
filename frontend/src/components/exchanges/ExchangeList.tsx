import React, { useState, useCallback } from "react";
import { useExchanges } from "../../context/ExchangeContext";
import { useSummary } from "../../context/SummaryContext";

// Define the Exchange interface based on the transcript data
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

interface Exchange {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
  summaries?: Summary[];
}

const ExchangeList: React.FC = () => {
  const {
    exchanges,
    pagination,
    loading: exchangesLoading,
    error: exchangesError,
    fetchExchanges,
    fetchExchange,
  } = useExchanges();

  const { summarizing, error: summaryError, summarizeExchange } = useSummary();

  const [expandedExchangeId, setExpandedExchangeId] = useState<string | null>(
    null
  );
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(
    null
  );
  const [loadingExchange, setLoadingExchange] = useState(false);
  const [exchangeSummaries, setExchangeSummaries] = useState<Summary[]>([]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      fetchExchanges(newPage, 10);
    },
    [fetchExchanges]
  );

  const handleExchangeClick = async (exchangeId: string) => {
    if (expandedExchangeId === exchangeId) {
      setExpandedExchangeId(null);
      setSelectedExchange(null);
      setExchangeSummaries([]);
      return;
    }

    try {
      setLoadingExchange(true);
      setExpandedExchangeId(exchangeId);
      const exchange = await fetchExchange(exchangeId);
      console.log("Fetched exchange:", exchange);
      setSelectedExchange(exchange);
      setExchangeSummaries(exchange.summaries || []);
    } catch (error) {
      console.error("Error fetching exchange data:", error);
    } finally {
      setLoadingExchange(false);
    }
  };

  const handleSummarize = async (exchangeId: string) => {
    try {
      const summary = await summarizeExchange(exchangeId);
      console.log("Summarized exchange:", summary);
      if (summary) {
        const exchange = await fetchExchange(exchangeId);
        setExchangeSummaries(exchange.summaries || []);
        setSelectedExchange(exchange);
      }
    } catch (error) {
      console.error("Error summarizing exchange:", error);
    }
  };

  if (exchangesLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (exchangesError && !exchangesLoading) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-600 mb-6">
        <p>Error loading exchanges: {exchangesError}</p>
        <button
          className="mt-2 text-sm underline"
          onClick={() => fetchExchanges(pagination.page, 10)}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!exchangesLoading && !exchangesError && exchanges.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-500 py-10 bg-gray-50 rounded-lg">
        <p>No exchanges found. Create your first exchange to get started.</p>
      </div>
    );
  }

  const renderExchangeDetail = () => {
    if (!selectedExchange) return null;

    return (
      <div className="mt-4 p-5 bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
        {loadingExchange ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {selectedExchange.title}
            </h3>
            {exchangeSummaries && exchangeSummaries.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-700">Summaries</h4>
                {exchangeSummaries.map((summary) => (
                  <div
                    key={summary.id}
                    className="p-3 bg-white rounded border border-gray-200"
                  >
                    {summary.content && summary.content.Overview && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700">
                          Purpose:
                        </p>
                        <p className="text-sm text-gray-600">
                          {summary.content.Overview.Purpose}
                        </p>
                        {summary.content.Overview.Conclusions && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">
                              Conclusions:
                            </p>
                            <p className="text-sm text-gray-600">
                              {summary.content.Overview.Conclusions}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {summary.content &&
                      summary.content.ActionItems &&
                      summary.content.ActionItems.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">
                            Action Items:
                          </p>
                          <ul className="list-disc pl-5 text-sm text-gray-600">
                            {summary.content.ActionItems.map((item, idx) => (
                              <li key={idx}>
                                {item.Name}: {item.Responsibility}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    {summary.content && summary.content.FollowUpEmail && (
                      <div className="mt-3 bg-blue-50 p-2 rounded">
                        <p className="text-sm font-medium text-gray-700">
                          Follow-up Email:
                        </p>
                        <p className="text-sm text-gray-600">
                          To: {summary.content.FollowUpEmail.To}
                        </p>
                        <p className="text-sm text-gray-600">
                          {summary.content.FollowUpEmail.Body}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Created: {new Date(summary.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <button
                  className="px-4 py-2 bg-[#ff8888] text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
                  onClick={() => handleSummarize(selectedExchange.id)}
                  disabled={summarizing}
                >
                  {summarizing ? "Summarizing..." : "Summarize Exchange"}
                </button>
                {summaryError && (
                  <p className="text-sm text-red-500 mt-2">{summaryError}</p>
                )}
              </div>
            )}
            <div className="mt-4 text-sm text-gray-500 flex justify-between">
              <span>
                Created: {new Date(selectedExchange.createdAt).toLocaleString()}
              </span>
              <span>
                Updated: {new Date(selectedExchange.updatedAt).toLocaleString()}
              </span>
            </div>
            {selectedExchange.messages &&
              selectedExchange.messages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Exchange contains {selectedExchange.messages.length}{" "}
                    messages
                  </p>
                  <div className="border border-gray-200 rounded p-2 max-h-32 overflow-y-auto bg-white">
                    {selectedExchange.messages.slice(0, 5).map((message) => (
                      <div
                        key={message.id}
                        className="text-xs text-gray-600 mb-1"
                      >
                        <span className="font-medium">{message.speaker}:</span>{" "}
                        {message.text.substring(0, 50)}
                        {message.text.length > 50 ? "..." : ""}
                      </div>
                    ))}
                    {selectedExchange.messages.length > 5 && (
                      <p className="text-xs text-gray-400 mt-1 italic">
                        + {selectedExchange.messages.length - 5} more messages
                      </p>
                    )}
                  </div>
                </div>
              )}
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="mt-6 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
        {exchanges.map((exchange) => (
          <div key={exchange.id} className="transition-all duration-200">
            <div
              className={`p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer ${
                expandedExchangeId === exchange.id
                  ? "border-purple-300 bg-purple-50"
                  : "border-gray-200"
              }`}
              onClick={() => handleExchangeClick(exchange.id)}
            >
              <h3 className="font-medium text-gray-900">{exchange.title}</h3>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>
                  Created: {new Date(exchange.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {expandedExchangeId === exchange.id && renderExchangeDetail()}
          </div>
        ))}
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrevious}
              className={`px-3 py-1 rounded-l-md border ${
                pagination.hasPrevious
                  ? "bg-white hover:bg-gray-50 text-purple-600 border-purple-200"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <div className="px-4 py-1 border-t border-b text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className={`px-3 py-1 rounded-r-md border ${
                pagination.hasNext
                  ? "bg-white hover:bg-gray-50 text-purple-600 border-purple-200"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

export default ExchangeList;
