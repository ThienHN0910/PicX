import React from 'react';

interface LoadingProps {
    message?: string;
}

const Loading: React.FC<LoadingProps> = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="relative">
                {/* Spinner */}
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-indigo-600"></div>
                {/* Inner spinner */}
                <div className="absolute top-2 left-2 animate-spin rounded-full h-12 w-12 border-4 border-gray-100 border-t-indigo-400"></div>
            </div>
           
        </div>
    );
};

export default Loading;