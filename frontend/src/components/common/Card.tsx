import React from "react";

type CardProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const Card: React.FC<CardProps> = ({ title, subtitle, children, footer }) => {
  return (
    <div className="w-full lg:max-w-md lg:mx-auto lg:mt-20 bg-white lg:rounded-2xl lg:shadow-xl lg:p-6 p-0">
      {(title || subtitle) && (
        <div className="mb-4 lg:border-b border-gray-200">
          {title && (
            <h3 className="text-2xl font-semibold text-center text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-center text-gray-500">{subtitle}</p>
          )}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 lg:border-t border-gray-200 lg:bg-gray-50 p-4">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
