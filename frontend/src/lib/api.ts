import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
console.log('🔌 Application API URL:', API_URL); // Debug logging

export interface PatientData {
    age: number;
    sex: number;
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
}

export interface Patient {
    id: number;
    name: string;
    age: number;
    sex: number;
    contact?: string;
    status: string;
    created_at: string;
}

export const predictHeartDisease = async (data: PatientData): Promise<PredictionResult> => {
    try {
        const response = await axios.post(`${API_URL}/predict`, data);
        return response.data;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const getPatients = async (): Promise<Patient[]> => {
    const response = await axios.get(`${API_URL}/patients`);
    return response.data.patients;
};

export const createPatient = async (patient: { name: string, age: number, sex: number, contact: string }) => {
    const response = await axios.post(`${API_URL}/patients`, patient);
    return response.data;
};

export const submitFeedback = async (name: string, rating: number, comment: string, patient_id?: number) => {
    await axios.post(`${API_URL}/feedbacks`, { name, rating, comment, patient_id });
};

export const getFeedbacks = async () => {
    const response = await axios.get(`${API_URL}/feedbacks`);
    return response.data;
};

export const resetSystem = async () => {
    await axios.post(`${API_URL}/reset`);
};

export const sendContact = async (data: { name: string, email: string, message: string }) => {
    await axios.post(`${API_URL}/contact`, data);
};

export const loginDoctor = async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/doctor/login`, { username, password });
    return response.data;
};
