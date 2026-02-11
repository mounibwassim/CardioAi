import { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function BloodDroplets() {
    const count = 30; // Number of droplets
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { viewport, mouse } = useThree();
    const dummy = new THREE.Object3D();

    // Track if droplets should be active (header section only)
    const [active, setActive] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > window.innerHeight * 0.8) {
                setActive(false);
            } else {
                setActive(true);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const particles = useRef(new Array(count).fill(0).map(() => ({
        position: [
            (Math.random() - 0.5) * 10, // Initial random X
            (Math.random() - 0.5) * 10, // Initial random Y
            (Math.random() - 0.5) * 5   // Initial random Z
        ],
        velocity: [0, 0, 0],
        life: 0, // 0 to 1
        opacity: 0
    })));

    useFrame((_state, delta) => {
        if (!mesh.current || !active) return;

        // Mouse influence position in 3D space
        const targetX = (mouse.x * viewport.width) / 2;
        const targetY = (mouse.y * viewport.height) / 2;

        particles.current.forEach((particle, i) => {
            // Move towards mouse with some lag/fluidity
            const dx = targetX - particle.position[0];
            const dy = targetY - particle.position[1];

            // Add some attraction to mouse
            particle.velocity[0] += dx * 0.002 * Math.random();
            particle.velocity[1] += dy * 0.002 * Math.random();

            // Add gravity/falling effect
            particle.velocity[1] -= 0.005;

            // Dampen velocity to prevent explosion
            particle.velocity[0] *= 0.95;
            particle.velocity[1] *= 0.95;

            // Update position
            particle.position[0] += particle.velocity[0];
            particle.position[1] += particle.velocity[1];

            // Life cycle management
            particle.life -= delta * 0.5;

            // Respawn if dead or out of bounds
            if (particle.life <= 0 || particle.position[1] < -viewport.height / 2) {
                particle.life = 1;
                particle.position[0] = targetX + (Math.random() - 0.5) * 2;
                particle.position[1] = targetY + (Math.random() - 0.5) * 2;
                particle.position[2] = (Math.random() - 0.5) * 5;
                particle.velocity = [(Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, 0];
            }

            // Update instance
            dummy.position.set(particle.position[0], particle.position[1], particle.position[2]);

            // Scale based on life (fade in/out effect)
            const scale = Math.sin(particle.life * Math.PI) * 0.15;
            dummy.scale.set(scale, scale, scale);

            dummy.updateMatrix();
            mesh.current!.setMatrixAt(i, dummy.matrix);
        });
        mesh.current.instanceMatrix.needsUpdate = true;
    });

    // If not active, render nothing or fade out? For now, render nothing if scrolled down
    if (!active) return null;

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshPhysicalMaterial
                color="#880808" // Dark blood red
                transparent
                opacity={0.8}
                roughness={0.2}
                metalness={0.5}
                clearcoat={1}
            />
        </instancedMesh>
    );
}
