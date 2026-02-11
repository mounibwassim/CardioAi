import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export default function Landing() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-32 space-y-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">

                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
                        >
                            <h1 className="text-4xl tracking-tight font-extrabold text-slate-900 sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                                <span className="block xl:inline">Advanced Cardiac</span>{' '}
                                <span className="block text-primary-600 xl:inline">Risk Assessment</span>
                            </h1>
                            <p className="mt-3 text-base text-slate-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                                Leveraging state-of-the-art machine learning models to provide early detection and personalized risk analysis for cardiovascular health.
                            </p>
                            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                                <Link
                                    to="/predict"
                                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    Start Analysis
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
                        >
                            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md bg-gradient-to-br from-primary-50 to-white p-8">
                                {/* Decorative Elements */}
                                <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                                <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

                                <div className="relative space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white p-3 rounded-full shadow-md">
                                            <Activity className="h-8 w-8 text-red-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">System Status</p>
                                            <p className="text-lg font-bold text-slate-900">Operational</p>
                                        </div>
                                    </div>

                                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-100">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-slate-600">Accuracy</span>
                                            <span className="text-sm font-bold text-primary-600">98.5%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div className="bg-primary-600 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                                        </div>
                                    </div>

                                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-100">
                                        <p className="text-sm text-slate-500 mb-1">Recent Analysis</p>
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className={`inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500`}>
                                                    U{i}
                                                </div>
                                            ))}
                                            <div className="h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-xs text-slate-400">+</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-12">
                        Professional Grade Features
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
                                <Zap className="h-6 w-6 text-primary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Inference</h3>
                            <p className="text-slate-500">
                                Instant analysis using optimized random forest algorithms for immediate results.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="mx-auto w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-6">
                                <Activity className="h-6 w-6 text-secondary-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Clinical Precision</h3>
                            <p className="text-slate-500">
                                Trained on verified UCI repository data with high validation accuracy.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                                <ShieldCheck className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Secure & Private</h3>
                            <p className="text-slate-500">
                                Data is processed securely and not stored permanently in this demo environment.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
