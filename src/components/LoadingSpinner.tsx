import React from "react";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message = "Cargando...",
}) => {
  const spinnerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={spinnerClasses}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-motoRed mx-auto mb-4"></div>
        <p className="text-motoGray">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
