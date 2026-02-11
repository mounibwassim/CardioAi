import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Phone, Clock, MapPin, ArrowRight, Activity, Brain, HeartPulse, Stethoscope, CheckCircle } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Heart3D from '../components/Three/Heart3D';
import Doctor3D from '../components/Three/Doctor3D';

export default function PatientPortal() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-800 text-white pb-20 pt-32 lg:pt-48">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    {/* Abstract Background Shapes */}
                    <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary-400/30 border border-primary-300/30 text-primary-50 text-sm font-medium mb-6 backdrop-blur-sm">
                                <span className="flex h-2 w-2 rounded-full bg-secondary-400 mr-2"></span>
                                Accepting New Patients
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                                Advanced AI <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-secondary-100">
                                    Cardiac Care
                                </span>
                            </h1>
                            <p className="text-xl text-primary-100 mb-8 leading-relaxed max-w-lg">
                                Experience the future of heart health. Our AI-assisted diagnostic center combines medical expertise with cutting-edge technology for precise assessments.
                            </p>

                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
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
                            className="relative h-[400px] lg:h-[500px] flex items-center justify-center"
                        >
                            <Canvas camera={{ position: [0, 0, 30], fov: 50 }}>
                                <ambientLight intensity={0.5} />
                                <pointLight position={[10, 10, 10]} intensity={1} />
                                <Heart3D />
                                <OrbitControls enableZoom={false} enablePan={false} />
                            </Canvas>

                            {/* Floating Cards */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute top-10 right-10 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50 max-w-[200px]"
                            >
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                        <CheckCircle className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-slate-800">98.5% Accuracy</span>
                                </div>
                                <p className="text-xs text-slate-500">AI-verified diagnostic precision</p>
                            </motion.div>

                            <motion.div
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                className="absolute bottom-10 left-10 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50 max-w-[200px]"
                            >
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-slate-800">Instant Results</span>
                                </div>
                                <p className="text-xs text-slate-500">Real-time analysis engine</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 w-full leading-none z-10">
                    <svg className="block w-full h-20 md:h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-slate-50"></path>
                    </svg>
                </div>
            </section>

            {/* Services Section */}
            <div className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Explore Our Services</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Comprehensive cardiovascular care powered by advanced technology and medical expertise.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                title: "Comprehensive Care",
                                desc: "Holistic heart health management tailored to you.",
                                icon: Activity,
                                link: "/services/comprehensive-care"
                            },
                            {
                                title: "AI Risk Analysis",
                                desc: "Advanced predictive analytics for early detection.",
                                icon: Brain,
                                link: "/services/ai-risk-analysis"
                            },
                            {
                                title: "Expert Consultation",
                                desc: "Direct access to world-class cardiologists.",
                                icon: Stethoscope, // Note: Need to import Stethoscope if not already available, or use User
                                link: "/services/expert-consultation"
                            },
                            {
                                title: "Ongoing Monitoring",
                                desc: "24/7 remote health tracking and alerts.",
                                icon: HeartPulse,
                                link: "/services/ongoing-monitoring"
                            }
                        ].map((service, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -10 }}
                                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-slate-100 flex flex-col h-full min-h-[320px]"
                            >
                                <div className="h-14 w-14 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
                                    <service.icon className="h-8 w-8 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                                <p className="text-slate-600 mb-8 flex-grow">
                                    {service.desc}
                                </p>
                                <Link
                                    to={service.link}
                                    className="text-primary-600 font-semibold flex items-center hover:text-primary-700 mt-auto"
                                >
                                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Specialists Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Meet Our Specialists</h2>
                        <p className="text-slate-600 text-lg">World-class cardiologists assisted by state-of-the-art AI.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Dr. Sarah Chen", role: "Chief Cardiologist", color: "#0ea5e9" },
                            { name: "Dr. Ahmed Al-Fayed", role: "AI Diagnostics Lead", color: "#10b981" },
                            { name: "Dr. Emily Ross", role: "Patient Care Director", color: "#8b5cf6" }
                        ].map((doc, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-xl transition-all text-center">
                                <div className="mb-6">
                                    <Doctor3D color={doc.color} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">{doc.name}</h3>
                                <p className="text-primary-600 font-medium mb-4">{doc.role}</p>
                                <button className="px-6 py-2 border border-slate-300 rounded-full text-sm font-semibold hover:bg-white hover:border-primary-500 hover:text-primary-600 transition-colors">
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Ready for Assessment */}
            <div className="relative py-24 overflow-hidden">
                <div
                    className="absolute inset-0 z-0 bg-cover bg-fixed bg-center"
                    style={{ backgroundImage: 'url(/assets/images/assessment_hero.webp)' }}
                />
                {/* Soft overlay as requested: rgba(15, 76, 129, 0.35) */}
                <div
                    className="absolute inset-0 z-10"
                    style={{ background: 'linear-gradient(rgba(15, 76, 129, 0.35), rgba(15, 76, 129, 0.35))' }}
                />

                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready for your assessment?</h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                        Take the first step towards a healthier heart today. Our AI-powered assessment takes only minutes.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a
                            href="https://wa.me/601111769636?text=I%20am%20ready%20for%20my%20assessment"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center px-8 py-4 bg-[#25D366] text-white rounded-full font-bold text-lg hover:bg-[#20bd5a] transition-all transform hover:scale-105 shadow-lg"
                        >
                            <MessageCircle className="mr-2 h-6 w-6" />
                            Book via WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <section className="py-24 bg-white relative">
                <div className="container mx-auto px-4">
                    <div className="bg-primary-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
                        <div className="p-12 md:w-1/2 flex flex-col justify-center text-white">
                            <h2 className="text-3xl font-bold mb-6">Ready for your assessment?</h2>
                            <p className="text-primary-100 mb-8 text-lg">
                                Contact us today to schedule your appointment. We prefer WhatsApp for fastest response.
                            </p>
                            <div className="space-y-6">
                                <div className="flex items-center">
                                    <div className="bg-primary-800 p-3 rounded-lg mr-4">
                                        <Phone className="h-6 w-6 text-secondary-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-primary-300">WhatsApp / Call</p>
                                        <p className="text-xl font-bold">+60 11 1176 9636</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="bg-primary-800 p-3 rounded-lg mr-4">
                                        <Mail className="h-6 w-6 text-secondary-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-primary-300">Email</p>
                                        <p className="text-xl font-bold">mounibwassimm@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="bg-primary-800 p-3 rounded-lg mr-4">
                                        <MapPin className="h-6 w-6 text-secondary-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-primary-300">Location</p>
                                        <p className="text-xl font-bold">Kuala Lumpur, Malaysia</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative md:w-1/2 min-h-[400px]">
                            <img
                                src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=1000&auto=format&fit=crop"
                                alt="Medical Interior"
                                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                            />
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-primary-900/90"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="mb-4 text-lg font-semibold text-white">CardioAI Systems</p>
                    <p>&copy; {new Date().getFullYear()} Professional Medical Intelligence. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
