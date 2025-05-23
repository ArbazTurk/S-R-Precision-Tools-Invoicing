"use client";

// This file might contain other form-related utilities if needed in the future.
// For now, it only contains the debounce function after refactoring.

/**
 * Debounce function to limit rapid calls.
 */
// Ensure the generic type F extends a function returning a Promise
export const debounce = <F extends (...args: any[]) => Promise<any>>(
  func: F,
  waitFor: number
) => {
  let timeout: NodeJS.Timeout | null = null;

  // The returned function should match the signature of F
  return (...args: Parameters<F>): ReturnType<F> => {
    // Clear the previous timer
    if (timeout) {
      clearTimeout(timeout);
    }
    // Set up a new promise that resolves after the timeout
    return new Promise((resolve, reject) => {
      timeout = setTimeout(async () => {
        try {
          const result = await func(...args); // Execute the original async function
          resolve(result); // Resolve with the result
        } catch (error) {
          console.error("Error in debounced function:", error);
          reject(error); // Reject the promise if the original function throws
        }
      }, waitFor);
    }) as ReturnType<F>; // Cast necessary as TS struggles with complex generic inference here
  };
};
("");
