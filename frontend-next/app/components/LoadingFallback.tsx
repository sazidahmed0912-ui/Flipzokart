import React from 'react';
import SignatureLoader from './ui/SignatureLoader';

const LoadingFallback: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <SignatureLoader />
        </div>
    );
};

export default LoadingFallback;
