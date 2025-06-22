'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import style from './backButton.module.css';

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
        <button onClick={handleClick} className={style.backButton}>
            <span className={style.iconContainer}><span className={style.icon}></span></span>
            Back
        </button>
    );
}