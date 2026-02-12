/**
 * Utility library for CardioAI professional dashboard
 * Includes safe math and sanitization helpers to prevent cascading chart failures.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind classes safely
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Checks if a value is a valid, finite number
 */
export const isValidNumber = (val: any): boolean => {
    return typeof val === 'number' && !isNaN(val) && isFinite(val);
};

/**
 * Coerces a value to a number or returns a fallback
 */
export const sanitizeNumber = (val: any, fallback: number = 0): number => {
    const num = Number(val);
    return isValidNumber(num) ? num : fallback;
};

/**
 * Performs division with safety checks to prevent NaN/Infinity
 */
export const safeDivide = (numerator: number, denominator: number): number => {
    if (!denominator || !isValidNumber(numerator) || !isValidNumber(denominator) || denominator === 0) {
        return 0;
    }
    return numerator / denominator;
};

/**
 * Sanitize an array of objects for chart consumption
 * Specifically targets keys named 'value', 'count', or 'score'
 */
export const sanitizeArray = <T extends Record<string, any>>(arr: T[] | null | undefined): T[] => {
    if (!arr || !Array.isArray(arr)) return [];

    return arr.map(item => {
        const newItem = { ...item };
        const keysToSanitize = ['value', 'count', 'score', 'risk_score', 'age'];

        keysToSanitize.forEach(key => {
            if (key in newItem) {
                newItem[key as keyof T] = sanitizeNumber(newItem[key]) as any;
            }
        });

        return newItem;
    });
};
