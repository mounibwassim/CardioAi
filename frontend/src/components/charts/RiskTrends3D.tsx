import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { guardNaN } from '../../lib/3d-utils';
import { Activity } from 'lucide-react';

interface RiskTrendData {
    date: string;
    low: number;
    medium: number;
    high: number;
}

interface StackedBarProps {
    position: [number, number, number];
    low: number;
    medium: number;
    high: number;
    maxTotal: number;
    label: string;
}

const StackedBar = ({ position, low, medium, high, maxTotal, label }: StackedBarProps) => {
    const [hovered, setHovered] = useState<string | null>(null);
    const lowRef = useRef<THREE.Mesh>(null);
    const medRef = useRef<THREE.Mesh>(null);
    const highRef = useRef<THREE.Mesh>(null);

    const total = low + medium + high;
    const scale = total / maxTotal;
    const maxHeight = 3;

    // Calculate heights and positions
    const lowHeight = (low / total) * scale * maxHeight;
    const medHeight = (medium / total) * scale * maxHeight;
    const highHeight = (high / total) * scale * maxHeight;

    useFrame(() => {
        [
            { ref: lowRef, target: hovered === 'low' ? 1.05 : 1 },
            { ref: medRef, target: hovered === 'medium' ? 1.05 : 1 },
            { ref: highRef, target: hovered === 'high' ? 1.05 : 1 },
        ].forEach(({ ref, target }) => {
            if (ref.current) {
                ref.current.scale.x += (target - ref.current.scale.x) * 0.1;
                ref.current.scale.z += (target - ref.current.scale.z) * 0.1;
            }
        });
    });

    return (
        <group position={position}>
            {/* Low Risk Layer (Bottom - Green) */}
            <mesh
                ref={lowRef}
                position={[0, lowHeight / 2, 0]}
                onPointerOver={() => setHovered('low')}
                onPointerOut={() => setHovered(null)}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[0.7, lowHeight, 0.7]} />
                <meshStandardMaterial
                    color="#10b981"
                    emissive="#10b981"
                    emissiveIntensity={hovered === 'low' ? 0.7 : 0.4}
                    metalness={0.7}
                    roughness={0.2}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Medium Risk Layer (Middle - Yellow) */}
            <mesh
                ref={medRef}
                position={[0.1, lowHeight + medHeight / 2, 0.1]} // Z-offset for depth
                onPointerOver={() => setHovered('medium')}
                onPointerOut={() => setHovered(null)}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[0.7, medHeight, 0.7]} />
                <meshStandardMaterial
                    color="#f59e0b"
                    emissive="#f59e0b"
                    emissiveIntensity={hovered === 'medium' ? 0.7 : 0.4}
                    metalness={0.7}
                    roughness={0.2}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* High Risk Layer (Top - Red) */}
            <mesh
                ref={highRef}
                position={[0.2, lowHeight + medHeight + highHeight / 2, 0.2]} // More Z-offset
                onPointerOver={() => setHovered('high')}
                onPointerOut={() => setHovered(null)}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[0.7, highHeight, 0.7]} />
                <meshStandardMaterial
                    color="#ef4444"
                    emissive="#ef4444"
                    emissiveIntensity={hovered === 'high' ? 0.7 : 0.4}
                    metalness={0.7}
                    roughness={0.2}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Date Label */}
            <Text
                position={[0, -0.3, 0]}
                fontSize={0.15}
                color="#94a3b8"
                anchorX="center"
                anchorY="middle"
            >
                {label}
            </Text>

            {/* Hover Values */}
            {hovered && (
                <Text
                    position={[0, lowHeight + medHeight + highHeight + 0.5, 0]}
                    fontSize={0.2}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000"
                >
                    {hovered === 'low' ? `Low: ${guardNaN(low)}` : hovered === 'medium' ? `Med: ${guardNaN(medium)}` : `High: ${guardNaN(high)}`}
                </Text>
            )}
        </group>
    );
};

const Scene = ({ data }: { data: RiskTrendData[] }) => {
    const maxTotal = Math.max(...data.map(d => d.low + d.medium + d.high), 1);

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
            <pointLight position={[-10, 5, -10]} intensity={0.8} color="#8b5cf6" />
            <spotLight
                position={[0, 20, 0]}
                angle={0.5}
                intensity={1.5}
                penumbra={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />

            {/* Floor Grid */}
            <gridHelper args={[20, 20, '#334155', '#1e293b']} position={[0, 0, 0]} />

            {/* Stacked Bars */}
            {data.map((item, i) => {
                const xPos = (i - (data.length - 1) / 2) * 1.5;
                return (
                    <StackedBar
                        key={item.date}
                        position={[xPos, 0, 0]}
                        low={item.low}
                        medium={item.medium}
                        high={item.high}
                        maxTotal={maxTotal}
                        label={item.date.split('-').slice(1).join('/')}
                    />
                );
            })}

            {/* Camera Controls */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                maxPolarAngle={Math.PI / 2.2}
                minPolarAngle={Math.PI / 6}
            />

            {/* Post-processing */}
            <EffectComposer>
                <Bloom
                    intensity={0.7}
                    luminanceThreshold={0.4}
                    luminanceSmoothing={0.9}
                />
            </EffectComposer>
        </>
    );
};

interface RiskTrends3DProps {
    data: RiskTrendData[];
}

const RiskTrends3D = ({ data }: RiskTrends3DProps) => {
    const safeData = useMemo(() => (data || []).filter((d: any) =>
        d && typeof d === 'object' && d.date &&
        typeof d.low === 'number' && typeof d.medium === 'number' && typeof d.high === 'number'
    ), [data]);

    if (safeData.length === 0) {
        return (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-xl shadow-sm border border-slate-700 h-96 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-400" />
                    Risk Level Trends
                </h3>
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/50 rounded-lg border border-dashed border-slate-600">
                    <Activity className="w-12 h-12 text-slate-500 mb-2" />
                    <p className="text-slate-400 text-sm">No trend data available</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="h-96 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-xl overflow-hidden relative shadow-2xl border border-slate-700"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Risk Level Trends
                </h3>
                <p className="text-sm text-slate-400">3D Stacked Layers</p>
            </div>

            {/* 3D Canvas */}
            <Canvas
                camera={{ position: [0, 4, 10], fov: 50 }}
                shadows
                gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            >
                <color attach="background" args={['#0f172a']} />
                <fog attach="fog" args={['#0f172a', 5, 25]} />
                <Scene data={safeData} />
            </Canvas>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-slate-600 shadow-lg space-y-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-red-500"></div>
                    <span className="text-xs text-slate-300">High Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-yellow-500"></div>
                    <span className="text-xs text-slate-300">Medium Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                    <span className="text-xs text-slate-300">Low Risk</span>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 text-xs text-slate-500">
                <p>💫 Hover layers • Drag to rotate</p>
            </div>
        </motion.div>
    );
};

export default RiskTrends3D;
