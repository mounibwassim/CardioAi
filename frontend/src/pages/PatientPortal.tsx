import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, Phone, Clock, MapPin, ArrowRight, Activity, Brain, HeartPulse, Stethoscope, CheckCircle, X } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import NeuralPulseField from '../components/Three/NeuralPulseField';
import HealthTechBackground from '../components/HealthTechBackground';


export default function PatientPortal() {
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [bgIndex, setBgIndex] = useState(0);
    const navigate = useNavigate();

    const backgrounds = [
        "/assets/images/cardiology clinic.jpg",
        "/assets/images/cardiology clinic modern interior.jpg"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % backgrounds.length);
        }, 5000); // 5 seconds (User asked for 3s but 5s is smoother for UX, adjusting to 3s as requested though)
        return () => clearInterval(interval);
    }, []);

    // Override to exact request
    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((prev) => (prev + 1) % backgrounds.length);
        }, 3000); // 3 seconds per request
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200">

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-slate-900 text-white min-h-screen flex items-center">
                {/* Background Slideshow */}
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={bgIndex}
                            src={backgrounds[bgIndex]}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.4 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                            alt="Background"
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 via-primary-800/80 to-slate-900/90" />
                </div>

                <div className="container mx-auto px-6 lg:px-12 py-16 relative z-10 pt-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium mb-8 backdrop-blur-md shadow-lg">
                                <span className="flex h-2 w-2 rounded-full bg-secondary-400 mr-2 animate-pulse"></span>
                                Accepting New Patients
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-8 tracking-tight">
                                Advanced AI <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-secondary-100 filter drop-shadow-lg">
                                    Cardiac Care
                                </span>
                            </h1>
                            <p className="text-xl text-slate-200 mb-10 leading-relaxed max-w-lg font-light">
                                Experience the future of heart health. Our AI-assisted diagnostic center combines medical expertise with cutting-edge technology for precise assessments.
                            </p>

                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                                <a
                                    href="https://wa.me/601111769636"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex justify-center items-center px-8 py-4 bg-secondary-500 text-white font-bold rounded-xl shadow-lg shadow-secondary-500/30 hover:bg-secondary-400 hover:scale-105 transition-all duration-300"
                                >
                                    <MessageCircle className="mr-2 h-5 w-5" />
                                    Book via WhatsApp
                                </a>
                                <a
                                    href="#services"
                                    className="inline-flex justify-center items-center px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
                                >
                                    Explore Services
                                </a>
                            </div>
                        </motion.div>

                        {/* 3D Model Showcase */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative h-[500px] lg:h-[600px] flex items-center justify-center"
                        >
                            <Canvas
                                dpr={[1, 2]}
                                camera={{ position: [0, 0, 30], fov: 50 }}
                                onCreated={({ gl }) => {
                                    // Resilience: Handle WebGL context recovery
                                    const handleLoss = (event: Event) => {
                                        event.preventDefault();
                                        console.warn('WebGL context lost - CardioAI UI stability feature triggered');
                                    };
                                    const canvas = gl.domElement;
                                    canvas.addEventListener('webglcontextlost', handleLoss, false);

                                    // Cleanup listener on unmount is tricky inside onCreated
                                    // We rely on standard R3F cleanup for the rest
                                }}
                            >
                                <ambientLight intensity={0.6} />
                                <pointLight position={[10, 10, 10]} intensity={1.5} color="#fbbf24" />
                                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
                                <NeuralPulseField />
                                <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
                            </Canvas>

                            {/* Floating Cards */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-20 right-10 bg-white/10 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-white/20 max-w-[220px]"
                            >
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
                                        <CheckCircle className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-white">99.2% Accuracy</span>
                                </div>
                                <p className="text-xs text-slate-300">AI-verified diagnostic precision</p>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-20 left-0 bg-white/10 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-white/20 max-w-[220px]"
                            >
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-white">Instant Results</span>
                                </div>
                                <p className="text-xs text-slate-300">Real-time analysis engine</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 w-full leading-none z-10 w-full overflow-hidden">
                    <svg className="block w-full h-24 md:h-48" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50 dark:fill-slate-950"></path>
                    </svg>
                </div>
            </section>

            {/* Services Section */}
            <div id="services" className="py-24 bg-slate-50 dark:bg-slate-950 relative">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/images/medical abstract background blue.jpg"
                        alt="Background"
                        className="w-full h-full object-cover opacity-5 mix-blend-multiply"
                    />
                </div>
                <div className="container mx-auto px-6 lg:px-12 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">Explore Our Services</h2>
                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            Comprehensive cardiovascular care powered by advanced technology and medical expertise.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: "Comprehensive Care",
                                desc: "Holistic heart health management tailored to your unique lifestyle.",
                                icon: Activity,
                                link: "/services/comprehensive-care",
                                image: "/assets/images/Comprehensive Care.jpg"
                            },
                            {
                                title: "AI Risk Analysis",
                                desc: "Advanced predictive analytics for early detection of potential risks.",
                                icon: Brain,
                                link: "/services/ai-risk-analysis",
                                image: "/assets/images/AI Risk Analysis.jpg"
                            },
                            {
                                title: "Expert Consultation",
                                desc: "Direct access to world-class cardiologists for personalized advice.",
                                icon: Stethoscope,
                                link: "/services/expert-consultation",
                                image: "/assets/images/Expert Consultation.jpg"
                            },
                            {
                                title: "Ongoing Monitoring",
                                desc: "24/7 remote health tracking and real-time alerts.",
                                icon: HeartPulse,
                                link: "/services/ongoing-monitoring",
                                image: "/assets/images/healthcare technology AI illustration.jpg"
                            }
                        ].map((service, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -10 }}
                                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-800 flex flex-col h-full"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-primary-900/10 group-hover:bg-primary-900/0 transition-all z-10" />
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000'; // Reliable fallback
                                        }}
                                    />
                                </div>
                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="h-12 w-12 bg-primary-50 rounded-xl flex items-center justify-center mb-6 text-primary-600 shadow-sm">
                                        <service.icon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{service.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 mb-8 flex-grow leading-relaxed">
                                        {service.desc}
                                    </p>
                                    <Link
                                        to={service.link}
                                        className="text-primary-600 font-bold flex items-center hover:text-secondary-500 transition-colors mt-auto"
                                    >
                                        Learn more <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Specialists Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/images/medical abstract background blue.jpg"
                        alt="Background"
                        className="w-full h-full object-cover opacity-100"
                    />
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
                </div>
                {/* Removed skewed bg */}

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-slate-900 font-bold text-3xl md:text-4xl mb-6">Meet Our Specialists</h2>
                        <p className="text-slate-700 text-lg md:text-xl font-medium">World-class cardiologists assisted by state-of-the-art AI.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                name: "Dr. Sarah Chen",
                                role: "Chief Cardiologist",
                                image: "/assets/images/Dr. Sarah Chen.jpg",
                                quote: "Combining empathy with precision medicine.",
                                bio: "Dr. Chen leads our cardiology department with over 15 years of experience in interventional cardiology. She specializes in minimally invasive procedures and has pioneered several AI-driven diagnostic protocols."
                            },
                            {
                                name: "Dr. Michael Torres",
                                role: "AI Diagnostics Lead",
                                image: "/assets/images/Dr. Ahmed Al-Fayed.jpg",
                                quote: "Technology detects what the eye might miss.",
                                bio: "Dr. Torres bridges the gap between medicine and machine learning, ensuring our AI diagnostic tools are clinically accurate suitable for patient care."
                            },
                            {
                                name: "Dr. Emily Ross",
                                role: "Patient Care Director",
                                image: "/assets/images/Dr. Emily Ross.jpg",
                                quote: "Your heart health is our life's mission.",
                                bio: "Dr. Ross oversees the patient experience, ensuring that every individual receives personalized, compassionate care throughout their journey with CardioAI."
                            }
                        ].map((doc, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all text-center relative group cursor-pointer"
                                onClick={() => setSelectedDoctor(doc)}
                            >
                                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-br from-primary-50 to-white rounded-t-3xl z-0" />

                                <div className="relative z-10 pt-4 pb-6">
                                    <div className="relative mb-6 inline-block">
                                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full opacity-75 blur group-hover:opacity-100 transition duration-500" />
                                        <img
                                            src={doc.image}
                                            alt={doc.name}
                                            className="relative h-48 w-48 rounded-full object-cover border-4 border-white shadow-lg"
                                        />
                                    </div>

                                    {/* Name Logic Fix: Ensure visibility above image or clearly below */}
                                    <div className="px-4">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{doc.name}</h3>
                                        <p className="text-secondary-500 font-bold uppercase text-xs tracking-wider mb-4">{doc.role}</p>

                                        <p className="text-slate-500 dark:text-slate-400 italic mb-6">"{doc.quote}"</p>

                                        <button className="w-full py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 hover:border-primary-200 transition-all active:scale-95">
                                            View Profile
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctor Modal */}
            <AnimatePresence>
                {selectedDoctor && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
                        onClick={() => setSelectedDoctor(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedDoctor(null)}
                                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-50"
                            >
                                <X className="h-5 w-5 text-slate-500" />
                            </button>

                            {/* Header Image */}
                            <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url('/assets/images/medical abstract background blue.jpg')` }}>
                                <div className="absolute inset-0 bg-primary-900/30" />
                            </div>

                            <div className="px-8 pb-8 relative -mt-16">
                                <div className="flex flex-col items-center text-center">
                                    <img
                                        src={selectedDoctor.image}
                                        alt={selectedDoctor.name}
                                        className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover mb-4 z-10"
                                    />

                                    <h2 className="text-3xl font-bold text-slate-900">{selectedDoctor.name}</h2>
                                    <p className="text-primary-600 font-semibold mb-6">{selectedDoctor.role}</p>

                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 mb-6 w-full text-left">
                                        <p className="text-slate-600 italic text-center mb-4">"{selectedDoctor.quote}"</p>
                                        <div className="h-px bg-slate-200 w-full mb-4" />
                                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Biography</h4>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {selectedDoctor.bio}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CTA Section - Ready for Assessment */}
            <div className="relative py-32 overflow-hidden">
                <HealthTechBackground />

                <div className="absolute inset-0 z-0 bg-slate-900" />
                <img
                    src="/assets/images/doctor cardiologist consultation.jpg"
                    alt="Consultation"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
                />

                <div
                    className="absolute inset-0 z-10"
                    style={{ background: 'linear-gradient(to right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.7))' }}
                />

                <div className="relative z-20 container mx-auto px-6 text-center text-white">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Ready for your assessment?</h2>
                    <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                        Take the first step towards a healthier heart today. Our AI-powered assessment takes only minutes and provides instant insights.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <a
                            href="https://wa.me/601111769636?text=I%20am%20ready%20for%20my%20assessment"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center px-10 py-5 bg-[#25D366] text-white rounded-full font-bold text-xl hover:bg-[#20bd5a] transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
                        >
                            <MessageCircle className="mr-3 h-7 w-7" />
                            Book via WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-6">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-slate-100">
                        <div className="p-12 lg:w-1/2 flex flex-col justify-center bg-slate-900 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-y-1/2 -translate-x-1/2" />

                            <h2 className="text-3xl font-bold mb-6 relative z-10">Get in Touch</h2>
                            <p className="text-slate-300 mb-10 text-lg relative z-10">
                                Contact us today to schedule your appointment. We prefer WhatsApp for the fastest response time.
                            </p>
                            <div className="space-y-8 relative z-10">
                                <div className="flex items-center group">
                                    <div className="bg-white/10 p-4 rounded-xl mr-5 group-hover:bg-secondary-500 transition-colors">
                                        <Phone className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">WhatsApp / Call</p>
                                        <p className="text-xl font-bold tracking-wide">+60 11 1176 9636</p>
                                    </div>
                                </div>
                                <div className="flex items-center group">
                                    <div className="bg-white/10 p-4 rounded-xl mr-5 group-hover:bg-secondary-500 transition-colors">
                                        <Mail className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Email</p>
                                        <p className="text-xl font-bold tracking-wide">mounibwassimm@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center group">
                                    <div className="bg-white/10 p-4 rounded-xl mr-5 group-hover:bg-secondary-500 transition-colors">
                                        <MapPin className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-1">Location</p>
                                        <p className="text-xl font-bold tracking-wide">Kuala Lumpur, Malaysia</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative lg:w-1/2 min-h-[400px]">
                            <img
                                src="/assets/images/cardiology clinic modern interior.jpg"
                                alt="Medical Interior"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-slate-900/50 lg:hidden"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0 text-center md:text-left">
                            <p className="text-lg font-semibold text-white">CardioAI Systems</p>
                            <p className="text-sm">&copy; {new Date().getFullYear()} Professional Medical Intelligence. All rights reserved.</p>
                        </div>
                        <div className="flex space-x-6">

                        </div>
                    </div>
                </div>
            </footer>
            {/* Hidden Portal Entry Dot - Relocated & Subtle */}
            <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
                <button
                    onClick={() => navigate("/doctor/login", { replace: true })}
                    className="w-4 h-4 rounded-full bg-white dark:bg-slate-950 opacity-[0.03] hover:opacity-100 transition-all duration-500 pointer-events-auto cursor-default"
                    aria-label="Staff Access"
                />
            </div>
        </div>
    );
}

