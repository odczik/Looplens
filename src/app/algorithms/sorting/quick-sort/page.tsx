'use client';

import { useEffect, useState, useRef } from 'react';
import { delay } from '@/app/_utils'

export default function QuickSortAlgorithm() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Controls
    const [play, setPlay] = useState<boolean>(false);
    const resetRef = useRef<HTMLButtonElement>(null!);
    const backwardRef = useRef<HTMLButtonElement>(null!); // Add backward button ref

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
    const sortingInitiatedRef = useRef<boolean>(false);
    
    // Partition state - preserves state between pausing
    const partitionStateRef = useRef<{
        low: number,
        high: number,
        pivotValue: number,
        pivotIndex: number,
        i: number,
        j: number,
        phase: 'comparing' | 'finalSwap' | 'complete'
    } | null>(null);
    
    // Stack to track recursive calls (for visualization)
    const callStackRef = useRef<{low: number, high: number}[]>([]);
    
    // Add history tracking for backward functionality
    const previousStatesRef = useRef<{
        array: number[],
        partitionState: typeof partitionStateRef.current,
        callStack: typeof callStackRef.current
    }[]>([]);

    // Map array values to visual heights - ensure distinct heights
    function scaleHeight(value: number, canvas: HTMLCanvasElement): number {
        const maxValue = size.current - 1; // Maximum value in our array
        const minHeight = canvas.height * 0.1; // Minimum height (10% of canvas)
        const maxHeight = canvas.height; // Maximum height (100% of canvas)
        
        // Linear interpolation between min and max heights
        return minHeight + (value / maxValue) * (maxHeight - minHeight);
    }

    const drawArray = (arr: number[], highlights: {pivot?: number, current?: number, left?: number} = {}) => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / arr.length;

        arr.forEach((value, index) => {
            // Set bar color
            ctx.fillStyle = '#4361ee'; // Default color
            
            if(index === highlights.pivot) {
                ctx.fillStyle = '#ff006e'; // Highlight pivot with red
            } else if(index === highlights.current) {
                ctx.fillStyle = '#4cc9f0'; // Highlight current with blue
            } else if(index === highlights.left) {
                ctx.fillStyle = '#00f5d4'; // Highlight leftmost with teal
            }
            
            // Draw bar
            const height = scaleHeight(value, canvas);
            ctx.fillRect(index * barWidth, canvas.height - height, barWidth - 2, height);
            
            // Reset shadow
            ctx.shadowBlur = 0;
        
            // Draw value text if size is small enough
            if(size.current <= 10) {
                ctx.fillStyle = 'white';
                ctx.font = '36px Arial';
                ctx.fillText(value.toString(), index * barWidth + (barWidth / 2) - 10, canvas.height - 20);
            }
        });
    };

    const quickSort = async () => {
        // If sorting is already in progress, just update the play state
        if (isSortingRef.current) {
            playRef.current = true;
            return;
        }
        
        // If sorting hasn't been initiated yet, initialize everything
        if (!sortingInitiatedRef.current) {
            sortingInitiatedRef.current = true;
            callStackRef.current = [{low: 0, high: arrayRef.current.length - 1}];
            partitionStateRef.current = null;
        }
        
        const currentResetToken = resetTokenRef.current;
        isSortingRef.current = true;
        playRef.current = true;
        
        // Start or resume the quicksort algorithm
        await quickSortIterative();
        
        function checkContinue() {
            if (currentResetToken !== resetTokenRef.current) {
                isSortingRef.current = false;
                sortingInitiatedRef.current = false;
                partitionStateRef.current = null;
                return false;
            }
            if (!playRef.current) {
                isSortingRef.current = false; // Allow restarting
                // Note: We don't clear partitionStateRef here to preserve it
                return false;
            }
            return true;
        }
        
        async function quickSortIterative() {
            const arr = arrayRef.current;
            
            // If we have a saved partition state, resume from there
            if (partitionStateRef.current) {
                const result = await resumePartition(arr);
                if (result === -1) return; // Paused or reset
                
                // Push the resulting subarrays to the stack
                const { low, high, pivotIndex } = partitionStateRef.current;
                callStackRef.current.push({ low: pivotIndex + 1, high });
                callStackRef.current.push({ low, high: pivotIndex - 1 });
                
                // Clear the partition state
                partitionStateRef.current = null;
            }
            
            // Process stack until empty
            while (callStackRef.current.length > 0) {
                if (!checkContinue()) return;
                
                // Pop the next range to process
                const { low, high } = callStackRef.current.pop()!;
                
                // Only process valid ranges
                if (low < high) {
                    // Partition the subarray
                    const pivotIndex = await partition(arr, low, high);
                    
                    if (pivotIndex === -1) return; // Paused or reset
                    
                    // Push subarrays to the stack (right first, then left)
                    // This processes left side first when popping
                    callStackRef.current.push({ low: pivotIndex + 1, high });
                    callStackRef.current.push({ low, high: pivotIndex - 1 });
                }
            }
            
            // Sorting complete
            drawArray(arr);
            isSortingRef.current = false;
            sortingInitiatedRef.current = false;
            partitionStateRef.current = null;
            setPlay(false);
        }

        // Resume a partition operation from where it left off
        async function resumePartition(arr: number[]): Promise<number> {
            if (!partitionStateRef.current) return -1;
            
            let { low, high, pivotValue, pivotIndex, i, j, phase } = partitionStateRef.current;
            
            // If we were in the comparing phase, continue from the current j
            if (phase === 'comparing') {
                // Highlight the current state
                drawArray(arr, { pivot: pivotIndex, current: j, left: i });
                await delay(stepDelay.current);
                if (!checkContinue()) return -1;
                
                // Continue comparison loop from j
                for (let currentJ = j; currentJ < high; currentJ++) {
                    // Highlight current element being compared
                    drawArray(arr, { pivot: pivotIndex, current: currentJ, left: i });
                    await delay(stepDelay.current);
                    if (!checkContinue()) {
                        // Save state for next resume
                        partitionStateRef.current = {
                            low, high, pivotValue, pivotIndex,
                            i, j: currentJ, phase: 'comparing'
                        };
                        return -1;
                    }
                    
                    // If current element is smaller than the pivot
                    if (arr[currentJ] < pivotValue) {
                        // Save state before swap
                        previousStatesRef.current.push({
                            array: [...arr],
                            partitionState: { ...partitionStateRef.current },
                            callStack: [...callStackRef.current]
                        });
                        
                        let currentI = i + 1; // Increment index of smaller element
                        
                        // Swap arr[currentI] and arr[currentJ]
                        [arr[currentI], arr[currentJ]] = [arr[currentJ], arr[currentI]];
                        arrayRef.current = [...arr]; // Update reference
                        
                        drawArray(arr, { pivot: pivotIndex, current: currentJ, left: currentI });
                        await delay(swapDelay.current);
                        if (!checkContinue()) {
                            // Save state for next resume
                            partitionStateRef.current = {
                                low, high, pivotValue, pivotIndex,
                                i: currentI, j: currentJ + 1, phase: 'comparing'
                            };
                            return -1;
                        }
                        
                        i = currentI; // Update i for the next iteration
                    }
                }
                
                // Move to final swap phase
                partitionStateRef.current.phase = 'finalSwap';
            }
            
            // Final swap phase - put the pivot in its correct position
            if (phase === 'finalSwap' || phase === 'comparing') {
                // Swap arr[i+1] and arr[pivotIndex] (put pivot in its final position)
                [arr[i + 1], arr[pivotIndex]] = [arr[pivotIndex], arr[i + 1]];
                arrayRef.current = [...arr]; // Update reference
                
                // Highlight the final pivot position
                drawArray(arr, { pivot: i + 1 });
                await delay(swapDelay.current);
                if (!checkContinue()) {
                    // Save state for next resume
                    partitionStateRef.current = {
                        ...partitionStateRef.current,
                        phase: 'complete'
                    };
                    return -1;
                }
            }
            
            // Return the pivot's final position
            return i + 1;
        }
        
        async function partition(arr: number[], low: number, high: number): Promise<number> {
            // Save state before partition begins
            previousStatesRef.current.push({
                array: [...arr],
                partitionState: partitionStateRef.current ? { ...partitionStateRef.current } : null,
                callStack: [...callStackRef.current]
            });
            
            // Choose rightmost element as pivot
            const pivotIndex = high;
            const pivotValue = arr[pivotIndex];
            let i = low - 1; // Index of smaller element
            
            // Save initial partition state
            partitionStateRef.current = {
                low, high, pivotValue, pivotIndex,
                i, j: low, phase: 'comparing'
            };
            
            // Highlight pivot
            drawArray(arr, { pivot: pivotIndex });
            await delay(stepDelay.current);
            if (!checkContinue()) return -1;
            
            // Compare each element with pivot
            for (let j = low; j < high; j++) {
                // Update partition state
                partitionStateRef.current = {
                    low, high, pivotValue, pivotIndex,
                    i, j, phase: 'comparing'
                };
                
                // Highlight current element being compared
                drawArray(arr, { pivot: pivotIndex, current: j, left: i });
                await delay(stepDelay.current);
                if (!checkContinue()) return -1;
                
                // If current element is smaller than the pivot
                if (arr[j] < pivotValue) {
                    // Save state before swap
                    previousStatesRef.current.push({
                        array: [...arr],
                        partitionState: { ...partitionStateRef.current },
                        callStack: [...callStackRef.current]
                    });
                    
                    i++; // Increment index of smaller element
                    
                    // Swap arr[i] and arr[j]
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    arrayRef.current = [...arr]; // Update reference
                    
                    drawArray(arr, { pivot: pivotIndex, current: j, left: i });
                    await delay(swapDelay.current);
                    if (!checkContinue()) return -1;
                }
            }
            
            // Update partition state to final swap phase
            partitionStateRef.current = {
                low, high, pivotValue, pivotIndex,
                i, j: high, phase: 'finalSwap'
            };
            
            // Save state before final pivot swap
            previousStatesRef.current.push({
                array: [...arr],
                partitionState: { ...partitionStateRef.current },
                callStack: [...callStackRef.current]
            });
            
            // Swap arr[i+1] and arr[high] (put pivot in its final position)
            [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
            arrayRef.current = [...arr]; // Update reference
            
            // Highlight the final pivot position
            drawArray(arr, { pivot: i + 1 });
            await delay(swapDelay.current);
            if (!checkContinue()) return -1;
            
            // Clear partition state as this operation completed
            partitionStateRef.current = null;
            
            return i + 1; // Return the pivot's final position
        }
    };

    // Add handleBackward function
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
        partitionStateRef.current = prevState.partitionState ? { ...prevState.partitionState } : null;
        callStackRef.current = [...prevState.callStack];
        
        // Determine what to highlight based on partition state
        let highlights = {};
        if (partitionStateRef.current) {
            const { pivotIndex, j, i } = partitionStateRef.current;
            highlights = { pivot: pivotIndex, current: j, left: i };
        }
        
        // Redraw the array with appropriate highlighting
        drawArray(arrayRef.current, highlights);
    };

    const shuffleArray = () => {
        // Clear history when shuffling
        previousStatesRef.current = [];
        
        // Stop any ongoing sorting
        isSortingRef.current = false;
        playRef.current = false;
        sortingInitiatedRef.current = false;
        partitionStateRef.current = null;
        setPlay(false);
        
        // Reset call stack
        callStackRef.current = [];
        
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
        
        // Connect backward button
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
        
        if (play) {
            quickSort();
        }
    }, [play]);

    const handleSizeChange = (newSize: number) => {
        size.current = newSize;
        shuffleArray();
    }

    return (
        <div className="algorithmPlayground">
            <h1>Quick sort</h1>
            <details className="algorithmDescription">
                <summary>Additional details</summary>
                <div>
                    <p>Quick sort is a divide-and-conquer algorithm that works by selecting a 'pivot' element from the array and partitioning the other elements into two sub-arrays according to whether they are less than or greater than the pivot. The sub-arrays are then sorted recursively.</p>
                    <p>Time complexity: <b>O(n²)</b> in the worst case, <b>O(n log n)</b> in the average case.</p>
                    <p>Space complexity: <b>O(log n)</b> due to the recursion stack.</p>
                    <p>This implementation uses an iterative approach with a stack to avoid actual recursion, allowing us to visualize the algorithm's steps and pause/resume at any point.</p>
                    <p>Color code:</p>
                    <ul>
                        <li><span style={{color: '#ff006e'}}>Red</span>: Pivot element</li>
                        <li><span style={{color: '#4cc9f0'}}>Blue</span>: Current element being compared</li>
                        <li><span style={{color: '#00f5d4'}}>Teal</span>: Index tracking elements smaller than pivot</li>
                    </ul>
                </div>
            </details>
            <div className="quick-sort-container">
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
                            <label htmlFor="stepDelay">Comparison delay (ms): </label>
                            <input type='number' id='stepDelay' min={10} max={500} step={10} defaultValue={stepDelay.current} onChange={(e) => stepDelay.current = Number(e.target.value)} />
                        </span>
                        <span>
                            <label htmlFor="swapDelay">Swap delay (ms): </label>
                            <input type='number' id='swapDelay' min={0} max={500} step={10} defaultValue={swapDelay.current} onChange={(e) => swapDelay.current = Number(e.target.value)} />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}