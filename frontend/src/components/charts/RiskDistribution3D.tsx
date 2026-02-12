import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { guardNaN } from '../../lib/3d-utils';

interface RiskData {
    level: string;
    count: number;
}

interface DonutSegmentProps {
    startAngle: number;
    endAngle: number;
    color: string;
    label: string;
    value: number;
    percentage: number;
}

const DonutSegment = ({ startAngle, endAngle, color, label, value, percentage }: DonutSegmentProps) => {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            // Smooth lift forward on hover
            const currentZ = meshRef.current.position.z;
            const target = hovered ? 0.3 : 0;
            meshRef.current.position.z += (target - currentZ) * 0.1;
        }
    });

    // Calculate segment geometry
    const innerRadius = 1.2;
    const outerRadius = 2.2;
    const segments = 32;

    return (
        <group>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                rotation={[Math.PI / 2, 0, 0]}
                castShadow
            >
                <ringGeometry args={[innerRadius, outerRadius, segments, 1, startAngle, endAngle - startAngle]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.7 : 0.4}
                    metalness={0.6}
                    roughness={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Label Text */}
            {hovered && (
                <Text
                    position={[
                        Math.cos((startAngle + endAngle) / 2) * 1.7,
                        0.5,
                        Math.sin((startAngle + endAngle) / 2) * 1.7
                    ]}
                    fontSize={0.25}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000"
                >
                    {`${label}\n${value} (${percentage.toFixed(1)}%)`}
                </Text>
            )}
        </group>
    );
};

const GlowingCore = () => {
    const coreRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        if (coreRef.current) {
            // Gentle pulsing animation
            const pulse = Math.sin(clock.getElapsedTime() * 2) * 0.1 + 1;
            coreRef.current.scale.set(pulse, pulse, pulse);
        }
    });

    return (
        <mesh ref={coreRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1.1, 32]} />
            <meshStandardMaterial
                color="#6366f1"
                emissive="#6366f1"
                emissiveIntensity={1.2}
                transparent
                opacity={0.6}
            />
        </mesh>
    );
};

const Scene = ({ data }: { data: RiskData[] }) => {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    const colors: Record<string, string> = {
        'Low': '#10b981',
        'Medium': '#f59e0b',
        'High': '#ef4444',
    };

    let currentAngle = 0;
    const segments = data.map(item => {
        const percentage = guardNaN((item.count / total) * 100);
        const angleSpan = guardNaN((item.count / total) * Math.PI * 2);
        const segment = {
            startAngle: currentAngle,
            endAngle: currentAngle + angleSpan,
            color: colors[item.level] || '#6366f1',
            label: item.level,
            value: item.count,
            percentage,
        };
        currentAngle += angleSpan;
        return segment;
    });

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#6366f1" />
            <pointLight position={[-5, 5, -5]} intensity={1} color="#a855f7" />
            <spotLight
                position={[0, 8, 0]}
                angle={0.5}
                intensity={1.5}
                penumbra={1}
                castShadow
            />

            {/* Glowing Inner Core */}
            <GlowingCore />

            {/* Donut Segments */}
            {segments.map((seg, i) => (
                <DonutSegment key={i} {...seg} />
            ))}

            {/* Camera Controls */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={1}
                maxPolarAngle={Math.PI / 2.5}
                minPolarAngle={Math.PI / 3}
            />

            {/* Post-processing */}
            <EffectComposer>
                <Bloom
                    intensity={0.6}
                    luminanceThreshold={0.4}
                    luminanceSmoothing={0.9}
                />
            </EffectComposer>
        </>
    );
};

interface RiskDistribution3DProps {
    data: RiskData[];
}

const RiskDistribution3D = ({ data }: RiskDistribution3DProps) => {
    const safeData = useMemo(() => (data || []).filter((d: any) =>
        d && typeof d === 'object' && d.level && typeof d.count === 'number' && d.count > 0
    ), [data]);

    if (safeData.length === 0) {
        return (
            <div className="h-96 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl flex items-center justify-center border border-slate-700">
                <p className="text-slate-400 text-sm">No risk distribution data available</p>
            </div>
        );
    }

    return (
        <motion.div
            className="h-96 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 rounded-xl overflow-hidden relative shadow-2xl border border-slate-700"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-lg font-bold text-white">Patient Risk Distribution</h3>
                <p className="text-sm text-slate-400">3D Interactive Donut</p>
            </div>

            {/* 3D Canvas */}
            <Canvas
                camera={{ position: [0, 4, 6], fov: 50 }}
                shadows
                gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            >
                <color attach="background" args={['#0f172a']} />
                <fog attach="fog" args={['#0f172a', 8, 15]} />
                <Scene data={safeData} />
            </Canvas>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-slate-600 shadow-lg space-y-2">
                {safeData.map((item, i) => {
                    const colors: Record<string, string> = {
                        'Low': 'bg-green-500',
                        'Medium': 'bg-yellow-500',
                        'High': 'bg-red-500',
                    };
                    return (
                        <div key={i} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-sm ${colors[item.level] || 'bg-indigo-500'}`}></div>
                            <span className="text-xs text-slate-300">{item.level}: {item.count}</span>
                        </div>
                    );
                })}
            </div>

            <div className="absolute bottom-4 left-4 text-xs text-slate-500">
                <p>💫 Hover segments • Auto-rotating</p>
            </div>
        </motion.div>
    );
};

export default RiskDistribution3D;
