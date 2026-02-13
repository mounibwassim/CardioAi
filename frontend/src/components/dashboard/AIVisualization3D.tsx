import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const PulseOrb = ({ riskWeights }: { riskWeights?: { green: number, yellow: number, red: number } }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const lastFrameTime = useRef(0);


    // Physics State
    const velocity = useRef(new THREE.Vector3(0, 0, 0));
    const position = useRef(new THREE.Vector3(0, 0, 0));
    const targetScale = useRef(1);

    const BOUNDARY = 2.5;
    const FRICTION = 0.92;
    const CLICK_FORCE = 0.8;

    // Dynamic color calculation based on weights
    const orbColor = useMemo(() => {
        if (!riskWeights || isNaN(riskWeights.green) || isNaN(riskWeights.yellow) || isNaN(riskWeights.red)) {
            return '#ffffff';
        }
        const r = Math.max(0, Math.min(255, riskWeights.red * 239 + riskWeights.yellow * 250 + riskWeights.green * 16));
        const g = Math.max(0, Math.min(255, riskWeights.red * 68 + riskWeights.yellow * 176 + riskWeights.green * 185));
        const b = Math.max(0, Math.min(255, riskWeights.red * 68 + riskWeights.yellow * 5 + riskWeights.green * 129));
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    }, [riskWeights]);

    const handleInteraction = (event: any) => {
        event.stopPropagation();
        // Add click force based on where we clicked (simple version: push towards center-opposite)
        const point = event.point;
        const pushDir = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), point).normalize();
        velocity.current.add(pushDir.multiplyScalar(CLICK_FORCE));
        targetScale.current = 1.4;
    };

    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.getElapsedTime();

        // GPU Optimization: FPS Stability
        if (time - lastFrameTime.current < 0.016) return;
        lastFrameTime.current = time;

        // Apply Physics
        position.current.add(velocity.current);
        velocity.current.multiplyScalar(FRICTION);

        // Boundary Management (Bounce)
        if (Math.abs(position.current.x) > BOUNDARY) {
            velocity.current.x *= -1;
            position.current.x = Math.sign(position.current.x) * BOUNDARY;
        }
        if (Math.abs(position.current.y) > BOUNDARY) {
            velocity.current.y *= -1;
            position.current.y = Math.sign(position.current.y) * BOUNDARY;
        }
        if (Math.abs(position.current.z) > BOUNDARY * 0.5) {
            velocity.current.z *= -1;
            position.current.z = Math.sign(position.current.z) * BOUNDARY * 0.5;
        }

        // Soft Reset to Center
        position.current.lerp(new THREE.Vector3(0, 0, 0), 0.01);

        // Update Mesh
        mesh.current.position.copy(position.current);

        // Pulse & Scale logic
        targetScale.current = THREE.MathUtils.lerp(targetScale.current, 1, 0.1);
        const pulse = 1 + Math.sin(time * 2.5) * 0.03;
        const s = targetScale.current * pulse;
        mesh.current.scale.set(s, s, s);

        // Subtle rotation based on movement
        mesh.current.rotation.y += velocity.current.x * 0.5 + 0.01;
        mesh.current.rotation.x += velocity.current.y * 0.5 + 0.005;
    });

    // Explicit Disposal
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
        <Sphere
            ref={mesh}
            args={[1.2, 64, 64]}
            onClick={handleInteraction}
            onPointerOver={() => { document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { document.body.style.cursor = 'auto' }}
        >
            <MeshDistortMaterial
                color={orbColor}
                speed={2}
                distort={0.3}
                radius={1}
                emissive={orbColor}
                emissiveIntensity={0.4}
                transparent
                opacity={0.8}
            />
        </Sphere>
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
                <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
                    <ambientLight intensity={0.4} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} />
                    <PulseOrb riskWeights={stats?.riskWeights} />
                </Canvas>
            </div>
        </div>
    );
};

export default AIVisualization3D;
