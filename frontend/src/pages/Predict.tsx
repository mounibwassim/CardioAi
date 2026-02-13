import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { predictHeartDisease, getDoctors, type PatientData, type Doctor } from '../lib/api';
import { cn } from '../lib/utils';

interface FormData extends PatientData { }

const initialData: FormData = {
    name: '',
    contact: '',
    age: 55,
    sex: 1,
    cp: 1,
    trestbps: 120,
    chol: 200,
    fbs: 0,
    restecg: 1,
    thalach: 150,
    exang: 0,
    oldpeak: 1.0,
    slope: 2,
    ca: 0,
    thal: 3,
};

// Hardcoded Doctors List for consistency
const DOCTORS_LIST = [
    { id: 1, name: 'Dr. Sarah Chen', email: 'sarah.chen@cardioai.com', specialization: 'Cardiology' },
    { id: 2, name: 'Dr. Emily Ross', email: 'emily.ross@cardioai.com', specialization: 'Internal Medicine' },
    { id: 3, name: 'Dr. Michael Torres', email: 'michael.torres@cardioai.com', specialization: 'Cardiology' }
];

// CRITICAL FIX: Move InputGroup OUTSIDE to prevent re-renders
const InputGroup = ({
    label,
    name,
    type = "number",
    options,
    value,
    onChange
}: {
    label: string;
    name: string;
    type?: string;
    options?: { label: string; value: number }[];
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) => (
    <div className="space-y-1">
        <label htmlFor={name} className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
        </label>
        {options ? (
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 rounded-xl p-3 shadow-sm transition-all outline-none"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900">{opt.label}</option>
                ))}
            </select>
        ) : (
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 rounded-xl p-3 shadow-sm transition-all outline-none"
                required
            />
        )}
    </div>
);

