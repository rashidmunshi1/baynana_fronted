import React from 'react';
import { RotateLoader } from 'react-spinners';

interface LoadingSpinnerProps {
    loading?: boolean;
    color?: string;
    size?: number;
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    loading = true,
    color = "#3F87DF",
    size = 15,
    text = "Loading..."
}) => {
    if (!loading) return null;

    return (
        <div className="flex flex-col items-center justify-center p-10 min-h-[200px]">
            <RotateLoader color={color} loading={loading} size={size} margin={5} />
            {text && <p className="mt-8 text-gray-500 font-medium">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
