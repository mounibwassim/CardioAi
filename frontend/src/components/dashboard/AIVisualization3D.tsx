import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const PulseOrb = ({ riskWeights, isClicked, setIsClicked }: { riskWeights?: { green: number, yellow: number, red: number }, isClicked: boolean, setIsClicked: (v: boolean) => void }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const targetScale = useRef(1);
    const lastFrameTime = useRef(0);

    // Dynamic color calculation based on weights
    // Green: #10b981 (16, 185, 129), Yellow: #fab005 (250, 176, 5), Red: #ef4444 (239, 68, 68), White: (255, 255, 255)
    const orbColor = useMemo(() => {
        // Guard against missing or NaN weights
        if (!riskWeights || isNaN(riskWeights.green) || isNaN(riskWeights.yellow) || isNaN(riskWeights.red)) {
            return '#ffffff'; // Professional White Initial/Fallback
        }

        const r = Math.max(0, Math.min(255, riskWeights.red * 239 + riskWeights.yellow * 250 + riskWeights.green * 16));
        const g = Math.max(0, Math.min(255, riskWeights.red * 68 + riskWeights.yellow * 176 + riskWeights.green * 185));
        const b = Math.max(0, Math.min(255, riskWeights.red * 68 + riskWeights.yellow * 5 + riskWeights.green * 129));

        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }, [riskWeights]);

    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.getElapsedTime();

        // GPU Optimization: FPS Throttling (30 FPS target for background animations)
        // We calculate every frame but only apply logic if enough time passed, 
        // OR we can just let it run but ensure it's lightweight. 
        // Throttling here helps on low-end clinical hardware.
        if (time - lastFrameTime.current < 0.033) return;
        lastFrameTime.current = time;

        // NaN Guard for scale/position
        if (isNaN(targetScale.current)) targetScale.current = 1;

        // Balloon Push Interaction
        if (isClicked) {
            targetScale.current = 1.6;
            setIsClicked(false);
        }

        // Lerp back to center position
        mesh.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.05);

        // Return scale
        targetScale.current = THREE.MathUtils.lerp(targetScale.current, 1, 0.1);
        const pulse = 1 + Math.sin(time * 2) * 0.05;
        const s = Math.max(0.1, Math.min(3, targetScale.current * pulse)); // Clamped & NaN safe
        mesh.current.scale.set(s, s, s);

        // Rotation
        mesh.current.rotation.y = time * 0.3;
        mesh.current.rotation.x = time * 0.2;
    });

    // Explicit Disposal on Unmount
    useEffect(() => {
        return () => {
            if (mesh.current) {
                mesh.current.geometry.dispose();
                if (Array.isArray(mesh.current.material)) {
                    mesh.current.material.forEach(m => m.dispose());
                } else {
                    mesh.current.material.dispose();
                }
            }
        };
    }, []);

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere
                ref={mesh}
                args={[1.2, 64, 64]}
                onClick={() => setIsClicked(true)}
                onPointerOver={() => { document.body.style.cursor = 'pointer' }}
                onPointerOut={() => { document.body.style.cursor = 'auto' }}
            >
                <MeshDistortMaterial
                    color={orbColor}
                    speed={2}
                    distort={0.4}
                    radius={1}
                    emissive={orbColor}
                    emissiveIntensity={0.6}
                    transparent
                    opacity={0.9}
                />
            </Sphere>
        </Float>
    );
};

interface AIStats {
    total: number;
    critical: number;
    accuracy: string;
    trend: string;
    riskWeights?: { green: number, yellow: number, red: number };
}

const AIVisualization3D = ({ stats }: { stats?: AIStats }) => {
    const [isClicked, setIsClicked] = useState(false);

    return (
        <div className="h-[400px] w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group">
            <div className="absolute top-6 left-6 z-10">
                <h3 className="text-xl font-bold text-white flex items-center">
                    <span className={`flex h-3 w-3 rounded-full mr-3 animate-pulse ${stats?.trend === 'up' ? 'bg-red-500' : stats?.trend === 'down' ? 'bg-emerald-500' : 'bg-blue-400'}`}></span>
                    Neural Analysis Engine
                </h3>
                <p className="text-slate-400 text-sm mt-1">Interconnected deep-learning parameter mapping</p>
            </div>

            {/* Live Stats Overlay */}
            <div className="absolute top-20 left-6 z-10 space-y-4">
                <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 transition-all hover:bg-white/10">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Analyses</p>
                    <p className="text-xl font-mono font-bold text-white leading-none mt-1">{stats?.total || 0}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 transition-all hover:bg-white/10">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Avg. Accuracy</p>
                    <p className="text-xl font-mono font-bold text-emerald-400 leading-none mt-1">{stats?.accuracy || '0.0%'}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 transition-all hover:bg-white/10">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Risk Status</p>
                    <p className={`text-xl font-mono font-bold leading-none mt-1 ${stats?.trend === 'up' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {stats?.trend === 'up' ? 'RISING' : 'STABLE'}
                    </p>
                </div>
            </div>

            <div className="absolute bottom-6 right-6 z-10 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">Model</p>
                        <p className="text-xs font-mono text-primary-400">v4.0.0-CLINICAL</p>
                    </div>
                </div>
            </div>

            {/* Canvas Container */}
            <div className="w-full h-full cursor-grab active:cursor-grabbing">
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} />
                    <PulseOrb
                        riskWeights={stats?.riskWeights}
                        isClicked={isClicked}
                        setIsClicked={setIsClicked}
                    />
                </Canvas>
            </div>
        </div>
    );
};

export default AIVisualization3D;