export default function Predict() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [doctors, setDoctors] = useState<Doctor[]>(DOCTORS_LIST);
    const [formData, setFormData] = useState<FormData>({ ...initialData, doctor_id: DOCTORS_LIST[0].id });

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const data = await getDoctors();
                if (data && data.length > 0) {
                    setDoctors(data);
                }
            } catch (error) {
                console.error("Failed to fetch doctors", error);
            }
        };
        fetchDoctors();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'name' || name === 'contact' || name === 'doctor_id') ? value : parseFloat(value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 🚨 CRITICAL: Validate all fields before sending
        const requiredFields = ['name', 'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal', 'doctor_id'];

        // Check for empty fields
        const emptyFields = requiredFields.filter(field => {
            const value = formData[field as keyof typeof formData];
            return value === '' || value === null || value === undefined;
        });

        if (emptyFields.length > 0) {
            alert(`Please fill all required fields: ${emptyFields.join(', ')}`);
            return;
        }

        // Check for NaN values in numeric fields
        const numericFields = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal'];
        const nanFields = numericFields.filter(field => {
            const value = formData[field as keyof typeof formData];
            return typeof value === 'number' && isNaN(value);
        });

        if (nanFields.length > 0) {
            alert(`Invalid numeric values detected in: ${nanFields.join(', ')}. Please enter valid numbers.`);
            return;
        }

        // Additional validation: age must be positive
        if (formData.age <= 0 || formData.age > 120) {
            alert('Age must be between 1 and 120');
            return;
        }

        setLoading(true);
        try {
            const result = await predictHeartDisease(formData);
            const selectedDoctorObj = doctors.find(d => String(d.id) === String(formData.doctor_id));

            // Set predictive result for modal
            setPredictionResult({
                result,
                doctorName: selectedDoctorObj?.name || 'Unknown'
            });
            setShowResultModal(true);

        } catch (error) {
            console.error("Prediction failed:", error);
            alert("Failed to get prediction. Please check all fields and try again.");
        } finally {
            setLoading(false);
        }
    };

    const [showResultModal, setShowResultModal] = useState(false);
    const [predictionResult, setPredictionResult] = useState<any>(null);

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Result Interstitial Modal */}
            {showResultModal && predictionResult && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                    >
                        <div className={cn(
                            "p-8 text-center",
                            predictionResult.result.risk_level === 'High' ? "bg-red-500/10" :
                                predictionResult.result.risk_level === 'Medium' ? "bg-amber-500/10" : "bg-emerald-500/10"
                        )}>
                            <div className={cn(
                                "w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6",
                                predictionResult.result.risk_level === 'High' ? "bg-red-500 text-white" :
                                    predictionResult.result.risk_level === 'Medium' ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                            )}>
                                <Activity className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-2">Analysis Complete</h3>
                            <p className="text-slate-400">Diagnostic assessment successful</p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-slate-400 font-medium">Risk Characterization</span>
                                <span className={cn(
                                    "px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider",
                                    predictionResult.result.risk_level === 'High' ? "bg-red-500/20 text-red-400" :
                                        predictionResult.result.risk_level === 'Medium' ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"
                                )}>
                                    {predictionResult.result.risk_level} Risk
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-slate-400 font-medium">Model Confidence</span>
                                <span className="text-white font-mono font-bold">{(predictionResult.result.risk_score * 100).toFixed(1)}%</span>
                            </div>

                            <div className="grid grid-cols-1 gap-3 pt-4">
                                <button
                                    onClick={() => navigate('/doctor/results', { state: { ...predictionResult, data: { ...formData, doctor_name: predictionResult.doctorName } } })}
                                    className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold transition-all active:scale-[0.98]"
                                >
                                    View Full Clinical Report
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShowResultModal(false)}
                                        className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                                    >
                                        New Analysis
                                    </button>
                                    <button
                                        onClick={() => navigate('/doctor')}
                                        className="py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
                <div className="bg-primary-600 px-8 py-6">
                    <div className="flex items-center space-x-3">
                        <Activity className="h-8 w-8 text-white" />
                        <h2 className="text-2xl font-bold text-white">Patient Assessment</h2>
                    </div>
                    <p className="mt-2 text-primary-100">
                        Enter clinical parameters for advanced AI analysis using random forest classification.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">

                    {/* Section 1: Demographics & Vitals */}
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-8">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                            <Heart className="h-5 w-5 mr-2 text-primary-500" />
                            Demographics & Vitals
                        </h3>
                        {/* Modified Grid for Name/Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <InputGroup label="Patient Full Name" name="name" type="text" value={formData.name} onChange={handleChange} />
                            <InputGroup label="Contact Number (Optional)" name="contact" type="text" value={formData.contact} onChange={handleChange} />
                            <div className="space-y-1">
                                <label htmlFor="doctor_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Assigned Doctor
                                </label>
                                <select
                                    id="doctor_id"
                                    name="doctor_id"
                                    value={formData.doctor_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 rounded-xl p-3 shadow-sm transition-all outline-none"
                                >
                                    {doctors.map(doc => (
                                        <option key={doc.id} value={doc.id} className="bg-white dark:bg-slate-900">{doc.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputGroup label="Age (years)" name="age" value={formData.age} onChange={handleChange} />
                            <InputGroup label="Sex" name="sex" options={[{ label: "Male", value: 1 }, { label: "Female", value: 0 }]} value={formData.sex} onChange={handleChange} />
                            <InputGroup label="Resting Blood Pressure (mm Hg)" name="trestbps" value={formData.trestbps} onChange={handleChange} />
                            <InputGroup label="Cholesterol (mg/dl)" name="chol" value={formData.chol} onChange={handleChange} />
                            <InputGroup label="Fasting Blood Sugar > 120 mg/dl" name="fbs" options={[{ label: "True", value: 1 }, { label: "False", value: 0 }]} value={formData.fbs} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Section 2: Cardiac Metrics */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-primary-500" />
                            Cardiac Metrics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputGroup label="Chest Pain Type" name="cp" options={[
                                { label: "Typical Angina", value: 1 },
                                { label: "Atypical Angina", value: 2 },
                                { label: "Non-anginal Pain", value: 3 },
                                { label: "Asymptomatic", value: 4 }
                            ]} value={formData.cp} onChange={handleChange} />
                            <InputGroup label="Resting ECG Results" name="restecg" options={[
                                { label: "Normal", value: 0 },
                                { label: "ST-T Wave Abnormality", value: 1 },
                                { label: "Left Ventricular Hypertrophy", value: 2 }
                            ]} value={formData.restecg} onChange={handleChange} />
                            <InputGroup label="Max Heart Rate" name="thalach" value={formData.thalach} onChange={handleChange} />
                            <InputGroup label="Exercise Induced Angina" name="exang" options={[{ label: "Yes", value: 1 }, { label: "No", value: 0 }]} value={formData.exang} onChange={handleChange} />
                            <InputGroup label="ST Depression (Oldpeak)" name="oldpeak" type="number" value={formData.oldpeak} onChange={handleChange} />
                            <InputGroup label="Slope" name="slope" options={[
                                { label: "Upsloping", value: 1 },
                                { label: "Flat", value: 2 },
                                { label: "Downsloping", value: 3 }
                            ]} value={formData.slope} onChange={handleChange} />
                            <InputGroup label="Major Vessels (0-3)" name="ca" value={formData.ca} onChange={handleChange} />
                            <InputGroup label="Thalassemia" name="thal" options={[
                                { label: "Normal", value: 3 },
                                { label: "Fixed Defect", value: 6 },
                                { label: "Reversable Defect", value: 7 }
                            ]} value={formData.thal} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={cn(
                                "inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-95",
                                loading && "opacity-75 cursor-not-allowed"
                            )}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Run Analysis
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
