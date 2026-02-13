import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const ParticleWave = ({ count = 200 }) => {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 2 + Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            p[i * 3 + 2] = r * Math.cos(phi);
        }
        return p;
    }, [count]);

    const ref = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (!ref.current) return;
        ref.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        ref.current.rotation.z = state.clock.getElapsedTime() * 0.05;
    });

    return (
        <Points ref={ref} positions={points} stride={3}>
            <PointMaterial
                transparent
                color="#6366f1"
                size={0.05}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
};

const PulsingRing = ({ riskTrend = 'stable', assessmentCount = 0 }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const lastCount = useRef(assessmentCount);
    const expandScale = useRef(1);

    const baseColor = riskTrend === 'up' ? '#ef4444' : riskTrend === 'down' ? '#10b981' : '#6366f1';

    useEffect(() => {
        if (assessmentCount > lastCount.current) {
            expandScale.current = 1.4;
            lastCount.current = assessmentCount;
        }
    }, [assessmentCount]);

    useFrame((state) => {
        if (!mesh.current) return;
        const time = state.clock.getElapsedTime();

        // Base pulse
        const s = 1 + Math.sin(time * 3) * 0.05;

        // Expansion logic
        if (expandScale.current > 1) {
            expandScale.current = THREE.MathUtils.lerp(expandScale.current, 1, 0.1);
        }

        const finalScale = s * expandScale.current;
        mesh.current.scale.set(finalScale, finalScale, finalScale);

        mesh.current.rotation.z = time * 0.5;
    });

    return (
        <Float speed={4} rotationIntensity={0.2} floatIntensity={0.5}>
            <mesh ref={mesh}>
                <torusGeometry args={[1.5, 0.02, 16, 100]} />
                <meshStandardMaterial
                    color={baseColor}
                    emissive={baseColor}
                    emissiveIntensity={2}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            {/* Inner Glow Sphere */}
            <Sphere args={[0.5, 32, 32]}>
                <MeshDistortMaterial
                    color={baseColor}
                    speed={2}
                    distort={0.3}
                    radius={1}
                    emissive={baseColor}
                    emissiveIntensity={1}
                    transparent
                    opacity={0.3}
                />
            </Sphere>
        </Float>
    );
};

interface LiveSystemPulseProps {
    stats: {
        total: number;
        trend: string;
    };
}

const LiveSystemPulse = ({ stats }: LiveSystemPulseProps) => {
    return (
        <div className="h-[400px] w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative group">
            <div className="absolute top-6 left-6 z-10">
                <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="flex h-3 w-3 rounded-full bg-primary-500 mr-3 animate-ping"></span>
                    Live System Pulse
                </h3>
                <p className="text-slate-400 text-sm mt-1">Real-time analytical activity stream</p>
            </div>

            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
                <PulsingRing riskTrend={stats.trend} assessmentCount={stats.total} />
                <ParticleWave count={Math.min(stats.total * 5 + 100, 1000)} />
            </Canvas>

            <div className="absolute bottom-6 left-6 z-10">
                <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Activity Density</p>
                    <div className="flex items-center space-x-2 mt-1">
                        <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary-500"
                                initial={{ width: "0%" }}
                                animate={{ width: `${Math.min((stats.total / 100) * 100, 100)}%` }}
                            />
                        </div>
                        <span className="text-[10px] font-mono text-primary-400">{stats.total} UNIT</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveSystemPulse;
