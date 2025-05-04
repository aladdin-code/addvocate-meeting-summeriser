import React from "react";

interface AuthFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ children, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
    </form>
  );
};
