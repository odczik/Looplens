/**
 * Creates a promise that resolves after a specified delay
 * @param {number} ms - The delay in milliseconds
 * @returns {Promise} A promise that resolves after the delay
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Maps array values to visual heights for rendering on canvas
 * @param {number} value - The value to be scaled
 * @param {HTMLCanvasElement} canvas - The canvas element that determines the available height
 * @param {React.RefObject<number>} size - A React ref containing the current array size
 * @returns {number} The scaled height value between minHeight and maxHeight
 * 
 * @example
 * // Scale an element's value to a height on the canvas
 * const height = scaleHeight(elementValue, canvasRef.current, sizeRef);
 * ctx.fillRect(x, canvas.height - height, width, height);
 */
export function scaleHeight(value: number, canvas: HTMLCanvasElement, size: React.RefObject<number>): number {
    const maxValue = size.current - 1; // Maximum value in our array
    const minHeight = canvas.height * 0.1; // Minimum height (10% of canvas)
    const maxHeight = canvas.height; // Maximum height (100% of canvas)
    
    // Linear interpolation between min and max heights
    return minHeight + (value / maxValue) * (maxHeight - minHeight);
}