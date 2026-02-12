import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { calculateBarHeight } from '../../lib/3d-utils';
import { Users } from 'lucide-react';

interface DoctorPerformanceData {
    doctor: string;
    patients: number;
    criticalCases?: number;
}

interface GlassBarProps {
    position: [number, number, number];
    width: number;
    doctor: string;
    value: number;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#10b981', '#3b82f6'];

const GlassBar = ({ position, width, doctor, value, color }: GlassBarProps & { color: string }) => {
    const [hovered, setHovered] = useState(false);
    const meshRef = useRef<THREE.Mesh>(null);
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            // Smooth width animation
            const currentScale = meshRef.current.scale.x;
            const target = hovered ? 1.05 : 1;
            meshRef.current.scale.x += (target - currentScale) * 0.1;
        }

        if (glowRef.current) {
            // Pulsing glow
            const pulse = Math.sin(Date.now() * 0.002) * 0.1 + 0.9;
            glowRef.current.scale.set(hovered ? pulse * 1.1 : 1, hovered ? pulse : 1, 1);
        }
    });

    return (
        <group position={position}>
            {/* Inner Glow */}
            <mesh
                ref={glowRef}
                position={[width / 2, 0, -0.05]}
            >
                <boxGeometry args={[width, 0.5, 0.4]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 1 : 0.3}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Glass Bar */}
            <mesh
                ref={meshRef}
                position={[width / 2, 0, 0]}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
                castShadow
                receiveShadow
            >
                <boxGeometry args={[width, 0.6, 0.6]} />
                <meshPhysicalMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={hovered ? 0.6 : 0.3}
                    metalness={0.3}
                    roughness={0.1}
                    transparent
                    opacity={0.7}
                    transmission={0.5}
                    thickness={0.5}
                    envMapIntensity={1.5}
                />
            </mesh>

            {/* Doctor Label */}
            <Text
                position={[-0.4, 0, 0]}
                fontSize={0.3}
                color="#f8fafc"
                anchorX="right"
                anchorY="middle"
            >
                {doctor}
            </Text>

            {/* Value Label */}
            {hovered && (
                <Text
                    position={[width + 0.4, 0, 0]}
                    fontSize={0.35}
                    color="white"
                    anchorX="left"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000"
                >
                    {value}
                </Text>
            )}

            {/* Reflection Line */}
            <mesh position={[width / 2, 0.35, 0.25]}>
                <boxGeometry args={[width * 0.8, 0.08, 0.05]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={0.8}
                    transparent
                    opacity={hovered ? 0.8 : 0.4}
                />
            </mesh>
        </group>
    );
};

const Scene = ({ data }: { data: DoctorPerformanceData[] }) => {
    const maxValue = Math.max(...data.map(d => d.patients), 1);
    const maxWidth = 3.5;

    return (
        <>
            {/* Lighting for Glass Effect */}
            <ambientLight intensity={0.6} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#6366f1" />
            <pointLight position={[-5, 5, -5]} intensity={1} color="#a855f7" />
            <pointLight position={[0, -5, 5]} intensity={0.8} color="#3b82f6" />
            <spotLight
                position={[10, 10, 5]}
                angle={0.3}
                intensity={2}
                penumbra={1}
                castShadow
            />

            {/* Bars */}
            {data.map((item, i) => {
                const width = calculateBarHeight(item.patients, maxValue, maxWidth);
                // Increased spacing from 1.2 to 1.6
                const yPos = -(i - (data.length - 1) / 2) * 1.6;
                const color = COLORS[i % COLORS.length];

                return (
                    <GlassBar
                        key={item.doctor}
                        position={[0, yPos, 0]}
                        width={width}
                        doctor={item.doctor}
                        value={item.patients}
                        color={color}
                    />
                );
            })}

            {/* Camera Controls */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate={false}
            />

            {/* Post-processing */}
            <EffectComposer>
                <Bloom
                    intensity={0.5}
                    luminanceThreshold={0.5}
                    luminanceSmoothing={0.9}
                />
            </EffectComposer>
        </>
    );
};

interface DoctorPerformance3DProps {
    data: DoctorPerformanceData[];
}

const DoctorPerformance3D = ({ data }: DoctorPerformance3DProps) => {
    const safeData = useMemo(() => (data || []).filter((d: any) =>
        d && typeof d === 'object' && d.doctor && typeof d.patients === 'number' && d.patients > 0
    ), [data]);

    if (safeData.length === 0) {
        return (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 rounded-xl shadow-sm border border-slate-700 h-96 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Doctor Performance
                </h3>
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-800/50 rounded-lg border border-dashed border-slate-600">
                    <Users className="w-12 h-12 text-slate-500 mb-2" />
                    <p className="text-slate-400 text-sm">No doctor performance data available</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="h-96 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-xl overflow-hidden relative shadow-2xl border border-slate-700"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Header */}
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    Doctor Performance
                </h3>
                <p className="text-sm text-slate-400">3D Glass Bars</p>
            </div>

            {/* 3D Canvas */}
            <Canvas
                camera={{ position: [5, 0, 8], fov: 50 }}
                shadows
                gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            >
                <color attach="background" args={['#0f172a']} />
                <Scene data={safeData} />
            </Canvas>

            {/* Info */}
            <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-600 shadow-lg">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-indigo-500 shadow-lg shadow-indigo-500/50"></div>
                    <span className="text-xs text-slate-300">Total Patients</span>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 text-xs text-slate-500">
                <p>💫 Hover bars for values</p>
            </div>
        </motion.div>
    );
};

export default DoctorPerformance3D;
