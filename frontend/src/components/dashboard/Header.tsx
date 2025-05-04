import React from "react";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

interface HeaderProps {
  onOpenSidebar: () => void;
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  userEmail = "placeholder@email.com",
}) => {
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="h-16 px-4 flex items-center justify-between">
        <button
          onClick={onOpenSidebar}
          className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 md:text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Meeting Summariser
          </h1>
        </div>
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 bg-purple-600">
              <AvatarFallback className="text-xs font-medium text-white">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700 hidden md:inline">
              {userEmail}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
