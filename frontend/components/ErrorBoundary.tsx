import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCcw, WifiOff } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    isChunkError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        isChunkError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Check if error is a chunk loading error
        const isChunkError =
            error.message?.includes("Loading chunk") ||
            error.message?.includes("Unable to preload CSS") ||
            error.message?.includes("Importing a module script failed");

        return { hasError: true, isChunkError };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        // Auto-reload ONCE if it's a chunk error
        if (
            this.state.isChunkError &&
            !window.location.search.includes("reloaded=true")
        ) {
            console.log("Chunk load error detected. Auto-reloading...");
            window.location.assign(window.location.href + (window.location.href.includes("?") ? "&" : "?") + "reloaded=true");
        }
    }

    private handleReload = () => {
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            if (this.state.isChunkError) {
                // If we are here, it means auto-reload might have failed or looped, so show manual option
                return (
                    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-4">
                        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-gray-100">
                            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RefreshCcw size={32} />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Update Available</h1>
                            <p className="text-gray-500 mb-6">
                                A new version of the app is available. Please refresh to load the latest features.
                            </p>
                            <button
                                onClick={this.handleReload}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all w-full"
                            >
                                Refresh Now
                            </button>
                        </div>
                    </div>
                );
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-4">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <WifiOff size={32} />
                        </div>
                        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
                        <p className="text-gray-500 mb-4">Please check your connection and try again.</p>
                        <button
                            onClick={this.handleReload}
                            className="text-blue-600 font-medium hover:underline"
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

export default ErrorBoundary;
