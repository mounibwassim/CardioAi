import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Contact() {
    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">Get in Touch</h1>
                    <p className="text-lg text-slate-600">
                        We are here to assist you with your cardiac health needs. Reach out to us directly.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 md:p-12 bg-primary-900 text-white flex flex-col justify-center">
                            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                            <p className="text-primary-200 mb-8">
                                Our team is available 24/7 for urgent cardiac inquiries and consultations.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <Phone className="h-6 w-6 text-secondary-400" />
                                    <span className="text-lg">+60 11 1176 9636</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <Mail className="h-6 w-6 text-secondary-400" />
                                    <span className="text-lg">mounibwassimm@gmail.com</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <MapPin className="h-6 w-6 text-secondary-400" />
                                    <span className="text-lg">Kuala Lumpur, Malaysia</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 bg-slate-50 flex flex-col justify-center items-center">
                            <h3 className="text-xl font-semibold text-slate-900 mb-6">Quick Connect</h3>
                            <a
                                href="https://wa.me/601111769636?text=I%20would%20like%20to%20schedule%20a%20consultation"
                                target="_blank"
                                rel="noreferrer"
                                className="w-full max-w-sm inline-flex justify-center items-center px-6 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-[#25D366] hover:bg-[#20bd5a] transition-all transform hover:scale-105 shadow-lg mb-4"
                            >
                                <MessageCircle className="mr-2 h-6 w-6" />
                                Chat on WhatsApp
                            </a>
                            <a
                                href="mailto:mounibwassimm@gmail.com"
                                className="w-full max-w-sm inline-flex justify-center items-center px-6 py-4 border border-slate-200 text-lg font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-all hover:shadow-md"
                            >
                                <Mail className="mr-2 h-6 w-6" />
                                Send an Email
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
