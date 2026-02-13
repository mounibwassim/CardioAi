import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Info, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const faqs: any[] = [];

export default function PatientFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const feedbackList = JSON.parse(localStorage.getItem("feedback") || "[]");

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-6 shadow-glow"
                    >
                        <HelpCircle className="h-10 w-10 text-primary-500" />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                        Health Intelligence <span className="text-primary-500">FAQ</span>
                    </h1>
                    <p className="mt-4 text-slate-400 text-lg">
                        Common questions about our cardiovascular risk assessment system
                    </p>
                </div>

                {faqs.length > 0 && (
                    <div className="space-y-4 mb-20">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <Info className="text-primary-500" />
                            System Guidelines
                        </h2>
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="overflow-hidden bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-sm"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors focus:outline-none"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-slate-800 rounded-lg">
                                            <faq.icon className="h-5 w-5 text-primary-400" />
                                        </div>
                                        <span className="font-bold text-slate-200">{faq.question}</span>
                                    </div>
                                    {openIndex === index ? (
                                        <ChevronUp className="h-5 w-5 text-slate-500" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-slate-500" />
                                    )}
                                </button>
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="px-6 pb-6 pt-0"
                                        >
                                            <div className="p-4 bg-slate-950/50 rounded-xl border border-white/5 text-slate-400 text-sm leading-relaxed">
                                                {faq.answer}
                                            </div>
                                            <div className="mt-4 flex items-center text-[10px] font-black tracking-widest text-primary-500 uppercase opacity-60">
                                                <span className="bg-primary-500/10 px-2 py-1 rounded">Category: {faq.category}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Community Feedback Section */}
                {feedbackList.length > 0 && (
                    <div className="mt-16 mb-20">
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <Star className="text-yellow-500" />
                            Community Feedback
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {feedbackList.map((feedback: any) => (
                                <motion.div
                                    key={feedback.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="
                                        p-6 rounded-2xl
                                        bg-gradient-to-br from-white to-slate-100
                                        dark:from-slate-800 dark:to-slate-900
                                        border border-slate-200 dark:border-slate-700
                                        shadow-xl
                                        hover:shadow-2xl hover:scale-[1.02]
                                        transition-all duration-300
                                        flex flex-col justify-between
                                    "
                                >
                                    <div>
                                        <div className="flex mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("h-3 w-3", i < feedback.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600")} />
                                            ))}
                                        </div>
                                        <p className="text-slate-800 dark:text-slate-100 italic text-sm leading-relaxed mb-4">
                                            "{feedback.message}"
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
                                        <span className="text-xs font-bold text-primary-500 dark:text-primary-400">{feedback.name}</span>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {new Date(feedback.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
