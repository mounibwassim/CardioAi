
import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, User, X, Plus } from 'lucide-react';
import { getPatients, createPatient, type Patient } from '../lib/api';

export default function PatientManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newPatient, setNewPatient] = useState({ name: '', age: '', sex: '1', contact: '' });

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const data = await getPatients();
            setPatients(data);
        } catch (error) {
            console.error("Failed to fetch patients", error);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createPatient({
                name: newPatient.name,
                age: parseInt(newPatient.age),
                sex: parseInt(newPatient.sex),
                contact: newPatient.contact
            });
            setIsModalOpen(false);
            setNewPatient({ name: '', age: '', sex: '1', contact: '' });
            fetchPatients();
        } catch (error) {
            alert("Failed to create patient");
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.id && p.id.toString().includes(searchTerm))
    );

    return (
        <div className="space-y-6 py-6 relative">
            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div className="absolute top-0 right-0 pt-4 pr-4">
                                <button
                                    type="button"
                                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    <span className="sr-only">Close</span>
                                    <X className="h-6 w-6" aria-hidden="true" />
                                </button>
                            </div>
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        Add New Patient
                                    </h3>
                                    <div className="mt-4">
                                        <form onSubmit={handleCreate} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    value={newPatient.name}
                                                    onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Age</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                        value={newPatient.age}
                                                        onChange={e => setNewPatient({ ...newPatient, age: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Sex</label>
                                                    <select
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                        value={newPatient.sex}
                                                        onChange={e => setNewPatient({ ...newPatient, sex: e.target.value })}
                                                    >
                                                        <option value="1">Male</option>
                                                        <option value="0">Female</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Contact / Notes</label>
                                                <input
                                                    type="text"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                                    value={newPatient.contact}
                                                    onChange={e => setNewPatient({ ...newPatient, contact: e.target.value })}
                                                />
                                            </div>
                                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                                                >
                                                    {loading ? 'Creating...' : 'Create Patient'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                                                    onClick={() => setIsModalOpen(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Patient Management</h1>
                    <p className="text-slate-500">View and manage patient assessment records.</p>
                </div>
                <div className="flex space-x-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search patients..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Patient
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Patient ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Age/Sex</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Assessment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredPatients.length > 0 ? (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{patient.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{patient.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{patient.age} / {patient.sex === 1 ? 'M' : 'F'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{new Date(patient.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{patient.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-slate-400 hover:text-slate-600">
                                            <MoreVertical className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <User className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                                    No patients found. Add one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

