import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Shield, Brain, Lock, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: "What is CardioAI and how does it help me?",
        answer: "CardioAI is an advanced health intelligence system that uses state-of-the-art AI models to analyze cardiovascular risk factors. It provides your healthcare provider with data-driven insights to help early detection and personalized care planning.",
        icon: Brain,
        category: "System Overview"
    },
    {
        question: "Is the AI diagnosis definitive?",
        answer: "No. CardioAI is designed as a clinical decision support tool. It provides a risk assessment, not a final medical diagnosis. All results must be reviewed and validated by a qualified medical professional before making any treatment decisions.",
        icon: Info,
        category: "Medical Disclaimer"
    },
    {
        question: "How is my medical data protected?",
        answer: "Your privacy is our top priority. All clinical data is encrypted both in transit and at rest using industry-standard protocols. We comply with major health data privacy regulations to ensure your personal information remains confidential.",
        icon: Lock,
        category: "Privacy & Security"
    },
    {
        question: "Who can see my assessment results?",
        answer: "Assessment results are only accessible to authorized healthcare providers signed into the clinical dashboard. Your data is cryptographically indexed to your patient record and is used solely for your medical care.",
        icon: Shield,
        category: "Access Control"
    },
    {
        question: "How should I interpret my risk score?",
        answer: "A risk score is a statistical probability of cardiovascular issues based on current clinical markers. A higher score indicates a need for closer monitoring or diagnostic follow-up, as determined by your physician.",
        icon: HelpCircle,
        category: "Understanding Results"
    }
];

export default function PatientFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
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

                <div className="space-y-4">
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

                {/* Disclaimer Box */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 p-8 bg-red-500/5 border border-red-500/20 rounded-3xl"
                >
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-red-500/20 rounded-xl">
                            <Info className="h-6 w-6 text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-2">Emergency Medical Disclaimer</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                This system is NOT for emergency medical use. If you are experiencing symptoms such as chest pain, shortness of breath, or numbness that could indicate a heart attack or stroke, please dial your local emergency number (e.g., 999 or 911) immediately.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
