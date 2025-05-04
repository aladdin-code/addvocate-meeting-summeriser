import React, { useState } from "react";
import { Sidebar } from "../components/dashboard/Sidebar";
import { Header } from "../components/dashboard/Header";
import { useAuth } from "../context/AuthContext";
import ExchangeList from "../components/exchanges/ExchangeList";

const ExchangesPage: React.FC = () => {
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

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Exchanges
                  </h2>
                  <p className="text-gray-600">
                    View and manage your exchanges here.
                  </p>
                </div>
              </div>

              {/* Exchange list component */}
              <ExchangeList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExchangesPage;
