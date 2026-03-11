import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Loader */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 bg-white dark:bg-slate-950 rounded-full"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full blur-sm opacity-30 animate-pulse"></div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">Loading</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Please wait a moment...</p>
        </div>

        {/* Loading Dots */}
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
