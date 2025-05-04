import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, MessageSquare, FileText } from "lucide-react";
import { cn } from "../../utils/utils";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { useAuth } from "../../context/AuthContext";

const styles = {
  primaryColor: "#9878f7",
  darkColor: "#1a0047",
  lightPurpleBackground: "#f5f0ff",
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  href,
  icon,
  label,
  active,
}) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 w-full",
        "relative overflow-hidden group",
        active
          ? "text-purple-800 font-medium shadow-sm"
          : "text-gray-600 hover:bg-purple-50 hover:text-purple-700 hover:shadow-sm"
      )}
      style={active ? { backgroundColor: styles.lightPurpleBackground } : {}}
    >
      {/* Left accent bar for active state */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1.5 transform transition-all duration-300",
          active
            ? "translate-x-0"
            : "-translate-x-full group-hover:translate-x-0"
        )}
        style={{
          backgroundColor: styles.primaryColor,
        }}
      />

      {/* Icon with transition effect */}
      <div
        className={cn(
          "h-5 w-5 transition-all duration-300",
          active ? "scale-110" : "group-hover:scale-110"
        )}
        style={{
          color: active ? styles.primaryColor : "#6b7280",
        }}
      >
        {icon}
      </div>

      {/* Label with font weight transition */}
      <span
        className={cn(
          "text-sm transition-all duration-300",
          active
            ? "font-medium translate-x-1"
            : "group-hover:font-medium group-hover:translate-x-1"
        )}
        style={{
          color: active ? styles.primaryColor : "#6b7280",
        }}
      >
        {label}
      </span>
    </Link>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const userEmail = user?.email || "user@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();

  // State for logout confirmation dialog
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex flex-col fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="px-4 py-6">
            <img
              src="https://addvocate.ai/wp-content/uploads/2024/07/Logo-Addvocate-1.png"
              alt="Addvocate Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Navigation */}
          <div className="mt-6 space-y-1 pr-0 pl-1">
            <SidebarItem
              href="/exchanges"
              icon={<MessageSquare />}
              label="Exchanges"
              active={location.pathname === "/exchanges"}
            />
            <SidebarItem
              href="/summaries"
              icon={<FileText />}
              label="Summaries"
              active={location.pathname === "/summaries"}
            />
          </div>
        </div>

        {/* User profile & logout */}
        <div className="px-4 py-6 border-t border-grey-100">
          <div className="flex items-center mb-4">
            <Avatar
              className="h-8 w-8 mr-3"
              style={{ backgroundColor: styles.primaryColor }}
            >
              <AvatarFallback className="text-xs font-medium text-white">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 truncate">
              {userEmail}
            </span>
          </div>
          <button
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 group"
            style={{
              color: "#dc2626",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fee2e2";
              e.currentTarget.style.boxShadow =
                "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={() => setShowLogoutConfirmation(true)}
          >
            <LogOut className="h-5 w-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirmation && (
        <>
          {/* Modal backdrop */}
          <div
            className="fixed inset-0 bg-[rgba(39,39,39,0.4)] z-50"
            onClick={() => setShowLogoutConfirmation(false)}
          />

          {/* Modal content */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-lg bg-white shadow-lg p-6">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Logout
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to log out of your account?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setShowLogoutConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-300"
                style={{
                  color: "#dc2626",
                  backgroundColor: "transparent",
                  border: "1px solid #dc2626",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fee2e2";
                  e.currentTarget.style.boxShadow =
                    "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.boxShadow = "none";
                }}
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
