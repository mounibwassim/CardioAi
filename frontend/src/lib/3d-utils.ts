/**
 * 3D Chart Utilities for Performance & Safety
 * Provides WebGL context management, cleanup, and validation utilities
 */

import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

/**
 * Check if WebGL is available in the browser
 */
export const isWebGLAvailable = (): boolean => {
    try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!context;
    } catch (e) {
        return false;
    }
};

/**
 * Validate dimensions to prevent negative or invalid values
 */
export const validateDimensions = (width: number, height: number): { width: number; height: number } => {
    const safeWidth = typeof width === 'number' && width > 0 ? width : 800;
    const safeHeight = typeof height === 'number' && height > 0 ? height : 400;
    return { width: safeWidth, height: safeHeight };
};

/**
 * Guard against NaN in calculations
 */
export const guardNaN = (value: number, fallback: number = 0): number => {
    return typeof value === 'number' && isFinite(value) ? value : fallback;
};

/**
 * Safe computation hook with memoization
 */
export const useSafeComputed = <T>(computeFn: () => T, deps: any[]): T => {
    return useMemo(() => {
        try {
            return computeFn();
        } catch (error) {
            console.error('Computation error:', error);
            return {} as T;
        }
    }, deps);
};

/**
 * Hook for Three.js renderer cleanup on unmount
 */
export const use3DCleanup = (rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>) => {
    useEffect(() => {
        return () => {
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss();
                rendererRef.current = null;
            }
        };
    }, []);
};

/**
 * Common 3D materials for consistency
 */
export const materials = {
    glass: (color: string = '#6366f1', opacity: number = 0.3) => ({
        color: color,
        transparent: true,
        opacity: opacity,
        metalness: 0.9,
        roughness: 0.1,
        envMapIntensity: 1,
    }),

    glow: (color: string = '#6366f1', intensity: number = 0.5) => ({
        color: color,
        emissive: color,
        emissiveIntensity: intensity,
        metalness: 0.7,
        roughness: 0.2,
    }),

    metallic: (color: string = '#6366f1') => ({
        color: color,
        metalness: 0.8,
        roughness: 0.3,
        envMapIntensity: 1.5,
    }),
};

/**
 * Smooth easing functions for animations
 */
export const easing = {
    easeInOut: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: (t: number): number => t * (2 - t),
    easeIn: (t: number): number => t * t,
    bounceOut: (t: number): number => {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    },
};

/**
 * Calculate normalized height for 3D bars
 */
export const calculateBarHeight = (value: number, maxValue: number, maxHeight: number = 3): number => {
    if (maxValue === 0 || !isFinite(value) || !isFinite(maxValue)) return 0;
    return guardNaN((value / maxValue) * maxHeight, 0);
};

/**
 * Generate color gradient
 */
export const generateGradient = (startColor: string, _endColor: string, steps: number): string[] => {
    // Simple gradient generator - in production use chroma.js or similar
    return Array(steps).fill(startColor); // Placeholder
};

/**
 * Validate chart data to prevent rendering errors
 */
export const validateChartData = <T extends { value?: number; count?: number; assessments?: number }>(
    data: T[]
): T[] => {
    return data.filter(item => {
        const value = item.value ?? item.count ?? item.assessments ?? 0;
        return typeof value === 'number' && isFinite(value) && value >= 0;
    });
};
