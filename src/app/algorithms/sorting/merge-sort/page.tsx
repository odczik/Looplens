'use client';

import { useEffect, useState, useRef } from 'react';
import { delay, scaleHeight } from '@/app/_utils'

export default function MergeSortAlgorithm() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Controls
    const [play, setPlay] = useState<boolean>(false);
    const resetRef = useRef<HTMLButtonElement>(null!);
    const backwardRef = useRef<HTMLButtonElement>(null!); // Add backward button ref

    // Delays
    const stepDelay = useRef<number>(300); // Delay for each step in milliseconds
    const mergeDelay = useRef<number>(300); // Delay for each merge operation in milliseconds

    // Array state
    const arrayRef = useRef<number[]>([]);
    const resetTokenRef = useRef<number>(0);
    const size = useRef<number>(10); // Default size of the array
    
    // Sorting state trackers
    const isSortingRef = useRef<boolean>(false);
    const playRef = useRef<boolean>(play);
    
    // Add history tracking for backward functionality
    const previousStatesRef = useRef<{
        array: number[],
        highlights: {
            leftStart?: number, 
            leftEnd?: number, 
            rightStart?: number, 
            rightEnd?: number,
            comparing?: number[],
            writing?: number
        }
    }[]>([]);
    
    // Add a state tracker for the ongoing merge operations
    const mergeStateRef = useRef<{
        low: number,
        mid: number, 
        high: number,
        auxArr: number[],
        i: number,
        j: number,
        k: number,
        phase: 'init' | 'compare' | 'leftRemain' | 'rightRemain' | 'complete'
    } | null>(null);

    const drawArray = (arr: number[], highlights: {
        leftStart?: number, 
        leftEnd?: number, 
        rightStart?: number, 
        rightEnd?: number,
        comparing?: number[],
        writing?: number
    } = {}) => {
        const ctx = ctxRef.current;
        const canvas = canvasRef.current;
        if (!ctx || !canvas) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = canvas.width / arr.length;

        arr.forEach((value, index) => {
            // Set bar color
            ctx.fillStyle = '#4361ee'; // Default color
            
            // Left subarray highlight
            if(highlights.leftStart !== undefined && 
                highlights.leftEnd !== undefined && 
                index >= highlights.leftStart && 
                index <= highlights.leftEnd) {
                ctx.fillStyle = '#43919e'; // Light blue for left subarray
            }
            
            // Right subarray highlight
            if(highlights.rightStart !== undefined && 
                highlights.rightEnd !== undefined && 
                index >= highlights.rightStart && 
                index <= highlights.rightEnd) {
                ctx.fillStyle = '#439e72'; // Light green for right subarray
            }
            
            // Elements being compared
            if(highlights.comparing && highlights.comparing.includes(index)) {
                ctx.fillStyle = '#ff006e'; // Red for elements being compared
            }
            
            // Element being written to
            if(index === highlights.writing) {
                ctx.fillStyle = '#9e4395'; // Purple for the element being written
            }
            
            // Draw bar
            const height = scaleHeight(value, canvas, size);
            ctx.fillRect(index * barWidth, canvas.height - height, barWidth - 2, height);
        
            // Draw value text if size is small enough
            if(size.current <= 15) {
                ctx.fillStyle = 'white';
                ctx.font = '36px Arial';
                ctx.fillText(value.toString(), index * barWidth + (barWidth / 2) - 10, canvas.height - 20);
            }
        });
    };

    // Add handleBackward function to step backwards
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
        
        // Clear the current merge state since we're going back
        // This forces the algorithm to restart the merge from a clean state
        mergeStateRef.current = null;
        
        // Redraw the array with the appropriate highlights
        drawArray(arrayRef.current, prevState.highlights);
    };

    // Fix the checkContinue function to properly handle play state
    function checkContinue() {
        if (currentResetToken !== resetTokenRef.current) {
            isSortingRef.current = false;
            return false;
        }
        
        // Only stop if explicitly told to pause - don't stop automatically
        if (!playRef.current) {
            // Just pause, don't completely stop
            return false;
        }
        
        return true;
    }

    // Modify the resumeMerge function to correctly handle phase transitions
    async function resumeMerge(mainArr: number[]): Promise<boolean> {
        if (!mergeStateRef.current) return true;
        
        const { low, mid, high, auxArr, i: startI, j: startJ, k: startK, phase } = mergeStateRef.current;
        
        // Highlight the subarrays being merged
        const highlightsSubarrays = {
            leftStart: low,
            leftEnd: mid,
            rightStart: mid + 1,
            rightEnd: high
        };
        
        // Initial phase - copy the array and show highlights
        if (phase === 'init') {
            drawArray(mainArr, highlightsSubarrays);
            
            await delay(stepDelay.current);
            if (!checkContinue()) return false;
            
            // Update phase and continue to comparison in this same execution
            mergeStateRef.current = {
                ...mergeStateRef.current,
                phase: 'compare'
            };
        }
        
        // Comparison phase - compare and merge elements
        if (mergeStateRef.current.phase === 'compare') {
            let i = mergeStateRef.current.i;
            let j = mergeStateRef.current.j;
            let k = mergeStateRef.current.k;
            
            while (i <= mid && j <= high) {
                // Highlight the elements being compared
                const compareHighlights = {
                    ...highlightsSubarrays,
                    comparing: [i, j],
                    writing: k
                };
                
                drawArray(mainArr, compareHighlights);
                
                await delay(mergeDelay.current);
                if (!checkContinue()) {
                    // Save position but don't change array yet
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        i, j, k,
                        phase: 'compare'
                    };
                    return false;
                }
                
                // Save state before modifying array
                previousStatesRef.current.push({
                    array: [...mainArr],
                    highlights: compareHighlights
                });
                
                if (auxArr[i] <= auxArr[j]) {
                    mainArr[k] = auxArr[i];
                    i++;
                } else {
                    mainArr[k] = auxArr[j];
                    j++;
                }
                
                // Update reference and show the write operation
                arrayRef.current = [...mainArr];
                const writeHighlights = {
                    ...highlightsSubarrays,
                    writing: k
                };
                
                drawArray(mainArr, writeHighlights);
                
                await delay(mergeDelay.current / 2);
                if (!checkContinue()) {
                    // Save current state after the operation
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        i, j, k: k + 1,
                        phase: 'compare'
                    };
                    previousStatesRef.current.push({
                        array: [...mainArr],
                        highlights: writeHighlights
                    });
                    return false;
                }
                
                k++;
                
                // Update state after each iteration
                mergeStateRef.current = {
                    ...mergeStateRef.current,
                    i, j, k,
                    phase: 'compare'
                };
            }
            
            // After finishing comparison phase, transition to appropriate next phase
            if (i <= mid) {
                mergeStateRef.current = {
                    ...mergeStateRef.current,
                    i, k,
                    phase: 'leftRemain'
                };
                // Continue execution into leftRemain phase
                return await resumeMerge(mainArr);
            } else if (j <= high) {
                mergeStateRef.current = {
                    ...mergeStateRef.current,
                    j, k,
                    phase: 'rightRemain'
                };
                // Continue execution into rightRemain phase
                return await resumeMerge(mainArr);
            } else {
                mergeStateRef.current = {
                    ...mergeStateRef.current,
                    phase: 'complete'
                };
                // Continue to complete phase
                return await resumeMerge(mainArr);
            }
        }
        
        // Copy remaining elements from left subarray
        if (mergeStateRef.current.phase === 'leftRemain') {
            let i = mergeStateRef.current.i;
            let k = mergeStateRef.current.k;
            
            while (i <= mid) {
                const leftRemainHighlights = {
                    ...highlightsSubarrays,
                    comparing: [i],
                    writing: k
                };
                
                drawArray(mainArr, leftRemainHighlights);
                
                await delay(mergeDelay.current);
                if (!checkContinue()) {
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        i, k,
                        phase: 'leftRemain'
                    };
                    return false;
                }
                
                // Save state before modification
                previousStatesRef.current.push({
                    array: [...mainArr],
                    highlights: leftRemainHighlights
                });
                
                mainArr[k] = auxArr[i];
                arrayRef.current = [...mainArr];
                
                const writeHighlights = {
                    ...highlightsSubarrays,
                    writing: k
                };
                
                drawArray(mainArr, writeHighlights);
                
                await delay(mergeDelay.current / 2);
                if (!checkContinue()) {
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        i: i + 1, k: k + 1,
                        phase: 'leftRemain'
                    };
                    previousStatesRef.current.push({
                        array: [...mainArr],
                        highlights: writeHighlights
                    });
                    return false;
                }
                
                i++;
                k++;
                
                // Update state after each iteration
                mergeStateRef.current = {
                    ...mergeStateRef.current,
                    i, k,
                    phase: 'leftRemain'
                };
            }
            
            // Move to complete phase
            mergeStateRef.current = {
                ...mergeStateRef.current,
                phase: 'complete'
            };
            return await resumeMerge(mainArr);
        }
        
        // Copy remaining elements from right subarray
        if (mergeStateRef.current.phase === 'rightRemain') {
            let j = mergeStateRef.current.j;
            let k = mergeStateRef.current.k;
            
            while (j <= high) {
                const rightRemainHighlights = {
                    ...highlightsSubarrays,
                    comparing: [j],
                    writing: k
                };
                
                drawArray(mainArr, rightRemainHighlights);
                
                await delay(mergeDelay.current);
                if (!checkContinue()) {
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        j, k,
                        phase: 'rightRemain'
                    };
                    return false;
                }
                
                // Save state before modification
                previousStatesRef.current.push({
                    array: [...mainArr],
                    highlights: rightRemainHighlights
                });
                
                mainArr[k] = auxArr[j];
                arrayRef.current = [...mainArr];
                
                const writeHighlights = {
                    ...highlightsSubarrays,
                    writing: k
                };
                
                drawArray(mainArr, writeHighlights);
                
                await delay(mergeDelay.current / 2);
                if (!checkContinue()) {
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        j: j + 1, k: k + 1,
                        phase: 'rightRemain'
                    };
                    previousStatesRef.current.push({
                        array: [...mainArr],
                        highlights: writeHighlights
                    });
                    return false;
                }
                
                j++;
                k++;
                
                // Update state after each iteration
                mergeStateRef.current = {
                    ...mergeStateRef.current,
                    j, k,
                    phase: 'rightRemain'
                };
            }
            
            // Move to complete phase
            mergeStateRef.current = {
                ...mergeStateRef.current,
                phase: 'complete'
            };
            return await resumeMerge(mainArr);
        }
        
        // Final phase - show completed merge
        if (mergeStateRef.current.phase === 'complete') {
            // Show the fully merged subarray
            const finalHighlights = {
                leftStart: low,
                leftEnd: high
            };
            
            drawArray(mainArr, finalHighlights);
            
            await delay(stepDelay.current);
            if (!checkContinue()) {
                previousStatesRef.current.push({
                    array: [...mainArr],
                    highlights: finalHighlights
                });
                return false;
            }
            
            // Clear this merge state - we're done with it
            mergeStateRef.current = null;
            
            return true;
        }
        
        return true;
    }
    
    // Fix the mergeSort function with properly scoped variables and functions
    const mergeSort = async () => {
        if (isSortingRef.current) return; // Prevent multiple sort operations
        
        const currentResetToken = resetTokenRef.current;
        isSortingRef.current = true;
        playRef.current = true;
        
        // Fix the checkContinue function to properly handle play state
        function checkContinue() {
            if (currentResetToken !== resetTokenRef.current) {
                isSortingRef.current = false;
                return false;
            }
            
            // Only stop if explicitly told to pause - don't stop automatically
            if (!playRef.current) {
                // Just pause, don't completely stop
                return false;
            }
            
            return true;
        }
        
        async function mergeSortHelper(mainArr: number[], auxArr: number[], low: number, high: number): Promise<boolean> {
            if (low >= high) return true; // Base case: subarray of size 1 is sorted
            
            // Divide the array into two halves
            const mid = Math.floor(low + (high - low) / 2);
            
            // Recursively sort the halves
            const contLeft = await mergeSortHelper(mainArr, auxArr, low, mid);
            if (!contLeft || !checkContinue()) return false;
            
            const contRight = await mergeSortHelper(mainArr, auxArr, mid + 1, high);
            if (!contRight || !checkContinue()) return false;
            
            // Merge the sorted halves
            return await merge(mainArr, auxArr, low, mid, high);
        }
        
        async function merge(mainArr: number[], auxArr: number[], low: number, mid: number, high: number): Promise<boolean> {
            // Initialize the merge state
            mergeStateRef.current = {
                low, mid, high,
                auxArr: [...mainArr], // Make a copy of the current array state
                i: low,
                j: mid + 1,
                k: low,
                phase: 'init'
            };
            
            // Save initial state before starting merge
            previousStatesRef.current.push({
                array: [...mainArr],
                highlights: {}
            });
            
            // Start the merge process
            return await resumeMerge(mainArr);
        }
        
        async function resumeMerge(mainArr: number[]): Promise<boolean> {
            if (!mergeStateRef.current) return true;
            
            const { low, mid, high, auxArr, i: startI, j: startJ, k: startK, phase } = mergeStateRef.current;
            
            // Highlight the subarrays being merged
            const highlightsSubarrays = {
                leftStart: low,
                leftEnd: mid,
                rightStart: mid + 1,
                rightEnd: high
            };
            
            // Initial phase - copy the array and show highlights
            if (phase === 'init') {
                drawArray(mainArr, highlightsSubarrays);
                
                await delay(stepDelay.current);
                if (!checkContinue()) return false;
                
                // Update phase and continue to comparison
                mergeStateRef.current = {
                    ...mergeStateRef.current,
                    phase: 'compare'
                };
                
                // Continue to comparison phase in the same execution
                return await resumeMerge(mainArr);
            }
            
            // Comparison phase - compare and merge elements
            if (mergeStateRef.current.phase === 'compare') {
                let i = mergeStateRef.current.i;
                let j = mergeStateRef.current.j;
                let k = mergeStateRef.current.k;
                
                while (i <= mid && j <= high) {
                    // Highlight the elements being compared
                    const compareHighlights = {
                        ...highlightsSubarrays,
                        comparing: [i, j],
                        writing: k
                    };
                    
                    drawArray(mainArr, compareHighlights);
                    
                    await delay(mergeDelay.current);
                    if (!checkContinue()) {
                        // Save position but don't change array yet
                        mergeStateRef.current = {
                            ...mergeStateRef.current,
                            i, j, k,
                            phase: 'compare'
                        };
                        return false;
                    }
                    
                    // Save state before modifying array
                    previousStatesRef.current.push({
                        array: [...mainArr],
                        highlights: compareHighlights
                    });
                    
                    if (auxArr[i] <= auxArr[j]) {
                        mainArr[k] = auxArr[i];
                        i++;
                    } else {
                        mainArr[k] = auxArr[j];
                        j++;
                    }
                    
                    // Update reference and show the write operation
                    arrayRef.current = [...mainArr];
                    const writeHighlights = {
                        ...highlightsSubarrays,
                        writing: k
                    };
                    
                    drawArray(mainArr, writeHighlights);
                    
                    await delay(mergeDelay.current / 2);
                    if (!checkContinue()) {
                        // Save current state after the operation
                        mergeStateRef.current = {
                            ...mergeStateRef.current,
                            i, j, k: k + 1,
                            phase: 'compare'
                        };
                        previousStatesRef.current.push({
                            array: [...mainArr],
                            highlights: writeHighlights
                        });
                        return false;
                    }
                    
                    k++;
                    
                    // Update state after each iteration
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        i, j, k,
                        phase: 'compare'
                    };
                }
                
                // After finishing comparison phase, transition to appropriate next phase
                if (i <= mid) {
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        i, k,
                        phase: 'leftRemain'
                    };
                    // Continue execution into leftRemain phase
                    return await resumeMerge(mainArr);
                } else if (j <= high) {
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        j, k,
                        phase: 'rightRemain'
                    };
                    // Continue execution into rightRemain phase
                    return await resumeMerge(mainArr);
                } else {
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        phase: 'complete'
                    };
                    // Continue to complete phase
                    return await resumeMerge(mainArr);
                }
            }
            
            // Copy remaining elements from left subarray
            if (mergeStateRef.current.phase === 'leftRemain') {
                let i = mergeStateRef.current.i;
                let k = mergeStateRef.current.k;
                
                while (i <= mid) {
                    const leftRemainHighlights = {
                        ...highlightsSubarrays,
                        comparing: [i],
                        writing: k
                    };
                    
                    drawArray(mainArr, leftRemainHighlights);
                    
                    await delay(mergeDelay.current);
                    if (!checkContinue()) {
                        mergeStateRef.current = {
                            ...mergeStateRef.current,
                            i, k,
                            phase: 'leftRemain'
                        };
                        return false;
                    }
                    
                    // Save state before modification
                    previousStatesRef.current.push({
                        array: [...mainArr],
                        highlights: leftRemainHighlights
                    });
                    
                    mainArr[k] = auxArr[i];
                    arrayRef.current = [...mainArr];
                    
                    const writeHighlights = {
                        ...highlightsSubarrays,
                        writing: k
                    };
                    
                    drawArray(mainArr, writeHighlights);
                    
                    await delay(mergeDelay.current / 2);
                    if (!checkContinue()) {
                        mergeStateRef.current = {
                            ...mergeStateRef.current,
                            i: i + 1, k: k + 1,
                            phase: 'leftRemain'
                        };
                        previousStatesRef.current.push({
                            array: [...mainArr],
                            highlights: writeHighlights
                        });
                        return false;
                    }
                    
                    i++;
                    k++;
                    
                    // Update state after each iteration
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        i, k,
                        phase: 'leftRemain'
                    };
                }
                
                // Move to complete phase
                mergeStateRef.current = {
                    ...mergeStateRef.current,
                    phase: 'complete'
                };
                return await resumeMerge(mainArr);
            }
            
            // Copy remaining elements from right subarray
            if (mergeStateRef.current.phase === 'rightRemain') {
                let j = mergeStateRef.current.j;
                let k = mergeStateRef.current.k;
                
                while (j <= high) {
                    const rightRemainHighlights = {
                        ...highlightsSubarrays,
                        comparing: [j],
                        writing: k
                    };
                    
                    drawArray(mainArr, rightRemainHighlights);
                    
                    await delay(mergeDelay.current);
                    if (!checkContinue()) {
                        mergeStateRef.current = {
                            ...mergeStateRef.current,
                            j, k,
                            phase: 'rightRemain'
                        };
                        return false;
                    }
                    
                    // Save state before modification
                    previousStatesRef.current.push({
                        array: [...mainArr],
                        highlights: rightRemainHighlights
                    });
                    
                    mainArr[k] = auxArr[j];
                    arrayRef.current = [...mainArr];
                    
                    const writeHighlights = {
                        ...highlightsSubarrays,
                        writing: k
                    };
                    
                    drawArray(mainArr, writeHighlights);
                    
                    await delay(mergeDelay.current / 2);
                    if (!checkContinue()) {
                        mergeStateRef.current = {
                            ...mergeStateRef.current,
                            j: j + 1, k: k + 1,
                            phase: 'rightRemain'
                        };
                        previousStatesRef.current.push({
                            array: [...mainArr],
                            highlights: writeHighlights
                        });
                        return false;
                    }
                    
                    j++;
                    k++;
                    
                    // Update state after each iteration
                    mergeStateRef.current = {
                        ...mergeStateRef.current,
                        j, k,
                        phase: 'rightRemain'
                    };
                }
                
                // Move to complete phase
                mergeStateRef.current = {
                    ...mergeStateRef.current,
                    phase: 'complete'
                };
                return await resumeMerge(mainArr);
            }
            
            // Final phase - show completed merge
            if (mergeStateRef.current.phase === 'complete') {
                // Show the fully merged subarray
                const finalHighlights = {
                    leftStart: low,
                    leftEnd: high
                };
                
                drawArray(mainArr, finalHighlights);
                
                await delay(stepDelay.current);
                if (!checkContinue()) {
                    previousStatesRef.current.push({
                        array: [...mainArr],
                        highlights: finalHighlights
                    });
                    return false;
                }
                
                // Clear this merge state - we're done with it
                mergeStateRef.current = null;
                
                return true;
            }
            
            return true;
        }
        
        try {
            const arr = [...arrayRef.current];
            const aux = new Array(arr.length); // Auxiliary array for merging
            
            // Start the merge sort algorithm
            // If we have a saved merge state, resume from there
            if (mergeStateRef.current !== null) {
                await resumeMerge(arr);
            } else {
                await mergeSortHelper(arr, aux, 0, arr.length - 1);
            }
            
            // Sorting complete - only if we actually finished
            if (currentResetToken === resetTokenRef.current) {
                drawArray(arr);
            }
        } finally {
            // Always ensure we clear the sorting flag when done
            isSortingRef.current = false;
            
            // Only set play to false if we're still in the same session
            if (currentResetToken === resetTokenRef.current) {
                setPlay(false);
            }
        }
    };

    const shuffleArray = () => {
        // Stop any ongoing sorting
        isSortingRef.current = false;
        playRef.current = false;
        setPlay(false);
        
        // Clear history and merge state when shuffling
        previousStatesRef.current = [];
        mergeStateRef.current = null;
        
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
        
        if (play && !isSortingRef.current) {
            mergeSort();
        }
    }, [play]);

    const handleSizeChange = (newSize: number) => {
        size.current = newSize;
        shuffleArray();
    }

    return (
        <div className="algorithmPlayground">
            <h1>Merge sort</h1>
            <details className="algorithmDescription">
                <summary>Additional details</summary>
                <div>
                    <p>Merge sort is a divide-and-conquer algorithm that divides the input array into two halves, recursively sorts them, and then merges the sorted halves to produce a sorted output.</p>
                    <p>Time complexity: <b>O(n log n)</b> in all cases (best, average, worst).</p>
                    <p>Space complexity: <b>O(n)</b> due to the auxiliary array needed for merging.</p>
                    <p>Merge sort is a stable sorting algorithm, meaning it preserves the relative order of equal elements.</p>
                    <p>Color code:</p>
                    <ul>
                        <li><span style={{color: '#43919e'}}>Blue</span>: Left subarray being merged</li>
                        <li><span style={{color: '#439e72'}}>Green</span>: Right subarray being merged</li>
                        <li><span style={{color: '#ff006e'}}>Red</span>: Elements being compared</li>
                        <li><span style={{color: '#9e4395'}}>Purple</span>: Position being written to</li>
                    </ul>
                </div>
            </details>
            <div className="merge-sort-container">
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
                            <label htmlFor="mergeDelay">Merge delay (ms): </label>
                            <input type='number' id='mergeDelay' min={0} max={500} step={10} defaultValue={mergeDelay.current} onChange={(e) => mergeDelay.current = Number(e.target.value)} />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}