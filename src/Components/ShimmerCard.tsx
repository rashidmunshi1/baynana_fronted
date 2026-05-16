import React from 'react';

export const ShimmerBusinessCard = () => {
    return (
        <div className="bg-white pb-3 border-b-[6px] border-gray-100 cursor-pointer animate-pulse">
            <div className="flex gap-3 overflow-hidden px-4 pt-4 pb-3">
                <div className="w-[110px] sm:w-[130px] h-[140px] flex-shrink-0 bg-gray-200 rounded-xl"></div>
                <div className="w-[110px] sm:w-[130px] h-[140px] flex-shrink-0 bg-gray-200 rounded-xl"></div>
                <div className="w-[110px] sm:w-[130px] h-[140px] flex-shrink-0 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="px-4 mt-1">
                <div className="flex items-center gap-3 mb-2.5">
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-2">
                    <div className="flex-[1.2] min-w-[120px] h-[44px] bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 min-w-[110px] h-[44px] bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 min-w-[110px] h-[44px] bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        </div>
    );
};

export const ShimmerCategory = () => {
    return (
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 w-full max-w-[76px] sm:max-w-[84px] md:max-w-[100px] animate-pulse">
            <div className="w-[52px] h-[52px] sm:w-[64px] sm:h-[64px] md:w-[76px] md:h-[76px] lg:w-[90px] lg:h-[90px] bg-gray-200 rounded-xl lg:rounded-2xl"></div>
            <div className="h-3 bg-gray-200 rounded w-10 sm:w-12 mt-1"></div>
        </div>
    );
};

export const ShimmerBusinessDetail = () => {
    return (
        <div className="min-h-screen bg-white pb-20 font-sans animate-pulse">
            <div className="bg-gray-300 pt-6 pb-16 px-4 relative" style={{ borderBottomLeftRadius: '50% 15%', borderBottomRightRadius: '50% 15%' }}>
                <div className="max-w-3xl mx-auto h-24"></div>
            </div>
            <div className="max-w-3xl mx-auto px-4 md:px-8">
                <div className="-mt-8 relative z-10 w-full mb-6 flex justify-center gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-gray-200 border border-gray-100 rounded-lg w-16 h-16 shadow-sm"></div>
                    ))}
                </div>
                <div className="bg-gray-200 h-48 md:h-64 rounded-xl mb-6 w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
                <hr className="border-gray-100 my-3" />
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
            </div>
        </div>
    );
};

export const ShimmerBanner = () => {
    return (
        <div className="bg-gray-200 animate-pulse rounded-xl sm:rounded-2xl shadow-sm aspect-[16/7] sm:aspect-[21/9] md:aspect-[3/1] lg:aspect-[4/1] w-full"></div>
    );
};
