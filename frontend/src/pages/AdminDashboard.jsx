import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Search, MessageSquare, BookOpen, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full"></div></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                    <div className="bg-blue-100 p-4 rounded-lg mr-4 text-blue-600">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Users</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                    <div className="bg-emerald-100 p-4 rounded-lg mr-4 text-emerald-600">
                        <Search className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Searches Today</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.searchesToday || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                    <div className="bg-amber-100 p-4 rounded-lg mr-4 text-amber-600">
                        <MessageSquare className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Open Feedback</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.openFeedbacks || 0}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center">
                    <div className="bg-indigo-100 p-4 rounded-lg mr-4 text-indigo-600">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Courses</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats?.totalCourses || 0}</h3>
                    </div>
                </div>

            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h2 className="text-lg font-medium text-gray-900">System is running normally</h2>
                <p className="text-sm mt-1">Further admin functionalities (like managing users or adding manual courses) would be listed here.</p>
            </div>
        </div>
    );
};

export default AdminDashboard;
