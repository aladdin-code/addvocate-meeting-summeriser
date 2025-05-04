import React, { useState } from "react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Header } from "../components/dashboard/Header";
import { useAuth } from "../context/AuthContext";
import SummaryList from "../components/summaries/Summarylist";

const SummariesPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          userEmail={user?.email || ""}
        />

        {/* Main content area */}
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Summaries
              </h2>

              {/* Fixed height scrollable container for SummaryList */}
              <div
                className="overflow-y-auto"
                style={{ height: "calc(100vh - 200px)" }} // Adjust the value as needed
              >
                <SummaryList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SummariesPage;
