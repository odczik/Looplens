'use client';

import { useEffect, useState, useRef, use } from 'react';
import { delay, scaleHeight } from '@/app/_utils'

export default function BubbleSortAlgorithm() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Controls
    const [play, setPlay] = useState<boolean>(false);
    const resetRef = useRef<HTMLButtonElement>(null!);
    const backwardRef = useRef<HTMLButtonElement>(null!);

    // Delays
    const stepDelay = useRef<number>(300); // Delay for each step in milliseconds
    const swapDelay = useRef<number>(300); // Delay for each step in milliseconds

    // Array state
    const arrayRef = useRef<number[]>([]);
    const resetTokenRef = useRef<number>(0);
    const size = useRef<number>(10); // Default size of the array
    
    // Sorting state trackers
    const isSortingRef = useRef<boolean>(false);
    const playRef = useRef<boolean>(play);
    const previousStatesRef = useRef<{array: number[], i: number, j: number}[]>([]);
    
    // Store current position in the sort algorithm
    const sortPositionRef = useRef<{i: number, j: number}>({i: 0, j: 0});

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
            const height = scaleHeight(value, canvas, size);
            ctx.fillRect(index * barWidth, canvas.height - height, barWidth - 2, height);
        
            // Draw value text if size is small enough
            if(size.current <= 10) {
                ctx.fillStyle = 'white';
                ctx.font = '36px Arial';
                ctx.fillText(value.toString(), index * barWidth + (barWidth / 2) - 10, canvas.height - 20);
            }
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
                await delay(stepDelay.current);
                
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
                    if(swapDelay.current) await delay(swapDelay.current);
                    
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
                
                previousStatesRef.current.push({
                    array: [...arr],
                    i: i,
                    j: j
                });
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
        const newArray = Array.from({ length: size.current }, (_, i) => i); // [0-9]
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
        
        // Connect backward button (if you're keeping this functionality)
        if (backwardRef.current) {
            backwardRef.current.onclick = handleBackward;
        }
        
        return () => {
            if (resetRef.current) {
                resetRef.current.onclick = null;
            }
            if (backwardRef.current) {
                backwardRef.current.onclick = null;
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

    const handleSizeChange = (newSize: number) => {
        size.current = newSize;
        shuffleArray();
    }

    // Add this function before the return statement
    const handleBackward = async () => {
        // Pause the sorting if it's currently running
        setPlay(false);
        
        // Check if we have previous states
        if (previousStatesRef.current.length === 0) {
            return; // Can't go back further
        }
        
        // Get the previous state
        const prevState = previousStatesRef.current.pop()!;
        
        // Restore the previous state
        arrayRef.current = [...prevState.array];
        sortPositionRef.current = { i: prevState.i, j: prevState.j };
        
        // Redraw the array with the current comparison highlighted
        drawArray(arrayRef.current, [prevState.j, prevState.j + 1]);
    };

    return (
        <div className="algorithmPlayground">
            <h1>Bubble sort page</h1>
            <details className="algorithmDescription">
                <summary>Additional details</summary>
                <div>
                    <p>Bubble sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements, and swaps
                    them if they are in the wrong order. The pass through the list is repeated until the list is sorted. The algorithm gets its name from the way smaller elements "bubble" to the top of the list.</p>
                    <p>Time complexity: <b>O(n^2)</b> in the worst case, <b>O(n)</b> in the best case (when the array is already sorted).</p>
                    <p>Space complexity: <b>O(1)</b> as it sorts the array in place.</p>
                    <p>This implementation allows you to visualize the sorting process, control the speed of the algorithm, and adjust the size of the array being sorted.</p>
                    <ul>
                        <li><span style={{color: '#ff006e'}}>Red</span> - First index being compared</li>
                        <li><span style={{color: '#4cc9f0'}}>Light Blue</span> - Second index being compared</li>
                        <li><span style={{color: '#4361ee'}}>Default</span> - Other elements in the array</li>
                    </ul>
                </div>
            </details>
            <div className="bubble-sort-container">
                <canvas ref={canvasRef} width={800} height={600} />
                <div className="controlsContainer">
                    <div className="generalControls">
                        <button className="iconContainer" ref={backwardRef} onClick={handleBackward}>
                            <span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/undo.png')"}}></span>
                        </button>
                        <button className="iconContainer" onClick={() => setPlay(!play)}>
                            {play ? (
                                <span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/pause.png')"}}></span>
                            ) : (
                                <span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/play--v1.png')"}}></span>
                            )}
                        </button>
                        <button className="iconContainer" ref={resetRef}><span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/restart--v1.png')"}}></span></button>
                    </div>
                    <div className="algorithmControls">
                        <span>
                            <label htmlFor="arraySize">Array size: </label>
                            <input type='number' id='arraySize' min={10} max={200} step={5} defaultValue={size.current} onChange={(e) => handleSizeChange(Number(e.target.value))} />
                        </span>
                        <span>
                            <label htmlFor="stepDelay">Step delay (ms): </label>
                            <input type='number' id='stepDelay' min={10} max={500} step={10} defaultValue={stepDelay.current} onChange={(e) => stepDelay.current = Number(e.target.value)} />
                        </span>
                        <span>
                            <label htmlFor="swapDelay">Delay after swap (ms): </label>
                            <input type='number' id='swapDelay' min={0} max={500} step={10} defaultValue={swapDelay.current} onChange={(e) => swapDelay.current = Number(e.target.value)} />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}