import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronDown, ChevronUp, Quote } from 'lucide-react';

export default function PatientReviews() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const faqs = [
        {
            q: "How accurate is the AI Risk Analysis?",
            a: "Our AI model is trained on thousands of verified clinical datasets and has shown over 85% accuracy in preliminary validation. However, it is designed to be a support tool for cardiologists, not a replacement for a full medical diagnosis."
        },
        {
            q: "Is my medical data secure?",
            a: "Absolutely. We utilize bank-grade encryption for all data transmission and storage. Your personal health information is accessible only to you and your authorized care team."
        },
        {
            q: "How do I prepare for my consultation?",
            a: "Please bring any recent blood work, a list of current medications, and a summary of your family history. If you have a wearable device (like a smartwatch), bring your recent heart rate data."
        },
        {
            q: "Do you accept insurance?",
            a: "We accept most major insurance plans. Please contact our administrative team via WhatsApp to verify your specific coverage."
        }
    ];

    const reviews = [
        {
            name: "Sarah L.",
            rating: 5,
            date: "Jan 15, 2024",
            text: "The AI assessment was incredibly quick, and the follow-up consultation gave me peace of mind I haven't had in years. Highly professional team."
        },
        {
            name: "Michael R.",
            rating: 5,
            date: "Dec 03, 2023",
            text: "I appreciated the clear layout of the patient portal. Tracking my recovery has never been easier. The doctor avatars are a nice touch too!"
        },
        {
            name: "Emily C.",
            rating: 4,
            date: "Feb 10, 2024",
            text: "Very futuristic clinic. The waiting times were minimal, and Dr. Aminah really took the time to explain my risk factors."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Patient Experiences & FAQ</h1>
                    <p className="text-xl text-slate-600">See what others are saying and find answers to common questions.</p>
                </div>

                {/* Reviews Section */}
                <div className="mb-20">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center justify-center">
                        <Star className="text-yellow-400 fill-yellow-400 mr-2 h-6 w-6" />
                        Patient Reviews
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.map((review, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3">
                                            {review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-slate-900">{review.name}</div>
                                            <div className="text-xs text-slate-400">{review.date}</div>
                                        </div>
                                    </div>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />
                                        ))}
                                    </div>
                                </div>
                                <div className="relative">
                                    <Quote className="absolute -top-1 -left-1 h-6 w-6 text-slate-100 transform -scale-x-100" />
                                    <p className="text-slate-600 italic pl-6">{review.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full flex justify-between items-center p-6 text-left focus:outline-none hover:bg-slate-50 transition-colors"
                                >
                                    <span className="font-semibold text-slate-900">{faq.q}</span>
                                    {openFaq === idx ? (
                                        <ChevronUp className="h-5 w-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                    )}
                                </button>
                                {openFaq === idx && (
                                    <div className="px-6 pb-6 text-slate-600 animate-fadeIn">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
