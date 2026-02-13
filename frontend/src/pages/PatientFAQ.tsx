import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Info, Star, Activity, Brain, Stethoscope, Shield, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const faqs = [
    {
        question: "What does the cardiovascular risk percentage mean?",
        answer: "The percentage represents the statistical probability of a cardiovascular event based on model analysis. • 0-20%: Low Risk, focus on maintenance. • 20-50%: Medium Risk, requires screening. • >50%: High Risk, clinical consultation required.",
        category: "Analytics",
        icon: Activity
    },
    {
        question: "How is the AI prediction calculated?",
        answer: "The system uses a Random Forest Ensemble model trained on anonymized clinical subsets. It analyzes age, BP, cholesterol, heart rate markers, and ST-segment patterns to derive risk vectors.",
        category: "Technology",
        icon: Brain
    },
    {
        question: "Can I edit or update patient assessments?",
        answer: "Yes, physicians can update clinical notes and signatures in the 'Patient Overview' section. Raw diagnostic data from assessments is locked to maintain audit trail integrity.",
        category: "Management",
        icon: Stethoscope
    },
    {
        question: "Is my clinical data stored securely?",
        answer: "Data is encrypted using military-grade protocols. Access is restricted via Physician PIN verification, and no personally identifiable information is used in AI model weight updates.",
        category: "Security",
        icon: Shield
    },
    {
        question: "How often should assessments be repeated?",
        answer: "• High Risk: Follow-up required immediately or within 14 days. • Medium Risk: Quarterly assessments recommended. • Low Risk: Annual cardiovascular screening.",
        category: "Protocol",
        icon: Clock
    },
    {
        question: "What actions should be taken for high-risk results?",
        answer: "Immediate cardiology referral is mandatory. The system generates a structured clinical report to assist the specialist in determining definitive intervention paths.",
        category: "Emergency",
        icon: AlertTriangle
    }
];

export default function PatientFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const feedbackList = JSON.parse(localStorage.getItem("feedback") || "[]").filter((f: any) =>
        f.message && !f.message.toLowerCase().includes("jj") && f.message.length > 5
    );

    return (
        <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center p-3 bg-primary-500/10 rounded-2xl mb-4"
                    >
                        <HelpCircle className="h-8 w-8 text-primary-500" />
                    </motion.div>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-500">
                        Physician Support Hub
                    </h1>
                    <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                        Comprehensive documentation and guidance for the CardioAI clinical decision support system.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-6 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center space-x-3 mb-6">
                            <Info className="h-5 w-5 text-indigo-500" />
                            <h2 className="text-lg font-bold">Frequently Asked Questions</h2>
                        </div>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border-b border-slate-100 dark:border-white/5 last:border-0 pb-4">
                                    <button
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                        className="w-full flex justify-between items-center text-left py-2 hover:text-primary-500 transition-colors"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <faq.icon className="h-4 w-4 opacity-50" />
                                            <span className="font-bold text-sm tracking-tight">{faq.question}</span>
                                        </div>
                                        {openIndex === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                    <AnimatePresence>
                                        {openIndex === index && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="py-3 text-sm text-slate-500 leading-relaxed font-medium">
                                                    {faq.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 shadow-xl rounded-2xl p-6 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center space-x-3 mb-6">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <h2 className="text-lg font-bold">Community Insights</h2>
                        </div>
                        <div className="space-y-6">
                            {feedbackList.length > 0 ? (
                                feedbackList.slice(0, 4).map((f: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            {f.rating && (
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={cn("h-3 w-3", i < f.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300")} />
                                                    ))}
                                                </div>
                                            )}
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{f.timestamp ? new Date(f.timestamp).toLocaleDateString() : 'Recent Review'}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 italic font-medium leading-relaxed italic line-clamp-3">
                                            "{f.message}"
                                        </p>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-sm text-slate-500">No community feedback available yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-primary-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary-600/20">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Diagnostic Verification Protocol</h3>
                            <p className="text-primary-100 max-w-md font-medium text-sm leading-relaxed">
                                Our AI system operates under strict clinical oversight. High-risk predictions are prioritized for manual review by a licensed cardiologist.
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-black tracking-widest uppercase text-xs shadow-xl"
                        >
                            Open Review Portal
                        </motion.button>
                    </div>
                    {/* Abstract background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                </div>
            </div>
        </div>
    );
}
