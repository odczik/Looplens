'use client';

import { useEffect, useState, useRef } from 'react';
import { delay } from '@/app/_utils'

export default function BubbleSortAlgorithm({ play, setPlay, resetRef }: { 
    play: boolean, 
    setPlay: React.Dispatch<React.SetStateAction<boolean>>, 
    forwardRef: React.RefObject<HTMLButtonElement>, // Keeping for interface compatibility but not using
    resetRef: React.RefObject<HTMLButtonElement> 
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    
    // Array state
    const arrayRef = useRef<number[]>([]);
    const resetTokenRef = useRef<number>(0);
    
    // Sorting state trackers
    const isSortingRef = useRef<boolean>(false);
    const playRef = useRef<boolean>(play);
    
    // Highlights for visualization
    const [comparisonIndices, setComparisonIndices] = useState<[number, number] | null>(null);
    
    // Map array values to visual heights - ensure distinct heights
    function scaleHeight(value: number, canvas: HTMLCanvasElement): number {
        const maxValue = 9; // Maximum value in our array [0-9]
        const minHeight = canvas.height * 0.1; // Minimum height (10% of canvas)
        const maxHeight = canvas.height; // Maximum height (90% of canvas)
        
        // Linear interpolation between min and max heights
        return minHeight + (value / maxValue) * (maxHeight - minHeight);
    }

    const drawArray = (arr: number[], highlightIndices: [number, number] | null = null) => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / arr.length;

        arr.forEach((value, index) => {
            const isHighlighted = highlightIndices !== null && 
                (index === highlightIndices[0] || index === highlightIndices[1]);
            
            // Set bar color
            ctx.fillStyle = isHighlighted ? '#ff6b6b' : '#4361ee';
            
            // Draw bar
            const height = scaleHeight(value, canvas);
            ctx.fillRect(index * barWidth, canvas.height - height, barWidth - 2, height);
        
            // Draw value text
            ctx.fillStyle = 'white';
            ctx.font = '36px Arial';
            ctx.fillText(value.toString(), index * barWidth + (barWidth / 2) - 10, canvas.height - 20);
            
            // Add highlight border if needed
            if (isHighlighted) {
                ctx.strokeStyle = '#ffd60a';
                ctx.lineWidth = 3;
                ctx.strokeRect(index * barWidth, canvas.height - height, barWidth - 2, height);
            }
        });
    };

    const bubbleSort = async () => {
        if (isSortingRef.current) return; // Prevent multiple sort operations
        
        const currentResetToken = resetTokenRef.current;
        isSortingRef.current = true;
        
        const arr = [...arrayRef.current];
        const n = arr.length;
        
        // Bubble sort algorithm
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                // Stop sorting if reset or pause
                if (currentResetToken !== resetTokenRef.current || !playRef.current) {
                    isSortingRef.current = false;
                    setComparisonIndices(null);
                    return;
                }
                
                // Show current comparison
                setComparisonIndices([j, j + 1]);
                drawArray(arr, [j, j + 1]);
                await delay(100);
                
                // Check again after delay
                if (currentResetToken !== resetTokenRef.current || !playRef.current) {
                    isSortingRef.current = false;
                    setComparisonIndices(null);
                    return;
                }
                
                // Swap if needed
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    drawArray(arr, [j, j + 1]);
                    await delay(100);
                    
                    // Check again after swap
                    if (currentResetToken !== resetTokenRef.current || !playRef.current) {
                        isSortingRef.current = false;
                        setComparisonIndices(null);
                        return;
                    }
                }
                
                // Keep array state updated
                arrayRef.current = [...arr];
            }
        }
        
        // Sorting complete
        setComparisonIndices(null);
        drawArray(arr);
        isSortingRef.current = false;
        setPlay(false);
    };

    const shuffleArray = () => {
        // Stop any ongoing sorting
        isSortingRef.current = false;
        playRef.current = false;
        setPlay(false);
        
        // Signal reset
        resetTokenRef.current += 1;
        
        // Create and shuffle new array
        const newArray = Array.from({ length: 10 }, (_, i) => i); // [0-9]
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        
        // Update state
        arrayRef.current = [...newArray];
        setComparisonIndices(null);
        
        // Redraw
        drawArray(newArray);
    };

    // Initialize
    useEffect(() => {
        if (canvasRef.current) {
            ctxRef.current = canvasRef.current.getContext('2d');
            shuffleArray();
        }
        
        // Connect reset button
        if (resetRef.current) {
            resetRef.current.onclick = shuffleArray;
        }
        
        return () => {
            if (resetRef.current) {
                resetRef.current.onclick = null;
            }
        };
    }, []);

    // Handle play state changes
    useEffect(() => {
        playRef.current = play;
        
        if (play && !isSortingRef.current) {
            bubbleSort();
        }
    }, [play]);

    return (
        <div className="bubble-sort-container">
            <canvas ref={canvasRef} width={800} height={600} />
        </div>
    );
}