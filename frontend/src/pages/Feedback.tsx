import { useState } from 'react';
import { Star, QrCode } from 'lucide-react';
import QRCode from 'react-qr-code';
import { submitFeedback } from '../lib/api';

export default function Feedback() {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) return;
        try {
            await submitFeedback(rating, comment);
            setSubmitted(true);
        } catch (error) {
            alert("Failed to submit feedback");
        }
    };

    const feedbackUrl = `${window.location.origin}/feedback`;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                {!submitted ? (
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">We Value Your Feedback</h1>
                        <p className="text-slate-500 mb-8">Please rate your experience with CardioAI.</p>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="flex justify-center space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-110"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(rating)}
                                    >
                                        <Star
                                            className={`h-10 w-10 ${star <= (hover || rating)
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-slate-300"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                rows={4}
                                placeholder="Tell us about your experience..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />

                            <button
                                type="submit"
                                disabled={rating === 0}
                                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
                            >
                                Submit Review
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                            <Star className="h-10 w-10 text-green-600 fill-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Thank You!</h2>
                        <p className="text-slate-600 mb-8">Your feedback helps us improve our services.</p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-primary-600 font-semibold hover:text-primary-700"
                        >
                            Submit another review
                        </button>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <button
                        onClick={() => setShowQR(!showQR)}
                        className="inline-flex items-center text-slate-500 hover:text-slate-700"
                    >
                        <QrCode className="mr-2 h-4 w-4" />
                        {showQR ? "Hide QR Code" : "Show Feedback QR Code"}
                    </button>

                    {showQR && (
                        <div className="mt-6 bg-white p-6 rounded-xl inline-block shadow-lg">
                            <QRCode value={feedbackUrl} />
                            <p className="mt-4 text-sm text-slate-500">Scan to leave feedback</p>
                            <button
                                onClick={() => window.print()}
                                className="mt-4 text-xs text-primary-600 font-semibold hover:underline"
                            >
                                Print QR Code
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
