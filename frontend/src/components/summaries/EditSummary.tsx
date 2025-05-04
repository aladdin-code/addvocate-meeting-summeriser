import React, { useState, useEffect } from "react";
import {
  SummaryContent,
  ExchangeSummary,
  useSummary,
} from "../../context/SummaryContext";

interface EditSummaryProps {
  summaryId: string;
  onClose: () => void;
  onSave: () => void;
}

const EditSummary: React.FC<EditSummaryProps> = ({
  summaryId,
  onClose,
  onSave,
}) => {
  const { summaries, updateSummary } = useSummary();
  const [formData, setFormData] = useState<SummaryContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");

  // Find the summary to edit
  useEffect(() => {
    const summary = summaries.find((s) => s.id === summaryId);
    if (summary) {
      // Initialize with summary data
      setFormData(getSummaryData(summary));
    } else {
      setError("Summary not found");
    }
  }, [summaryId, summaries]);

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

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    if (!formData) return;

    // Handle nested fields
    if (field.includes(".")) {
      const [section, key] = field.split(".");
      setFormData({
        ...formData,
        [section]: {
          ...formData[section as keyof SummaryContent],
          [key]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [field]: value,
      });
    }
  };

  // Handle action item change
  const handleActionItemChange = (
    index: number,
    field: string,
    value: string
  ) => {
    if (!formData) return;

    const updatedActionItems = [...formData.ActionItems];
    updatedActionItems[index] = {
      ...updatedActionItems[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      ActionItems: updatedActionItems,
    });
  };

  // Handle note change
  const handleNoteChange = (index: number, field: string, value: string) => {
    if (!formData) return;

    const updatedNotes = [...(formData.Notes || [])];
    updatedNotes[index] = {
      ...updatedNotes[index],
      [field]: value,
    };

    setFormData({
      ...formData,
      Notes: updatedNotes,
    });
  };

  // Add a new action item
  const addActionItem = () => {
    if (!formData) return;

    setFormData({
      ...formData,
      ActionItems: [...formData.ActionItems, { Name: "", Responsibility: "" }],
    });
  };

  // Remove an action item
  const removeActionItem = (index: number) => {
    if (!formData) return;

    const updatedActionItems = [...formData.ActionItems];
    updatedActionItems.splice(index, 1);

    setFormData({
      ...formData,
      ActionItems: updatedActionItems,
    });
  };

  // Add a new note
  const addNote = () => {
    if (!formData) return;

    setFormData({
      ...formData,
      Notes: [...(formData.Notes || []), { Theme: "", Details: "" }],
    });
  };

  // Remove a note
  const removeNote = (index: number) => {
    if (!formData) return;

    const updatedNotes = [...(formData.Notes || [])];
    updatedNotes.splice(index, 1);

    setFormData({
      ...formData,
      Notes: updatedNotes,
    });
  };

  // In the EditSummary component
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    try {
      setLoading(true);
      setError(null);

      // Wait for the update to complete
      const result = await updateSummary(summaryId, formData);
      console.log("Summary updated successfully:", result);

      // Force a re-render in the parent component
      onSave();

      // Could also add a timeout to ensure state has time to update
      // setTimeout(() => onSave(), 100);
    } catch (err: any) {
      console.error("Error in EditSummary:", err);
      setError(err.message || "Failed to update summary");
    } finally {
      setLoading(false);
    }
  };

  if (!formData) {
    return (
      <div className="p-6 flex-grow flex items-center justify-center">
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full max-h-full overflow-hidden"
    >
      {/* Sticky navigation tabs with improved scrolling */}
      <div className="border-b border-gray-100 sticky top-0 bg-white z-10">
        <nav className="flex overflow-x-auto py-1 px-1 no-scrollbar">
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
              activeSection === "overview"
                ? "text-purple-600 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveSection("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
              activeSection === "notes"
                ? "text-purple-600 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveSection("notes")}
          >
            Notes
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
              activeSection === "actions"
                ? "text-purple-600 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveSection("actions")}
          >
            Actions
          </button>
          <button
            type="button"
            className={`px-3 py-2 text-sm font-medium whitespace-nowrap ${
              activeSection === "email"
                ? "text-purple-600 border-b-2 border-purple-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveSection("email")}
          >
            Follow-up
          </button>
        </nav>
      </div>

      {/* Main content area with improved scrolling */}
      <div
        className="p-4 overflow-y-auto flex-grow"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {activeSection === "overview" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Purpose
              </label>
              <textarea
                className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                value={formData.Overview.Purpose}
                onChange={(e) =>
                  handleFormChange("Overview.Purpose", e.target.value)
                }
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Conclusions
              </label>
              <textarea
                className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                value={formData.Overview.Conclusions}
                onChange={(e) =>
                  handleFormChange("Overview.Conclusions", e.target.value)
                }
                rows={3}
              />
            </div>
            {formData.Overview.KeyTopics && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Topics
                </label>
                {formData.Overview.KeyTopics.map((topic, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      className="p-2 flex-grow border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                      value={topic}
                      onChange={(e) => {
                        const newTopics = [
                          ...(formData.Overview.KeyTopics || []),
                        ];
                        newTopics[index] = e.target.value;
                        handleFormChange("Overview.KeyTopics", newTopics);
                      }}
                    />
                    <button
                      type="button"
                      className="ml-2 p-2 text-red-500 hover:text-red-700"
                      onClick={() => {
                        const newTopics = [
                          ...(formData.Overview.KeyTopics || []),
                        ];
                        newTopics.splice(index, 1);
                        handleFormChange("Overview.KeyTopics", newTopics);
                      }}
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 flex items-center text-sm text-purple-600 hover:text-purple-800"
                  onClick={() => {
                    const newTopics = formData.Overview.KeyTopics || [];
                    handleFormChange("Overview.KeyTopics", [...newTopics, ""]);
                  }}
                >
                  <svg
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Topic
                </button>
              </div>
            )}
          </div>
        )}

        {activeSection === "notes" && (
          <div className="space-y-4">
            {formData.Notes?.map((note, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Note {index + 1}
                  </h4>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeNote(index)}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-600">
                    Theme
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    value={note.Theme}
                    onChange={(e) =>
                      handleNoteChange(index, "Theme", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Details
                  </label>
                  <textarea
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    value={note.Details}
                    onChange={(e) =>
                      handleNoteChange(index, "Details", e.target.value)
                    }
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 flex items-center text-sm text-purple-600 hover:text-purple-800"
              onClick={addNote}
            >
              <svg
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Note
            </button>
          </div>
        )}

        {activeSection === "actions" && (
          <div className="space-y-4">
            {formData.ActionItems.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 rounded-md border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Action Item {index + 1}
                  </h4>
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => removeActionItem(index)}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-600">
                    Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    value={item.Name}
                    onChange={(e) =>
                      handleActionItemChange(index, "Name", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Responsibility
                  </label>
                  <input
                    type="text"
                    className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    value={item.Responsibility}
                    onChange={(e) =>
                      handleActionItemChange(
                        index,
                        "Responsibility",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 flex items-center text-sm text-purple-600 hover:text-purple-800"
              onClick={addActionItem}
            >
              <svg
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Action Item
            </button>
          </div>
        )}

        {activeSection === "email" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                To
              </label>
              <input
                type="text"
                className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                value={formData.FollowUpEmail.To}
                onChange={(e) =>
                  handleFormChange("FollowUpEmail.To", e.target.value)
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Body
              </label>
              <textarea
                className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                value={formData.FollowUpEmail.Body}
                onChange={(e) =>
                  handleFormChange("FollowUpEmail.Body", e.target.value)
                }
                rows={8}
              />
            </div>
          </div>
        )}

        {/* Add padding at the bottom to ensure content isn't hidden behind the sticky footer */}
        <div className="h-16"></div>
      </div>

      {/* Sticky footer for buttons */}
      <div className="px-4 py-3 bg-gray-50 flex justify-end border-t border-gray-100 sticky bottom-0 left-0 right-0 z-10">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mr-2"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-2 bg-[#9878f7] text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
};

export default EditSummary;
