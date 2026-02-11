import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { sendContact } from '../lib/api';

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await sendContact(formData);
            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <h1 className="text-4xl font-bold text-center text-slate-900 mb-12">Get in Touch</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8 md:p-12 bg-primary-900 text-white">
                        <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                        <p className="text-primary-200 mb-8">
                            Fill up the form or contact us directly. Our team is available 24/7 for urgent cardiac inquiries.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <Phone className="h-6 w-6 text-secondary-400" />
                                <span>+60 11 1176 9636</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Mail className="h-6 w-6 text-secondary-400" />
                                <span>mounibwassimm@gmail.com</span>
                            </div>
                            <div className="flex items-center space-x-4">
                                <MapPin className="h-6 w-6 text-secondary-400" />
                                <span>Kuala Lumpur, Malaysia</span>
                            </div>
                        </div>

                        <div className="mt-12">
                            <a
                                href="https://wa.me/601111769636?text=I%20would%20like%20to%20schedule%20a%20consultation"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex w-full justify-center items-center px-6 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all transform hover:scale-105 shadow-lg"
                            >
                                <MessageCircle className="mr-2 h-6 w-6" />
                                Chat on WhatsApp
                            </a>
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Message</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {status === 'sending' ? 'Sending...' : 'Send Message'}
                                <Send className="ml-2 h-4 w-4" />
                            </button>

                            {status === 'success' && (
                                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center font-semibold animate-pulse">
                                    ✅ Message sent successfully! We will contact you shortly.
                                </div>
                            )}
                            {status === 'error' && (
                                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center font-semibold">
                                    ❌ Failed to send message. Please try again or email us directly at mounibwassimm@gmail.com.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
