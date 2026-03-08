import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { RotateLoader } from 'react-spinners';

export const RouteLoader = () => {
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 500);

        return () => {
            clearTimeout(timeout);
            setIsLoading(false);
        };
    }, [location]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <RotateLoader color="#3F87DF" size={15} margin={5} />
        </div>
    );
};
