/**
 * Creates a promise that resolves after a specified delay
 * @param {number} ms - The delay in milliseconds
 * @returns {Promise} A promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Map array values to visual heights
export function scaleHeight(value: number, canvas: HTMLCanvasElement, size: React.RefObject<number>): number {
    const maxValue = size.current - 1; // Maximum value in our array
    const minHeight = canvas.height * 0.1; // Minimum height (10% of canvas)
    const maxHeight = canvas.height; // Maximum height (100% of canvas)
    
    // Linear interpolation between min and max heights
    return minHeight + (value / maxValue) * (maxHeight - minHeight);
}