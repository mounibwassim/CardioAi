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
                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Overview</h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                {detailedContent}
                            </p>

                            <h3 className="text-xl font-bold text-slate-900 mb-4">Key Benefits</h3>
                            <ul className="space-y-4 mb-8">
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
                                className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-[#25D366] text-white rounded-xl font-bold text-lg hover:bg-[#20bd5a] transition-colors shadow-lg shadow-green-500/20"
                            >
                                <MessageCircle className="h-6 w-6 mr-3" />
                                Book via WhatsApp
                            </a>
                        </div>

                        <div className="h-96 bg-slate-100 rounded-2xl overflow-hidden shadow-inner">
                            {/* Placeholder for 3D model or secondary image */}
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200">
                                <span>Visual Asset Placeholder</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
