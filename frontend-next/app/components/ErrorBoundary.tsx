import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl text-left overflow-auto">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                        <p className="text-gray-600 mb-6 font-semibold">
                            App crashed. Please send this error to your developer:
                        </p>
                        
                        <div className="bg-gray-100 p-4 rounded mb-6 overflow-x-auto text-xs font-mono text-red-500 whitespace-pre-wrap">
                            <p className="font-bold mb-2">Error: {this.state.error?.message}</p>
                            <hr className="my-2 border-gray-300"/>
                            {this.state.error?.stack}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#2874F0] text-white px-6 py-2 rounded font-bold hover:bg-blue-600 transition-colors w-full"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
