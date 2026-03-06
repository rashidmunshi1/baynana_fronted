import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ showSpinner: false, speed: 400 });

export const RouteLoader = () => {
    const location = useLocation();

    useEffect(() => {
        NProgress.start();
        const timeout = setTimeout(() => {
            NProgress.done();
        }, 500);

        return () => {
            clearTimeout(timeout);
            NProgress.done();
        };
    }, [location]);

    return null;
};
