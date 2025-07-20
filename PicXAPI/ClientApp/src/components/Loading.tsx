import React from 'react';

interface LoadingProps {
    message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="relative">
                {/* Outer spinner with gradient */}
                <div className="h-16 w-16 rounded-full animate-spin
                    bg-[conic-gradient(rgba(66,230,149,1),rgba(59,178,184,1),rgba(66,230,149,1))]
                    mask-image-[radial-gradient(farthest-side,_white_98%,_transparent_100%)]
                    mask-composite-exclude
                    border-4 border-transparent"
                ></div>

                {/* Optional inner spinner if you still want */}
                <div className="absolute top-2 left-2 h-12 w-12 rounded-full bg-white"></div>
            </div>

            {/* Optional message */}
            {message && <p className="mt-4 text-gray-600">{message}</p>}
        </div>
    );
};

export default Loading;
