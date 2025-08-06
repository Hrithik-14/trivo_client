import React from "react";

type Props = {
  error: Error;
  resetErrorBoundary: () => void;
};

export default function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <div className="p-10 text-center bg-red-50 text-red-700 rounded-md">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="mt-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
