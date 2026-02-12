import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('🔌 Application API URL:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('doctor_name');
            localStorage.removeItem('doctor_role');

            if (window.location.pathname !== '/doctor-secure-access-portal') {
                window.location.href = '/doctor-secure-access-portal';
            }
        }
        return Promise.reject(error);
    }
);

export interface PatientData {
    name: string;
    age: number;
    sex: number;
    contact?: string;
    cp: number;
    trestbps: number;
    chol: number;
    fbs: number;
    restecg: number;
    thalach: number;
    exang: number;
    oldpeak: number;
    slope: number;
    ca: number;
    thal: number;
}

export interface PredictionResult {
    prediction: number;
    risk_score: number;
    risk_level: string;
    patient_id: number;
    record_id: number;
    explanation?: string;
}

export interface Patient {
    id: number;
    name: string;
    age: number;
    sex: number;
    contact?: string;
    status: string;
    risk_level: string;
    doctor_name: string;
    doctor_notes?: string;
    system_notes?: string;
    doctor_signature?: string;
    created_at: string;
    last_updated: string;
    assessment_count: number;
}

export interface Record {
    id: number;
    patient_id: number;
    input_data: string;
    prediction_result: number;
    risk_score: number;
    risk_level: string;
    doctor_name: string;
    created_at: string;
}

export const predictHeartDisease = async (data: PatientData): Promise<PredictionResult> => {
    try {
        const response = await api.post('/predict', data);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const getPatients = async (): Promise<Patient[]> => {
    const response = await api.get('/patients');
    return response.data.patients;
};

export const createPatient = async (patient: { name: string, age: number, sex: number, contact: string }) => {
    const response = await api.post('/patients', patient);
    return response.data;
};

export const submitFeedback = async (name: string, rating: number, comment: string, patient_id?: number) => {
    await api.post('/feedbacks', { name, rating, comment, patient_id });
};

export const getFeedbacks = async () => {
    const response = await api.get('/feedbacks');
    return response.data;
};

export const resetSystem = async () => {
    await api.post('/reset');
};

export const sendContact = async (data: { name: string, email: string, message: string }) => {
    await api.post('/contact', data);
};

export const loginDoctor = async (username: string, password: string) => {
    const response = await api.post('/doctor/login', { username, password });
    return response.data;
};

export const registerDoctor = async (username: string, email: string, password: string) => {
    const response = await api.post('/register', { username, email, password });
    return response.data;
};

export const verifyPin = async (pin: string) => {
    const response = await api.post('/pin-login', { pin });
    return response.data;
};

export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export const getMonthlyStats = async () => {
    const response = await api.get('/dashboard/monthly-stats');
    return response.data.monthly_stats;
};


export const updatePatientNotes = async (patientId: number, doctorNotes: string, doctorName: string) => {
    const response = await api.put(`/patients/${patientId}/notes`, {
        doctor_notes: doctorNotes,
        doctor_name: doctorName
    });
    return response.data;
};

export const getPatientRecords = async (patientId: number): Promise<{ patient: Patient; records: Record[] }> => {
    const response = await api.get(`/patients/${patientId}/records`);
    return response.data;
};

export const updatePatientSignature = async (patientId: number, signature: string) => {
    const response = await api.put(`/patients/${patientId}/signature`, {
        signature: signature
    });
    return response.data;
};
