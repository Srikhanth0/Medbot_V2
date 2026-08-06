import React, { Component, ReactNode, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import useSupabaseSync from '@/hooks/useSupabaseSync';

/**
 * Props for ErrorBoundary
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * State for ErrorBoundary
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Root Error Boundary Component
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-[#11222C] text-white">
          <div className="text-center space-y-4 p-8 bg-[#DDD4D8] rounded-xl text-black">
            <h1 className="text-3xl font-bold text-red-600">Something went wrong.</h1>
            <p className="text-gray-700">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#0891B2] text-white rounded hover:bg-[#067a96]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Inner Root Layout Consumer Hook for Supabase Sync
 */
const RootContent: React.FC = () => {
  useSupabaseSync();
  return <Outlet />;
};

/**
 * Top-level application layout
 */
export const RootLayout: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#11222C]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0891B2]"></div>
        </div>
      }>
        <RootContent />
      </Suspense>
    </ErrorBoundary>
  );
};
export default RootLayout;
