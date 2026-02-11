import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ServicePageProps {
    title: string;
    description: string;
    imageSrc: string;
    benefits: string[];
    detailedContent: string;
}

export default function ServicePage({ title, description, imageSrc, benefits, detailedContent }: ServicePageProps) {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Hero Section */}
            <div className="relative h-[60vh] bg-slate-900 overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageSrc})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center max-w-4xl px-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold text-white mb-6"
                        >
                            {title}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-slate-200"
                        >
                            {description}
                        </motion.p>
                    </div>
                </div>

                <Link
                    to="/"
                    className="absolute top-8 left-8 text-white/80 hover:text-white flex items-center transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 mr-2" />
                    Back to Home
                </Link>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-16 -mt-20 relative z-10">
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left Side - Image */}
                        <div className="relative h-96 lg:h-auto min-h-[500px]">
                            <div className="absolute inset-0 bg-slate-900/20 z-10" />
                            <img
                                src={imageSrc}
                                alt={title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />

                            {/* Medical Overlay Graphic */}
                            <div className="absolute bottom-8 left-8 right-8 z-20">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-white font-semibold">Treatment Efficacy</span>
                                        <span className="text-secondary-400 font-bold text-xl">98.5%</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '98.5%' }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-secondary-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Content */}
                        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Overview</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                {detailedContent}
                            </p>

                            <h3 className="text-xl font-bold text-slate-900 mb-4">Key Benefits</h3>
                            <ul className="space-y-4 mb-10">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mt-1 mr-4 shrink-0">
                                            <div className="h-2 w-2 rounded-full bg-primary-600" />
                                        </div>
                                        <span className="text-slate-700">{benefit}</span>
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="https://wa.me/601111769636?text=I%20would%20like%20to%20know%20more%20about%20your%20services"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center w-full px-8 py-4 bg-[#25D366] text-white rounded-xl font-bold text-lg hover:bg-[#20bd5a] transition-all transform hover:scale-105 shadow-lg shadow-green-500/20"
                            >
                                <MessageCircle className="h-6 w-6 mr-3" />
                                Book Consultation
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
