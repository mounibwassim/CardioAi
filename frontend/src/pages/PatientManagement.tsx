import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, User, Download, Edit3, Eye } from 'lucide-react';
import { getPatients, type Patient } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export default function PatientManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchPatients, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchPatients = async () => {
        try {
            const data = await getPatients();
            setPatients(data);
        } catch (error) {
            console.error("Failed to fetch patients", error);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.id && p.id.toString().includes(searchTerm))
    );

    const getRiskBadgeColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'High':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'Medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const handleViewDetails = (patientId: number) => {
        navigate(`/doctor/patients/${patientId}`);
        setOpenMenuId(null);
    };

    const handleAddNote = (patientId: number) => {
        navigate(`/doctor/patients/${patientId}?tab=notes`);
        setOpenMenuId(null);
    };

    const handleDownloadReport = async (patient: Patient) => {
        // TODO: Implement PDF download for latest assessment
        console.log('Download report for patient:', patient.id);
        setOpenMenuId(null);
    };

    return (
        <div className="pt-8 px-6 pb-6 mb-6 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Patient Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {patients.length} patient{patients.length !== 1 ? 's' : ''} • Auto-updated
                    </p>
                </div>
                <div className="flex space-x-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-white/10 rounded-md leading-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-slate-300 dark:border-white/10 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none transition-colors">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-white/5 overflow-hidden mt-6">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-white/5">
                    <thead className="bg-slate-50 dark:bg-white/5">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patient ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Age/Sex</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Assessment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Risk Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Doctor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assessments</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-white/5">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient, index) => (
                                <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">{patient.name}</div>
                                        {patient.contact && (
                                            <div className="text-xs text-slate-500">{patient.contact}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {patient.age} / {patient.sex === 1 ? 'M' : 'F'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(patient.last_updated || patient.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskBadgeColor(patient.risk_level)}`}>
                                            {patient.risk_level || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                                        {patient.doctor_name || 'Not Assigned'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-medium">
                                            {patient.assessment_count || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === patient.id ? null : patient.id)}
                                            className="text-slate-400 hover:text-slate-600 transition-colors"
                                        >
                                            <MoreVertical className="h-5 w-5" />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {openMenuId === patient.id && (
                                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 z-50 border dark:border-white/10">
                                                <div className="py-1" role="menu">
                                                    <button
                                                        onClick={() => handleViewDetails(patient.id)}
                                                        className="flex items-center w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleAddNote(patient.id)}
                                                        className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors"
                                                    >
                                                        <Edit3 className="h-4 w-4 mr-2" />
                                                        Add Note
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadReport(patient)}
                                                        className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors"
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Download Report
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                    <User className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                    <p className="text-lg font-medium">No patients found</p>
                                    <p className="text-sm mt-1">Patients will appear here automatically after assessments</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Click outside to close menu */}
            {openMenuId && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setOpenMenuId(null)}
                />
            )}
        </div>
    );
}
