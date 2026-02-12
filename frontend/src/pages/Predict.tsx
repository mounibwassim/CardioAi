import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { predictHeartDisease, type PatientData } from '../lib/api';
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
        <label htmlFor={name} className="block text-sm font-medium text-slate-700">
            {label}
        </label>
        {options ? (
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        ) : (
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3 border"
                required
            />
        )}
    </div>
);

export default function Predict() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>(initialData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'name' || name === 'contact') ? value : parseFloat(value)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await predictHeartDisease(formData);
            navigate('/doctor/results', { state: { result, data: formData } });
        } catch (error) {
            console.error("Prediction failed:", error);
            alert("Failed to get prediction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
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
                    <div className="border-b border-slate-200 pb-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                            <Heart className="h-5 w-5 mr-2 text-primary-500" />
                            Demographics & Vitals
                        </h3>
                        {/* Modified Grid for Name/Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <InputGroup label="Patient Full Name" name="name" type="text" value={formData.name} onChange={handleChange} />
                            <InputGroup label="Contact Number (Optional)" name="contact" type="text" value={formData.contact} onChange={handleChange} />
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
                        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
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
                                "inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors",
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
