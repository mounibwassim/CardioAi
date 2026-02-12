/**
 * Safe mathematical utilities to prevent NaN and division by zero errors
 */

export const safeDivide = (numerator: number, denominator: number): number => {
    if (!denominator || denominator === 0) return 0;
    if (!numerator && numerator !== 0) return 0;
    return numerator / denominator;
};

export const safePercentage = (part: number, total: number): number => {
    const result = safeDivide(part, total) * 100;
    return Math.round(result * 10) / 10; // Round to 1 decimal
};

export const ensureNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || !isFinite(num) ? fallback : num;
};
