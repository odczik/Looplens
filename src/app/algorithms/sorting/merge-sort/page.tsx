'use client';

import { useEffect, useState, useRef } from 'react';
import { delay, scaleHeight } from '@/app/_utils'

export default function MergeSortAlgorithm() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Controls
    const [play, setPlay] = useState<boolean>(false);
    const forwardRef = useRef<HTMLButtonElement>(null!);
    const resetRef = useRef<HTMLButtonElement>(null!);

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

    const mergeSort = async () => {
        if (isSortingRef.current) return; // Prevent multiple sort operations
        
        const currentResetToken = resetTokenRef.current;
        isSortingRef.current = true;
        
        const arr = [...arrayRef.current];
        const aux = new Array(arr.length); // Auxiliary array for merging
        
        // Start the merge sort algorithm
        await mergeSortHelper(arr, aux, 0, arr.length - 1);
        
        // Sorting complete
        drawArray(arr);
        isSortingRef.current = false;
        setPlay(false);
        
        function checkContinue() {
            if (currentResetToken !== resetTokenRef.current || !playRef.current) {
                isSortingRef.current = false;
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
            // Highlight the subarrays being merged
            drawArray(mainArr, {
                leftStart: low,
                leftEnd: mid,
                rightStart: mid + 1,
                rightEnd: high
            });
            
            await delay(stepDelay.current);
            if (!checkContinue()) return false;
            
            // Copy both halves to the auxiliary array
            for (let i = low; i <= high; i++) {
                auxArr[i] = mainArr[i];
            }
            
            // Merge back to the original array
            let i = low;      // Index for left subarray
            let j = mid + 1;  // Index for right subarray
            let k = low;      // Index for merged array
            
            while (i <= mid && j <= high) {
                // Highlight the elements being compared
                drawArray(mainArr, {
                    leftStart: low,
                    leftEnd: mid,
                    rightStart: mid + 1,
                    rightEnd: high,
                    comparing: [i, j],
                    writing: k
                });
                
                await delay(mergeDelay.current);
                if (!checkContinue()) return false;
                
                if (auxArr[i] <= auxArr[j]) {
                    mainArr[k] = auxArr[i];
                    i++;
                } else {
                    mainArr[k] = auxArr[j];
                    j++;
                }
                
                // Update reference and show the write operation
                arrayRef.current = [...mainArr];
                drawArray(mainArr, {
                    leftStart: low,
                    leftEnd: mid,
                    rightStart: mid + 1,
                    rightEnd: high,
                    writing: k
                });
                
                await delay(mergeDelay.current / 2);
                if (!checkContinue()) return false;
                
                k++;
            }
            
            // Copy the remaining elements of the left subarray, if any
            while (i <= mid) {
                drawArray(mainArr, {
                    leftStart: low,
                    leftEnd: mid,
                    rightStart: mid + 1,
                    rightEnd: high,
                    comparing: [i],
                    writing: k
                });
                
                await delay(mergeDelay.current);
                if (!checkContinue()) return false;
                
                mainArr[k] = auxArr[i];
                arrayRef.current = [...mainArr];
                
                drawArray(mainArr, {
                    leftStart: low,
                    leftEnd: mid,
                    rightStart: mid + 1,
                    rightEnd: high,
                    writing: k
                });
                
                await delay(mergeDelay.current / 2);
                if (!checkContinue()) return false;
                
                i++;
                k++;
            }
            
            // Copy the remaining elements of the right subarray, if any
            while (j <= high) {
                drawArray(mainArr, {
                    leftStart: low,
                    leftEnd: mid,
                    rightStart: mid + 1,
                    rightEnd: high,
                    comparing: [j],
                    writing: k
                });
                
                await delay(mergeDelay.current);
                if (!checkContinue()) return false;
                
                mainArr[k] = auxArr[j];
                arrayRef.current = [...mainArr];
                
                drawArray(mainArr, {
                    leftStart: low,
                    leftEnd: mid,
                    rightStart: mid + 1,
                    rightEnd: high,
                    writing: k
                });
                
                await delay(mergeDelay.current / 2);
                if (!checkContinue()) return false;
                
                j++;
                k++;
            }
            
            // Show the fully merged subarray
            drawArray(mainArr, {
                leftStart: low,
                leftEnd: high
            });
            
            await delay(stepDelay.current);
            if (!checkContinue()) return false;
            
            return true;
        }
    };

    const shuffleArray = () => {
        // Stop any ongoing sorting
        isSortingRef.current = false;
        playRef.current = false;
        setPlay(false);
        
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
                        <button className="iconContainer" onClick={() => setPlay(!play)}>
                            {play ? (
                                <span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/pause.png')"}}></span>
                            ) : (
                                <span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/play--v1.png')"}}></span>
                            )}
                        </button>
                        <button className="iconContainer" ref={forwardRef}><span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/redo.png')"}}></span></button>
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