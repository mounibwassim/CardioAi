import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const PulseOrb = () => {
    const mesh = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.getElapsedTime();
        mesh.current.rotation.x = time * 0.2;
        mesh.current.rotation.y = time * 0.3;

        // Dynamic scale pulse
        const s = 1 + Math.sin(time * 2) * 0.05;
        mesh.current.scale.set(s, s, s);
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere ref={mesh} args={[1, 64, 64]}>
                <MeshDistortMaterial
                    color="#0ea5e9"
                    speed={2}
                    distort={0.4}
                    radius={1}
                />
            </Sphere>
        </Float>
    );
};

const AIVisualization3D = () => {
    return (
        <div className="h-[400px] w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group">
            <div className="absolute top-6 left-6 z-10">
                <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="flex h-3 w-3 rounded-full bg-secondary-400 mr-3 animate-pulse"></span>
                    Neural Analysis Engine
                </h3>
                <p className="text-slate-400 text-sm mt-1">Real-time AI parameter visualization</p>
            </div>

            {/* Canvas isolated with demand-only loop for battery/CPU efficiency */}
            <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                frameloop="always" // Use always for smooth pulse, but isolated in this component
                dpr={[1, 2]}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#fbbf24" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
                <PulseOrb />
                <OrbitControls enableZoom={false} enablePan={false} />
            </Canvas>

            <div className="absolute bottom-6 right-6 z-10 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Processing</p>
                        <p className="text-xs font-mono text-secondary-400">99.2 FPS</p>
                    </div>
                    <div className="h-8 w-px bg-slate-700"></div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Model</p>
                        <p className="text-xs font-mono text-primary-400">v3.2.0-RF</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIVisualization3D;
