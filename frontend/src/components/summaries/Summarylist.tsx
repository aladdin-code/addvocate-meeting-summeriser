import React, { useEffect, useState } from "react";
import {
  SummaryContent,
  ExchangeSummary,
  useSummary,
} from "../../context/SummaryContext";
import EditSummary from "./EditSummary";

const SummaryList: React.FC = () => {
  const { summaries, getSummaries, updateSummary } = useSummary();
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [expandedSummary, setExpandedSummary] = useState<string | null>(null);

  // Add state for edit popup
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [editingSummaryId, setEditingSummaryId] = useState<string | null>(null);

  // Fetch summaries when component mounts - only once
  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        await getSummaries();
      } catch (err: any) {
        console.error("Failed to fetch summaries:", err);
        setFetchError(err.message || "Failed to fetch summaries.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle summary update
  const handleUpdateSummary = async (
    id: string,
    updatedContent: Partial<SummaryContent>
  ) => {
    try {
      await updateSummary(id, updatedContent);
      alert("Summary updated successfully!");
    } catch (err: any) {
      console.error("Failed to update summary:", err);
      alert("Failed to update summary: " + err.message);
    }
  };

  // Helper function to access summary data whether it's in content or at root
  const getSummaryData = (summary: ExchangeSummary): SummaryContent => {
    // If summary has content property with Overview, use that
    if (summary.content && summary.content.Overview) {
      return summary.content;
    }

    // Otherwise construct a SummaryContent object from root properties
    return {
      Overview: summary.Overview || { Purpose: "", Conclusions: "" },
      Notes: summary.Notes || [],
      ActionItems: summary.ActionItems || [],
      FollowUpEmail: summary.FollowUpEmail || { To: "", Body: "" },
    };
  };

  // Check if summary has valid structure
  const isValidSummary = (summary: ExchangeSummary): boolean => {
    const data = getSummaryData(summary);
    return (
      !!summary.id &&
      !!data.Overview &&
      !!data.ActionItems &&
      !!data.FollowUpEmail &&
      typeof data.Overview.Purpose === "string" &&
      typeof data.Overview.Conclusions === "string" &&
      Array.isArray(data.ActionItems) &&
      typeof data.FollowUpEmail.To === "string" &&
      typeof data.FollowUpEmail.Body === "string"
    );
  };

  // Toggle expanded summary
  const toggleExpandSummary = (id: string) => {
    if (expandedSummary === id) {
      setExpandedSummary(null);
    } else {
      setExpandedSummary(id);
    }
  };

  // Open edit popup
  const openEditPopup = (summaryId: string) => {
    setEditingSummaryId(summaryId);
    setIsEditPopupOpen(true);
  };

  // Close edit popup
  const closeEditPopup = () => {
    setIsEditPopupOpen(false);
    setEditingSummaryId(null);
  };

  return (
    <div className="h-full p-4">
      {loading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{fetchError}</span>
        </div>
      )}

      {summaries.length === 0 && !loading && !fetchError ? (
        <div className="text-center py-10">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No summaries
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No summaries are currently available.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {summaries.map((summary, index) => {
            const summaryData = getSummaryData(summary);
            return (
              <div
                key={summary.id || index}
                className="border rounded-lg overflow-hidden shadow-sm bg-white transition hover:shadow-md"
              >
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800 truncate">
                    {summaryData.Overview?.Purpose?.substring(0, 50)}
                    {summaryData.Overview?.Purpose?.length > 50 ? "..." : ""}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {/* Add Edit icon */}
                    <button
                      onClick={() => openEditPopup(summary.id)}
                      className="text-gray-500 hover:text-purple-600"
                      title="Edit Summary"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleExpandSummary(summary.id)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {expandedSummary === summary.id ? (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {isValidSummary(summary) && expandedSummary === summary.id && (
                  <div>
                    <div className="border-b border-gray-100">
                      <nav className="flex">
                        <button
                          className={`px-4 py-2 text-sm font-medium ${
                            activeTab === "overview"
                              ? "text-purple-600 border-b-2 border-purple-500"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                          onClick={() => setActiveTab("overview")}
                        >
                          Overview
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium ${
                            activeTab === "notes"
                              ? "text-purple-600 border-b-2 border-purple-500"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                          onClick={() => setActiveTab("notes")}
                        >
                          Notes
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium ${
                            activeTab === "actions"
                              ? "text-purple-600 border-b-2 border-purple-500"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                          onClick={() => setActiveTab("actions")}
                        >
                          Actions
                        </button>
                        <button
                          className={`px-4 py-2 text-sm font-medium ${
                            activeTab === "email"
                              ? "text-purple-600 border-b-2 border-purple-500"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                          onClick={() => setActiveTab("email")}
                        >
                          Follow-up
                        </button>
                      </nav>
                    </div>

                    <div className="p-6">
                      {activeTab === "overview" && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Purpose
                            </h4>
                            <p className="mt-1 text-sm text-gray-800">
                              {summaryData.Overview.Purpose}
                            </p>
                          </div>
                          {summaryData.Overview.KeyTopics && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-500">
                                Key Topics
                              </h4>
                              <ul className="mt-1 pl-5 list-disc text-sm text-gray-800">
                                {summaryData.Overview.KeyTopics.map(
                                  (topic, index) => (
                                    <li key={index}>{topic}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Conclusions
                            </h4>
                            <p className="mt-1 text-sm text-gray-800">
                              {summaryData.Overview.Conclusions}
                            </p>
                          </div>
                        </div>
                      )}

                      {activeTab === "notes" && (
                        <div className="space-y-4">
                          {summaryData.Notes && summaryData.Notes.length > 0 ? (
                            summaryData.Notes.map((note, index) => (
                              <div
                                key={index}
                                className="p-3 bg-gray-50 rounded-md"
                              >
                                <h4 className="text-sm font-medium text-gray-700">
                                  {note.Theme}
                                </h4>
                                <p className="mt-1 text-sm text-gray-600">
                                  {note.Details}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">
                              No notes available.
                            </p>
                          )}
                        </div>
                      )}

                      {activeTab === "actions" && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-3">
                            Action Items
                          </h4>
                          <div className="space-y-3">
                            {summaryData.ActionItems.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className="flex items-start bg-gray-50 p-3 rounded-md"
                              >
                                <div className="flex-shrink-0 h-5 w-5 text-purple-500">
                                  <svg viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.Name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    Responsible: {item.Responsibility}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "email" && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              To
                            </h4>
                            <p className="mt-1 text-sm text-gray-800">
                              {summaryData.FollowUpEmail.To}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Email Body
                            </h4>
                            <div className="mt-1 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm text-gray-800 whitespace-pre-line">
                                {summaryData.FollowUpEmail.Body}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 flex justify-end">
                      <button
                        onClick={() =>
                          handleUpdateSummary(summary.id, {
                            Overview: {
                              Purpose: "Updated Purpose",
                              Conclusions: summaryData.Overview.Conclusions,
                            },
                          })
                        }
                        className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )}

                {!isValidSummary(summary) && (
                  <div className="p-6">
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Invalid summary format
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <div className="mt-2 max-h-40 overflow-auto text-xs bg-gray-100 p-2 rounded">
                              <pre>{JSON.stringify(summary, null, 2)}</pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isValidSummary(summary) && expandedSummary !== summary.id && (
                  <div className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {summaryData.Overview.Conclusions}
                    </p>
                    <div className="mt-4 flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {summaryData.ActionItems.length} Actions
                      </span>
                      {summaryData.Notes && summaryData.Notes.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {summaryData.Notes.length} Notes
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Popup with EditSummary Component */}
      {isEditPopupOpen && editingSummaryId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#000000] bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between">
              <h3 className="text-lg font-medium text-gray-800">
                Edit Summary
              </h3>
              <button
                onClick={closeEditPopup}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            <EditSummary
              summaryId={editingSummaryId}
              onClose={closeEditPopup}
              onSave={() => {
                closeEditPopup();
                window.location.reload();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryList;
