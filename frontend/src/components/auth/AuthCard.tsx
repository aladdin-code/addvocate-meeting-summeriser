import React from "react";
import Card from "../common/Card";

interface AuthCardProps {
  title: string;
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, children }) => {
  return (
    <Card>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
        {children}
      </div>
    </Card>
  );
};
