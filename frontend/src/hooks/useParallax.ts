import { useState, useEffect, type RefObject } from 'react';

interface ParallaxValues {
    x: number;
    y: number;
    rotateX: number;
    rotateY: number;
}

/**
 * Hook for parallax mouse tracking and 3D tilt effect
 * @param containerRef - Reference to the container element
 * @param intensity - Intensity of the parallax effect (0-1)
 * @returns Parallax transform values
 */
export const useParallax = (
    containerRef: RefObject<HTMLElement | null>,
    intensity: number = 0.5
): ParallaxValues => {
    const [values, setValues] = useState<ParallaxValues>({
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
    });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate mouse position relative to center (-1 to 1)
            const mouseX = (e.clientX - centerX) / (rect.width / 2);
            const mouseY = (e.clientY - centerY) / (rect.height / 2);

            // Smooth interpolation
            const update = () => {
                setValues(prev => ({
                    x: prev.x + (mouseX * intensity - prev.x) * 0.1,
                    y: prev.y + (mouseY * intensity - prev.y) * 0.1,
                    rotateX: prev.rotateX + (-mouseY * 5 * intensity - prev.rotateX) * 0.1,
                    rotateY: prev.rotateY + (mouseX * 5 * intensity - prev.rotateY) * 0.1,
                }));
            };

            animationFrameId = requestAnimationFrame(update);
        };

        const handleMouseLeave = () => {
            // Smooth return to center
            const reset = () => {
                setValues(prev => {
                    const newX = prev.x * 0.9;
                    const newY = prev.y * 0.9;
                    const newRotateX = prev.rotateX * 0.9;
                    const newRotateY = prev.rotateY * 0.9;

                    // Continue animating until close to zero
                    if (Math.abs(newX) > 0.01 || Math.abs(newY) > 0.01) {
                        animationFrameId = requestAnimationFrame(reset);
                    }

                    return {
                        x: Math.abs(newX) < 0.01 ? 0 : newX,
                        y: Math.abs(newY) < 0.01 ? 0 : newY,
                        rotateX: Math.abs(newRotateX) < 0.01 ? 0 : newRotateX,
                        rotateY: Math.abs(newRotateY) < 0.01 ? 0 : newRotateY,
                    };
                });
            };

            animationFrameId = requestAnimationFrame(reset);
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [containerRef, intensity]);

    return values;
};
