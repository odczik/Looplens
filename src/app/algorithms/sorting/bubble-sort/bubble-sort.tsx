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
    
    // Store current position in the sort algorithm
    const sortPositionRef = useRef<{i: number, j: number}>({i: 0, j: 0});
    
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
            // Set bar color
            ctx.fillStyle = '#4361ee';

            if(index === highlightIndices?.[0]) {
                ctx.fillStyle = '#ff006e'; // Highlight first index
            } else if(index === highlightIndices?.[1]) {
                ctx.fillStyle = '#4cc9f0'; // Highlight second index
            }
            
            // Draw bar
            const height = scaleHeight(value, canvas);
            ctx.fillRect(index * barWidth, canvas.height - height, barWidth - 2, height);
        
            // Draw value text
            ctx.fillStyle = 'white';
            ctx.font = '36px Arial';
            ctx.fillText(value.toString(), index * barWidth + (barWidth / 2) - 10, canvas.height - 20);
        });
    };

    const bubbleSort = async () => {
        if (isSortingRef.current) return; // Prevent multiple sort operations
        
        const currentResetToken = resetTokenRef.current;
        isSortingRef.current = true;
        
        // Use the current state of the array from our ref
        const arr = [...arrayRef.current];
        const n = arr.length;
        
        // Resume from where we left off, or start from beginning
        let i = sortPositionRef.current.i;
        let j = sortPositionRef.current.j;
        
        // Bubble sort algorithm
        for (; i < n - 1; i++) {
            // On first iteration of outer loop, use saved j
            // On subsequent iterations, start j from 0
            for (; j < n - i - 1; j++) {
                // Stop sorting if reset
                if (currentResetToken !== resetTokenRef.current) {
                    isSortingRef.current = false;
                    // Reset sort position on reset
                    sortPositionRef.current = {i: 0, j: 0};
                    return;
                }
                
                // Pause if play is false
                if (!playRef.current) {
                    isSortingRef.current = false;
                    // Save current position before pausing
                    sortPositionRef.current = {i, j};
                    // Keep comparison indices visible during pause
                    // And ensure the array state is saved
                    arrayRef.current = [...arr];
                    return;
                }
                
                // Show current comparison
                drawArray(arr, [j, j + 1]);
                await delay(300);
                
                // Check again after delay
                if (currentResetToken !== resetTokenRef.current) {
                    isSortingRef.current = false;
                    sortPositionRef.current = {i: 0, j: 0};
                    return;
                }
                
                if (!playRef.current) {
                    isSortingRef.current = false;
                    sortPositionRef.current = {i, j};
                    // Save array state before pausing
                    arrayRef.current = [...arr];
                    return;
                }
                
                // Swap if needed
                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    
                    // Immediately update the array reference to preserve the swap
                    arrayRef.current = [...arr];
                    
                    drawArray(arr, [j + 1, j]);
                    await delay(300);
                    
                    // Check again after swap
                    if (currentResetToken !== resetTokenRef.current) {
                        isSortingRef.current = false;
                        sortPositionRef.current = {i: 0, j: 0};
                        return;
                    }
                    
                    if (!playRef.current) {
                        isSortingRef.current = false;
                        sortPositionRef.current = {i, j};
                        // Array state is already updated above
                        return;
                    }
                }
            }
            // Reset j to 0 for the next iteration of the outer loop
            j = 0;
        }
        
        // Sorting complete
        drawArray(arr);
        arrayRef.current = [...arr]; // Ensure final state is saved
        isSortingRef.current = false;
        sortPositionRef.current = {i: 0, j: 0}; // Reset position for next run
        setPlay(false);
    };

    const shuffleArray = () => {
        // Stop any ongoing sorting
        isSortingRef.current = false;
        playRef.current = false;
        setPlay(false);
        
        // Reset sort position
        sortPositionRef.current = {i: 0, j: 0};
        
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