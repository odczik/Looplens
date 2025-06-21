'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BackButton({ fallbackPath = '/' }) {
    const router = useRouter();
    const [canGoBack, setCanGoBack] = useState(false);
    
    useEffect(() => {
        setCanGoBack(window.history.length > 1);
    }, []);
    
    const handleClick = () => {
        if (canGoBack) {
        router.back();
        } else {
        router.push(fallbackPath);
        }
    };
    
    return (
        <button onClick={handleClick}>
            Back
        </button>
    );
}