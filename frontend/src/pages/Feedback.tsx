import { useState } from 'react';
import { Star, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';

export default function Feedback() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0 || !name.trim()) return;

        const newFeedback = {
            id: crypto.randomUUID(),
            name,
            message: comment,
            rating,
            createdAt: new Date().toISOString()
        };

        try {
            const existing = JSON.parse(localStorage.getItem("feedback") || "[]");
            existing.unshift(newFeedback); // Newest first
            localStorage.setItem("feedback", JSON.stringify(existing));
            setSubmitted(true);

            // Auto redirect after a short delay or allow user to see success
            setTimeout(() => {
                navigate("/faq");
            }, 1500);
        } catch (error) {
            alert("Failed to save feedback");
        }
    };

    const feedbackUrl = `${window.location.origin}/feedback`;

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                {!submitted ? (
                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">We Value Your Feedback</h1>
                        <p className="text-slate-500 mb-8">Please enter your name and rate your experience.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="text-left">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-center space-x-2 py-4">
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
                                className="
                                    w-full p-4 rounded-xl
                                    bg-white text-slate-800
                                    dark:bg-slate-800 dark:text-slate-100
                                    border border-slate-300 dark:border-slate-600
                                    focus:ring-2 focus:ring-blue-500
                                    placeholder-slate-400 dark:placeholder-slate-500
                                "
                                rows={4}
                                required
                                placeholder="Tell us about your experience..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />

                            <button
                                type="submit"
                                disabled={rating === 0 || !name.trim() || !comment.trim()}
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
